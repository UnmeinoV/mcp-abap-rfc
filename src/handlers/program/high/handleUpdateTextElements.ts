/**
 * UpdateTextElements — write a program's text symbols and/or selection texts
 * (the ORIGINAL-language text pool) and activate them, verified by reading the
 * ACTIVE text pool back. Measured protocol and traps: src/lib/textElements.ts.
 *
 * The verdict never comes from an HTTP 200: after the write the newest version
 * is read back and compared; after activation the ACTIVE version is read back
 * and compared again. Either mismatch is an error naming the keys.
 */

import {
  describeActivation,
  evaluateActivation,
} from '../../../lib/adtMessages';
import { activateAdtObjects, runLocked } from '../../../lib/adtObjectOps';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  containsCjk,
  isCjkLanguage,
  mergeSelections,
  mergeSymbols,
  type SelectionInput,
  type SelectionText,
  type SymbolInput,
  selectionDifferences,
  serializeSelections,
  serializeSymbols,
  symbolDifferences,
  TEXT_ELEMENT_MEDIA,
  type TextSymbol,
  textElementsUrl,
} from '../../../lib/textElements';
import { makeAdtRequestWithTimeout, return_error } from '../../../lib/utils';
import { readTextPool } from '../readonly/handleGetTextElements';

export const TOOL_DEFINITION = {
  name: 'UpdateTextElements',
  available_in: ['onprem', 'legacy'] as const,
  description:
    "Write a program's TEXT-xxx symbols / selection texts (original language), merged by key, then activate; verified by reading the active text pool back. Translations: UpdateTranslation (RPT4).",
  notes: `Protocol (measured on S4D over RFC): lock /sap/bc/adt/textelements/programs/{program}, PUT
source/symbols and/or source/selections (each with its own media type), unlock, activate as PROG/PX.
The write lands in the INACTIVE text pool; activation makes it active.

ALWAYS THE ORIGINAL LANGUAGE: a ZH-logon session writing an EN-original program changed the EN
pool and created no ZH one, so this tool cannot write a translation. Texts containing CJK
characters for a program whose original language is not CJK produce a warning — they would replace
the original, not add a translation.

mode "merge" (default): the current texts (including changes pending in an inactive version) are
read, the keys passed are added or replaced, remove_symbols are deleted, everything else is kept.
mode "replace": the parts passed are written exactly as given (omitted symbols are deleted). A
selections list replaces/merges selection texts the same way; a part not passed is not touched.

symbols: key = the 3 characters after TEXT- (001, A01). max_length defaults to the existing one or
the text length — it is the room SE63 gives translators, so set it larger when a translation will be
longer. Text symbols hold at most 132 characters, selection texts 30. A selection text you pass
switches its Dictionary reference off unless you pass ddic_reference: true.

activate defaults to true. If an inactive version was already pending, it is activated together with
this change and a warning says so. transport_request is required for a transportable program.`,
  inputSchema: {
    type: 'object',
    properties: {
      program_name: { type: 'string', description: 'Program.' },
      symbols: {
        type: 'array',
        description: '[{"key":"001","text":"…"}]',
        items: {
          type: 'object',
          properties: {
            key: { type: 'string' },
            text: { type: 'string' },
            max_length: { type: 'number' },
          },
          required: ['key', 'text'],
        },
      },
      remove_symbols: {
        type: 'array',
        items: { type: 'string' },
        description: 'Keys.',
      },
      selections: {
        type: 'array',
        description: '[{"name":"P_FILE","text":"…"}]',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            text: { type: 'string' },
            ddic_reference: { type: 'boolean' },
          },
          required: ['name', 'text'],
        },
      },
      mode: {
        type: 'string',
        enum: ['merge', 'replace'],
      },
      transport_request: { type: 'string' },
      activate: { type: 'boolean' },
    },
    required: ['program_name'],
  },
} as const;

interface UpdateTextElementsArgs {
  program_name: string;
  symbols?: SymbolInput[];
  remove_symbols?: string[];
  selections?: SelectionInput[];
  mode?: 'merge' | 'replace';
  transport_request?: string;
  activate?: boolean;
}

function changeSummary<T>(
  before: readonly T[],
  after: readonly T[],
  key: (t: T) => string,
  same: (a: T, b: T) => boolean,
) {
  const b = new Map(before.map((t) => [key(t), t]));
  const a = new Map(after.map((t) => [key(t), t]));
  return {
    added: [...a.keys()].filter((k) => !b.has(k)),
    changed: [...a.keys()].filter(
      (k) => b.has(k) && !same(b.get(k)!, a.get(k)!),
    ),
    removed: [...b.keys()].filter((k) => !a.has(k)),
  };
}

