/**
 * DeleteProgram Handler - Delete ABAP Program via AdtClient
 *
 * Uses AdtClient.getProgram().delete() for high-level delete operation.
 * Includes deletion check before actual deletion.
 */

import {
  deleteAdtObjectWithMessages,
  describeFailedDeletion,
} from '../../../lib/adtDeletion';
import { formatAdtMessages } from '../../../lib/adtMessages';
import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { programObjectUri, readTrdirRow } from '../../../lib/programTrdir';
import {
  type AxiosResponse,
  encodeSapObjectName,
  isCloudConnection,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'DeleteProgram',
  available_in: ['onprem', 'legacy'] as const,
  description:
    'Delete an ABAP program from the SAP system. Includes deletion check before actual deletion. Transport request optional for $TMP objects.',
  inputSchema: {
    type: 'object',
    properties: {
      program_name: {
        type: 'string',
        description: 'Program name (e.g., Z_MY_PROGRAM).',
      },
      transport_request: {
        type: 'string',
        description:
          'Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).',
      },
    },
    required: ['program_name'],
  },
} as const;

interface DeleteProgramArgs {
  program_name: string;
  transport_request?: string;
}

/**
 * Main handler for DeleteProgram MCP tool
 *
 * Uses AdtClient.getProgram().delete() - high-level delete operation with deletion check
 */
export async function handleDeleteProgram(
  context: HandlerContext,
  args: DeleteProgramArgs,
) {
  const { connection, logger } = context;
  try {
    const { program_name, transport_request } = args as DeleteProgramArgs;

    // Validation
    if (!program_name) {
      return return_error(new Error('program_name is required'));
    }

    if (isCloudConnection(connection)) {
      return return_error(
        new Error(
          'Programs are not available on cloud systems (ABAP Cloud). This operation is only supported on on-premise systems.',
        ),
      );
    }

    const client = createAdtClient(connection, logger);
    const programName = program_name.toUpperCase();

    logger?.info(`Starting program deletion: ${programName}`);

    try {
      // TRDIR says what the object is. An include lives under
      // /programs/includes: deleting or re-reading it through /programs/programs
      // does nothing and then reads "not found", which used to be reported as a
      // successful deletion while the include stayed in TRDIR (S4D, 2026-11-03).
      const before = await readTrdirRow(client, programName, logger);
      if (before === 'missing') {
        throw Object.assign(new Error(`Program ${programName} not found.`), {
          response: { status: 404 },
        });
      }
      const isInclude = before !== null && before.subc.toUpperCase() === 'I';
      const objectUri = programObjectUri(programName, isInclude ? 'I' : '1');

      if (isInclude) {
        const result = await deleteAdtObjectWithMessages(
          connection,
          objectUri,
          transport_request,
        );
        if (!result.isDeleted && result.errors.length) {
          throw new Error(
            `Include ${programName} was NOT deleted. SAP reported: ${formatAdtMessages(result.errors)}`,
          );
        }
      } else {
        // Delete program using AdtClient (includes deletion check)
        const deleteResult = await client.getProgram().delete({
          programName,
          transportRequest: transport_request,
        });
        if (!deleteResult || !deleteResult.deleteResult) {
          throw new Error(
            `Delete did not return a response for program ${programName}`,
          );
        }
      }

      // VERIFY against TRDIR, the one witness that answers for both resources.
      // (ADT answers HTTP 200 when it refuses a deletion, and the dependency
      // overwrites the body with a hardcoded success payload.)
      const after = await readTrdirRow(client, programName, logger);
      if (after !== 'missing') {
        const deletionFailure =
          after === null
            ? await describeFailedDeletion(
                connection,
                objectUri,
                `Program ${programName}`,
              )
            : `Program ${programName} was NOT deleted — TRDIR still holds it (SUBC '${after.subc}').`;
        if (deletionFailure) {
          throw new Error(deletionFailure);
        }
      }

      logger?.info(`✅ DeleteProgram completed successfully: ${programName}`);

      return return_response({
        data: JSON.stringify(
          {
            success: true,
            program_name: programName,
            transport_request: transport_request || null,
            message: `Program ${programName} deleted successfully.`,
          },
          null,
          2,
        ),
      } as AxiosResponse);
    } catch (error: any) {
      logger?.error(
        `Error deleting program ${programName}: ${error?.message || error}`,
      );

      // Parse error message
      let errorMessage = `Failed to delete program: ${error.message || String(error)}`;

      if (error.response?.status === 404) {
        errorMessage = `Program ${programName} not found. It may already be deleted.`;
      } else if (error.response?.status === 423) {
        errorMessage = `Program ${programName} is locked by another user. Cannot delete.`;
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
