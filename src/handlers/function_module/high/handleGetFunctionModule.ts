/**
 * GetFunctionModule Handler - Read ABAP FunctionModule via AdtClient
 *
 * Uses AdtClient.getFunctionModule().read() for high-level read operation.
 * Supports both active and inactive versions.
 */

import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  type AxiosResponse,
  return_error,
  return_response,
} from '../../../lib/utils';
import { handleGetSqlQuery } from '../../system/readonly/handleGetSqlQuery';
import { assertFunctionGroupMatches } from '../shared/parseContainerGroup';

export const TOOL_DEFINITION = {
  name: 'GetFunctionModule',
  available_in: ['onprem', 'legacy'] as const,
  description:
    'Retrieve an ABAP function module definition. Supports reading the active or ' +
    'inactive version. NOTE: the containing function GROUP is REQUIRED — ADT addresses ' +
    'a function module as <group>/fmodules/<module>, so there is no lookup by module ' +
    'name alone, so this tool resolves the group itself when you omit it (TFDIR-PNAME with ' +
    'the SAPL prefix removed) and reports which group it used. Passing it explicitly is ' +
    'still faster and avoids a lookup. Historic note — the manual route was: run ' +
    'GetSqlQuery on table TFDIR filtered by FUNCNAME, take PNAME and drop its leading ' +
    'SAPL prefix.',
  inputSchema: {
    type: 'object',
    properties: {
      function_module_name: {
        type: 'string',
        description: 'FunctionModule name (e.g., Z_MY_FUNCTIONMODULE).',
      },
      function_group_name: {
        type: 'string',
        description:
          'Function group containing the module (e.g., Z_MY_FUNCTIONGROUP). OPTIONAL: when ' +
          'omitted it is resolved from TFDIR-PNAME automatically (the lookup ADT itself does ' +
          'not offer) and the group actually used is reported in the response.',
      },
      version: {
        type: 'string',
        enum: ['active', 'inactive'],
        description:
          'Version to read: "active" (default) for deployed version, "inactive" for modified but not activated version.',
        default: 'active',
      },
    },
    required: ['function_module_name'],
  },
} as const;

interface GetFunctionModuleArgs {
  function_module_name: string;
  function_group_name?: string;
  version?: 'active' | 'inactive';
}

/**
 * Resolve a function module's owning group from TFDIR.
 *
 * TFDIR-PNAME is the generated program of the group: `SAPL<GROUP>`, or
 * `/NS/SAPL<GROUP>` for a namespaced group (observed live, e.g.
 * `/SCWM/SAPLTM_CORE` -> `/SCWM/TM_CORE`). Returns '' when nothing matches.
 */
