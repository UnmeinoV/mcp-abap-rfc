/**
 * Table type (TTYP) content writing.
 *
 * A table type is POSTed bare (root + packageRef only), so the row type has to
 * be written by a follow-up PUT. The dep does that with a regex patch that can
 * only REPLACE tags which already exist, so on a fresh object every patch
 * silently no-ops and the row type — the entire point of a table type — is
 * dropped. These tests pin the INSERT behaviour.
 *
 * The XML shapes below mirror a live read of STRING_TABLE from
 * /sap/bc/adt/ddic/tabletypes/string_table (SAP_BASIS 7.56).
 */

import {
  buildTableTypeCreateXml,
  patchTableTypeContent,
} from '../../lib/tableTypeXml';

/** What SAP returns for a freshly created (bare) table type. */
const BARE = `<?xml version="1.0" encoding="UTF-8"?>
<ttyp:tableType xmlns:ttyp="http://www.sap.com/dictionary/tabletype" xmlns:adtcore="http://www.sap.com/adt/core" adtcore:description="Order items" adtcore:name="ZTT_ORDER_ITEM" adtcore:type="TTYP/DA" adtcore:masterLanguage="EN">
  <adtcore:packageRef adtcore:name="$TMP"/>
</ttyp:tableType>`;

/** An existing table type that already carries the subtree. */
const POPULATED = `<?xml version="1.0" encoding="UTF-8"?>
<ttyp:tableType xmlns:ttyp="http://www.sap.com/dictionary/tabletype" xmlns:adtcore="http://www.sap.com/adt/core" adtcore:description="Old" adtcore:name="ZTT_X" adtcore:type="TTYP/DA">
  <adtcore:packageRef adtcore:name="$TMP"/>
  <ttyp:rowType>
    <ttyp:typeKind>predefinedAbapType</ttyp:typeKind>
    <ttyp:typeName></ttyp:typeName>
    <ttyp:builtInType>
      <ttyp:dataType>STRING</ttyp:dataType>
      <ttyp:length>0</ttyp:length>
      <ttyp:decimals>0</ttyp:decimals>
    </ttyp:builtInType>
  </ttyp:rowType>
  <ttyp:accessType>standard</ttyp:accessType>
  <ttyp:primaryKey>
    <ttyp:definition>standard</ttyp:definition>
    <ttyp:kind>nonUnique</ttyp:kind>
  </ttyp:primaryKey>
</ttyp:tableType>`;

