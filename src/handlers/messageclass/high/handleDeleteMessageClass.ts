/**
 * DeleteMessageClass Handler - Delete an ABAP message class (MSAG).
 * Workflow: lock -> DELETE.
 */

import { describeFailedDeletion } from '../../../lib/adtDeletion';
import { deleteAdt, runLocked } from '../../../lib/adtObjectOps';
import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  encodeSapObjectName,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'DeleteMessageClass',
  available_in: ['onprem', 'legacy'] as const,
  description:
    'Operation: Delete. Subject: MessageClass. Delete an ABAP message class (MSAG) from the SAP system.',
  inputSchema: {
    type: 'object',
    properties: {
      message_class_name: {
        type: 'string',
        description: 'Message class name.',
      },
      transport_request: {
        type: 'string',
        description:
          'Transport request. Required for transportable objects; optional for $TMP.',
      },
    },
    required: ['message_class_name'],
  },
} as const;

interface DeleteMessageClassArgs {
  message_class_name: string;
  transport_request?: string;
}

export async function handleDeleteMessageClass(
  context: HandlerContext,
  args: DeleteMessageClassArgs,
) {
  const { connection, logger } = context;
  try {
    if (!args?.message_class_name)
      return return_error(new Error('message_class_name is required'));
    createAdtClient(connection, logger); // wrap connection (sap-language pinning)
    const name = args.message_class_name.toUpperCase();
    const url = `/sap/bc/adt/messageclass/${encodeSapObjectName(name).toLowerCase()}`;

    await runLocked(connection, url, async (lockHandle) => {
      await deleteAdt(connection, url, lockHandle, args.transport_request);
    });

    // GROUND TRUTH: verify the object is really gone rather than trusting
    // that the DELETE returned without throwing. Same reason the other
    // Delete* handlers verify — a deletion SAP declined must not be
    // reported as success, or the next run fails with a misleading
    // "already exists".
    const deletionFailure = await describeFailedDeletion(
      connection,
      url,
      `Message class ${name}`,
    );
    if (deletionFailure) {
      throw new Error(deletionFailure);
    }
    logger?.info(`Message class deleted: ${name}`);

    return return_response({
      data: JSON.stringify(
        {
          success: true,
          message_class_name: name,
          message: `Message class ${name} deleted successfully.`,
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
    const msg = `Error deleting message class ${args?.message_class_name}: ${error instanceof Error ? error.message : String(error)}${bodyText ? ` | ADT: ${bodyText.slice(0, 1000)}` : ''}`;
    logger?.error(msg);
    return return_error(new Error(msg));
  }
}
