/**
 * CreateLockObject Handler - Create an ABAP lock object (ENQU).
 *
 * ADT collection: POST /sap/bc/adt/ddic/lockobjects/sources (confirmed via
 * discovery on S/4 7.56). No adt-clients wrapper. The primary table + lock mode
 * are sent in the create body; SAP generates the ENQUEUE_/DEQUEUE_ function
 * modules on activation (ActivateLockObject). Lock object names conventionally
 * start with E and are limited like DB objects (<=16 chars).
 */

import { setSessionMode } from '../../../lib/adtObjectOps';
import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { buildLockContent, escXml } from '../../../lib/lockObjectXml';
import {
  assertNameLength,
  encodeSapObjectName,
  getSystemContext,
  makeAdtRequestWithTimeout,
  return_error,
  return_response,
  withExplicitStatelessHeader,
} from '../../../lib/utils';
import { validateTransportRequest } from '../../../utils/transportValidation.js';

export const TOOL_DEFINITION = {
  name: 'CreateLockObject',
  available_in: ['onprem', 'legacy'] as const,
  description:
    'Operation: Create. Subject: LockObject (ENQU). Create a new ABAP lock object over a primary table. Activate with ActivateLockObject to generate the ENQUEUE/DEQUEUE function modules.',
  inputSchema: {
    type: 'object',
    properties: {
      lock_object_name: {
        type: 'string',
        description:
          'Lock object name (e.g., EZMY_LOCK). Conventionally starts with E, max 16 chars.',
      },
      primary_table: {
        type: 'string',
        description: 'Primary (base) table the lock protects.',
      },
      lock_mode: {
        type: 'string',
        description:
          'Lock mode for the primary table: E (exclusive, default), S (shared), X (exclusive non-cumulative), O (optimistic).',
        enum: ['E', 'S', 'X', 'O'],
      },
      allow_rfc: {
        type: 'boolean',
        description: 'Allow enqueue via RFC. Default: false.',
      },
      description: {
        type: 'string',
        description: 'Description (defaults to name).',
      },
      package_name: {
        type: 'string',
        description: 'Package name (e.g., $TMP, ZMY_PKG).',
      },
      transport_request: {
        type: 'string',
        description: 'Transport request (if transportable).',
      },
    },
    required: ['lock_object_name', 'primary_table', 'package_name'],
  },
} as const;

interface CreateLockObjectArgs {
  lock_object_name: string;
  primary_table: string;
  lock_mode?: string;
  allow_rfc?: boolean;
  description?: string;
  package_name: string;
  transport_request?: string;
}

export async function handleCreateLockObject(
  context: HandlerContext,
  args: CreateLockObjectArgs,
) {
  const { connection, logger } = context;
  try {
    if (!args?.lock_object_name)
      return return_error(new Error('lock_object_name is required'));
    if (!args?.primary_table)
      return return_error(new Error('primary_table is required'));
    if (!args?.package_name)
      return return_error(new Error('package_name is required'));
    try {
      validateTransportRequest(args.package_name, args.transport_request);
    } catch (e) {
      return return_error(e as Error);
    }

    createAdtClient(connection, logger); // wrap connection (sap-language pinning)
    const name = args.lock_object_name.toUpperCase();
    assertNameLength('lock_object', name, 'Lock object');
    const description = args.description || name;
    const lang = (
      getSystemContext().masterLanguage ||
      process.env.SAP_LANGUAGE ||
      'EN'
    ).toUpperCase();
    const { responsible, masterSystem } = getSystemContext();

    const content = buildLockContent({
      allowRfc: args.allow_rfc === true,
      primaryTable: args.primary_table.toUpperCase(),
      lockMode: (args.lock_mode || 'E').toUpperCase(),
    });

    const body =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<enqu:lockobject xmlns:enqu="http://www.sap.com/adt/ddic/enqu" ` +
      `xmlns:adtcore="http://www.sap.com/adt/core" ` +
      `adtcore:description="${escXml(description)}" adtcore:name="${escXml(name)}" ` +
      `adtcore:type="ENQU/DL" adtcore:language="${lang}" adtcore:masterLanguage="${lang}"` +
      `${masterSystem ? ` adtcore:masterSystem="${escXml(masterSystem)}"` : ''}` +
      `${responsible ? ` adtcore:responsible="${escXml(responsible)}"` : ''}>` +
      `<adtcore:packageRef adtcore:name="${escXml(args.package_name)}"/>` +
      `${content}` +
      `</enqu:lockobject>`;

    const params: Record<string, string> = { 'sap-language': lang };
    if (args.transport_request?.trim())
      params.corrNr = args.transport_request.trim();

    // Force stateless for the POST. Both mechanisms are needed:
    //   * setSessionMode omits the stateful header, but it does NOT terminate a
    //     server session an earlier stateful op (lock/activate) left alive on
    //     this shared connection — so the create still lands in that session and
    //     the new object is born holding an implicit EDIT LOCK, which then makes
    //     every later lock fail 403 "<user> is currently editing <object>".
    //   * withExplicitStatelessHeader SENDS `x-sap-adt-sessiontype: stateless`,
    //     which does terminate it.
    // Proven by an A/B probe on DM2: with setSessionMode alone a freshly created
    // message class was already locked; with the explicit header it was not.
    // Same remedy as the P4 GetPackageContents nodestructure-bleed fix.
    setSessionMode(connection, 'stateless');
    const restoreStateless = withExplicitStatelessHeader(connection);
    try {
      await makeAdtRequestWithTimeout(
        connection,
        '/sap/bc/adt/ddic/lockobjects/sources',
        'POST',
        'default',
        body,
        params,
        { 'Content-Type': 'application/*' },
      );
    } finally {
      restoreStateless();
    }
    logger?.info(`Lock object created: ${name}`);

    return return_response({
      data: JSON.stringify(
        {
          success: true,
          lock_object_name: name,
          primary_table: args.primary_table.toUpperCase(),
          lock_mode: (args.lock_mode || 'E').toUpperCase(),
          package_name: args.package_name,
          transport_request: args.transport_request || null,
          type: 'ENQU/DL',
          message: `Lock object ${name} created. Use ActivateLockObject to generate ENQUEUE/DEQUEUE modules.`,
          uri: `/sap/bc/adt/ddic/lockobjects/sources/${encodeSapObjectName(name).toLowerCase()}`,
        },
        null,
        2,
      ),
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });
  } catch (error: any) {
    const status = error?.response?.status;
    const body = error?.response?.data;
    const bodyText = body
      ? typeof body === 'string'
        ? body
        : JSON.stringify(body)
      : '';
    const msg = [
      `Error creating lock object ${args?.lock_object_name}`,
      status ? `HTTP ${status}` : '',
      error instanceof Error ? error.message : String(error),
      bodyText ? `ADT response: ${bodyText.slice(0, 1200)}` : '',
    ]
      .filter(Boolean)
      .join(' | ');
    logger?.error(msg);
    return return_error(new Error(msg));
  }
}
