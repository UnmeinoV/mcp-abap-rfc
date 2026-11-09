/**
 * CheckInterface Handler - Syntax check for ABAP Interface
 *
 * Uses AdtClient.checkInterface from @mcp-abap-adt/adt-clients.
 * Low-level handler: single method call.
 */

import {
  buildActivationUri,
  checkObjectAndReport,
} from '../../../lib/adtObjectOps';
import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  type AxiosResponse,
  restoreSessionInConnection,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'CheckInterfaceLow',
  available_in: ['onprem', 'legacy'] as const,
  description:
    '[low-level] Perform syntax check on an ABAP interface. Returns syntax errors, warnings, and messages. Can use session_id and session_state from GetSession to maintain the same session.',
  inputSchema: {
    type: 'object',
    properties: {
      interface_name: {
        type: 'string',
        description: 'Interface name (e.g., Z_MY_PROGRAM).',
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
    required: ['interface_name'],
  },
} as const;

interface CheckInterfaceArgs {
  interface_name: string;
  session_id?: string;
  session_state?: {
    cookies?: string;
    csrf_token?: string;
    cookie_store?: Record<string, string>;
  };
}

/**
 * Main handler for CheckInterface MCP tool
 *
 * Uses AdtClient.checkInterface - low-level single method call
 */
export async function handleCheckInterface(
  context: HandlerContext,
  args: CheckInterfaceArgs,
) {
  const { connection, logger } = context;
  try {
    const { interface_name, session_id, session_state } =
      args as CheckInterfaceArgs;

    // Validation
    if (!interface_name) {
      return return_error(new Error('interface_name is required'));
    }

    createAdtClient(connection, logger); // wrap connection (sap-language pinning)

    // Restore session state if provided
    if (session_id && session_state) {
      await restoreSessionInConnection(connection, session_id, session_state);
    }

    const interfaceName = interface_name.toUpperCase();

    logger?.info(`Starting interface check: ${interfaceName}`);

    try {
      const report = await checkObjectAndReport(connection, {
        objectUri: buildActivationUri(interfaceName, 'INTF'),
        subject: `interface ${interfaceName}`,
      });
      const checkResult = report.check_result;

      // Get updated session state after check

      logger?.info(`✅ CheckInterface completed: ${interfaceName}`);
      logger?.debug(
        `Status: ${checkResult.status} | Errors: ${checkResult.errors.length}, Warnings: ${checkResult.warnings.length}`,
      );

      return return_response({
        data: JSON.stringify(
          {
            success: report.success,
            interface_name: interfaceName,
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
        `Error checking interface ${interfaceName}: ${error?.message || error}`,
      );

      // Parse error message
      let errorMessage = `Failed to check interface: ${error.message || String(error)}`;

      if (error.response?.status === 404) {
        errorMessage = `Interface ${interfaceName} not found.`;
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
