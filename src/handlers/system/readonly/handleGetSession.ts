/**
 * GetSession Handler - Get session ID and session state for reuse across multiple requests
 *
 * Returns session ID and session state (cookies, CSRF token) that can be passed
 * to other handlers to maintain the same session and lock handle across operations.
 */

import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { describeSapClients } from '../../../lib/sapClients';
import { getServerBuildInfo } from '../../../lib/serverVersion';
import { generateSessionId } from '../../../lib/sessionUtils';
import {
  type AxiosResponse,
  getTimeoutConfig,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'GetSession',
  available_in: ['onprem'] as const,
  description:
    '[read-only] Get a new session ID and current session state (cookies, CSRF token) for reuse across multiple ADT operations, plus the identity of the server build answering: server_version, build_timestamp (the build actually LOADED, not the file currently on disk), started_at and pid. Call it first when recording a measurement, so the result can be attributed to a build.',
  inputSchema: {
    type: 'object',
    properties: {
      force_new: {
        type: 'boolean',
        description:
          'Force creation of a new session even if one exists. Default: false',
      },
    },
    required: [],
  },
} as const;

interface GetSessionArgs {
  force_new?: boolean;
}

/**
 * Main handler for GetSession MCP tool
 *
 * Returns session ID and session state that can be reused in other handlers
 */
export async function handleGetSession(
  context: HandlerContext,
  args: GetSessionArgs,
) {
  const { connection, logger } = context;
  try {
    const { force_new = false } = args as GetSessionArgs;

    logger?.debug(
      `Connecting managed session${force_new ? ' (force new)' : ''}...`,
    );

    // Ensure connection is established (get cookies and CSRF token)
    // Generate new session ID
    const sessionId = generateSessionId();

    // Session state is not persisted by this server
    logger?.info(
      `✅ GetSession completed: session ID ${sessionId.substring(0, 8)}...`,
    );

    return return_response({
      data: JSON.stringify(
        {
          success: true,
          session_id: sessionId,
          session_state: null, // Session state is not persisted by this server
          // field report round 7, F-11. Captured at process start, not read per call: a
          // rebuild after startup changes the file on disk while this process
          // keeps serving the old code, and reporting the newer file would
          // recreate the confusion this field exists to end.
          ...getServerBuildInfo(),
          // round 3 R3-F3. A caller who hits "timeout of 45000ms exceeded" has no
          // way to see what the limit IS or that it is settable, so the same
          // answer is on the same tool as the build identity.
          timeouts_ms: {
            ...getTimeoutConfig(),
            configured_by:
              'SAP_TIMEOUT_DEFAULT / SAP_TIMEOUT_CSRF / SAP_TIMEOUT_LONG (milliseconds, read per call)',
          },
          // Multi-client: which clients this server can reach and which it has
          // logged on to. Absent when SAP_CLIENTS is not configured.
          sap_clients: describeSapClients(),
          message: `Session ID generated. Use this session_id in subsequent requests to maintain the same session.`,
        },
        null,
        2,
      ),
    } as AxiosResponse);
  } catch (error: any) {
    logger?.error('Error getting session:', error);
    return return_error(error);
  }
}
