/**
 * Data Preview parsing.
 *
 * The payloads below are REAL responses captured from DM2/310 (S/4HANA 2023
 * FPS02) on 2026-08-23 while root-causing two reported corruptions:
 *   - a row whose every projected cell was blank disappeared from the result;
 *   - values appeared to move between rows.
 *
 * Both came from the same cause: SAP writes a blank cell as the self-closing
 * `<dataPreview:data/>`, and the old regex required a closing tag. These tests
 * pin the shape of the fix against the actual bytes SAP sends, so a future
 * parser rewrite cannot quietly reintroduce either failure.
 */

import {
  describeDataPreviewError,
  isSessionError,
  parseDataPreviewXml,
} from '../../lib/dataPreviewParser';

/** Captured verbatim: ZMY_TABLE has one row, and its only projected cell is blank. */
const SINGLE_BLANK_COLUMN = `<?xml version="1.0" encoding="utf-8"?><dataPreview:tableData xmlns:dataPreview="http://www.sap.com/adt/dataPreview"><dataPreview:totalRows>0</dataPreview:totalRows><dataPreview:isHanaAnalyticalView>false</dataPreview:isHanaAnalyticalView><dataPreview:executedQueryString>SELECT ALLOW_MSGNO_QUERY FROM ZMY_TABLE   INTO     TABLE @DATA(LT_RESULT)   UP TO 20  ROWS   .</dataPreview:executedQueryString><dataPreview:queryExecutionTime>25.9140000</dataPreview:queryExecutionTime><dataPreview:message dataPreview:text="Names may consist only of the characters &quot;A-Z, &quot;_&quot;, &quot;0-9&quot; (not leading), and &quot;-&quot; (not in OO context)." dataPreview:severity="I"/><dataPreview:columns><dataPreview:metadata dataPreview:name="ALLOW_MSGNO_QUERY" dataPreview:type="C" dataPreview:description="ALLOW_MSGNO_QUERY" dataPreview:keyAttribute="false" dataPreview:colType="" dataPreview:isKeyFigure="false"/><dataPreview:dataSet><dataPreview:data/></dataPreview:dataSet></dataPreview:columns></dataPreview:tableData>`;

/** Captured verbatim: the same table with a non-blank column added. */
const BLANK_PLUS_NONBLANK = `<?xml version="1.0" encoding="utf-8"?><dataPreview:tableData xmlns:dataPreview="http://www.sap.com/adt/dataPreview"><dataPreview:totalRows>0</dataPreview:totalRows><dataPreview:queryExecutionTime>22.4380000</dataPreview:queryExecutionTime><dataPreview:columns><dataPreview:metadata dataPreview:name="INTERFACE_ID" dataPreview:type="C" dataPreview:description="INTERFACE_ID"/><dataPreview:dataSet><dataPreview:data>ZMY_INTERFACE_ID</dataPreview:data></dataPreview:dataSet></dataPreview:columns><dataPreview:columns><dataPreview:metadata dataPreview:name="ALLOW_MSGNO_QUERY" dataPreview:type="C" dataPreview:description="ALLOW_MSGNO_QUERY"/><dataPreview:dataSet><dataPreview:data/></dataPreview:dataSet></dataPreview:columns></dataPreview:tableData>`;

/**
 * Trimmed from the real `SELECT objct, fiel3 FROM tobj` response: five rows
 * where only the fourth has a FIEL3 value. The old parser reported PLANT_GR as
 * row 1's value — this is the row-shift case, reduced to its smallest form.
 */
