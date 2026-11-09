/**
 * Program text pool formats (ADT /textelements), pinned to bodies captured
 * live on S4D/100 (2026-11-05) — not to formats inferred from documentation.
 */

import {
  containsCjk,
  isCjkLanguage,
  mergeSelections,
  mergeSymbols,
  parseHeadings,
  parseSelections,
  parseSymbols,
  selectionDifferences,
  serializeSelections,
  serializeSymbols,
  symbolDifferences,
} from '../../lib/textElements';

// A real selections body (a program with DDIC-referenced and own texts).
const SELECTIONS_REAL =
  '@DDICReference\r\nP_FILE  =File name\r\n\r\n@DDICReference\r\nP_WERKS =Plant\r\n\r\nR_REP   =Report\r\n\r\nR_UPL   =Upload Data\r\n\r\nS_DATE  =Build Date\r\n\r\n@DDICReference\r\nS_MATNR =Material\r\n\r\n@DDICReference\r\nS_VIN   =VIN';
// The shape of a real symbols body (SAP report, original language DE).
const SYMBOLS_REAL =
  '@MaxLength:7\r\n001=Treffer\r\n\r\n@MaxLength:46\r\n002=Source Scan für String:\r\n\r\n@MaxLength:11\r\nA05=Suchbegriff';
const HEADINGS_REAL =
  'listHeader=\r\n\r\ncolumnHeader_1=\r\ncolumnHeader_2=\r\ncolumnHeader_3=\r\ncolumnHeader_4=';

describe('parse the measured formats', () => {
  it('symbols: @MaxLength + KEY=text blocks', () => {
    expect(parseSymbols(SYMBOLS_REAL)).toEqual([
      { key: '001', text: 'Treffer', max_length: 7 },
      { key: '002', text: 'Source Scan für String:', max_length: 46 },
      { key: 'A05', text: 'Suchbegriff', max_length: 11 },
    ]);
    expect(parseSymbols('')).toEqual([]);
  });

  it('selections: name padded to 8, optional @DDICReference', () => {
    const sel = parseSelections(SELECTIONS_REAL);
    expect(sel).toHaveLength(7);
    expect(sel[0]).toEqual({
      name: 'P_FILE',
      text: 'File name',
      ddic_reference: true,
    });
    expect(sel[2]).toEqual({
      name: 'R_REP',
      text: 'Report',
      ddic_reference: false,
    });
  });

  // Measured on a fresh program: a parameter WITHOUT a selection text is shown
  // as "NAME    =?...". Writing that back would store the placeholder as text.
  it('the "?..." placeholder is a missing text and is never written back', () => {
    const sel = parseSelections('P_ABC   =?...\r\n\r\nP_DEF   =Real');
    expect(sel[0]).toEqual({
      name: 'P_ABC',
      text: '',
      ddic_reference: false,
      missing: true,
    });
    expect(serializeSelections(sel)).toBe('P_DEF   =Real');
  });

  it('headings: key=value lines', () => {
    expect(parseHeadings(HEADINGS_REAL)).toMatchObject({
      listHeader: '',
      columnHeader_1: '',
    });
  });

  it('round-trips byte-identically', () => {
    expect(serializeSymbols(parseSymbols(SYMBOLS_REAL))).toBe(SYMBOLS_REAL);
    expect(serializeSelections(parseSelections(SELECTIONS_REAL))).toBe(
      SELECTIONS_REAL,
    );
  });
});

