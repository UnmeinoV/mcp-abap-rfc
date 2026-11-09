/**
 * DeleteAccessControl Handler - Delete a DCL source.
 *
 * Uses the shared deletion API (`/sap/bc/adt/deletion/delete`, object-type
 * agnostic) so SAP's own `del:isDeleted` and every `del:message` survive, then
 * VERIFIES against the system that the object is really gone. The dep's
 * `deleteAccessControl()` cannot be used for this: it overwrites the response
 * body with a hardcoded `{ success: true, message: "… deleted successfully" }`.
 */

import { accessControlUri } from '../../../lib/accessControlXml';
import {
  deleteAdtObjectWithMessages,
  describeFailedDeletion,
} from '../../../lib/adtDeletion';
import { formatAdtMessages } from '../../../lib/adtMessages';
import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { return_error, return_response } from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'DeleteAccessControl',
  available_in: ['onprem'] as const,
  description:
    'Operation: Delete. Subject: Access Control (DCL / DCLS). Delete a DCL source from the SAP ' +
    'system. The deletion is verified against the system afterwards, so a refusal is reported as ' +
    'a failure with SAP’s own reason rather than as success.',
  inputSchema: {
    type: 'object',
    properties: {
      access_control_name: {
        type: 'string',
        description: 'DCL name.',
      },
      transport_request: {
        type: 'string',
        description:
          'Transport request. Required for transportable objects; omit for $TMP.',
      },
    },
    required: ['access_control_name'],
  },
} as const;

interface DeleteAccessControlArgs {
  access_control_name: string;
  transport_request?: string;
}

export async function handleDeleteAccessControl(
  context: HandlerContext,
  args: DeleteAccessControlArgs,
) {
  const { connection, logger } = context;
  try {
    if (!args?.access_control_name) {
      return return_error(new Error('access_control_name is required'));
    }
    createAdtClient(connection, logger); // wrap connection (sap-language pinning)
    const name = args.access_control_name.toUpperCase();
    const uri = accessControlUri(name);

    const result = await deleteAdtObjectWithMessages(
      connection,
      uri,
      args.transport_request,
    );

    if (!result.isDeleted) {
      const detail = result.messages.length
        ? formatAdtMessages(result.messages)
        : 'SAP reported the object was not deleted (no message returned).';
      return return_error(
        new Error(`Failed to delete access control ${name}: ${detail}`),
      );
    }

    // GROUND TRUTH: ask the system, do not trust the delete call's own report.
    const deletionFailure = await describeFailedDeletion(
      connection,
      uri,
      `Access control ${name}`,
      result.messages,
    );
    if (deletionFailure) {
      return return_error(new Error(deletionFailure));
    }

    logger?.info(`Access control deleted: ${name}`);

    return return_response({
      data: JSON.stringify(
        {
          success: true,
          access_control_name: name,
          transport_request: args.transport_request || null,
          messages: result.messages,
          message: `Access control ${name} deleted successfully.`,
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
    let msg = `Error deleting access control ${args?.access_control_name}: ${
      error instanceof Error ? error.message : String(error)
    }`;
    if (error?.response?.status === 404) {
      msg = `Access control ${args?.access_control_name?.toUpperCase()} not found. It may already be deleted.`;
    } else if (error?.response?.status === 423) {
      msg = `Access control ${args?.access_control_name?.toUpperCase()} is locked by an existing edit session — clear it in SM12 or wait for it to expire.`;
    } else if (bodyText) {
      msg += ` | ADT: ${bodyText.slice(0, 1000)}`;
    }
    logger?.error(msg);
    return return_error(new Error(msg));
  }
}
