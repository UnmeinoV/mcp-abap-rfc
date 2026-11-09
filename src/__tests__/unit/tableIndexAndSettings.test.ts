/**
 * Table indexes (TABL/DTI) and technical settings (TABL/DTT).
 *
 * The payloads here are REAL responses from DM2/310 (S/4HANA 2023 FPS02),
 * captured while working out the contract — SAP's own MARA~G16 index, T100's
 * single-record buffering, and the multi-object deletion response that exposed a
 * parser bug affecting every Delete* handler.
 */

import { parseDeletionResult } from '../../lib/adtDeletion';
import {
  buildTableIndexCreateXml,
  buildTableIndexSource,
  parseTableIndexNodes,
  parseTableIndexSource,
  tableIndexName,
  tableIndexUri,
} from '../../lib/tableIndexXml';
import {
  classifyBuffering,
  describeBuffering,
  parseTableSettings,
  patchTableSettings,
  tableSettingsUri,
} from '../../lib/tableSettingsXml';

describe('table index URIs and names', () => {
  it('addresses an index as table~id with the tilde percent-encoded', () => {
    // ADT's own nodestructure returns /sap/bc/adt/ddic/db/indexes/mara%7eg16.
    expect(tableIndexUri('MARA', 'G16')).toBe(
      '/sap/bc/adt/ddic/db/indexes/mara%7eg16',
    );
    expect(tableIndexName('mara', 'g16')).toBe('MARA~G16');
  });
});

describe('buildTableIndexSource', () => {
  it('produces SAP’s published indx-v1 shape', () => {
    const source = JSON.parse(
      buildTableIndexSource({
        description: 'Verification due',
        fields: ['MANDT', 'VERIFIED', 'VERIFY_DUE_AT'],
      }),
    );
    expect(source).toEqual({
      formatVersion: '1',
      header: { description: 'Verification due', originalLanguage: 'en' },
      uniqueIndex: false,
      bufferIndexOnly: false,
      textIndex: false,
      indexFields: [
        { fieldName: 'MANDT' },
        { fieldName: 'VERIFIED' },
        { fieldName: 'VERIFY_DUE_AT' },
      ],
    });
  });

  it('keeps field ORDER and removes duplicates', () => {
    // Order decides which queries the index serves, so it must survive; a
    // duplicated column is rejected by SAP with a message that reads like a
    // schema problem, so it is dropped here instead.
    const source = parseTableIndexSource(
      buildTableIndexSource({
        description: 'x',
        fields: ['due_at', 'MANDT', 'DUE_AT', ' status '],
      }),
    );
    expect(source?.indexFields.map((f) => f.fieldName)).toEqual([
      'DUE_AT',
      'MANDT',
      'STATUS',
    ]);
  });

  it('lower-cases the original language, as SAP’s schema requires', () => {
    const source = parseTableIndexSource(
      buildTableIndexSource({
        description: 'x',
        fields: ['A'],
        originalLanguage: 'EN',
      }),
    );
    expect(source?.header.originalLanguage).toBe('en');
  });

  it('carries the unique and buffer-only flags', () => {
    const source = parseTableIndexSource(
      buildTableIndexSource({
        description: 'x',
        fields: ['A'],
        unique: true,
        bufferIndexOnly: true,
      }),
    );
    expect(source?.uniqueIndex).toBe(true);
    expect(source?.bufferIndexOnly).toBe(true);
  });
});

describe('buildTableIndexCreateXml', () => {
  it('escapes XML metacharacters in the description', () => {
    const xml = buildTableIndexCreateXml({
      tableName: 'ZT',
      indexId: 'VER',
      packageName: '$tmp',
      description: 'Auth for A & B "q" <t>',
    });
    expect(xml).toContain('adtcore:name="ZT~VER"');
    expect(xml).toContain('adtcore:type="TABL/DTI"');
    expect(xml).toContain('adtcore:name="$TMP"');
    const attr = /adtcore:description="([^"]*)"/.exec(xml)?.[1] ?? '';
    expect(attr).toContain('&amp;');
    expect(attr).not.toMatch(/[<>](?!(amp|quot|lt|gt|apos);)/);
  });

  it('emits exactly one XML declaration', () => {
    const xml = buildTableIndexCreateXml({
      tableName: 'ZT',
      indexId: 'A',
      packageName: '$TMP',
    });
    expect(xml.match(/<\?xml/g)).toHaveLength(1);
  });
});

