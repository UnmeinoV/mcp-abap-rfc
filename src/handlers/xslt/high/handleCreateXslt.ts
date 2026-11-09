/**
 * CreateXslt Handler - Create an ABAP Transformation (XSLT/ST).
 *
 * ADT collection: POST /sap/bc/adt/xslt/transformations (confirmed via
 * /sap/bc/adt/discovery on S/4 7.56). No adt-clients wrapper exists, so the
 * metadata POST is issued directly. Source is set via UpdateXslt.
 */

import { escXml, setSessionMode } from '../../../lib/adtObjectOps';
import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  encodeSapObjectName,
  getSystemContext,
  makeAdtRequestWithTimeout,
  return_error,
  return_response,
  withExplicitStatelessHeader,
} from '../../../lib/utils';
import { validateTransportRequest } from '../../../utils/transportValidation.js';

export const TOOL_DEFINITION = {
  name: 'CreateXslt',
  available_in: ['onprem', 'legacy'] as const,
  description:
    'Operation: Create. Subject: Transformation (XSLT/ST). Create a new ABAP transformation in initial state. Choose transformation_type: XSLTProgram (XSLT, default) or SimpleTransformation (ST). Set the source with UpdateXslt.',
  inputSchema: {
    type: 'object',
    properties: {
      xslt_name: {
        type: 'string',
        description:
          'Transformation name (e.g., ZMY_XSLT). Start with Z or Y, max 30 chars.',
      },
      transformation_type: {
        type: 'string',
        description:
          "Transformation kind: 'XSLTProgram' (XSLT, default) or 'SimpleTransformation' (ST, source starts with <?sap.transform simple?>).",
        enum: ['XSLTProgram', 'SimpleTransformation'],
      },
      description: {
        type: 'string',
        description: 'Description (defaults to xslt_name).',
      },
      package_name: {
        type: 'string',
        description: 'Package name (e.g., $TMP, ZMY_PKG).',
      },
      transport_request: {
        type: 'string',
        description: 'Transport request. Required for transportable packages.',
      },
    },
    required: ['xslt_name', 'package_name'],
  },
} as const;

interface CreateXsltArgs {
  xslt_name: string;
  transformation_type?: 'XSLTProgram' | 'SimpleTransformation';
  description?: string;
  package_name: string;
  transport_request?: string;
}

export async function handleCreateXslt(
  context: HandlerContext,
  args: CreateXsltArgs,
) {
  const { connection, logger } = context;
  try {
    if (!args?.xslt_name)
      return return_error(new Error('xslt_name is required'));
    if (!args?.package_name)
      return return_error(new Error('package_name is required'));
    try {
      validateTransportRequest(args.package_name, args.transport_request);
    } catch (e) {
      return return_error(e as Error);
    }

    createAdtClient(connection, logger); // wrap connection (sap-language pinning)
    const name = args.xslt_name.toUpperCase();
    const description = args.description || name;
    const lang = (
      getSystemContext().masterLanguage ||
      process.env.SAP_LANGUAGE ||
      'EN'
    ).toUpperCase();
    const { responsible, masterSystem } = getSystemContext();
    const transformationType =
      args.transformation_type === 'SimpleTransformation'
        ? 'SimpleTransformation'
        : 'XSLTProgram';

    const body =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<trans:transformation xmlns:trans="http://www.sap.com/adt/transformation" ` +
      `xmlns:adtcore="http://www.sap.com/adt/core" trans:transformationType="${transformationType}" ` +
      `adtcore:description="${escXml(description)}" adtcore:language="${lang}" ` +
      `adtcore:name="${escXml(name)}" adtcore:type="XSLT/VT" adtcore:masterLanguage="${lang}"` +
      `${masterSystem ? ` adtcore:masterSystem="${escXml(masterSystem)}"` : ''}` +
      `${responsible ? ` adtcore:responsible="${escXml(responsible)}"` : ''}>` +
      `<adtcore:packageRef adtcore:name="${escXml(args.package_name)}"/>` +
      `</trans:transformation>`;

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
        '/sap/bc/adt/xslt/transformations',
        'POST',
        'default',
        body,
        params,
        { 'Content-Type': 'application/*' },
      );
    } finally {
      restoreStateless();
    }
    logger?.info(`Transformation created: ${name}`);

    return return_response({
      data: JSON.stringify(
        {
          success: true,
          xslt_name: name,
          package_name: args.package_name,
          transport_request: args.transport_request || null,
          type: 'XSLT/VT',
          message: `Transformation ${name} created successfully. Use UpdateXslt to set the source code.`,
          uri: `/sap/bc/adt/xslt/transformations/${encodeSapObjectName(name).toLowerCase()}`,
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
      `Error creating transformation ${args?.xslt_name}`,
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