describe('patchTableTypeContent — INSERT into a bare table type', () => {
  it('inserts the whole rowType subtree that the regex patch would have dropped', () => {
    const out = patchTableTypeContent(BARE, {
      row_type_name: 'zs_order_item',
      row_type_kind: 'dictionaryType',
      access_type: 'standard',
      primary_key_definition: 'standard',
      primary_key_kind: 'nonUnique',
    });
    expect(out).toContain('<ttyp:rowType>');
    expect(out).toContain('<ttyp:typeKind>dictionaryType</ttyp:typeKind>');
    // Row type names are stored upper-case.
    expect(out).toContain('<ttyp:typeName>ZS_ORDER_ITEM</ttyp:typeName>');
    expect(out).toContain('<ttyp:accessType>standard</ttyp:accessType>');
    expect(out).toContain('<ttyp:definition>standard</ttyp:definition>');
    expect(out).toContain('<ttyp:kind>nonUnique</ttyp:kind>');
  });

  it('preserves the packageRef and root attributes', () => {
    const out = patchTableTypeContent(BARE, { row_type_name: 'ZS_X' });
    expect(out).toContain('adtcore:packageRef');
    expect(out).toContain('adtcore:name="$TMP"');
    expect(out).toContain('adtcore:name="ZTT_ORDER_ITEM"');
    expect(out).toContain('adtcore:type="TTYP/DA"');
  });

  it('emits exactly one XML declaration', () => {
    const out = patchTableTypeContent(BARE, { row_type_name: 'ZS_X' });
    expect(out.match(/<\?xml/g)).toHaveLength(1);
    expect(out.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
  });

  it('writes a built-in row type with length and decimals', () => {
    const out = patchTableTypeContent(BARE, {
      row_type_kind: 'predefinedAbapType',
      built_in_type: { data_type: 'char', length: 10, decimals: 0 },
    });
    expect(out).toContain('<ttyp:typeKind>predefinedAbapType</ttyp:typeKind>');
    expect(out).toContain('<ttyp:dataType>CHAR</ttyp:dataType>');
    expect(out).toContain('<ttyp:length>10</ttyp:length>');
    expect(out).toContain('<ttyp:decimals>0</ttyp:decimals>');
  });

  it('defaults built-in length/decimals to 0 rather than dropping them', () => {
    const out = patchTableTypeContent(BARE, {
      built_in_type: { data_type: 'STRING' },
    });
    expect(out).toContain('<ttyp:length>0</ttyp:length>');
    expect(out).toContain('<ttyp:decimals>0</ttyp:decimals>');
  });

  it('caps the description at 60 characters', () => {
    const out = patchTableTypeContent(BARE, { description: 'x'.repeat(80) });
    const m = out.match(/adtcore:description="(x+)"/);
    expect(m?.[1]).toHaveLength(60);
  });

  it('touches nothing when the patch is empty', () => {
    const out = patchTableTypeContent(BARE, {});
    expect(out).not.toContain('<ttyp:rowType>');
    expect(out).not.toContain('<ttyp:accessType>');
  });

  it('rejects XML that is not a table type', () => {
    expect(() =>
      patchTableTypeContent('<doma:domain xmlns:doma="x"/>', {
        row_type_name: 'ZS_X',
      }),
    ).toThrow(/<ttyp:tableType> root element not found/);
  });
});

describe('patchTableTypeContent — UPDATE an existing table type', () => {
  it('replaces existing values in place', () => {
    const out = patchTableTypeContent(POPULATED, {
      row_type_kind: 'dictionaryType',
      row_type_name: 'ZS_NEW',
      access_type: 'sorted',
      primary_key_kind: 'unique',
      description: 'New description',
    });
    expect(out).toContain('<ttyp:typeKind>dictionaryType</ttyp:typeKind>');
    expect(out).toContain('<ttyp:typeName>ZS_NEW</ttyp:typeName>');
    expect(out).toContain('<ttyp:accessType>sorted</ttyp:accessType>');
    expect(out).toContain('<ttyp:kind>unique</ttyp:kind>');
    expect(out).toContain('adtcore:description="New description"');
    // Untouched siblings survive.
    expect(out).toContain('<ttyp:definition>standard</ttyp:definition>');
  });

  it('leaves unrelated existing nodes alone', () => {
    const out = patchTableTypeContent(POPULATED, { access_type: 'hashed' });
    expect(out).toContain('<ttyp:accessType>hashed</ttyp:accessType>');
    expect(out).toContain('<ttyp:dataType>STRING</ttyp:dataType>');
    expect(out).toContain('adtcore:description="Old"');
  });
});

describe('buildTableTypeCreateXml', () => {
  it('builds a bare create body with packageRef and TTYP/DA type', () => {
    const xml = buildTableTypeCreateXml({
      name: 'ztt_x',
      packageName: '$tmp',
      description: 'Demo',
      masterLanguage: 'en',
    });
    expect(xml).toContain('adtcore:name="ZTT_X"');
    expect(xml).toContain('adtcore:name="$TMP"');
    expect(xml).toContain('adtcore:type="TTYP/DA"');
    expect(xml).toContain('adtcore:masterLanguage="EN"');
    expect(xml).toContain('adtcore:description="Demo"');
    // No row type at create time — it is written by the follow-up PUT.
    expect(xml).not.toContain('ttyp:rowType');
  });

  it('omits masterSystem/responsible when unknown, includes them when known', () => {
    expect(
      buildTableTypeCreateXml({ name: 'ZTT_X', packageName: '$TMP' }),
    ).not.toContain('adtcore:responsible');
    const withCtx = buildTableTypeCreateXml({
      name: 'ZTT_X',
      packageName: '$TMP',
      masterSystem: 'DM2',
      responsible: 'SOME.USER',
    });
    expect(withCtx).toContain('adtcore:masterSystem="DM2"');
    expect(withCtx).toContain('adtcore:responsible="SOME.USER"');
  });

  it('escapes special characters in the description', () => {
    const xml = buildTableTypeCreateXml({
      name: 'ZTT_X',
      packageName: '$TMP',
      description: 'A & B "quoted" <tag>',
    });
    expect(xml).toContain('&amp;');
    expect(xml).toContain('&quot;');
    expect(xml).toContain('&lt;tag&gt;');
  });

  it('defaults the description to the object name', () => {
    const xml = buildTableTypeCreateXml({
      name: 'ZTT_ITEMS',
      packageName: '$TMP',
    });
    expect(xml).toContain('adtcore:description="ZTT_ITEMS"');
  });
});

describe('patchTableTypeContent — attribute round-trip', () => {
  it('keeps ="true" attribute VALUES instead of collapsing them', () => {
    // fast-xml-parser's builder defaults suppressBooleanAttributes to TRUE,
    // which rewrites ttyp:isVisible="true" into a valueless ttyp:isVisible.
    // HTML allows that, XML does not: SAP answered
    //   400 ExceptionInvalidData "System expected end of element ... tableType"
    // pointing at the element carrying the mangled attribute, so every write
    // through this module failed until the option was turned off.
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ttyp:tableType xmlns:ttyp="http://www.sap.com/dictionary/tabletype" xmlns:adtcore="http://www.sap.com/adt/core" adtcore:name="ZTT_X">
  <ttyp:primaryKey ttyp:isVisible="true" ttyp:isEditable="true">
    <ttyp:definition>standard</ttyp:definition>
    <ttyp:kind>nonUnique</ttyp:kind>
  </ttyp:primaryKey>
  <ttyp:secondaryKeys ttyp:isVisible="true" ttyp:isEditable="true">
    <ttyp:allowed>notSpecified</ttyp:allowed>
  </ttyp:secondaryKeys>
</ttyp:tableType>`;
    const out = patchTableTypeContent(xml, { primary_key_kind: 'unique' });
    expect(out).toContain('ttyp:isVisible="true"');
    expect(out).toContain('ttyp:isEditable="true"');
    expect(out).not.toMatch(/ttyp:isVisible[ >]/);
    expect(out).toContain('<ttyp:kind>unique</ttyp:kind>');
  });
});
