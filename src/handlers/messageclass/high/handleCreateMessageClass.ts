/**
 * CreateMessageClass Handler - Create an ABAP message class (MSAG).
 *
 * ADT collection: POST /sap/bc/adt/messageclass (confirmed via discovery; a
 * live probe returned 201). No adt-clients wrapper. Individual messages are
 * added via UpdateMessageClass. Message class names: max 20 chars.
 */

import { escXml, setSessionMode } from '../../../lib/adtObjectOps';
import { createAdtClient } from '../../../lib/clients';
import { endRfcSession } from '../../../lib/connectionFactory';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
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
  name: 'CreateMessageClass',
  available_in: ['onprem', 'legacy'] as const,
  description:
    'Operation: Create. Subject: MessageClass. Create a new ABAP message class (MSAG) in initial state. Add messages with UpdateMessageClass.',
  inputSchema: {
    type: 'object',
    properties: {
      message_class_name: {
        type: 'string',
        description:
          'Message class name (e.g., ZMY_MSG). Start with Z or Y, MAX 20 chars.',
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
    required: ['message_class_name', 'package_name'],
  },
} as const;

interface CreateMessageClassArgs {
  message_class_name: string;
  description?: string;
  package_name: string;
  transport_request?: string;
}

export async function handleCreateMessageClass(
  context: HandlerContext,
  args: CreateMessageClassArgs,
) {
  const { connection, logger } = context;
  try {
    if (!args?.message_class_name)
      return return_error(new Error('message_class_name is required'));
    if (!args?.package_name)
      return return_error(new Error('package_name is required'));
    try {
      validateTransportRequest(args.package_name, args.transport_request);
    } catch (e) {
      return return_error(e as Error);
    }

    createAdtClient(connection, logger); // wrap connection (sap-language pinning)
    const name = args.message_class_name.toUpperCase();
    assertNameLength('message_class', name, 'Message class');
    const description = args.description || name;
    const lang = (
      getSystemContext().masterLanguage ||
      process.env.SAP_LANGUAGE ||
      'EN'
    ).toUpperCase();
    const { responsible, masterSystem } = getSystemContext();

    const body =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<mc:messageClass xmlns:mc="http://www.sap.com/adt/MessageClass" ` +
      `xmlns:adtcore="http://www.sap.com/adt/core" ` +
      `adtcore:description="${escXml(description)}" adtcore:name="${escXml(name)}" ` +
      `adtcore:type="MSAG/N" adtcore:language="${lang}" adtcore:masterLanguage="${lang}"` +
      `${masterSystem ? ` adtcore:masterSystem="${escXml(masterSystem)}"` : ''}` +
      `${responsible ? ` adtcore:responsible="${escXml(responsible)}"` : ''}>` +
      `<adtcore:packageRef adtcore:name="${escXml(args.package_name)}"/>` +
      `</mc:messageClass>`;

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
        '/sap/bc/adt/messageclass',
        'POST',
        'default',
        body,
        params,
        { 'Content-Type': 'application/*' },
      );
    } finally {
      restoreStateless();
    }
    logger?.info(`Message class created: ${name}`);

    // Over RFC the create leaves the new class edit-locked by this connection's
    // own ABAP session (measured — see endRfcSession); end that session so the
    // next UpdateMessageClass / AddMessage is not refused.
    const sessionEnd = await endRfcSession(connection);
    const lockWarning =
      sessionEnd === 'skipped_stateful'
        ? `The RFC session was not ended because another operation is using it statefully, so ${name} may still be edit-locked by this server's session: if UpdateMessageClass/AddMessage is refused as locked, restart the MCP server (its RFC session holds the lock) or release it in SM12. (GetSession force_new does NOT end the SAP session.)`
        : undefined;

    return return_response({
      data: JSON.stringify(
        {
          success: true,
          message_class_name: name,
          package_name: args.package_name,
          transport_request: args.transport_request || null,
          type: 'MSAG/N',
          message: `Message class ${name} created successfully. Use UpdateMessageClass to add messages.`,
          ...(sessionEnd === 'reset' ? { rfc_session_reset: true } : {}),
          ...(lockWarning ? { warnings: [lockWarning] } : {}),
          uri: `/sap/bc/adt/messageclass/${encodeSapObjectName(name).toLowerCase()}`,
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
      `Error creating message class ${args?.message_class_name}`,
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
