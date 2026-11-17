/**
 * UpdateStructure Handler - Update ABAP Structure DDL Source
 *
 * Uses AdtClient.updateStructure from @mcp-abap-adt/adt-clients.
 * Low-level handler: single method call.
 */

import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { resolveLowTransport } from '../../../lib/lowLockTransport';
import {
  type AxiosResponse,
  restoreSessionInConnection,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'UpdateStructureLow',
  available_in: ['onprem'] as const,
  description:
    '[low-level] Update DDL source code of an existing ABAP structure. Requires lock handle from LockObject. - use UpdateStructureSource for full workflow with lock/unlock.',
  inputSchema: {
    type: 'object',
    properties: {
      structure_name: {
        type: 'string',
        description:
          'Structure name (e.g., ZZ_S_TEST_001). Structure must already exist.',
      },
      ddl_code: {
        type: 'string',
        description: 'Complete DDL source code for the structure definition.',
      },
      lock_handle: {
        type: 'string',
        description: 'Lock handle from LockObject.',
      },
      transport_request: {
        type: 'string',
        description:
          'Transport request/task (corrNr) for a transportable package; omit for $TMP.',
      },
      session_id: {
        type: 'string',
        description: 'Optional session ID from GetSession.',
      },
      session_state: {
        type: 'object',
        description: 'Session state from GetSession; needed with session_id.',
        properties: {
          cookies: { type: 'string' },
          csrf_token: { type: 'string' },
          cookie_store: { type: 'object' },
        },
      },
    },
    required: ['structure_name', 'ddl_code', 'lock_handle'],
  },
} as const;

interface UpdateStructureArgs {
  transport_request?: string;
  structure_name: string;
  ddl_code: string;
  lock_handle: string;
  session_id?: string;
  session_state?: {
    cookies?: string;
    csrf_token?: string;
    cookie_store?: Record<string, string>;
  };
}

/**
 * Main handler for UpdateStructure MCP tool
 *
 * Uses AdtClient.updateStructure - low-level single method call
 */
export async function handleUpdateStructure(
  context: HandlerContext,
  args: UpdateStructureArgs,
) {
  const { connection, logger } = context;
  try {
    const { structure_name, ddl_code, lock_handle, session_id, session_state } =
      args as UpdateStructureArgs;

    // Validation
    if (!structure_name || !ddl_code || !lock_handle) {
      return return_error(
        new Error('structure_name, ddl_code, and lock_handle are required'),
      );
    }

    const client = createAdtClient(connection, logger);
    // The caller's argument, else the CORRNR SAP returned to the Lock*Low
    // call that produced this handle (issue #3).
    const { transportRequest, source: transportSource } = resolveLowTransport(
      (args as { transport_request?: string }).transport_request,
      (args as { lock_handle?: string }).lock_handle,
    );

    // Restore session state if provided
    if (session_id && session_state) {
      await restoreSessionInConnection(connection, session_id, session_state);
    } else {
      // Ensure connection is established
    }

    const structureName = structure_name.toUpperCase();

    logger?.info(`Starting structure update: ${structureName}`);

    try {
      // Update structure with DDL code
      const updateState = await client.getStructure().update(
        {
          structureName: structureName,
          ddlCode: ddl_code,
          transportRequest,
        },
        { lockHandle: lock_handle },
      );
      const updateResult = updateState.updateResult;

      if (!updateResult) {
        throw new Error(
          `Update did not return a response for structure ${structureName}`,
        );
      }

      // Get updated session state after update

      logger?.info(`✅ UpdateStructure completed: ${structureName}`);

      return return_response({
        data: JSON.stringify(
          {
            success: true,
            transport_request: transportRequest ?? null,
            ...(transportSource === 'lock'
              ? { transport_request_source: 'lock (CORRNR)' }
              : {}),
            structure_name: structureName,
            session_id: session_id || null,
            session_state: null, // Session state is not persisted by this server,
            message: `Structure ${structureName} updated successfully. Remember to unlock using UnlockObject.`,
          },
          null,
          2,
        ),
      } as AxiosResponse);
    } catch (error: any) {
      logger?.error(`Error updating structure ${structureName}:`, error);

      // Parse error message
      let errorMessage = `Failed to update structure: ${error.message || String(error)}`;

      if (error.response?.status === 404) {
        errorMessage = `Structure ${structureName} not found.`;
      } else if (error.response?.status === 423) {
        errorMessage = `Structure ${structureName} is locked by another user or lock handle is invalid.`;
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
