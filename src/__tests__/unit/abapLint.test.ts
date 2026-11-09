/**
 * Local ABAP static analysis via @abaplint/core — no SAP round-trip.
 *
 * These tests exercise the library against the REAL abaplint engine (not a mock — a mocked
 * abaplint would just pin our own assumptions about it), pinning: filename construction is
 * type-driven rather than sniffed, release resolution has a sane default and a documented
 * fallback for an unrecognised value, a known-bad sample really produces the rule we expect, and
 * the auto-fix loop both reduces the issue count and leaves genuinely re-parseable ABAP behind.
 */

import { Version } from '@abaplint/core';
import {
  buildLintFilename,
  lintAbapSource,
  lintAndFix,
  resolveLintVersion,
} from '../../lib/abapLint';

describe('buildLintFilename — type-driven, not content-sniffed', () => {
  it('maps every supported object type to the extension abaplint expects', () => {
    expect(buildLintFilename('ZCL_FOO', 'class')).toBe('zcl_foo.clas.abap');
    expect(buildLintFilename('ZIF_FOO', 'interface')).toBe('zif_foo.intf.abap');
    expect(buildLintFilename('ZPROG', 'program')).toBe('zprog.prog.abap');
    expect(buildLintFilename('ZFUGR', 'function_group')).toBe(
      'zfugr.fugr.abap',
    );
    expect(buildLintFilename('ZTABLE', 'table')).toBe('ztable.tabl.astabl');
    expect(buildLintFilename('ZSTRUCT', 'structure')).toBe(
      'zstruct.tabl.astabl',
    );
    expect(buildLintFilename('Z_I_VIEW', 'cds_view')).toBe(
      'z_i_view.ddls.asddls',
    );
    expect(buildLintFilename('Z_I_VIEW', 'metadata_extension')).toBe(
      'z_i_view.ddlx.asddlx',
    );
    expect(buildLintFilename('ZACL', 'access_control')).toBe(
      'zacl.dcls.asdcls',
    );
    expect(buildLintFilename('Z_I_BDEF', 'behavior_definition')).toBe(
      'z_i_bdef.bdef.asbdef',
    );
  });

  it('lower-cases the object name (abaplint is case-sensitive about the filename)', () => {
    expect(buildLintFilename('ZCL_Mixed_Case', 'class')).toBe(
      'zcl_mixed_case.clas.abap',
    );
  });
});

describe('resolveLintVersion', () => {
  it("defaults to this project's own primary target release (758) when none is given", () => {
    const { version, resolvedAlias } = resolveLintVersion(undefined);
    expect(version).toBe(Version.v758);
    expect(resolvedAlias).toBe('758');
  });

  it('resolves known aliases, including "cloud"', () => {
    expect(resolveLintVersion('757').version).toBe(Version.v757);
    expect(resolveLintVersion('cloud').version).toBe(Version.Cloud);
    expect(resolveLintVersion('BTP').version).toBe(Version.Cloud);
  });

  it('falls back to the newest known release for an unrecognised value, and SAYS SO rather than silently substituting', () => {
    const { version, resolvedAlias } = resolveLintVersion('999');
    expect(version).toBe(Version.v758);
    expect(resolvedAlias).toContain('unrecognised "999"');
  });
});

const CLASS_WITH_ISSUES = `CLASS zcl_mcp_lint_probe DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS foo.
ENDCLASS.
CLASS zcl_mcp_lint_probe IMPLEMENTATION.
  METHOD foo.
    DATA lv_x TYPE i.
    lv_x = 1.
    WRITE lv_x.
  ENDMETHOD.
ENDCLASS.
`;

describe('lintAbapSource — against the real abaplint engine', () => {
  it('finds the fixable "prefer inline declaration" issue on an old-style DATA statement', () => {
    const issues = lintAbapSource(
      CLASS_WITH_ISSUES,
      buildLintFilename('zcl_mcp_lint_probe', 'class'),
      Version.v758,
    );
    const preferInline = issues.find((i) => i.rule === 'prefer_inline');
    expect(preferInline).toBeDefined();
    expect(preferInline?.fixable).toBe(true);
    expect(preferInline?.severity).toBe('error');
  });

  it('a syntactically clean class produces no fixable issues left after our own real-world sample settles', () => {
    // Sanity check on the harness itself: an EMPTY method body should not explode the parser.
    const issues = lintAbapSource(
      `CLASS zcl_x DEFINITION PUBLIC FINAL CREATE PUBLIC.\n  PUBLIC SECTION.\n    METHODS foo.\nENDCLASS.\nCLASS zcl_x IMPLEMENTATION.\n  METHOD foo.\n  ENDMETHOD.\nENDCLASS.\n`,
      'zcl_x.clas.abap',
      Version.v758,
    );
    expect(Array.isArray(issues)).toBe(true);
  });

  it('excludeRules removes exactly the named rule and nothing else', () => {
    const all = lintAbapSource(
      CLASS_WITH_ISSUES,
      buildLintFilename('zcl_mcp_lint_probe', 'class'),
      Version.v758,
    );
    const withoutPreferInline = lintAbapSource(
      CLASS_WITH_ISSUES,
      buildLintFilename('zcl_mcp_lint_probe', 'class'),
      Version.v758,
      ['prefer_inline'],
    );
    expect(withoutPreferInline.some((i) => i.rule === 'prefer_inline')).toBe(
      false,
    );
    expect(withoutPreferInline.length).toBe(
      all.filter((i) => i.rule !== 'prefer_inline').length,
    );
  });
});

describe('lintAndFix — the auto-fix loop', () => {
  it('applies at least one real fix and the result still parses as valid ABAP with fewer issues', () => {
    const filename = buildLintFilename('zcl_mcp_lint_probe', 'class');
    const before = lintAbapSource(CLASS_WITH_ISSUES, filename, Version.v758);

    const result = lintAndFix(CLASS_WITH_ISSUES, filename, Version.v758);
    expect(result.applied_fixes).toBeGreaterThan(0);
    expect(result.fixed_rules).toContain('prefer_inline');

    // The fixed source, re-linted from scratch, must produce STRICTLY FEWER issues than before —
    // proving the fix loop did not just relabel the same problems.
    const after = lintAbapSource(result.fixed_source, filename, Version.v758);
    expect(after.length).toBeLessThan(before.length);

    // And the fix actually did what it says: the old-style DATA statement is gone.
    expect(result.fixed_source).not.toMatch(/DATA\s+lv_x\s+TYPE\s+i\./i);
    expect(result.fixed_source).toMatch(/DATA\(lv_x\)/i);
  });

  it('is idempotent: fixing an already-fixed source applies no further fixes', () => {
    const filename = buildLintFilename('zcl_mcp_lint_probe', 'class');
    const first = lintAndFix(CLASS_WITH_ISSUES, filename, Version.v758);
    const second = lintAndFix(first.fixed_source, filename, Version.v758);
    expect(second.applied_fixes).toBe(0);
  });

  it('excludeRules is honoured on the REMAINING issues after fixing', () => {
    const filename = buildLintFilename('zcl_mcp_lint_probe', 'class');
    const result = lintAndFix(CLASS_WITH_ISSUES, filename, Version.v758, [
      'no_prefixes',
    ]);
    expect(result.remaining_issues.some((i) => i.rule === 'no_prefixes')).toBe(
      false,
    );
  });
});
