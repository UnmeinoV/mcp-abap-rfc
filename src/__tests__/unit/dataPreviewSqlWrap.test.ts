/**
 * A single-line GetSqlQuery longer than 255 characters failed (2026-10-16).
 *
 * MEASURED through the compiled stdio server, client 100 (transport numbers
 * replaced by the synthetic ABCK prefix — same lengths, same columns):
 *
 *   SELECT trkorr, trfunction, trstatus, as4user, as4date, strkorr FROM e070
 *   WHERE trkorr IN ('ABCK942542', ... 9 values) OR strkorr IN (... 3 values)
 *   (262 characters, ONE line)
 *
 *   -> ADT 400 ExceptionDataPreviewGeneral: The text literal
 *      "'ABCK9   INTO     TABLE @DATA(" is longer than 255 characters.
 *
 * `'ABCK9` ends at EXACTLY column 255. Data Preview turns the statement into
 * ABAP source whose lines hold 255 characters, so everything past column 255 of
 * a line is lost — here mid-literal, and the literal then swallows the
 * `INTO TABLE @DATA(...)` SAP appends. The same SQL spread over several lines
 * works. So the body is re-wrapped before it is sent: breaks only where ABAP
 * SQL allows whitespace, never inside a literal or a comment, and never so that
 * a line starts with `*` (column-1 `*` is a comment line in ABAP).
 */

import { handleGetSqlQuery } from '../../handlers/system/readonly/handleGetSqlQuery';
import {
  DATA_PREVIEW_MAX_LINE,
  wrapDataPreviewSql,
} from '../../lib/dataPreviewSql';

const REPRO =
  "SELECT trkorr, trfunction, trstatus, as4user, as4date, strkorr FROM e070 WHERE trkorr IN ('ABCK942542','ABCK942543','ABCK938148','ABCK932471','ABCK930745','ABCK930744','ABCK927936','ABCK927922','ABCK924381') OR strkorr IN ('ABCK942542','ABCK942543','ABCK938148')";

/** Literals in order of appearance, quotes included ('' escape aware). */
function literals(sql: string): string[] {
  return sql.match(/'(?:[^']|'')*'|`(?:[^`]|``)*`/g) ?? [];
}

/** Whitespace-insensitive form, keeping literal contents verbatim. */
function normalized(sql: string): string {
  const parts = sql.split(/('(?:[^']|'')*'|`(?:[^`]|``)*`)/);
  return parts
    .map((part, i) =>
      i % 2 === 1 ? part : part.replace(/\s+/g, ' ').replace(/ ?, ?/g, ','),
    )
    .join('')
    .trim();
}