async function resolveFunctionGroup(
  context: HandlerContext,
  functionModuleName: string,
): Promise<string> {
  // A single quote cannot appear in an ABAP object name, but escape anyway
  // rather than interpolating a caller-supplied value into SQL unguarded.
  const literal = functionModuleName.replace(/'/g, "''");
  const response = await handleGetSqlQuery(context, {
    sql_query: `SELECT funcname, pname FROM tfdir WHERE funcname = '${literal}'`,
    row_number: 2,
  });
  if (response?.isError) return '';
  let rows: Array<Record<string, string>> = [];
  try {
    rows = JSON.parse(String(response.content?.[0]?.text ?? '{}')).rows ?? [];
  } catch {
    return '';
  }
  const pname = String(rows[0]?.PNAME ?? '')
    .trim()
    .toUpperCase();
  if (!pname) return '';
  // Namespaced first, so '/NS/SAPLX' does not lose its namespace.
  const namespaced = /^(\/[^/]+\/)SAPL(.+)$/.exec(pname);
  if (namespaced) return `${namespaced[1]}${namespaced[2]}`;
  return pname.replace(/^SAPL/, '');
}

/**
 * Main handler for GetFunctionModule MCP tool
 *
 * Uses AdtClient.getFunctionModule().read() - high-level read operation
 */
export async function handleGetFunctionModule(
  context: HandlerContext,
  args: GetFunctionModuleArgs,
) {
  const { connection, logger } = context;
  try {
    const {
      function_module_name,
      function_group_name,
      version = 'active',
    } = args as GetFunctionModuleArgs;

    // Validation
    if (!function_module_name) {
      return return_error(new Error('function_module_name is required'));
    }

    const client = createAdtClient(connection, logger);
    const functionModuleName = function_module_name.toUpperCase();

    // ADT cannot look a module up by name alone, but TFDIR can: PNAME holds the
    // generated program of the owning group ('SAPL<GROUP>', or
    // '/NS/SAPL<GROUP>' in a namespace). The lookup is deterministic, so do it
    // rather than making every caller repeat it.
    let functionGroupName = function_group_name?.toUpperCase() ?? '';
    let resolvedGroup = false;
    if (!functionGroupName) {
      functionGroupName = await resolveFunctionGroup(
        context,
        functionModuleName,
      );
      if (!functionGroupName) {
        return return_error(
          new Error(
            `Could not resolve the function group of ${functionModuleName} from TFDIR — ` +
              'the module may not exist. Pass function_group_name explicitly if you know it.',
          ),
        );
      }
      resolvedGroup = true;
      logger?.info(
        `Resolved function group ${functionGroupName} for ${functionModuleName} via TFDIR`,
      );
    }

    logger?.info(
      `Reading function module ${functionModuleName} in ${functionGroupName}, version: ${version}`,
    );

    try {
      const functionModuleObject = client.getFunctionModule();

      // Verify ownership first — ADT resolves FM by name regardless of group
      // segment in URL, so we reject mismatches before returning source.
      const metaResult = await functionModuleObject.readMetadata({
        functionModuleName,
        functionGroupName,
      });
      const metadataXml =
        typeof metaResult?.metadataResult?.data === 'string'
          ? metaResult.metadataResult.data
          : null;
      const realGroup = assertFunctionGroupMatches(
        metadataXml,
        functionGroupName,
        functionModuleName,
      );

      const readResult = await functionModuleObject.read(
        { functionModuleName, functionGroupName: realGroup },
        version as 'active' | 'inactive',
      );

      if (!readResult || !readResult.readResult) {
        throw new Error(`FunctionModule ${functionModuleName} not found`);
      }

      // Extract data from read result
      let functionModuleData: string;
      if (typeof readResult.readResult.data === 'string') {
        functionModuleData = readResult.readResult.data;
      } else {
        try {
          functionModuleData = JSON.stringify(readResult.readResult.data);
        } catch {
          // Fallback for circular references (e.g. raw Axios response objects)
          functionModuleData = String(readResult.readResult.data);
        }
      }

      logger?.info(
        `GetFunctionModule completed successfully: ${functionModuleName} in ${realGroup}`,
      );

      return return_response({
        data: JSON.stringify(
          {
            success: true,
            function_module_name: functionModuleName,
            function_group_name: realGroup,
            ...(resolvedGroup
              ? {
                  function_group_resolved_from: 'TFDIR-PNAME',
                }
              : {}),
            version,
            function_module_data: functionModuleData,
            status: readResult.readResult.status,
            status_text: readResult.readResult.statusText,
          },
          null,
          2,
        ),
      } as AxiosResponse);
    } catch (error: any) {
      logger?.error(
        `Error reading function module ${functionModuleName}: ${error?.message || error}`,
      );

      // Parse error message
      let errorMessage = `Failed to read function module: ${error.message || String(error)}`;

      if (error.response?.status === 404) {
        errorMessage = `FunctionModule ${functionModuleName} not found.`;
      } else if (error.response?.status === 423) {
        errorMessage = `FunctionModule ${functionModuleName} is locked by another user.`;
      }

      return return_error(new Error(errorMessage));
    }
  } catch (error: any) {
    return return_error(error);
  }
}
