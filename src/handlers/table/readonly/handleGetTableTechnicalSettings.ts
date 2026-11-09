/**
 * GetTableTechnicalSettings — read a table's SE13 settings (buffering, size
 * category, data class, logging).
 *
 * There was previously no way to see this through the MCP: the settings object
 * is not part of the table's own payload, and DD09L's SPEICHKLA column is not
 * exposed by the ADT Data Preview. The response therefore also reports the
 * DD09L-PUFFERUNG value the state corresponds to, so the caller can cross-check
 * it with `SELECT tabname, pufferung FROM dd09l` (that read does work).
 */

import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  CT_TABLE_SETTINGS,
  describeBuffering,
  parseTableSettings,
  tableSettingsUri,
} from '../../../lib/tableSettingsXml';
import {
  makeAdtRequestWithTimeout,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'GetTableTechnicalSettings',
  available_in: ['onprem'] as const,
  description:
    '[read-only] Operation: Read. Subject: Table technical settings (SE13). Report a table’s ' +
    'buffering mode, size category, data class and change-logging flag. ' +
    'Buffering is encoded by SAP as two fields, so "allowed" alone does NOT mean the table is ' +
    'buffered — the response states the effective mode in plain words and gives the ' +
    'DD09L-PUFFERUNG value it corresponds to for an independent check.',
  inputSchema: {
    type: 'object',
    properties: {
      table_name: {
        type: 'string',
        description: 'Table name (e.g., ZMY_TABLE).',
      },
      version: {
        type: 'string',
        description: 'Version to read: "active" (default) or "inactive".',
        enum: ['active', 'inactive'],
      },
    },
    required: ['table_name'],
  },
} as const;

interface Args {
  table_name: string;
  version?: 'active' | 'inactive';
}

export async function handleGetTableTechnicalSettings(
  context: HandlerContext,
  args: Args,
) {
  const { connection, logger } = context;
  try {
    if (!args?.table_name) {
      return return_error(new Error('table_name is required'));
    }
    createAdtClient(connection, logger); // wrap connection (sap-language pinning)
    const tableName = args.table_name.toUpperCase();
    const uri = tableSettingsUri(tableName);

    const response = await makeAdtRequestWithTimeout(
      connection,
      uri,
      'GET',
      'default',
      undefined,
      { version: args.version || 'active' },
      { Accept: CT_TABLE_SETTINGS },
    );

    const settings = parseTableSettings(String(response?.data ?? ''));

    // A pending INACTIVE version is invisible in the active read but decides
    // what happens on the next activation — an unactivatable inactive setting
    // makes every later activation of the table (and of its indexes) fail with
    // a message about buffering, which reads like an unrelated defect. So say so.
    const warnings: string[] = [];
    if ((args.version || 'active') === 'active') {
      try {
        const inactive = await makeAdtRequestWithTimeout(
          connection,
          uri,
          'GET',
          'default',
          undefined,
          { version: 'inactive' },
          { Accept: CT_TABLE_SETTINGS },
        );
        const pending = parseTableSettings(String(inactive?.data ?? ''));
        if (
          pending.version === 'inactive' &&
          (pending.buffering !== settings.buffering ||
            pending.size_category !== settings.size_category ||
            pending.data_class !== settings.data_class ||
            pending.logging_enabled !== settings.logging_enabled)
        ) {
          warnings.push(
            'An INACTIVE version of these settings is pending and differs from the active ' +
              `one (${describeBuffering(pending)}, size category ${pending.size_category}, ` +
              `data class ${pending.data_class}, logging ${
                pending.logging_enabled ? 'on' : 'off'
              }). It is what the next activation of this table will apply.`,
          );
        }
      } catch {
        // No inactive version, or the version parameter is not honoured here.
        // Either way it is not worth failing the read for.
      }
    }

    return return_response({
      data: JSON.stringify(
        {
          success: true,
          ...settings,
          table_name: settings.table_name || tableName,
          buffering_description: describeBuffering(settings),
          ...(warnings.length ? { warnings } : {}),
          verify_with: `SELECT tabname, pufferung FROM dd09l WHERE tabname = '${tableName}'`,
        },
        null,
        2,
      ),
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });
  } catch (error: any) {
    const body = error?.response?.data
      ? typeof error.response.data === 'string'
        ? error.response.data
        : JSON.stringify(error.response.data)
      : '';
    let message = `Error reading technical settings for ${args?.table_name}: ${
      error instanceof Error ? error.message : String(error)
    }`;
    if (error?.response?.status === 404) {
      message =
        `Table ${args?.table_name?.toUpperCase()} has no technical settings object. ` +
        'Only transparent DDIC tables have one — a structure, an append or a view does not.';
    } else if (body) {
      message += ` | ADT: ${body.slice(0, 800)}`;
    }
    logger?.error(message);
    return return_error(new Error(message));
  }
}
