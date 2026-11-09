/**
 * DeleteStructure Handler - Delete ABAP Structure via AdtClient
 */

import {
  deleteAdtObjectWithMessages,
  describeFailedDeletion,
} from '../../../lib/adtDeletion';
import { formatAdtMessages } from '../../../lib/adtMessages';
import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  type AxiosResponse,
  encodeSapObjectName,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'DeleteStructure',
  available_in: ['onprem'] as const,
  description:
    'Delete an ABAP structure from the SAP system. Includes deletion check before actual deletion. Transport request optional for $TMP objects.',
  inputSchema: {
    type: 'object',
    properties: {
      structure_name: {
        type: 'string',
        description: 'Structure name (e.g., Z_MY_STRUCTURE).',
      },
      transport_request: {
        type: 'string',
        description:
          'Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).',
      },
    },
    required: ['structure_name'],
  },
} as const;

interface DeleteStructureArgs {
  structure_name: string;
  transport_request?: string;
}

export async function handleDeleteStructure(
  context: HandlerContext,
  args: DeleteStructureArgs,
) {
  const { connection, logger } = context;
  try {
    const { structure_name, transport_request } = args as DeleteStructureArgs;

    if (!structure_name) {
      return return_error(new Error('structure_name is required'));
    }

    const client = createAdtClient(connection, logger);
    const structureName = structure_name.toUpperCase();

    logger?.info(`Starting structure deletion: ${structureName}`);

    try {
      // Delete through our own request rather than the dep's
      // getStructure().delete(): deleteStructure() in adt-clients spreads the
      // real response and then REPLACES its body with a hardcoded
      // `{ success: true, message: "... deleted successfully" }`, so SAP's own
      // del:deletionResult — the isDeleted verdict and the del:message list
      // explaining a refusal — was unreachable. Going direct relays both.
      const structureUri = `/sap/bc/adt/ddic/structures/${encodeSapObjectName(structureName).toLowerCase()}`;
      const deletion = await deleteAdtObjectWithMessages(
        connection,
        structureUri,
        transport_request,
      );
      if (!deletion.isDeleted) {
        throw new Error(
          `Failed to delete structure ${structureName}: ` +
            (formatAdtMessages(deletion.messages) ||
              'SAP reported isDeleted=false without a message'),
        );
      }

      // VERIFY the deletion actually happened.
      //
      // The guard above only proves a response object came back. ADT answers
      // HTTP 200 when it REFUSES a deletion (the reason lives in the response
      // messages), and the dep's delete functions additionally overwrite the
      // response body with a hardcoded success payload — so a refused deletion
      // was reported as "deleted successfully" while the object stayed in the
      // system, and the next run failed with a misleading "already exists".
      const deletionFailure = await describeFailedDeletion(
        connection,
        structureUri,
        `Structure ${structureName}`,
        deletion.messages,
      );
      if (deletionFailure) {
        throw new Error(deletionFailure);
      }

      logger?.info(
        `✅ DeleteStructure completed successfully: ${structureName}`,
      );

      return return_response({
        data: JSON.stringify(
          {
            success: true,
            structure_name: structureName,
            transport_request: transport_request || null,
            message: `Structure ${structureName} deleted successfully.`,
          },
          null,
          2,
        ),
      } as AxiosResponse);
    } catch (error: any) {
      logger?.error(
        `Error deleting structure ${structureName}: ${error?.message || error}`,
      );

      let errorMessage = `Failed to delete structure: ${error.message || String(error)}`;

      if (error.response?.status === 404) {
        errorMessage = `Structure ${structureName} not found. It may already be deleted.`;
      } else if (error.response?.status === 423) {
        errorMessage = `Structure ${structureName} is locked by another user. Cannot delete.`;
      } else if (error.response?.status === 400) {
        errorMessage = `Bad request. Check if transport request is required and valid.`;
      } else if (
        error.response?.data &&
        typeof error.response.data === 'string'
      ) {
        try {
          const { XMLParser } = require('fast-xml-parser');
          const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
          });
          const errorData = parser.parse(error.response.data);
          const errorMsg =
            errorData['exc:exception']?.message?.['#text'] ||
            errorData['exc:exception']?.message;
          if (errorMsg) {
            errorMessage = `SAP Error: ${errorMsg}`;
          }
        } catch (_parseError) {
          // Ignore parse errors
        }
      }

      return return_error(new Error(errorMessage));
    }
  } catch (error: any) {
    return return_error(error);
  }
}
