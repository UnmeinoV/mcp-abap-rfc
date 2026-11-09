/**
 * GetPrettyPrinterSettings Handler - read the system pretty-printer settings.
 *
 * Mirrors abap-adt-api's prettyPrinterSetting:
 *   GET /sap/bc/adt/abapsource/prettyprinter/settings
 *   -> <abapformatter:PrettyPrinterSettings abapformatter:indentation="true"
 *        abapformatter:style="keywordUpper"/>
 *
 * These are the settings PrettyPrintSource applies. Read-only.
 */

import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  type AxiosResponse,
  makeAdtRequestWithTimeout,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'GetPrettyPrinterSettings',
  available_in: ['onprem'] as const,
  description:
    '[read-only] Read the system ABAP pretty-printer settings (indentation on/off and keyword style, e.g. keywordUpper). These are the settings PrettyPrintSource applies.',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
} as const;

export async function handleGetPrettyPrinterSettings(
  context: HandlerContext,
  _args: Record<string, never>,
) {
  const { connection, logger } = context;
  try {
    const resp = await makeAdtRequestWithTimeout(
      connection,
      '/sap/bc/adt/abapsource/prettyprinter/settings',
      'GET',
      'default',
      undefined,
      undefined,
      { Accept: 'application/*' },
    );

    const { XMLParser } = require('fast-xml-parser');
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      removeNSPrefix: true,
    });
    const parsed = parser.parse(String(resp.data));
    const node = parsed?.PrettyPrinterSettings ?? {};

    const indentationRaw = node['@_indentation'];
    const style = node['@_style'] ?? null;
    const indentation =
      indentationRaw === 'true' || indentationRaw === true
        ? true
        : indentationRaw === 'false' || indentationRaw === false
          ? false
          : null;

    logger?.info(
      `GetPrettyPrinterSettings: indentation=${indentation} style=${style}`,
    );

    return return_response({
      data: JSON.stringify({
        success: true,
        indentation,
        style,
      }),
    } as AxiosResponse);
  } catch (error: any) {
    logger?.error(
      `GetPrettyPrinterSettings failed: ${error?.message || error}`,
    );
    return return_error(error);
  }
}