describe('parseTableIndexNodes', () => {
  /** Trimmed from the real nodestructure response for MARA. */
  const NODES = `<?xml version="1.0" encoding="utf-8"?><asx:abap xmlns:asx="http://www.sap.com/abapxml"><asx:values><DATA><TREE_CONTENT><SEU_ADT_REPOSITORY_OBJ_NODE><OBJECT_TYPE>TABL/DTI</OBJECT_TYPE><OBJECT_NAME>G16</OBJECT_NAME><TECH_NAME>MARA          G16</TECH_NAME><OBJECT_URI>/sap/bc/adt/ddic/db/indexes/mara%7eg16</OBJECT_URI><DESCRIPTION>Index for A &amp; B &lt;x&gt;</DESCRIPTION></SEU_ADT_REPOSITORY_OBJ_NODE><SEU_ADT_REPOSITORY_OBJ_NODE><OBJECT_TYPE>TABL/DF</OBJECT_TYPE><OBJECT_NAME>MATNR</OBJECT_NAME><TECH_NAME>MARA MATNR</TECH_NAME><OBJECT_URI>/x</OBJECT_URI><DESCRIPTION>a field, not an index</DESCRIPTION></SEU_ADT_REPOSITORY_OBJ_NODE></TREE_CONTENT></DATA></asx:values></asx:abap>`;

  it('returns only the TABL/DTI children', () => {
    const entries = parseTableIndexNodes(NODES);
    expect(entries).toHaveLength(1);
    expect(entries[0].index_id).toBe('G16');
    expect(entries[0].name).toBe('MARA~G16');
    expect(entries[0].uri).toBe('/sap/bc/adt/ddic/db/indexes/mara%7eg16');
  });

  it('decodes XML entities in the description', () => {
    expect(parseTableIndexNodes(NODES)[0].description).toBe(
      'Index for A & B <x>',
    );
  });

  it('returns an empty list for a table with no indexes', () => {
    expect(parseTableIndexNodes('<x/>')).toEqual([]);
  });
});

describe('table technical settings', () => {
  /** Captured verbatim: T100 is single-record buffered (DD09L-PUFFERUNG 'P'). */
  const T100 = `<?xml version="1.0" encoding="utf-8"?><ts:tableSettings adtcore:name="T100" adtcore:type="TABL/DTT" adtcore:version="active" adtcore:description="Messages" xmlns:ts="http://www.sap.com/dictionary/table/settings" xmlns:adtcore="http://www.sap.com/adt/core"><ts:dataClassCategory>SSEXC</ts:dataClassCategory><ts:sizeCategory>4</ts:sizeCategory><ts:buffering><ts:allowed>X</ts:allowed><ts:type>P</ts:type><ts:areaKeyFields>0</ts:areaKeyFields></ts:buffering><ts:storageType>C</ts:storageType><ts:sharingType>T</ts:sharingType><ts:loadUnit/><ts:loggingEnabled>false</ts:loggingEnabled><ts:supportsLoggingAssessment>true</ts:supportsLoggingAssessment></ts:tableSettings>`;

  /** Captured verbatim: buffering NOT allowed, self-closing <ts:type/>. */
  const NOT_ALLOWED = T100.replace(
    '<ts:allowed>X</ts:allowed><ts:type>P</ts:type>',
    '<ts:allowed>N</ts:allowed><ts:type/>',
  );

  it('builds the settings URI', () => {
    expect(tableSettingsUri('ZMY_TABLE')).toBe(
      '/sap/bc/adt/ddic/db/settings/zmy_table',
    );
  });

  it('reads T100 as single-record buffered and names the DD09L value', () => {
    const s = parseTableSettings(T100);
    expect(s.buffering).toBe('single_record');
    // Ground-truthed against DD09L: T100 has PUFFERUNG 'P'.
    expect(s.expected_dd09l_pufferung).toBe('P');
    expect(s.data_class).toBe('SSEXC');
    expect(s.size_category).toBe('4');
    expect(s.logging_enabled).toBe(false);
  });

  it('tells "not allowed" apart from "allowed but switched off"', () => {
    // Both have DD09L-PUFFERUNG blank, so only the allowed flag separates them —
    // and a caller that sets only one of the two fields gets a table that looks
    // configured and is not buffered.
    expect(parseTableSettings(NOT_ALLOWED).buffering).toBe('not_allowed');
    expect(classifyBuffering('X', '')).toBe('allowed_but_switched_off');
    expect(classifyBuffering('X', 'X')).toBe('fully_buffered');
    expect(classifyBuffering('X', 'G')).toBe('generic');
    expect(classifyBuffering('?', '?')).toBe('unknown');
  });

  it('patches only what was asked for', () => {
    const patched = patchTableSettings(T100, { size_category: 2 });
    const s = parseTableSettings(patched);
    expect(s.size_category).toBe('2');
    // Everything else must survive — an omitted field means KEEP.
    expect(s.buffering).toBe('single_record');
    expect(s.data_class).toBe('SSEXC');
    expect(s.logging_enabled).toBe(false);
    // Elements this module does not model must be untouched.
    expect(patched).toContain('<ts:sharingType>T</ts:sharingType>');
    expect(patched).toContain('<ts:supportsLoggingAssessment>true<');
  });

  it('sets both buffering fields together', () => {
    const s = parseTableSettings(
      patchTableSettings(NOT_ALLOWED, { buffering: 'fully_buffered' }),
    );
    expect(s.buffering_allowed).toBe('X');
    expect(s.buffering_type).toBe('X');
    expect(s.buffering).toBe('fully_buffered');
  });

  it('forces the generic key count to 0 for non-generic modes', () => {
    const s = parseTableSettings(
      patchTableSettings(T100, {
        buffering: 'fully_buffered',
        generic_key_fields: 3,
      }),
    );
    expect(s.generic_key_fields).toBe('0');
  });

  it('keeps the generic key count for generic buffering', () => {
    const s = parseTableSettings(
      patchTableSettings(T100, { buffering: 'generic', generic_key_fields: 2 }),
    );
    expect(s.buffering).toBe('generic');
    expect(s.generic_key_fields).toBe('2');
    expect(describeBuffering(s)).toContain('2 key field');
  });

  it('turns change logging on and off', () => {
    expect(
      parseTableSettings(patchTableSettings(T100, { log_changes: true }))
        .logging_enabled,
    ).toBe(true);
    expect(
      parseTableSettings(patchTableSettings(T100, { log_changes: false }))
        .logging_enabled,
    ).toBe(false);
  });
});

