/**
 * GetTextElements — a program's text pool (text symbols, selection texts, list
 * headings) through ADT /sap/bc/adt/textelements/programs/{prog}. See
 * src/lib/textElements.ts for the measured formats.
 */

import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  parseHeadings,
  parseSelections,
  parseSymbols,
  TEXT_ELEMENT_MEDIA,
  type TextElementPart,
  textElementsUrl,
} from '../../../lib/textElements';
import { makeAdtRequestWithTimeout, return_error } from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'GetTextElements',
  available_in: ['onprem', 'legacy'] as const,
  description:
    "[read-only] Read a program's text pool: text symbols (TEXT-xxx with max length), selection texts (PARAMETERS / SELECT-OPTIONS, with the Dictionary-reference flag) and list headings — in the program's ORIGINAL language. Says whether an inactive version is pending. Translations: GetTranslation (LXE type RPT4).",
  notes: `Read through /sap/bc/adt/textelements/programs/{program} and its source/symbols, source/selections,
source/headings parts. version "active" (default) reads the active text pool; "inactive" reads the
newest one, i.e. including changes written but not yet activated (when none are pending it is the
active one, and pending_inactive_version says so). The texts are always in the program's original
language (original_language) — the ADT resource serves and edits that one regardless of the logon
language (measured). A parameter without a selection text is reported with missing: true.`,
  inputSchema: {
    type: 'object',
    properties: {
      program_name: { type: 'string', description: 'Program name.' },
      version: {
        type: 'string',
        enum: ['active', 'inactive'],
        description:
          'active (default) or inactive (newest, incl. pending changes).',
      },
    },
    required: ['program_name'],
  },
} as const;

interface GetTextElementsArgs {
  program_name: string;
  version?: 'active' | 'inactive';
}

export interface TextPoolSnapshot {
  original_language: string;
  pending_inactive_version: boolean;
  symbols: ReturnType<typeof parseSymbols>;
  selections: ReturnType<typeof parseSelections>;
  headings: Record<string, string>;
}

function attr(xml: string, name: string): string {
  return new RegExp(`${name}="([^"]*)"`).exec(xml)?.[1] ?? '';
}

export async function readTextPoolPart(
  connection: any,
  program: string,
  part: TextElementPart,
  version: 'active' | 'newest',
): Promise<string> {
  const response = await makeAdtRequestWithTimeout(
    connection,
    `${textElementsUrl(program)}/source/${part}`,
    'GET',
    'default',
    undefined,
    version === 'active' ? { version: 'active' } : undefined,
    { Accept: TEXT_ELEMENT_MEDIA[part] },
  );
  return String(response?.data ?? '');
}

/** Metadata + all three parts. Throws a readable error for a missing program. */
export async function readTextPool(
  connection: any,
  program: string,
  version: 'active' | 'newest',
): Promise<TextPoolSnapshot> {
  let meta: string;
  try {
    const response = await makeAdtRequestWithTimeout(
      connection,
      textElementsUrl(program),
      'GET',
      'default',
    );
    meta = String(response?.data ?? '');
  } catch (error: any) {
    if (error?.response?.status === 404) {
      throw new Error(
        `Program ${program} does not exist (no text elements resource)`,
      );
    }
    throw error;
  }
  const [symbols, selections, headings] = await Promise.all(
    (['symbols', 'selections', 'headings'] as const).map((p) =>
      readTextPoolPart(connection, program, p, version),
    ),
  );
  return {
    original_language: attr(meta, 'adtcore:masterLanguage'),
    pending_inactive_version: attr(meta, 'adtcore:version') === 'inactive',
    symbols: parseSymbols(symbols),
    selections: parseSelections(selections),
    headings: parseHeadings(headings),
  };
}

export async function handleGetTextElements(
  context: HandlerContext,
  args: GetTextElementsArgs,
) {
  const { connection, logger } = context;
  try {
    const program = String(args?.program_name ?? '')
      .trim()
      .toUpperCase();
    if (!program) throw new Error('program_name is required');
    const version = args?.version === 'inactive' ? 'newest' : 'active';
    const pool = await readTextPool(connection, program, version);
    return {
      isError: false,
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              program_name: program,
              version_read:
                version === 'active'
                  ? 'active'
                  : pool.pending_inactive_version
                    ? 'inactive'
                    : 'active (no inactive version pending)',
              ...pool,
              symbol_count: pool.symbols.length,
            },
            null,
            2,
          ),
        },
      ],
    };
  } catch (error) {
    logger?.error('GetTextElements failed', error as any);
    return return_error(error);
  }
}