const INTERLEAVED_BLANKS = `<?xml version="1.0" encoding="utf-8"?><dataPreview:tableData xmlns:dataPreview="http://www.sap.com/adt/dataPreview"><dataPreview:totalRows>0</dataPreview:totalRows><dataPreview:columns><dataPreview:metadata dataPreview:name="OBJCT" dataPreview:type="C"/><dataPreview:dataSet><dataPreview:data>A_OBJ1</dataPreview:data><dataPreview:data>A_OBJ2</dataPreview:data><dataPreview:data>A_OBJ3</dataPreview:data><dataPreview:data>A_OBJ4</dataPreview:data><dataPreview:data>A_OBJ5</dataPreview:data></dataPreview:dataSet></dataPreview:columns><dataPreview:columns><dataPreview:metadata dataPreview:name="FIEL3" dataPreview:type="C"/><dataPreview:dataSet><dataPreview:data/><dataPreview:data/><dataPreview:data/><dataPreview:data>PLANT_GR</dataPreview:data><dataPreview:data/></dataPreview:dataSet></dataPreview:columns></dataPreview:tableData>`;

/** Six rows for a max_rows of 5 — the shape the /datapreview/ddic endpoint returns. */
const OVER_DELIVERED = `<?xml version="1.0" encoding="utf-8"?><dataPreview:tableData xmlns:dataPreview="http://www.sap.com/adt/dataPreview"><dataPreview:totalRows>0</dataPreview:totalRows><dataPreview:columns><dataPreview:metadata dataPreview:name="OBJCT" dataPreview:type="C"/><dataPreview:dataSet><dataPreview:data>R1</dataPreview:data><dataPreview:data>R2</dataPreview:data><dataPreview:data>R3</dataPreview:data><dataPreview:data>R4</dataPreview:data><dataPreview:data>R5</dataPreview:data><dataPreview:data>R6</dataPreview:data></dataPreview:dataSet></dataPreview:columns></dataPreview:tableData>`;

describe('parseDataPreviewXml — a blank cell is a value, not a missing row', () => {
  it('returns the row when the only projected cell is blank', () => {
    const result = parseDataPreviewXml(SINGLE_BLANK_COLUMN, 20);
    // The reported bug: this was `rows: []`, so the caller could not tell
    // "no such row" from "the row exists and the value is blank".
    expect(result.rows).toHaveLength(1);
    expect(result.returned_rows).toBe(1);
    expect(result.rows[0]).toEqual({ ALLOW_MSGNO_QUERY: '' });
  });

  it('reports a blank cell as an empty string, not null', () => {
    const result = parseDataPreviewXml(BLANK_PLUS_NONBLANK, 20);
    expect(result.rows).toEqual([
      { INTERFACE_ID: 'ZMY_INTERFACE_ID', ALLOW_MSGNO_QUERY: '' },
    ]);
  });

  it('keeps every value on its own row when blanks are interleaved', () => {
    const result = parseDataPreviewXml(INTERLEAVED_BLANKS, 25);
    expect(result.rows).toHaveLength(5);
    // The whole point: PLANT_GR belongs to row 4 (A_OBJ4). The old parser
    // dropped the three leading blanks and reported it against A_OBJ1.
    expect(result.rows.map((r) => r.FIEL3)).toEqual([
      '',
      '',
      '',
      'PLANT_GR',
      '',
    ]);
    expect(result.rows.find((r) => r.FIEL3 === 'PLANT_GR')?.OBJCT).toBe(
      'A_OBJ4',
    );
  });

  /**
   * A column's NAME and its CELLS must come from the same document element.
   *
   * Reported hypothesis (2026-09-11): adding ORDER BY changes the order of the
   * <dataPreview:columns> sections SAP returns, so a parser that pairs a
   * separate metadata list against a separate data list BY INDEX would attach
   * one column's values to another column's name — a silent transposition that
   * looks like valid data. That is what the pre-2026-08-23 regex parser did.
   *
   * The current parser reads each section's own <dataPreview:metadata>, so the
   * section order cannot matter. These two documents carry the SAME data with
   * the sections in OPPOSITE order and must parse identically.
   */
  it('attaches values by section, so the order of the column sections cannot transpose them', () => {
    const order = (first: string, second: string) =>
      `<dataPreview:tableData xmlns:dataPreview="http://www.sap.com/adt/dataPreview">${first}${second}</dataPreview:tableData>`;
    const objct =
      '<dataPreview:columns><dataPreview:metadata dataPreview:name="OBJCT" dataPreview:type="C"/><dataPreview:dataSet><dataPreview:data>A_OBJ1</dataPreview:data><dataPreview:data>A_OBJ2</dataPreview:data></dataPreview:dataSet></dataPreview:columns>';
    const fiel3 =
      '<dataPreview:columns><dataPreview:metadata dataPreview:name="FIEL3" dataPreview:type="C"/><dataPreview:dataSet><dataPreview:data/><dataPreview:data>PLANT_GR</dataPreview:data></dataPreview:dataSet></dataPreview:columns>';

    const forward = parseDataPreviewXml(order(objct, fiel3));
    const reversed = parseDataPreviewXml(order(fiel3, objct));

    const expected = [
      { OBJCT: 'A_OBJ1', FIEL3: '' },
      { OBJCT: 'A_OBJ2', FIEL3: 'PLANT_GR' },
    ];
    expect(forward.rows).toEqual(expected);
    expect(reversed.rows).toEqual(expected);

    // Only the column ORDER differs, and it follows the document.
    expect(forward.columns.map((c) => c.name)).toEqual(['OBJCT', 'FIEL3']);
    expect(reversed.columns.map((c) => c.name)).toEqual(['FIEL3', 'OBJCT']);
  });

  it('never names a column whose metadata is missing', () => {
    // A section with no metadata name is SKIPPED, not silently given the next
    // column's name — the transposition the index-pairing parser produced.
    const xml =
      '<dataPreview:tableData xmlns:dataPreview="http://www.sap.com/adt/dataPreview">' +
      '<dataPreview:columns><dataPreview:dataSet><dataPreview:data>orphan</dataPreview:data></dataPreview:dataSet></dataPreview:columns>' +
      '<dataPreview:columns><dataPreview:metadata dataPreview:name="REAL" dataPreview:type="C"/><dataPreview:dataSet><dataPreview:data>kept</dataPreview:data></dataPreview:dataSet></dataPreview:columns>' +
      '</dataPreview:tableData>';
    const result = parseDataPreviewXml(xml);
    expect(result.columns.map((c) => c.name)).toEqual(['REAL']);
    expect(result.rows).toEqual([{ REAL: 'kept' }]);
  });
});

