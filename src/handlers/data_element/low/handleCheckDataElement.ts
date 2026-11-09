/**
 * CheckDataElement Handler - Syntax check for ABAP DataElement
 *
 * Uses AdtClient.checkDataElement from @mcp-abap-adt/adt-clients.
 * Low-level handler: single method call.
 */

import { checkObjectAndReport } from '../../../lib/adtObjectOps';
import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  type AxiosResponse,
  encodeSapObjectName,
  restoreSessionInConnection,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'CheckDataElementLow',
  available_in: ['onprem'] as const,
  description:
    '[low-level] Perform syntax check on an ABAP data element. Returns syntax errors, warnings, and messages. Can use session_id and session_state from GetSession to maintain the same session.',
  inputSchema: {
    type: 'object',
    properties: {
      data_element_name: {
        type: 'string',
        description: 'DataElement name (e.g., Z_MY_PROGRAM).',
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
    required: ['data_element_name'],
  },
} as const;

interface CheckDataElementArgs {
  data_element_name: string;
  session_id?: string;
  session_state?: {
    cookies?: string;
    csrf_token?: string;
    cookie_store?: Record<string, string>;
  };
}

/**
 * Main handler for CheckDataElement MCP tool
 *
 * Uses AdtClient.checkDataElement - low-level single method call
 */
export async function handleCheckDataElement(
  context: HandlerContext,
  args: CheckDataElementArgs,
) {
  const { connection, logger } = context;
  try {
    const { data_element_name, session_id, session_state } =
      args as CheckDataElementArgs;

    // Validation
    if (!data_element_name) {
      return return_error(new Error('data_element_name is required'));
    }

    createAdtClient(connection, logger); // wrap connection (sap-language pinning)

    // Restore session state if provided
    if (session_id && session_state) {
      await restoreSessionInConnection(connection, session_id, session_state);
    }

    const dataElementName = data_element_name.toUpperCase();

    logger?.info(`Starting data element check: ${dataElementName}`);

    try {
      // Our own checkrun + formatter: see checkObjectAndReport for the three
      // separate ways the dependency's per-type check() gets this wrong.
      const report = await checkObjectAndReport(connection, {
        objectUri: `/sap/bc/adt/ddic/dataelements/${encodeSapObjectName(dataElementName).toLowerCase()}`,
        subject: `data element ${dataElementName}`,
      });
      const checkResult = report.check_result;

      // Get updated session state after check

      logger?.info(`✅ CheckDataElement completed: ${dataElementName}`);
      logger?.debug(
        `Status: ${checkResult.status} | Errors: ${checkResult.errors.length}, Warnings: ${checkResult.warnings.length}`,
      );

      return return_response({
        data: JSON.stringify(
          {
            success: report.success,
            data_element_name: dataElementName,
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
        `Error checking data element ${dataElementName}: ${error?.message || error}`,
      );

      // Parse error message
      let errorMessage = `Failed to check data element: ${error.message || String(error)}`;

      if (error.response?.status === 404) {
        errorMessage = `DataElement ${dataElementName} not found.`;
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
