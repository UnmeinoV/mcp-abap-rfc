/**
 * Re-wrap a Data Preview (freestyle SQL) statement so no line is too long.
 *
 * MEASURED 2026-10-16 (client 100, compiled stdio server): a ONE-LINE query of
 * 262 characters failed with ADT 400 ExceptionDataPreviewGeneral
 * `The text literal "'ABCK9   INTO     TABLE @DATA(" is longer than 255
 * characters` — and `'ABCK9` ends at exactly column 255. Data Preview generates
 * ABAP source from the statement with 255-character lines, so whatever lies past
 * column 255 of a line is lost; cut mid-literal, the literal then swallows the
 * `INTO TABLE @DATA(...)` SAP appends. The same statement on several lines works.
 *
 * Rules, each pinned by `dataPreviewSqlWrap.test.ts`:
 *   - only lines longer than the limit are touched; existing line breaks stay;
 *   - breaks only at whitespace, or right after a comma — both places where ABAP
 *     SQL allows a line break — and never inside a '…' or `…` literal (with the
 *     doubled-quote escape) nor inside a `"` comment (it runs to end of line);
 *   - continuation lines are indented, so none starts with `*` (a column-1 `*`
 *     makes the whole line an ABAP comment: `SELECT\n* FROM` would drop the `*`);
 *   - a single unbreakable piece longer than the limit (a long literal) is left
 *     whole on its own line — splitting it would change the data, and SAP's own
 *     error about it is clearer than ours.
 */

/** Well under SAP's 255 — SAP adds its own clause to the generated source. */
export const DATA_PREVIEW_MAX_LINE = 120;

const CONTINUATION_INDENT = '  ';

interface Piece {
  /** Separator before the piece: whitespace (dropped at a break) or '' (after a comma). */
  sep: string;
  text: string;
}

/** Split one physical line into unbreakable pieces with their separators. */
function splitPieces(line: string): Piece[] {
  const pieces: Piece[] = [];
  let sep = '';
  let text = '';
  let i = 0;
  const flush = () => {
    if (text) pieces.push({ sep, text });
    sep = '';
    text = '';
  };
  while (i < line.length) {
    const ch = line[i];
    if (ch === "'" || ch === '`') {
      // Literal: runs to the matching quote; a doubled quote is an escape.
      let j = i + 1;
      while (j < line.length) {
        if (line[j] === ch) {
          if (line[j + 1] === ch) {
            j += 2;
            continue;
          }
          break;
        }
        j++;
      }
      text += line.slice(i, j + 1);
      i = j + 1;
    } else if (ch === '"') {
      // Comment to end of line: one unbreakable piece.
      text += line.slice(i);
      i = line.length;
    } else if (/\s/.test(ch)) {
      flush();
      let j = i;
      while (j < line.length && /\s/.test(line[j])) j++;
      sep = line.slice(i, j);
      i = j;
    } else if (ch === ',') {
      text += ch;
      i++;
      // Break opportunity right after the comma (zero-width separator).
      if (i < line.length && !/\s/.test(line[i])) flush();
    } else {
      text += ch;
      i++;
    }
  }
  flush();
  return pieces;
}

function wrapLine(line: string, max: number): string[] {
  if (line.length <= max) return [line];
  // A column-1 `*` line is a full-line comment: leave it alone.
  if (line.startsWith('*')) return [line];

  const leading = line.match(/^\s*/)?.[0] ?? '';
  const pieces = splitPieces(line.slice(leading.length));
  const out: string[] = [];
  let current = leading;
  let currentHasText = false;
  for (const piece of pieces) {
    const sep = currentHasText ? piece.sep : '';
    if (
      !currentHasText ||
      current.length + sep.length + piece.text.length <= max
    ) {
      current += sep + piece.text;
    } else {
      out.push(current);
      current = CONTINUATION_INDENT + piece.text;
    }
    currentHasText = true;
  }
  out.push(current);
  return out;
}

/**
 * Return `sql` with every line at most `max` characters wherever that can be
 * done without touching a literal or a comment. A statement that already fits
 * is returned unchanged.
 */
export function wrapDataPreviewSql(
  sql: string,
  max: number = DATA_PREVIEW_MAX_LINE,
): string {
  if (typeof sql !== 'string') return sql;
  const lines = sql.split(/\r?\n/);
  if (lines.every((l) => l.length <= max)) return sql;
  return lines.flatMap((l) => wrapLine(l, max)).join('\n');
}