describe('parseDeletionResult with more than one del:object', () => {
  /**
   * Captured verbatim. Deleting a table index cascades onto the table's
   * technical-settings object, so SAP answers with TWO del:object elements.
   * Reading `.object` as a single node then yielded an ARRAY, so isDeleted and
   * the messages were both undefined — reported as "the deletion failed and SAP
   * gave no reason" for a deletion that had in fact happened.
   */
  const CASCADE = `<?xml version="1.0" encoding="utf-8"?><del:deletionResult xmlns:del="http://www.sap.com/adt/deletion"><del:object del:isDeleted="false" adtcore:uri="/sap/bc/adt/ddic/db/indexes/zmcp_idxprobe%7edel" adtcore:type="TABL/DTI" adtcore:name="ZMCP_IDXPROBE DEL" xmlns:adtcore="http://www.sap.com/adt/core"><del:message del:priority="0" del:type="E"><del:text>Error while deleting object ZMCP_IDXPROBE DEL from the database</del:text></del:message></del:object><del:object del:isDeleted="true" adtcore:uri="/sap/bc/adt/ddic/db/settings/zmcp_idxprobe" adtcore:type="TABT/DTT" xmlns:adtcore="http://www.sap.com/adt/core"><del:message del:priority="0" del:type="S"><del:text>Settings removed</del:text></del:message></del:object></del:deletionResult>`;

  const asResponse = (data: string) => ({ data, status: 200 }) as any;

  it('no longer loses every message when SAP reports several objects', () => {
    const result = parseDeletionResult(asResponse(CASCADE));
    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].text).toContain('Error while deleting');
    expect(result.errors).toHaveLength(1);
  });

  it('takes the verdict from the object the caller named', () => {
    const target = parseDeletionResult(
      asResponse(CASCADE),
      '/sap/bc/adt/ddic/db/settings/zmcp_idxprobe',
    );
    expect(target.isDeleted).toBe(true);

    const index = parseDeletionResult(
      asResponse(CASCADE),
      '/sap/bc/adt/ddic/db/indexes/zmcp_idxprobe~del',
    );
    // The URI is percent-encoded in the response and decoded in the argument;
    // the match must still be found.
    expect(index.isDeleted).toBe(false);
  });

  it('reports the per-object breakdown when there is more than one', () => {
    expect(parseDeletionResult(asResponse(CASCADE)).objects).toHaveLength(2);
  });

  it('still handles the ordinary single-object response', () => {
    const single = `<del:deletionResult xmlns:del="http://www.sap.com/adt/deletion"><del:object del:isDeleted="true" adtcore:uri="/x" xmlns:adtcore="http://www.sap.com/adt/core"/></del:deletionResult>`;
    const result = parseDeletionResult(asResponse(single), '/x');
    expect(result.isDeleted).toBe(true);
    expect(result.messages).toEqual([]);
    expect(result.objects).toBeUndefined();
  });
});
