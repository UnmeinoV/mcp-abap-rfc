/**
 * PrettyPrintSource Handler - format ABAP source with the system pretty printer.
 *
 * Mirrors abap-adt-api's prettyPrinter:
 *   POST /sap/bc/adt/abapsource/prettyprinter
 *   Content-Type: text/plain, Accept: text/plain
 *   body: the source to format -> formatted source (plain text)
 *
 * Formatting follows the system-wide pretty-printer settings (indentation +
 * keyword case). Read GetPrettyPrinterSettings to see them, SetPrettyPrinterSettings
 * to change them. Read-only: this only reformats the text you pass in; it does
 * not read or write any repository object.
 */

import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  type AxiosResponse,
  makeAdtRequestWithTimeout,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'PrettyPrintSource',
  available_in: ['onprem'] as const,
  description:
    '[read-only] Format ABAP source code using the system pretty printer (indentation + keyword case per the system settings). Pass the raw source; returns the formatted source. Useful to normalize generated code before Update*/activation. Does not modify any repository object.',
  inputSchema: {
    type: 'object',
    properties: {
      source: {
        type: 'string',
        description: 'ABAP source code to format.',
      },
    },
    required: ['source'],
  },
} as const;

interface PrettyPrintArgs {
  source: string;
}

export async function handlePrettyPrintSource(
  context: HandlerContext,
  args: PrettyPrintArgs,
) {
  const { connection, logger } = context;
  try {
    const source = args?.source;
    if (source === undefined || source === null) {
      return return_error(new Error('source is required'));
    }

    const resp = await makeAdtRequestWithTimeout(
      connection,
      '/sap/bc/adt/abapsource/prettyprinter',
      'POST',
      'default',
      source,
      undefined,
      { 'Content-Type': 'text/plain', Accept: 'text/plain' },
    );

    // The endpoint returns the formatted source as plain text; fall back to the
    // original source if the server returned an empty body.
    const formatted =
      resp.data !== undefined && resp.data !== null && String(resp.data) !== ''
        ? String(resp.data)
        : source;

    logger?.info(`PrettyPrintSource: formatted ${source.length} chars`);

    return return_response({
      data: JSON.stringify({
        success: true,
        formatted_source: formatted,
        changed: formatted !== source,
      }),
    } as AxiosResponse);
  } catch (error: any) {
    logger?.error(`PrettyPrintSource failed: ${error?.message || error}`);
    return return_error(error);
  }
}
