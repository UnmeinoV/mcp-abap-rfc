/**
 * Program text elements (text pool: text symbols, selection texts, list
 * headings) through ADT `/sap/bc/adt/textelements/programs/{prog}`.
 *
 * Every fact here was measured on S4D/100 over RFC (2026-11-05), not taken from
 * documentation:
 *  - Each part is a plain-text source under `/source/symbols|selections|headings`
 *    and needs its own SINGLE exact Accept / Content-Type
 *    (`application/vnd.sap.adt.textelements.<part>.v1`); without it ADT answers
 *    an HTML preview.
 *  - Blocks are separated by a blank line (`\r\n\r\n`). A symbol is
 *    `@MaxLength:n` + `KEY=text`; a selection text is an optional
 *    `@DDICReference` + the name padded to 8 + `=text`.
 *  - The default GET returns the NEWEST version (inactive if one is pending);
 *    `?version=active` returns the active one; the metadata's
 *    `adtcore:version` says which exists.
 *  - Lock `{object}?_action=LOCK` → PUT each part → UNLOCK writes an INACTIVE
 *    text pool; activation as `PROG/PX` with the textelements URI makes it active
 *    (oracle: READ TEXTPOOL … STATE 'A'/'I', and the program's own output).
 *  - THE RESOURCE ALWAYS EDITS THE ORIGINAL LANGUAGE: a ZH-logon session writing
 *    an EN-original program changed the EN inactive pool and created no ZH pool.
 *    So it cannot write a translation — that is UpdateTranslation (LXE RPT4).
 */

export const TEXT_ELEMENTS_BASE = '/sap/bc/adt/textelements/programs';

export const TEXT_ELEMENT_MEDIA = {
  symbols: 'application/vnd.sap.adt.textelements.symbols.v1',
  selections: 'application/vnd.sap.adt.textelements.selections.v1',
  headings: 'application/vnd.sap.adt.textelements.headings.v1',
} as const;

export type TextElementPart = keyof typeof TEXT_ELEMENT_MEDIA;

export interface TextSymbol {
  key: string;
  text: string;
  /** `@MaxLength` — the length reserved for the text (translations too). */
  max_length: number;
}

export interface SelectionText {
  name: string;
  text: string;
  /** `@DDICReference` — SAP takes the text from the Dictionary. */
  ddic_reference: boolean;
  /**
   * The parameter has NO selection text. ADT renders that as `NAME    =?...`
   * (measured on a fresh program) — a placeholder, never written back.
   */
  missing?: boolean;
}

/** What ADT shows in place of a selection text that does not exist. */
export const MISSING_SELECTION_TEXT = '?...';

export function textElementsUrl(program: string): string {
  return `${TEXT_ELEMENTS_BASE}/${encodeURIComponent(program.toLowerCase())}`;
}

function blocks(source: string): string[][] {
  return String(source ?? '')
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((b) => b.split('\n').filter((l) => l.length > 0))
    .filter((b) => b.length > 0);
}

export function parseSymbols(source: string): TextSymbol[] {
  const out: TextSymbol[] = [];
  for (const block of blocks(source)) {
    let max = 0;
    for (const line of block) {
      const m = /^@MaxLength:(\d+)\s*$/.exec(line);
      if (m) {
        max = Number(m[1]);
        continue;
      }
      if (line.startsWith('@')) continue;
      const eq = line.indexOf('=');
      if (eq <= 0) continue;
      const text = line.slice(eq + 1);
      out.push({
        key: line.slice(0, eq).trim(),
        text,
        max_length: max || text.length,
      });
    }
  }
  return out;
}

export function serializeSymbols(symbols: readonly TextSymbol[]): string {
  return symbols
    .map((s) => `@MaxLength:${s.max_length}\r\n${s.key}=${s.text}`)
    .join('\r\n\r\n');
}

