/**
 * CheckStructure Handler - Syntax check for ABAP Structure
 *
 * Uses AdtClient.checkStructure from @mcp-abap-adt/adt-clients.
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
  name: 'CheckStructureLow',
  available_in: ['onprem'] as const,
  description:
    '[low-level] Perform syntax check on an ABAP structure. Returns syntax errors, warnings, and messages. Can use session_id and session_state from GetSession to maintain the same session. If ddl_code is provided, validates new/unsaved code (will be base64 encoded in request).',
  inputSchema: {
    type: 'object',
    properties: {
      structure_name: {
        type: 'string',
        description: 'Structure name (e.g., Z_MY_PROGRAM).',
      },
      ddl_code: {
        type: 'string',
        description:
          'Optional DDL to check INSTEAD of the stored version. The object must ALREADY EXIST. Note this parameter was accepted and then silently DROPPED before 2026-08-26 for tables and structures (the dependency hardcoded no-source), so a verdict from an older build described the stored version, not this DDL.',
      },
      version: {
        type: 'string',
        description:
          "Version to check: 'active' (last activated) or 'inactive' (current unsaved). Default: active — a DDIC object with no inactive version cannot be checked as 'inactive'.",
        enum: ['active', 'inactive'],
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
    required: ['structure_name'],
  },
} as const;

interface CheckStructureArgs {
  structure_name: string;
  ddl_code?: string;
  version?: string;
  session_id?: string;
  session_state?: {
    cookies?: string;
    csrf_token?: string;
    cookie_store?: Record<string, string>;
  };
}

/**
 * Main handler for CheckStructure MCP tool
 *
 * Uses AdtClient.checkStructure - low-level single method call
 */
export async function handleCheckStructure(
  context: HandlerContext,
  args: CheckStructureArgs,
) {
  const { connection, logger } = context;
  try {
    const {
      structure_name,
      ddl_code,
      version = 'active',
      session_id,
      session_state,
    } = args as CheckStructureArgs;

    // Validation
    if (!structure_name) {
      return return_error(new Error('structure_name is required'));
    }

    createAdtClient(connection, logger); // wrap connection (sap-language pinning)

    // Restore session state if provided
    if (session_id && session_state) {
      await restoreSessionInConnection(connection, session_id, session_state);
    } else {
      // Ensure connection is established
    }

    const structureName = structure_name.toUpperCase();

    const validVersions = ['active', 'inactive'];
    // DEFAULT 'active', measured on DM2/310 (field report round 6). A DDIC object with no
    // inactive version answers the checkrun with status="notProcessed" and
    // "Error while importing object <NAME> from the database" for BOTH
    // 'inactive' and 'new' — so the old defaults meant a plain
    // `CheckTable(T100)` / `CheckStructure(X)` could never produce a verdict.
    // (It did not look broken before only because the dependency turned that
    // message-less report into an empty "check failed:" throw.) With a source
    // artifact the version makes no difference — all three behave identically.
    const checkVersion =
      version && validVersions.includes(version.toLowerCase())
        ? (version.toLowerCase() as 'active' | 'inactive')
        : 'active';

    logger?.info(
      `Starting structure check: ${structureName} (version: ${checkVersion}) ${ddl_code ? '(with new code)' : '(saved version)'}`,
    );

    try {
      // Check structure with optional source code (for validating new/unsaved code)
      // If ddl_code is provided, it will be base64 encoded in the request body
      // NOTE the dependency's AdtStructure.check() hardcodes `undefined` where
      // ddl_code belongs, so before this every "check my new DDL" call silently
      // reported a verdict about the version STORED in the system.
      const report = await checkObjectAndReport(connection, {
        objectUri: buildActivationUri(structureName, 'STRU'),
        subject: `structure ${structureName}`,
        version: checkVersion,
        sourceCode: ddl_code,
      });

      // Parse check results
      const checkResult = report.check_result;

      // Get updated session state after check

      logger?.info(`✅ CheckStructure completed: ${structureName}`);
      logger?.info(`   Status: ${checkResult.status}`);
      logger?.info(
        `   Errors: ${checkResult.errors.length}, Warnings: ${checkResult.warnings.length}`,
      );

      return return_response({
        data: JSON.stringify(
          {
            success: report.success,
            structure_name: structureName,
            version: checkVersion,
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
      logger?.error(`Error checking structure ${structureName}:`, error);

      // Parse error message
      let errorMessage = `Failed to check structure: ${error.message || String(error)}`;

      if (error.response?.status === 404) {
        errorMessage = `Structure ${structureName} not found.`;
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
