/**
 * Method-level class surgery (F-5 / K-8: "UpdateClassMethod / anchored patch").
 *
 * These tests pin the two things a body-only patch must never get wrong:
 *  - a period inside a string literal, a string template, or a decimal number must never be
 *    mistaken for a statement terminator (that would corrupt boundary detection);
 *  - splicing one method's body must leave every other byte of the source untouched.
 */

import {
  extractMethodBody,
  findImplementationBlocks,
  findMethod,
  findMethodDeclarations,
  listAllMethodNames,
  listClassMethods,
  spliceMethodBody,
  splitStatements,
} from '../../lib/classMethodSurgery';

const SIMPLE_CLASS = `CLASS zcl_mcp_demo DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS greet
      IMPORTING iv_name TYPE string
      RETURNING VALUE(rv_greeting) TYPE string.
    METHODS add
      IMPORTING iv_a TYPE i
                iv_b TYPE i
      RETURNING VALUE(rv_sum) TYPE i.
  PRIVATE SECTION.
    METHODS helper.
ENDCLASS.

CLASS zcl_mcp_demo IMPLEMENTATION.
  METHOD greet.
    rv_greeting = |Hello, { iv_name }.|.
  ENDMETHOD.

  METHOD add.
    rv_sum = iv_a + iv_b.
  ENDMETHOD.

  METHOD helper.
  ENDMETHOD.
ENDCLASS.`;

describe('splitStatements — periods that must NOT terminate a statement', () => {
  it('does not split on a period inside a string literal', () => {
    const src = `lv_x = 'a.b'.\nlv_y = 1.`;
    const stmts = splitStatements(src);
    expect(stmts.map((s) => s.text.trim())).toEqual([
      "lv_x = 'a.b'.",
      'lv_y = 1.',
    ]);
  });

  it('does not split on a period inside a string template, including one before an escaped bar', () => {
    const src = `rv = |price: { lv_amount }.|.\nrv2 = |a\\|b|.`;
    const stmts = splitStatements(src);
    expect(stmts).toHaveLength(2);
    expect(stmts[0].text.trim()).toBe('rv = |price: { lv_amount }.|.');
  });

  it('does not split on the period in a decimal literal', () => {
    const src = `lv_x = 1.5.\nlv_y = 2.`;
    const stmts = splitStatements(src);
    expect(stmts.map((s) => s.text.trim())).toEqual([
      'lv_x = 1.5.',
      'lv_y = 2.',
    ]);
  });

  it('does not split inside a rest-of-line comment', () => {
    const src = `lv_x = 1. " a comment with a period.\nlv_y = 2.`;
    const stmts = splitStatements(src);
    expect(stmts.map((s) => s.text.trim().split('"')[0].trim())).toEqual([
      'lv_x = 1.',
      'lv_y = 2.',
    ]);
  });

  it('ignores a whole-line comment entirely', () => {
    const src = `* this whole line is a comment. it has periods.\nlv_x = 1.`;
    const stmts = splitStatements(src);
    expect(stmts).toHaveLength(1);
    expect(stmts[0].text.trim()).toBe('lv_x = 1.');
  });
});