describe('parseDataPreviewXml — counts the caller can actually trust', () => {
  it('always reports returned_rows === rows.length', () => {
    for (const xml of [
      SINGLE_BLANK_COLUMN,
      BLANK_PLUS_NONBLANK,
      INTERLEAVED_BLANKS,
      OVER_DELIVERED,
    ]) {
      const result = parseDataPreviewXml(xml, 5);
      expect(result.returned_rows).toBe(result.rows.length);
    }
  });

  it('trims SAP’s extra row to max_rows and flags has_more', () => {
    const result = parseDataPreviewXml(OVER_DELIVERED, 5);
    expect(result.rows).toHaveLength(5);
    expect(result.returned_rows).toBe(5);
    expect(result.has_more).toBe(true);
  });

  it('does not set has_more when SAP stayed within the bound', () => {
    expect(parseDataPreviewXml(OVER_DELIVERED, 10).has_more).toBeUndefined();
    expect(parseDataPreviewXml(OVER_DELIVERED, 10).rows).toHaveLength(6);
  });

  it('warns when SAP’s total_rows contradicts the rows returned', () => {
    // Every live response observed carried <totalRows>0</totalRows>, rows or
    // not, so a caller branching on total_rows == 0 concludes "no data" while
    // holding data. Pass it through, but say so.
    const result = parseDataPreviewXml(BLANK_PLUS_NONBLANK, 20);
    expect(result.total_rows).toBe(0);
    expect(result.warnings?.join(' ')).toMatch(/must not be used|no data/i);
  });

  it('warns when columns disagree on how many cells they hold', () => {
    const ragged = INTERLEAVED_BLANKS.replace(
      '<dataPreview:data>A_OBJ5</dataPreview:data>',
      '',
    );
    const result = parseDataPreviewXml(ragged, 25);
    expect(result.warnings?.join(' ')).toMatch(/different cell counts/i);
    // Still positional: the surviving values must not slide.
    expect(result.rows[3].FIEL3).toBe('PLANT_GR');
  });
});

