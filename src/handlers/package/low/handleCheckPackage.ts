/**
 * CheckPackage Handler - Syntax check for ABAP Package
 *
 * Uses AdtClient.checkPackage from @mcp-abap-adt/adt-clients.
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
  name: 'CheckPackageLow',
  available_in: ['onprem', 'legacy'] as const,
  description:
    '[low-level] Perform syntax check on an ABAP package. Returns syntax errors, warnings, and messages. Can use session_id and session_state from GetSession to maintain the same session.',
  inputSchema: {
    type: 'object',
    properties: {
      package_name: {
        type: 'string',
        description: 'Package name (e.g., ZOK_TEST_0002).',
      },
      super_package: {
        type: 'string',
        description:
          'Super package (parent package) name (e.g., ZOK_PACKAGE). Required.',
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
    required: ['package_name', 'super_package'],
  },
} as const;

interface CheckPackageArgs {
  package_name: string;
  super_package: string;
  session_id?: string;
  session_state?: {
    cookies?: string;
    csrf_token?: string;
    cookie_store?: Record<string, string>;
  };
}

/**
 * Main handler for CheckPackage MCP tool
 *
 * Uses AdtClient.checkPackage - low-level single method call
 */
export async function handleCheckPackage(
  context: HandlerContext,
  args: CheckPackageArgs,
) {
  const { connection, logger } = context;
  try {
    const { package_name, super_package, session_id, session_state } =
      args as CheckPackageArgs;

    // Validation
    if (!package_name || !super_package) {
      return return_error(
        new Error('package_name and super_package are required'),
      );
    }

    createAdtClient(connection, logger); // wrap connection (sap-language pinning)

    // Restore session state if provided
    if (session_id && session_state) {
      await restoreSessionInConnection(connection, session_id, session_state);
    } else {
      // Ensure connection is established
    }

    const packageName = package_name.toUpperCase();
    const superPackage = super_package.toUpperCase();

    logger?.info(`Starting package check: ${packageName} in ${superPackage}`);

    try {
      // The dependency's checkPackage() posts exactly this checkrun and ignores
      // its own superPackage argument; going direct only adds the positions.
      const report = await checkObjectAndReport(connection, {
        objectUri: `/sap/bc/adt/packages/${encodeSapObjectName(packageName).toLowerCase()}`,
        subject: `package ${packageName}`,
      });

      // Parse check results
      const checkResult = report.check_result;

      // Get updated session state after check

      logger?.info(`✅ CheckPackage completed: ${packageName}`);
      logger?.debug(
        `Status: ${checkResult.status} | Errors: ${checkResult.errors.length}, Warnings: ${checkResult.warnings.length}`,
      );

      return return_response({
        data: JSON.stringify(
          {
            success: report.success,
            package_name: packageName,
            super_package: superPackage,
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
        `Error checking package ${packageName}: ${error?.message || error}`,
      );

      // Parse error message
      let errorMessage = `Failed to check package: ${error.message || String(error)}`;

      if (error.response?.status === 404) {
        errorMessage = `Package ${packageName} not found.`;
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