describe('findImplementationBlocks / findMethod', () => {
  it('finds every method in the implementation block, in order', () => {
    const blocks = findImplementationBlocks(SIMPLE_CLASS);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].className.toUpperCase()).toBe('ZCL_MCP_DEMO');
    expect(blocks[0].methods.map((m) => m.name)).toEqual([
      'greet',
      'add',
      'helper',
    ]);
  });

  it('locates a method case-insensitively and reports its body boundaries', () => {
    const found = findMethod(SIMPLE_CLASS, 'zcl_mcp_demo', 'GREET');
    expect(found).not.toBeNull();
    expect(found!.name).toBe('greet');
    const body = extractMethodBody(SIMPLE_CLASS, found!);
    expect(body).toBe('    rv_greeting = |Hello, { iv_name }.|.');
  });

  it('reports an empty-body method as null, not as an empty string mistaken for absent', () => {
    const found = findMethod(SIMPLE_CLASS, 'zcl_mcp_demo', 'helper');
    expect(found).not.toBeNull();
    const body = extractMethodBody(SIMPLE_CLASS, found!);
    expect(body).toBeNull();
  });

  it('returns null for a method that does not exist, rather than guessing', () => {
    const found = findMethod(SIMPLE_CLASS, 'zcl_mcp_demo', 'no_such_method');
    expect(found).toBeNull();
  });

  it('lists every method name for a helpful not-found message', () => {
    expect(listAllMethodNames(SIMPLE_CLASS)).toEqual([
      'greet',
      'add',
      'helper',
    ]);
  });

  it('falls back to searching all implementation blocks when the named class has none', () => {
    // A CCIMP-style include: the local class name inside it is not literally the global class
    // name that was passed in.
    const src = `CLASS lcl_helper IMPLEMENTATION.
  METHOD do_work.
    rv = 1.
  ENDMETHOD.
ENDCLASS.`;
    const found = findMethod(src, 'zcl_global_name', 'do_work');
    expect(found).not.toBeNull();
    expect(found!.implementationClassName).toBe('lcl_helper');
  });

  it('refuses to guess when the same method name appears in two different implementation blocks', () => {
    const src = `CLASS lcl_a IMPLEMENTATION.
  METHOD do_work.
    rv = 1.
  ENDMETHOD.
ENDCLASS.
CLASS lcl_b IMPLEMENTATION.
  METHOD do_work.
    rv = 2.
  ENDMETHOD.
ENDCLASS.`;
    expect(findMethod(src, 'zcl_global_name', 'do_work')).toBeNull();
  });

  it('handles an interface-implementation method name containing ~', () => {
    const src = `CLASS zcl_x IMPLEMENTATION.
  METHOD if_y~do_it.
    rv = 1.
  ENDMETHOD.
ENDCLASS.`;
    const found = findMethod(src, 'zcl_x', 'if_y~do_it');
    expect(found).not.toBeNull();
    expect(extractMethodBody(src, found!)).toBe('    rv = 1.');
  });
});

describe('findMethodDeclarations / listClassMethods — visibility, deliberately conservative', () => {
  it('resolves a non-chained declaration', () => {
    const decls = findMethodDeclarations(SIMPLE_CLASS, 'zcl_mcp_demo');
    expect(decls.get('GREET')).toMatchObject({
      visibility: 'public',
      isStatic: false,
      isRedefinition: false,
    });
    expect(decls.get('HELPER')).toMatchObject({ visibility: 'private' });
  });

  it('resolves every segment of a colon-chained declaration', () => {
    const src = `CLASS zcl_x DEFINITION.
  PUBLIC SECTION.
    METHODS: foo IMPORTING iv_a TYPE i,
             bar RETURNING VALUE(rv) TYPE i.
  PROTECTED SECTION.
    CLASS-METHODS baz.
ENDCLASS.
CLASS zcl_x IMPLEMENTATION.
  METHOD foo. ENDMETHOD.
  METHOD bar. ENDMETHOD.
  METHOD baz. ENDMETHOD.
ENDCLASS.`;
    const decls = findMethodDeclarations(src, 'zcl_x');
    expect(decls.get('FOO')).toMatchObject({
      visibility: 'public',
      isStatic: false,
    });
    expect(decls.get('BAR')).toMatchObject({
      visibility: 'public',
      isStatic: false,
    });
    expect(decls.get('BAZ')).toMatchObject({
      visibility: 'protected',
      isStatic: true,
    });
  });

  it('marks a redefined method', () => {
    const src = `CLASS zcl_x DEFINITION.
  PUBLIC SECTION.
    METHODS constructor REDEFINITION.
ENDCLASS.
CLASS zcl_x IMPLEMENTATION.
  METHOD constructor. ENDMETHOD.
ENDCLASS.`;
    expect(
      findMethodDeclarations(src, 'zcl_x').get('CONSTRUCTOR'),
    ).toMatchObject({
      isRedefinition: true,
    });
  });

  it('reports an interface-implemented method as unknown visibility rather than guessing', () => {
    const src = `CLASS zcl_x DEFINITION.
  PUBLIC SECTION.
    INTERFACES if_y.
ENDCLASS.
CLASS zcl_x IMPLEMENTATION.
  METHOD if_y~do_it.
    rv = 1.
  ENDMETHOD.
ENDCLASS.`;
    const methods = listClassMethods(src, 'zcl_x');
    const m = methods.find((x) => x.name === 'if_y~do_it');
    expect(m).toMatchObject({ visibility: 'unknown', isInterfaceMethod: true });
  });

  it('listClassMethods reports line ranges and body presence for every method', () => {
    const methods = listClassMethods(SIMPLE_CLASS, 'zcl_mcp_demo');
    expect(methods.map((m) => m.name)).toEqual(['greet', 'add', 'helper']);
    const greet = methods.find((m) => m.name === 'greet')!;
    expect(greet.hasBody).toBe(true);
    expect(greet.visibility).toBe('public');
    const helper = methods.find((m) => m.name === 'helper')!;
    expect(helper.hasBody).toBe(false);
    expect(helper.visibility).toBe('private');
  });
});