describe('wrapDataPreviewSql', () => {
  it('THE REPRODUCTION: every line fits, no literal is split, the statement is unchanged', () => {
    expect(REPRO.length).toBeGreaterThan(255);
    const wrapped = wrapDataPreviewSql(REPRO);
    const lines = wrapped.split('\n');
    expect(lines.length).toBeGreaterThan(1);
    for (const line of lines) {
      expect(line.length).toBeLessThanOrEqual(DATA_PREVIEW_MAX_LINE);
      // A literal never straddles a line: each line has an even quote count.
      expect((line.match(/'/g) ?? []).length % 2).toBe(0);
    }
    expect(literals(wrapped)).toEqual(literals(REPRO));
    expect(normalized(wrapped)).toBe(normalized(REPRO));
  });

  it('keeps the limit well under 255 — SAP appends its own clause to the statement', () => {
    expect(DATA_PREVIEW_MAX_LINE).toBeLessThanOrEqual(200);
  });

  it('leaves a short query byte-identical', () => {
    const q = "SELECT trkorr, as4user FROM e070 WHERE trkorr = 'ABCK942542'";
    expect(wrapDataPreviewSql(q)).toBe(q);
  });

  it('never breaks inside a literal that contains spaces and commas', () => {
    const lit = `'${'a, b '.repeat(20)}'`; // 102 chars with many break-looking spots
    const q = `SELECT trkorr FROM e070 WHERE as4text = ${lit} OR as4text = ${lit} OR as4text = ${lit}`;
    const wrapped = wrapDataPreviewSql(q);
    expect(literals(wrapped)).toEqual([lit, lit, lit]);
    for (const line of wrapped.split('\n')) {
      expect(line.length).toBeLessThanOrEqual(DATA_PREVIEW_MAX_LINE);
    }
  });

  it("understands the '' escape — a doubled quote does not end the literal", () => {
    const lit = `'it''s ${'x '.repeat(40)}done'`;
    const q = `SELECT trkorr FROM e070 WHERE as4text = ${lit} OR trkorr = ${"'A' OR trkorr = ".repeat(20)}'B'`;
    const wrapped = wrapDataPreviewSql(q);
    expect(literals(wrapped)).toEqual(literals(q));
    expect(literals(wrapped)).toContain(lit);
  });

  it('never makes a line start with * (a column-1 * is an ABAP comment line)', () => {
    const q = `SELECT * FROM e070 WHERE ${Array.from({ length: 30 }, (_, i) => `trkorr = 'ABCK9${String(i).padStart(5, '0')}'`).join(' OR ')}`;
    const wrapped = wrapDataPreviewSql(q);
    for (const line of wrapped.split('\n')) {
      expect(line.startsWith('*')).toBe(false);
    }
    expect(normalized(wrapped)).toBe(normalized(q));
  });

  it('breaks after a comma when there is no whitespace to break at', () => {
    const q = `SELECT trkorr FROM e070 WHERE trkorr IN (${Array.from({ length: 25 }, (_, i) => `'ABCK9${String(i).padStart(5, '0')}'`).join(',')})`;
    const wrapped = wrapDataPreviewSql(q);
    for (const line of wrapped.split('\n')) {
      expect(line.length).toBeLessThanOrEqual(DATA_PREVIEW_MAX_LINE);
    }
    expect(literals(wrapped)).toEqual(literals(q));
  });

  it('does not wrap the text of a " comment into code', () => {
    const q = `SELECT trkorr FROM e070 WHERE trkorr = 'A' " ${'note '.repeat(60)}`;
    const wrapped = wrapDataPreviewSql(q);
    const commentLines = wrapped.split('\n').filter((l) => l.includes('note'));
    expect(commentLines).toHaveLength(1);
    expect(commentLines[0]).toContain('"');
  });

  it('keeps existing line breaks and wraps only the long lines', () => {
    const q = `SELECT trkorr\nFROM e070\nWHERE ${"trkorr = 'ABCK942542' OR ".repeat(12)}trkorr = 'X'`;
    const wrapped = wrapDataPreviewSql(q);
    const lines = wrapped.split('\n');
    expect(lines[0]).toBe('SELECT trkorr');
    expect(lines[1]).toBe('FROM e070');
    for (const line of lines) {
      expect(line.length).toBeLessThanOrEqual(DATA_PREVIEW_MAX_LINE);
    }
    expect(normalized(wrapped)).toBe(normalized(q));
  });

  it('leaves an unsplittable over-long literal intact rather than corrupting it', () => {
    const lit = `'${'x'.repeat(230)}'`;
    const q = `SELECT trkorr FROM e070 WHERE as4text = ${lit}`;
    const wrapped = wrapDataPreviewSql(q);
    expect(literals(wrapped)).toEqual([lit]);
  });
});

describe('GetSqlQuery sends the wrapped statement on the wire', () => {
  it('the body POSTed to /datapreview/freestyle has no line over the limit', async () => {
    const makeAdtRequest = jest.fn().mockResolvedValue({
      status: 200,
      data: `<?xml version="1.0" encoding="utf-8"?><dataPreview:tableData xmlns:dataPreview="http://www.sap.com/adt/dataPreview"><dataPreview:totalRows>0</dataPreview:totalRows></dataPreview:tableData>`,
    });
    const connection = { makeAdtRequest } as any;

    const result = await handleGetSqlQuery({ connection } as any, {
      sql_query: REPRO,
    });

    expect(result.isError).toBe(false);
    const sent = makeAdtRequest.mock.calls.find((c) =>
      String(c[0]?.url).includes('/datapreview/freestyle'),
    )?.[0];
    expect(sent).toBeDefined();
    for (const line of String(sent.data).split('\n')) {
      expect(line.length).toBeLessThanOrEqual(DATA_PREVIEW_MAX_LINE);
    }
    expect(normalized(String(sent.data))).toBe(normalized(REPRO));
    // The caller still sees the query it wrote, not our re-wrapped copy.
    expect(JSON.parse(result.content[0].text).sql_query).toBe(REPRO);
  });
});