export function parseSelections(source: string): SelectionText[] {
  const out: SelectionText[] = [];
  for (const block of blocks(source)) {
    let ddic = false;
    for (const line of block) {
      if (/^@DDICReference\s*$/.test(line)) {
        ddic = true;
        continue;
      }
      if (line.startsWith('@')) continue;
      const eq = line.indexOf('=');
      if (eq <= 0) continue;
      const text = line.slice(eq + 1);
      const missing = !ddic && text === MISSING_SELECTION_TEXT;
      out.push({
        name: line.slice(0, eq).trim(),
        text: missing ? '' : text,
        ddic_reference: ddic,
        ...(missing ? { missing: true } : {}),
      });
    }
  }
  return out;
}

export function serializeSelections(
  selections: readonly SelectionText[],
): string {
  return selections
    .filter((s) => !s.missing)
    .map(
      (s) =>
        `${s.ddic_reference ? '@DDICReference\r\n' : ''}${s.name.padEnd(8, ' ')}=${s.text}`,
    )
    .join('\r\n\r\n');
}

/** Headings are `key=value` lines (listHeader, columnHeader_1, …). */
export function parseHeadings(source: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of String(source ?? '').split(/\r?\n/)) {
    const eq = line.indexOf('=');
    if (eq > 0) out[line.slice(0, eq).trim()] = line.slice(eq + 1);
  }
  return out;
}

/** Text symbol key: 3 characters, letters and digits (TEXT-001, TEXT-A01). */
export const SYMBOL_KEY_PATTERN = /^[A-Z0-9]{3}$/;
/** Selection name: a PARAMETERS / SELECT-OPTIONS name, at most 8 characters. */
export const SELECTION_NAME_PATTERN = /^[A-Z][A-Z0-9_]{0,7}$/;
export const SYMBOL_TEXT_MAX = 132;
export const SELECTION_TEXT_MAX = 30;

export interface SymbolInput {
  key: string;
  text: string;
  max_length?: number;
}
export interface SelectionInput {
  name: string;
  text: string;
  ddic_reference?: boolean;
}

/**
 * Merge the caller's symbols into the current ones (replace: only the caller's).
 * A new symbol's max_length defaults to its text length; an existing one keeps
 * its max_length unless the text no longer fits. Refuses what SAP would refuse
 * or silently cut, before anything is written.
 */
export function mergeSymbols(
  current: readonly TextSymbol[],
  input: readonly SymbolInput[],
  remove: readonly string[],
  replace: boolean,
): TextSymbol[] {
  const seen = new Set<string>();
  const byKey = new Map<string, TextSymbol>(
    replace ? [] : current.map((s) => [s.key, { ...s }]),
  );
  for (const k of remove) {
    const key = String(k ?? '')
      .trim()
      .toUpperCase();
    if (!byKey.has(key) && !replace) {
      throw new Error(`remove_symbols: text symbol ${key} does not exist`);
    }
    byKey.delete(key);
  }
  for (const [i, s] of input.entries()) {
    const key = String(s?.key ?? '')
      .trim()
      .toUpperCase();
    const text = String(s?.text ?? '');
    if (!SYMBOL_KEY_PATTERN.test(key)) {
      throw new Error(
        `symbols[${i}].key "${s?.key}" is not a text symbol key (3 letters/digits, e.g. 001 for TEXT-001)`,
      );
    }
    if (seen.has(key)) throw new Error(`symbols: key ${key} is given twice`);
    seen.add(key);
    if (/[\r\n]/.test(text)) {
      throw new Error(
        `symbols[${i}] (${key}): a text symbol cannot contain a line break`,
      );
    }
    if (text.length > SYMBOL_TEXT_MAX) {
      throw new Error(
        `symbols[${i}] (${key}): ${text.length} characters, a text symbol holds at most ${SYMBOL_TEXT_MAX}`,
      );
    }
    const existing = byKey.get(key);
    const requested = s.max_length;
    if (requested !== undefined) {
      if (
        !Number.isInteger(requested) ||
        requested < 1 ||
        requested > SYMBOL_TEXT_MAX
      ) {
        throw new Error(
          `symbols[${i}] (${key}): max_length must be 1..${SYMBOL_TEXT_MAX}`,
        );
      }
      if (requested < text.length) {
        throw new Error(
          `symbols[${i}] (${key}): max_length ${requested} is shorter than the text (${text.length})`,
        );
      }
    }
    const max =
      requested ?? Math.max(existing?.max_length ?? 0, text.length, 1);
    byKey.set(key, { key, text, max_length: max });
  }
  return [...byKey.values()].sort((a, b) => a.key.localeCompare(b.key));
}

