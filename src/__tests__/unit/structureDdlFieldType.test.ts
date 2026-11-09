/**
 * Regression tests for CreateStructure's DDL field typing.
 *
 * The reference parameters `structure_ref` and `table_ref` were accepted by the
 * inputSchema (and present in the internal interface) but NEVER read by the DDL
 * builder, which only looked at `data_element` and `data_type`. A field passing
 * `table_ref: "ZTT_ITEMS"` therefore fell through to the CHAR default and the
 * length default of 1 and was emitted as `abap.char(1)` — and the structure
 * ACTIVATED, so the wrong type was discoverable only by reading every field
 * back. Nested interface structures (a header carrying a line-item table) are
 * exactly the shape that hit this.
 */

import {
  buildStructureDdl,
  ddlFieldType,
  type StructureField,
} from '../../handlers/structure/high/handleCreateStructure';

const f = (o: Partial<StructureField>): StructureField =>
  ({ name: 'FLD', ...o }) as StructureField;

describe('ddlFieldType — reference parameters', () => {
  it('types a field to a data element', () => {
    expect(ddlFieldType(f({ data_element: 'MATNR' }))).toBe('matnr');
  });

  it('types a field to a nested STRUCTURE (structure_ref)', () => {
    expect(ddlFieldType(f({ structure_ref: 'ZS_ORDER_HEAD' }))).toBe(
      'zs_order_head',
    );
  });

  it('types a field to a TABLE TYPE (table_ref)', () => {
    expect(ddlFieldType(f({ table_ref: 'ZTT_ORDER_ITEM' }))).toBe(
      'ztt_order_item',
    );
  });

  it('REJECTS domain instead of silently degrading to char(1)', () => {
    // Silently producing abap.char(1) — which then activates — is far worse
    // than an explicit error, because the wrong type ships unnoticed.
    expect(() => ddlFieldType(f({ domain: 'ZDOM_X' }))).toThrow(
      /"domain" cannot type a DDL structure field/,
    );
  });

  it('accepts domain when a data_element is also given (data element wins)', () => {
    expect(ddlFieldType(f({ domain: 'ZDOM_X', data_element: 'ZDE_X' }))).toBe(
      'zde_x',
    );
  });
});

describe('ddlFieldType — precedence', () => {
  it('data_element beats structure_ref, table_ref and data_type', () => {
    expect(
      ddlFieldType(
        f({
          data_element: 'ZDE_X',
          structure_ref: 'ZS_Y',
          table_ref: 'ZTT_Z',
          data_type: 'CHAR',
          length: 10,
        }),
      ),
    ).toBe('zde_x');
  });

  it('structure_ref beats table_ref and data_type', () => {
    expect(
      ddlFieldType(
        f({ structure_ref: 'ZS_Y', table_ref: 'ZTT_Z', data_type: 'CHAR' }),
      ),
    ).toBe('zs_y');
  });

  it('table_ref beats data_type', () => {
    expect(
      ddlFieldType(f({ table_ref: 'ZTT_Z', data_type: 'CHAR', length: 5 })),
    ).toBe('ztt_z');
  });
});

describe('ddlFieldType — built-in types', () => {
  it('emits (length, decimals) for DEC/CURR/QUAN', () => {
    expect(
      ddlFieldType(f({ data_type: 'CURR', length: 15, decimals: 2 })),
    ).toBe('abap.curr(15,2)');
    expect(
      ddlFieldType(f({ data_type: 'QUAN', length: 13, decimals: 3 })),
    ).toBe('abap.quan(13,3)');
    expect(ddlFieldType(f({ data_type: 'DEC', length: 8 }))).toBe(
      'abap.dec(8,0)',
    );
  });

  it('emits (length) for CHAR/NUMC/RAW/CUKY/UNIT', () => {
    expect(ddlFieldType(f({ data_type: 'CHAR', length: 10 }))).toBe(
      'abap.char(10)',
    );
    expect(ddlFieldType(f({ data_type: 'CUKY', length: 5 }))).toBe(
      'abap.cuky(5)',
    );
    expect(ddlFieldType(f({ data_type: 'UNIT', length: 3 }))).toBe(
      'abap.unit(3)',
    );
  });

  it('emits a bare type for length-less builtins', () => {
    expect(ddlFieldType(f({ data_type: 'INT4' }))).toBe('abap.int4');
    expect(ddlFieldType(f({ data_type: 'DATS' }))).toBe('abap.dats');
    expect(ddlFieldType(f({ data_type: 'CLNT' }))).toBe('abap.clnt');
    expect(ddlFieldType(f({ data_type: 'STRING' }))).toBe('abap.string');
  });

  it('defaults to char(1) only when NOTHING was specified', () => {
    expect(ddlFieldType(f({}))).toBe('abap.char(1)');
  });
});

describe('buildStructureDdl', () => {
  it('emits nested structure and table-type fields correctly', () => {
    // The exact case that used to produce two abap.char(1) fields.
    const ddl = buildStructureDdl(
      'ZS_ORDER',
      'Order',
      [
        f({ name: 'HEADER', structure_ref: 'ZS_ORDER_HEAD' }),
        f({ name: 'ITEM', table_ref: 'ZTT_ORDER_ITEM' }),
      ],
      undefined,
    );
    expect(ddl).toContain('header : zs_order_head;');
    expect(ddl).toContain('item : ztt_order_item;');
    expect(ddl).not.toContain('abap.char(1)');
  });

  it('puts includes before fields and keeps the mandatory annotation', () => {
    const ddl = buildStructureDdl(
      'ZS_X',
      'X',
      [f({ name: 'ID', data_type: 'CHAR', length: 10 })],
      [{ name: 'ZS_BASE' } as any],
    );
    const lines = ddl.split('\n');
    expect(ddl).toContain(
      '@AbapCatalog.enhancement.category : #NOT_EXTENSIBLE',
    );
    expect(lines.indexOf('  include zs_base;')).toBeLessThan(
      lines.indexOf('  id : abap.char(10);'),
    );
    expect(ddl).toContain('define structure zs_x {');
  });

  it('escapes single quotes in the label', () => {
    const ddl = buildStructureDdl('ZS_X', "Bob's data", [], undefined);
    expect(ddl).toContain("@EndUserText.label : 'Bob''s data'");
  });
});
