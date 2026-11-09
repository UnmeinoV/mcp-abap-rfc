/**
 * CheckProgram Handler - Syntax check for ABAP Program
 *
 * Uses AdtClient.checkProgram from @mcp-abap-adt/adt-clients.
 * Low-level handler: single method call.
 */

import { checkObjectAndReport } from '../../../lib/adtObjectOps';
import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  type AxiosResponse,
  encodeSapObjectName,
  isCloudConnection,
  restoreSessionInConnection,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'CheckProgramLow',
  available_in: ['onprem', 'legacy'] as const,
  description:
    '[low-level] Perform syntax check on an ABAP program. Returns syntax errors, warnings, and messages. Can use session_id and session_state from GetSession to maintain the same session.',
  inputSchema: {
    type: 'object',
    properties: {
      program_name: {
        type: 'string',
        description: 'Program name (e.g., Z_MY_PROGRAM).',
      },
      session_id: {
        type: 'string',
        description:
          'Session ID from GetSession. If not provided, a new session will be created.',
      },
      session_state: {
        type: 'object',
        description:
          'Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.',
        properties: {
          cookies: { type: 'string' },
          csrf_token: { type: 'string' },
          cookie_store: { type: 'object' },
        },
      },
    },
    required: ['program_name'],
  },
} as const;

interface CheckProgramArgs {
  program_name: string;
  session_id?: string;
  session_state?: {
    cookies?: string;
    csrf_token?: string;
    cookie_store?: Record<string, string>;
  };
}

/**
 * Main handler for CheckProgram MCP tool
 *
 * Uses AdtClient.checkProgram - low-level single method call
 */
export async function handleCheckProgram(
  context: HandlerContext,
  args: CheckProgramArgs,
) {
  const { connection, logger } = context;
  try {
    const { program_name, session_id, session_state } = args;

    // Validation
    if (!program_name) {
      return return_error(new Error('program_name is required'));
    }

    // Check if cloud - programs are not available on cloud systems
    if (isCloudConnection(connection)) {
      return return_error(
        new Error(
          'Programs are not available on cloud systems (ABAP Cloud). This operation is only supported on on-premise systems.',
        ),
      );
    }

    createAdtClient(connection, logger); // wrap connection (sap-language pinning)

    // Restore session state if provided
    if (session_id && session_state) {
      await restoreSessionInConnection(connection, session_id, session_state);
    }

    const programName = program_name.toUpperCase();

    logger?.info(`Starting program check: ${programName}`);

    try {
      // Our own checkrun + formatter: see checkObjectAndReport for the three
      // separate ways the dependency's per-type check() gets this wrong.
      const report = await checkObjectAndReport(connection, {
        objectUri: `/sap/bc/adt/programs/programs/${encodeSapObjectName(programName).toLowerCase()}`,
        subject: `program ${programName}`,
      });
      const checkResult = report.check_result;

      // Get updated session state after check

      logger?.info(`✅ CheckProgram completed: ${programName}`);
      logger?.debug(
        `Status: ${checkResult.status} | Errors: ${checkResult.errors.length}, Warnings: ${checkResult.warnings.length}`,
      );

      return return_response({
        data: JSON.stringify(
          {
            success: report.success,
            program_name: programName,
            check_result: checkResult,
            session_id: session_id || null,
            session_state: null, // Session state is not persisted by this server,
            message: report.message,
            findings: report.findings,
          },
          null,
          2,
        ),
      } as AxiosResponse);
    } catch (error: any) {
      logger?.error(
        `Error checking program ${programName}: ${error?.message || error}`,
      );

      // Parse error message
      let errorMessage = `Failed to check program: ${error.message || String(error)}`;

      if (error.response?.status === 404) {
        errorMessage = `Program ${programName} not found.`;
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