export function mergeSelections(
  current: readonly SelectionText[],
  input: readonly SelectionInput[],
  replace: boolean,
): SelectionText[] {
  const seen = new Set<string>();
  const byName = new Map<string, SelectionText>(
    replace ? [] : current.map((s) => [s.name, { ...s }]),
  );
  for (const [i, s] of input.entries()) {
    const name = String(s?.name ?? '')
      .trim()
      .toUpperCase();
    const text = String(s?.text ?? '');
    if (!SELECTION_NAME_PATTERN.test(name)) {
      throw new Error(
        `selections[${i}].name "${s?.name}" is not a PARAMETERS / SELECT-OPTIONS name (max 8 characters)`,
      );
    }
    if (seen.has(name)) throw new Error(`selections: ${name} is given twice`);
    seen.add(name);
    if (/[\r\n]/.test(text)) {
      throw new Error(
        `selections[${i}] (${name}): a selection text cannot contain a line break`,
      );
    }
    if (text.length > SELECTION_TEXT_MAX) {
      throw new Error(
        `selections[${i}] (${name}): ${text.length} characters, a selection text holds at most ${SELECTION_TEXT_MAX}`,
      );
    }
    // A text the caller writes is the text they want shown: unless they ask for
    // the Dictionary reference explicitly, it is switched off for this entry.
    byName.set(name, {
      name,
      text,
      ddic_reference: s.ddic_reference === true,
    });
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** CJK characters — a hint that a translation is being written as an original. */
export function containsCjk(text: string): boolean {
  return /[぀-ヿ㐀-䶿一-鿿가-힯]/.test(text);
}

const CJK_LANGUAGES = new Set(['ZH', 'ZF', 'JA', 'KO', '1', 'M', 'J', '3']);

export function isCjkLanguage(lang: string): boolean {
  return CJK_LANGUAGES.has(
    String(lang ?? '')
      .trim()
      .toUpperCase(),
  );
}

/** Compare intended vs read-back symbols; returns the keys that differ. */
export function symbolDifferences(
  want: readonly TextSymbol[],
  have: readonly TextSymbol[],
): string[] {
  const got = new Map(have.map((s) => [s.key, s]));
  const diff: string[] = [];
  for (const w of want) {
    const h = got.get(w.key);
    if (!h || h.text.trimEnd() !== w.text.trimEnd()) diff.push(w.key);
  }
  for (const h of have)
    if (!want.some((w) => w.key === h.key)) diff.push(h.key);
  return diff;
}

export function selectionDifferences(
  want: readonly SelectionText[],
  have: readonly SelectionText[],
): string[] {
  const got = new Map(have.map((s) => [s.name, s]));
  const diff: string[] = [];
  for (const w of want) {
    if (w.missing) continue;
    const h = got.get(w.name);
    if (h?.missing) {
      diff.push(w.name);
      continue;
    }
    if (
      !h ||
      h.ddic_reference !== w.ddic_reference ||
      (!w.ddic_reference && h.text.trimEnd() !== w.text.trimEnd())
    ) {
      diff.push(w.name);
    }
  }
  for (const h of have) {
    if (h.missing) continue;
    if (!want.some((w) => w.name === h.name && !w.missing)) diff.push(h.name);
  }
  return diff;
}
