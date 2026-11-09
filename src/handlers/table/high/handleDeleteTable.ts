/**
 * DeleteTable Handler - Delete ABAP Table via AdtClient
 *
 * Uses AdtClient.getTable().delete() for high-level delete operation.
 * Includes deletion check before actual deletion.
 */

import { describeFailedDeletion } from '../../../lib/adtDeletion';
import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  type AxiosResponse,
  encodeSapObjectName,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'DeleteTable',
  available_in: ['onprem'] as const,
  description:
    'Delete an ABAP table from the SAP system. Includes deletion check before actual deletion. Transport request optional for $TMP objects.',
  inputSchema: {
    type: 'object',
    properties: {
      table_name: {
        type: 'string',
        description: 'Table name (e.g., Z_MY_TABLE).',
      },
      transport_request: {
        type: 'string',
        description:
          'Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).',
      },
    },
    required: ['table_name'],
  },
} as const;

interface DeleteTableArgs {
  table_name: string;
  transport_request?: string;
}

/**
 * Main handler for DeleteTable MCP tool
 *
 * Uses AdtClient.getTable().delete() - high-level delete operation with deletion check
 */
export async function handleDeleteTable(
  context: HandlerContext,
  args: DeleteTableArgs,
) {
  const { connection, logger } = context;
  try {
    const { table_name, transport_request } = args as DeleteTableArgs;

    // Validation
    if (!table_name) {
      return return_error(new Error('table_name is required'));
    }

    const client = createAdtClient(connection, logger);
    const tableName = table_name.toUpperCase();

    logger?.info(`Starting table deletion: ${tableName}`);

    try {
      // Delete table using AdtClient (includes deletion check)
      const tableObject = client.getTable();
      const deleteResult = await tableObject.delete({
        tableName,
        transportRequest: transport_request,
      });

      if (!deleteResult || !deleteResult.deleteResult) {
        throw new Error(
          `Delete did not return a response for table ${tableName}`,
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
        `/sap/bc/adt/ddic/tables/${encodeSapObjectName(tableName).toLowerCase()}`,
        `Table ${tableName}`,
      );
      if (deletionFailure) {
        throw new Error(deletionFailure);
      }

      logger?.info(`✅ DeleteTable completed successfully: ${tableName}`);

      return return_response({
        data: JSON.stringify(
          {
            success: true,
            table_name: tableName,
            transport_request: transport_request || null,
            message: `Table ${tableName} deleted successfully.`,
          },
          null,
          2,
        ),
      } as AxiosResponse);
    } catch (error: any) {
      logger?.error(
        `Error deleting table ${tableName}: ${error?.message || error}`,
      );

      // Parse error message
      let errorMessage = `Failed to delete table: ${error.message || String(error)}`;

      if (error.response?.status === 404) {
        errorMessage = `Table ${tableName} not found. It may already be deleted.`;
      } else if (error.response?.status === 423) {
        errorMessage = `Table ${tableName} is locked by another user. Cannot delete.`;
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
