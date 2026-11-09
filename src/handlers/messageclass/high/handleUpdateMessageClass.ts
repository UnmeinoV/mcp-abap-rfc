/**
 * UpdateMessageClass Handler - Set the messages of an ABAP message class (MSAG).
 *
 * UPSERT semantics — NOT replace, despite what this handler used to claim.
 * Measured on DM2/310 (SAP_BASIS 7.58): PUTting the class with 2 of its 3
 * messages leaves all 3 in place. Every message in the array is created or
 * updated; messages left OUT are KEPT.
 *
 * Two consequences worth knowing:
 *   - a message cannot be lost by being omitted, so the read-modify-resend loop
 *     is safer than it looks;
 *   - a message cannot be REMOVED this way either. Removing one is not reachable
 *     through ADT on this release (the /messages/{no} sub-resource refuses DELETE
 *     with ExceptionResourceInvalidLockHandle) — it needs SE91.
 *
 * To change ONE message prefer AddMessage / UpdateMessage: they read the current
 * list from SAP, so the caller does not have to hold the others at all.
 *
 * Workflow: GET current (preserve root attrs + package) -> lock -> PUT full XML
 * -> unlock. Message classes are active on save (no separate activation).
 */

import {
  escXml,
  getAdt,
  putAdtContent,
  runLocked,
} from '../../../lib/adtObjectOps';
import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  encodeSapObjectName,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'UpdateMessageClass',
  available_in: ['onprem', 'legacy'] as const,
  description:
    'Operation: Update. Subject: MessageClass. Create or update several messages of an ' +
    'existing ABAP message class in one call. ' +
    'UPSERT semantics, verified live: messages you pass are created or overwritten, and ' +
    'messages you leave OUT are KEPT (this is NOT a whole-set replace, so nothing is lost by ' +
    'omission — and nothing can be deleted this way either; removing a message needs SE91). ' +
    'To change a single message prefer AddMessage / UpdateMessage, which read the current list ' +
    'from SAP so you never have to resend the others.',
  inputSchema: {
    type: 'object',
    properties: {
      message_class_name: {
        type: 'string',
        description: 'Message class name (must exist).',
      },
      messages: {
        type: 'array',
        description:
          'Messages to create or update. Messages of this class that are NOT listed here are ' +
          'left untouched.',
        items: {
          type: 'object',
          properties: {
            msgno: {
              type: 'string',
              description: 'Message number 000-999 (padded to 3 digits).',
            },
            text: {
              type: 'string',
              description: 'Short text (may contain &1..&9 placeholders).',
            },
            self_explanatory: {
              type: 'boolean',
              description:
                'Message is self-explanatory (no long text). Default: true.',
            },
          },
          required: ['msgno', 'text'],
        },
      },
      transport_request: {
        type: 'string',
        description: 'Transport request (if transportable).',
      },
    },
    required: ['message_class_name', 'messages'],
  },
} as const;

interface MsgInput {
  msgno: string | number;
  text: string;
  self_explanatory?: boolean;
}
interface UpdateMessageClassArgs {
  message_class_name: string;
  messages: MsgInput[];
  transport_request?: string;
}

export async function handleUpdateMessageClass(
  context: HandlerContext,
  args: UpdateMessageClassArgs,
) {
  const { connection, logger } = context;
  try {
    if (!args?.message_class_name)
      return return_error(new Error('message_class_name is required'));
    if (!Array.isArray(args?.messages))
      return return_error(new Error('messages array is required'));

    createAdtClient(connection, logger); // wrap connection (sap-language pinning)
    const name = args.message_class_name.toUpperCase();
    const url = `/sap/bc/adt/messageclass/${encodeSapObjectName(name).toLowerCase()}`;

    // Preserve the existing root open tag (namespaces + adtcore attrs) and packageRef.
    const current = await getAdt(connection, url);
    const openTag = current.match(/<mc:messageClass[^>]*>/)?.[0];
    const pkgRef = current.match(/<adtcore:packageRef[^>]*\/>/)?.[0] || '';
    if (!openTag) {
      return return_error(
        new Error(`Could not parse existing message class ${name}`),
      );
    }

    const messagesXml = args.messages
      .map((m) => {
        const no = String(m.msgno).padStart(3, '0');
        const self = m.self_explanatory === false ? 'false' : 'true';
        return `<mc:messages mc:msgno="${escXml(no)}" mc:msgtext="${escXml(m.text ?? '')}" mc:selfexplainatory="${self}" adtcore:name=""/>`;
      })
      .join('');

    const body = `<?xml version="1.0" encoding="UTF-8"?>${openTag}${pkgRef}${messagesXml}</mc:messageClass>`;

    await runLocked(connection, url, async (lockHandle) => {
      await putAdtContent(
        connection,
        url,
        body,
        lockHandle,
        args.transport_request,
      );
      logger?.info(
        `Message class updated: ${name} (${args.messages.length} message(s))`,
      );
    });

    return return_response({
      data: JSON.stringify(
        {
          success: true,
          message_class_name: name,
          message_count: args.messages.length,
          message: `Message class ${name} updated with ${args.messages.length} message(s).`,
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
    const bodyText = error?.response?.data
      ? typeof error.response.data === 'string'
        ? error.response.data
        : JSON.stringify(error.response.data)
      : '';
    const msg = `Error updating message class ${args?.message_class_name}: ${error instanceof Error ? error.message : String(error)}${bodyText ? ` | ADT: ${bodyText.slice(0, 1000)}` : ''}`;
    logger?.error(msg);
    return return_error(new Error(msg));
  }
}