describe('spliceMethodBody — everything outside the target method is byte-identical', () => {
  it('replaces only the body of the named method', () => {
    const found = findMethod(SIMPLE_CLASS, 'zcl_mcp_demo', 'add')!;
    const patched = spliceMethodBody(
      SIMPLE_CLASS,
      found,
      '    rv_sum = iv_a - iv_b. "fixed',
    );

    // The method's own header/footer and every other method/section survive unchanged.
    expect(patched).toContain(
      'METHOD add.\n    rv_sum = iv_a - iv_b. "fixed\n  ENDMETHOD.',
    );
    expect(patched).toContain(
      'METHOD greet.\n    rv_greeting = |Hello, { iv_name }.|.\n  ENDMETHOD.',
    );
    expect(patched).toContain('PUBLIC SECTION.');
    expect(patched).toContain('METHOD helper.\n  ENDMETHOD.');

    // Re-parsing the patched source still finds all three methods, in order — the patch did not
    // shift or duplicate a boundary.
    expect(listAllMethodNames(patched)).toEqual(['greet', 'add', 'helper']);
  });

  it('fills an empty-body method with new statements', () => {
    const found = findMethod(SIMPLE_CLASS, 'zcl_mcp_demo', 'helper')!;
    const patched = spliceMethodBody(SIMPLE_CLASS, found, '    lv_x = 1.');
    const refound = findMethod(patched, 'zcl_mcp_demo', 'helper')!;
    expect(extractMethodBody(patched, refound)).toBe('    lv_x = 1.');
  });

  it('empties a method body back out when given an empty string', () => {
    const found = findMethod(SIMPLE_CLASS, 'zcl_mcp_demo', 'greet')!;
    const patched = spliceMethodBody(SIMPLE_CLASS, found, '');
    const refound = findMethod(patched, 'zcl_mcp_demo', 'greet')!;
    expect(extractMethodBody(patched, refound)).toBeNull();
  });

  it('is safe when the new body text itself contains the word ENDMETHOD in a string', () => {
    const found = findMethod(SIMPLE_CLASS, 'zcl_mcp_demo', 'helper')!;
    const patched = spliceMethodBody(
      SIMPLE_CLASS,
      found,
      `    lv_x = 'not really ENDMETHOD.'.`,
    );
    // The class must still parse to exactly three methods — the literal text did not get
    // mistaken for a real statement boundary on re-parse.
    expect(listAllMethodNames(patched)).toEqual(['greet', 'add', 'helper']);
  });
});