export async function handleUpdateTextElements(
  context: HandlerContext,
  args: UpdateTextElementsArgs,
) {
  const { connection, logger } = context;
  const steps: string[] = [];
  try {
    const program = String(args?.program_name ?? '')
      .trim()
      .toUpperCase();
    if (!program) throw new Error('program_name is required');
    const symbolsIn = Array.isArray(args?.symbols) ? args.symbols : undefined;
    const removeIn = Array.isArray(args?.remove_symbols)
      ? args.remove_symbols
      : [];
    const selectionsIn = Array.isArray(args?.selections)
      ? args.selections
      : undefined;
    if (!symbolsIn && removeIn.length === 0 && !selectionsIn) {
      throw new Error(
        'Nothing to write: pass symbols, remove_symbols and/or selections',
      );
    }
    const replace = args?.mode === 'replace';
    const transport = args?.transport_request?.trim() || undefined;
    const activate = args?.activate !== false;
    const writeSymbols = !!symbolsIn || removeIn.length > 0;
    const writeSelections = !!selectionsIn;

    // Current = newest (what the editor shows, incl. pending inactive changes).
    const current = await readTextPool(connection, program, 'newest');
    steps.push('read_current');
    const warnings: string[] = [];
    if (current.pending_inactive_version && activate) {
      warnings.push(
        `${program} already had an inactive text pool version; it is activated together with this change.`,
      );
    }

    const targetSymbols: TextSymbol[] | undefined = writeSymbols
      ? mergeSymbols(current.symbols, symbolsIn ?? [], removeIn, replace)
      : undefined;
    const targetSelections: SelectionText[] | undefined = writeSelections
      ? mergeSelections(current.selections, selectionsIn ?? [], replace)
      : undefined;

    const original = current.original_language;
    const cjkTexts = [
      ...(symbolsIn ?? []).map((s) => s.text),
      ...(selectionsIn ?? []).map((s) => s.text),
    ].some((t) => containsCjk(String(t ?? '')));
    if (cjkTexts && original && !isCjkLanguage(original)) {
      warnings.push(
        `Texts contain CJK characters but ${program}'s original language is ${original}: they REPLACE the ${original} originals. For a translation use UpdateTranslation (object_type RPT4).`,
      );
    }

    const url = textElementsUrl(program);
    await runLocked(connection, url, async (lockHandle) => {
      const params: Record<string, string> = { lockHandle };
      if (transport) params.corrNr = transport;
      const parts: Array<[keyof typeof TEXT_ELEMENT_MEDIA, string]> = [];
      if (targetSymbols)
        parts.push(['symbols', serializeSymbols(targetSymbols)]);
      if (targetSelections) {
        parts.push(['selections', serializeSelections(targetSelections)]);
      }
      for (const [part, body] of parts) {
        await makeAdtRequestWithTimeout(
          connection,
          `${url}/source/${part}`,
          'PUT',
          'default',
          body,
          params,
          {
            'Content-Type': `${TEXT_ELEMENT_MEDIA[part]}; charset=utf-8`,
            Accept: TEXT_ELEMENT_MEDIA[part],
          },
        );
        steps.push(`write_${part}`);
      }
    });
    steps.push('unlock');

    const verify = async (version: 'active' | 'newest') => {
      const pool = await readTextPool(connection, program, version);
      const diff = [
        ...(targetSymbols
          ? symbolDifferences(targetSymbols, pool.symbols)
          : []),
        ...(targetSelections
          ? selectionDifferences(targetSelections, pool.selections)
          : []),
      ];
      return { pool, diff };
    };

    const written = await verify('newest');
    if (written.diff.length > 0) {
      throw new Error(
        `The text pool read back after writing differs from what was sent for: ${written.diff.join(', ')} — NOT verified as written.`,
      );
    }
    steps.push('verify_written');

    let activated = false;
    let finalPool = written.pool;
    if (activate) {
      const outcome = evaluateActivation(
        await activateAdtObjects(connection, [
          { name: program, type: 'PROG/PX', uri: url },
        ]),
      );
      if (!outcome.success) {
        throw new Error(
          `${describeActivation(outcome, `text elements of ${program}`)} The new texts are written but INACTIVE.`,
        );
      }
      steps.push('activate');
      const active = await verify('active');
      if (active.diff.length > 0) {
        throw new Error(
          `Activation reported success but the ACTIVE text pool differs for: ${active.diff.join(', ')}.`,
        );
      }
      steps.push('verify_active');
      activated = true;
      finalPool = active.pool;
    }

    const symbolChanges = targetSymbols
      ? changeSummary(
          current.symbols,
          targetSymbols,
          (s) => s.key,
          (a, b) => a.text === b.text && a.max_length === b.max_length,
        )
      : undefined;
    const selectionChanges = targetSelections
      ? changeSummary(
          current.selections.filter((s) => !s.missing),
          targetSelections.filter((s) => !s.missing),
          (s) => s.name,
          (a, b) => a.text === b.text && a.ddic_reference === b.ddic_reference,
        )
      : undefined;

    return {
      isError: false,
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              program_name: program,
              original_language: original,
              mode: replace ? 'replace' : 'merge',
              activated,
              verified: activated ? 'active_text_pool' : 'inactive_text_pool',
              ...(symbolChanges ? { symbol_changes: symbolChanges } : {}),
              ...(selectionChanges
                ? { selection_changes: selectionChanges }
                : {}),
              symbol_count: finalPool.symbols.length,
              transport_request: transport ?? null,
              steps_completed: steps,
              ...(warnings.length ? { warnings } : {}),
              message: activated
                ? `Text elements of ${program} written in ${original || 'the original language'} and activated; the active text pool was read back and matches.`
                : `Text elements of ${program} written in ${original || 'the original language'} and left INACTIVE (activate: false); the inactive text pool was read back and matches.`,
            },
            null,
            2,
          ),
        },
      ],
    };
  } catch (error) {
    logger?.error('UpdateTextElements failed', error as any);
    const wrote = steps.some((st) => st.startsWith('write_'));
    const done = wrote
      ? ` Steps completed: ${steps.join(', ')}.`
      : ' Nothing was written.';
    return return_error(
      new Error(
        `${error instanceof Error ? error.message : String(error)}${done}`,
      ),
    );
  }
}