describe('mergeSymbols', () => {
  const current = parseSymbols(SYMBOLS_REAL);

  it('merge keeps the others, adds and replaces by key', () => {
    const out = mergeSymbols(
      current,
      [
        { key: '001', text: 'Hits' },
        { key: 'b01', text: 'New one' },
      ],
      [],
      false,
    );
    expect(out.map((s) => s.key)).toEqual(['001', '002', 'A05', 'B01']);
    // an existing symbol keeps its larger reserved length...
    expect(out.find((s) => s.key === '001')).toEqual({
      key: '001',
      text: 'Hits',
      max_length: 7,
    });
    // ...a new one defaults to its text length
    expect(out.find((s) => s.key === 'B01')?.max_length).toBe(7);
  });

  it('replace writes exactly what was given', () => {
    expect(
      mergeSymbols(current, [{ key: '001', text: 'x' }], [], true).map(
        (s) => s.key,
      ),
    ).toEqual(['001']);
  });

  it('remove deletes; removing a key that does not exist is refused', () => {
    expect(mergeSymbols(current, [], ['002'], false).map((s) => s.key)).toEqual(
      ['001', 'A05'],
    );
    expect(() => mergeSymbols(current, [], ['ZZZ'], false)).toThrow(
      /does not exist/,
    );
  });

  it('refuses what SAP would refuse or cut, before writing', () => {
    expect(() =>
      mergeSymbols([], [{ key: 'TEXT-001', text: 'x' }], [], false),
    ).toThrow(/3 letters/);
    expect(() =>
      mergeSymbols([], [{ key: '001', text: 'a\nb' }], [], false),
    ).toThrow(/line break/);
    expect(() =>
      mergeSymbols([], [{ key: '001', text: 'x'.repeat(133) }], [], false),
    ).toThrow(/132/);
    expect(() =>
      mergeSymbols(
        [],
        [{ key: '001', text: 'long text', max_length: 3 }],
        [],
        false,
      ),
    ).toThrow(/shorter than the text/);
    expect(() =>
      mergeSymbols(
        [],
        [
          { key: '001', text: 'a' },
          { key: '001', text: 'b' },
        ],
        [],
        false,
      ),
    ).toThrow(/twice/);
  });
});

describe('mergeSelections', () => {
  const current = parseSelections(SELECTIONS_REAL);

  it('a text you pass switches its Dictionary reference off unless asked', () => {
    const out = mergeSelections(
      current,
      [{ name: 'p_file', text: 'Upload file' }],
      false,
    );
    expect(out.find((s) => s.name === 'P_FILE')).toEqual({
      name: 'P_FILE',
      text: 'Upload file',
      ddic_reference: false,
    });
    // untouched entries keep their flag
    expect(out.find((s) => s.name === 'P_WERKS')?.ddic_reference).toBe(true);
    expect(out).toHaveLength(7);
  });

  it('refuses a name longer than 8 and a text longer than 30', () => {
    expect(() =>
      mergeSelections([], [{ name: 'P_TOO_LONG1', text: 'x' }], false),
    ).toThrow(/8 characters/);
    expect(() =>
      mergeSelections([], [{ name: 'P_A', text: 'x'.repeat(31) }], false),
    ).toThrow(/30/);
  });
});

describe('read-back comparison', () => {
  it('names the keys that differ, including extra and missing ones', () => {
    const want = parseSymbols(SYMBOLS_REAL);
    expect(symbolDifferences(want, want)).toEqual([]);
    expect(
      symbolDifferences(want, [{ key: '001', text: 'other', max_length: 7 }]),
    ).toEqual(['001', '002', 'A05']);
  });

  it('a DDIC-referenced selection is compared by flag, not by text', () => {
    const want = [{ name: 'P_FILE', text: 'mine', ddic_reference: true }];
    const have = [
      { name: 'P_FILE', text: 'Dictionary text', ddic_reference: true },
    ];
    expect(selectionDifferences(want, have)).toEqual([]);
    expect(
      selectionDifferences(want, [
        { name: 'P_FILE', text: '', ddic_reference: false, missing: true },
      ]),
    ).toEqual(['P_FILE']);
  });
});

describe('CJK guard', () => {
  it('detects CJK text and CJK original languages', () => {
    expect(containsCjk('上传文件')).toBe(true);
    expect(containsCjk('Upload file')).toBe(false);
    expect(isCjkLanguage('EN')).toBe(false);
    expect(isCjkLanguage('ZH')).toBe(true);
  });
});