describe('parseDataPreviewXml — value fidelity', () => {
  it('keeps leading zeros and does not turn "0" into null', () => {
    const xml = `<dataPreview:tableData xmlns:dataPreview="http://www.sap.com/adt/dataPreview"><dataPreview:columns><dataPreview:metadata dataPreview:name="NUM" dataPreview:type="N"/><dataPreview:dataSet><dataPreview:data>0001</dataPreview:data><dataPreview:data>0</dataPreview:data></dataPreview:dataSet></dataPreview:columns></dataPreview:tableData>`;
    const result = parseDataPreviewXml(xml);
    expect(result.rows.map((r) => r.NUM)).toEqual(['0001', '0']);
  });

  it('decodes XML entities in values', () => {
    const xml = `<dataPreview:tableData xmlns:dataPreview="http://www.sap.com/adt/dataPreview"><dataPreview:columns><dataPreview:metadata dataPreview:name="T" dataPreview:type="C"/><dataPreview:dataSet><dataPreview:data>A &amp; B &lt;x&gt;</dataPreview:data></dataPreview:dataSet></dataPreview:columns></dataPreview:tableData>`;
    expect(parseDataPreviewXml(xml).rows[0].T).toBe('A & B <x>');
  });

  it('surfaces the messages SAP attached to the result', () => {
    const result = parseDataPreviewXml(SINGLE_BLANK_COLUMN, 20);
    expect(result.messages?.[0].severity).toBe('I');
    expect(result.messages?.[0].text).toContain('Names may consist only');
  });

  it('returns an empty result rather than throwing on an empty body', () => {
    const result = parseDataPreviewXml('');
    expect(result.rows).toEqual([]);
    expect(result.returned_rows).toBe(0);
    expect(result.columns).toEqual([]);
  });
});

describe('describeDataPreviewError', () => {
  /** Captured verbatim from the live 400. */
  const unknownColumn = {
    response: {
      status: 400,
      data: `<?xml version="1.0" encoding="utf-8"?><exc:exception xmlns:exc="http://www.sap.com/abapxml/types/communicationframework"><namespace id="http://www.sap.com/adt/wda/dataPreview"/><type id="ExceptionDataPreviewGeneral"/><message lang="EN">Unknown column name "SPEICHKLA".</message><localizedMessage lang="ZH">x</localizedMessage></exc:exception>`,
    },
    message: 'Request failed with status code 400',
  };

  it('names the column SAP rejected instead of relaying an axios status', () => {
    const text = describeDataPreviewError(unknownColumn);
    expect(text).toContain('Unknown column name "SPEICHKLA"');
    expect(text).toContain('ExceptionDataPreviewGeneral');
    // The old message was just "Request failed with status code 400", which
    // sends the caller off rewriting a query that may be fine.
    expect(text).toMatch(/DDIC field list|OBJCT/);
  });

  it('says a JOIN was the likely cause when the query contained one', () => {
    const text = describeDataPreviewError(
      { response: { status: 400, data: '<x/>' }, message: 'boom' },
      'SELECT a FROM t1 INNER JOIN t2 ON t1~k = t2~k',
    );
    expect(text).toMatch(/rejects JOINs/i);
  });

  it('marks a session failure as a session failure, not a bad request', () => {
    const err = {
      response: {
        status: 400,
        data: '<message lang="EN">Session Timed Out</message>',
      },
      message: 'Request failed with status code 400',
    };
    expect(isSessionError(err)).toBe(true);
    expect(describeDataPreviewError(err)).toMatch(/SESSION-level/);
  });

  it('does not treat an auth failure as retryable', () => {
    expect(
      isSessionError({ response: { status: 403, data: 'session timed out' } }),
    ).toBe(false);
  });
});
