/**
 * SetPrettyPrinterSettings Handler - change the system pretty-printer settings.
 *
 * Mirrors abap-adt-api's setPrettyPrinterSetting:
 *   PUT /sap/bc/adt/abapsource/prettyprinter/settings
 *   body: <prettyprintersettings:PrettyPrinterSettings ... indentation style/>
 *
 * Mutating: this changes a system-wide formatting setting that affects every
 * subsequent PrettyPrintSource call.
 */

import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  type AxiosResponse,
  makeAdtRequestWithTimeout,
  return_error,
  return_response,
} from '../../../lib/utils';

const STYLES = [
  'toLower',
  'toUpper',
  'keywordUpper',
  'keywordLower',
  'keywordAuto',
  'none',
] as const;

export const TOOL_DEFINITION = {
  name: 'SetPrettyPrinterSettings',
  available_in: ['onprem'] as const,
  description:
    'Change the system ABAP pretty-printer settings (indentation on/off and keyword style). Note: this is a system-wide setting affecting every subsequent PrettyPrintSource call.',
  inputSchema: {
    type: 'object',
    properties: {
      indentation: {
        type: 'boolean',
        description: 'Enable indentation.',
      },
      style: {
        type: 'string',
        enum: [...STYLES],
        description:
          'Keyword style: toLower, toUpper, keywordUpper, keywordLower, keywordAuto, none.',
      },
    },
    required: ['indentation', 'style'],
  },
} as const;

interface SetPrettyPrinterSettingsArgs {
  indentation: boolean;
  style: (typeof STYLES)[number];
}

export async function handleSetPrettyPrinterSettings(
  context: HandlerContext,
  args: SetPrettyPrinterSettingsArgs,
) {
  const { connection, logger } = context;
  try {
    const { indentation, style } = args ?? ({} as any);
    if (indentation === undefined || !style) {
      return return_error(new Error('indentation and style are required'));
    }
    if (!STYLES.includes(style)) {
      return return_error(
        new Error(`style must be one of: ${STYLES.join(', ')}`),
      );
    }

    const body = `<?xml version="1.0" encoding="UTF-8"?><prettyprintersettings:PrettyPrinterSettings
xmlns:prettyprintersettings="http://www.sap.com/adt/prettyprintersettings"
prettyprintersettings:indentation="${indentation}" prettyprintersettings:style="${style}"/>`;

    logger?.info(
      `SetPrettyPrinterSettings: indentation=${indentation} style=${style}`,
    );

    await makeAdtRequestWithTimeout(
      connection,
      '/sap/bc/adt/abapsource/prettyprinter/settings',
      'PUT',
      'default',
      body,
      undefined,
      { 'Content-Type': 'application/*' },
    );

    return return_response({
      data: JSON.stringify({
        success: true,
        indentation,
        style,
        message: `Pretty-printer settings updated (indentation=${indentation}, style=${style})`,
      }),
    } as AxiosResponse);
  } catch (error: any) {
    logger?.error(
      `SetPrettyPrinterSettings failed: ${error?.message || error}`,
    );
    return return_error(error);
  }
}
