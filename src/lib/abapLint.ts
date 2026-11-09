/**
 * Local ABAP static analysis via `@abaplint/core` — no SAP round-trip.
 *
 * WHY THIS FILE EXISTS
 * ---------------------
 * Every syntax check this project already has (`Check*`, the pre-write check inside `Update*`)
 * asks SAP: the object must exist on the server, and each call is a network round-trip. That is
 * fine for "is my CHANGE to a real object valid", but there is no way to check a fragment of ABAP
 * BEFORE creating anything, and no way to check style/best-practice rules SAP's own syntax check
 * does not enforce (naming conventions, obsolete statements, downport hazards for Cloud, …).
 * `@abaplint/core` is a full ABAP lexer/parser/rule-engine that runs entirely offline.
 *
 * SCOPE
 * -----
 * This is intentionally CHECK-ONLY plus a bounded AUTO-FIX loop over abaplint's own quick-fixes —
 * it never talks to SAP and never decides what a caller should DO with the result (that is the
 * new `LintSourceLocal` tool's job). abaplint's rule set is large (180+ rules); this file does not
 * curate a "recommended" subset the way a project-specific linter might — it uses abaplint's own
 * `Config.getDefault(version)`, so the version parameter is what actually changes behaviour, not a
 * private opinion layered on top. A caller who wants a narrower rule set can be added later; this
 * is deliberately not filtering error/warning severities that abaplint itself assigns.
 *
 * OBJECT-TYPE NAMING IS EXPLICIT, NOT SNIFFED FROM SOURCE. abaplint identifies an object's TYPE
 * from its virtual filename's extension (e.g. `x.clas.abap`, `x.ddls.asddls`), not from a header
 * keyword. Guessing the type from the first line of source is itself a source of the "looks right,
 * is wrong" defect this project tracks — a caller who mistypes `object_type` gets an filename that
 * does not match their own stated intent, not a filename abaplint mis-detected on their behalf.
 */

import {
  Config,
  Edits,
  MemoryFile,
  Registry,
  Severity,
  Version,
} from '@abaplint/core';

export type LintObjectType =
  | 'class'
  | 'interface'
  | 'program'
  | 'function_group'
  | 'table'
  | 'structure'
  | 'cds_view'
  | 'metadata_extension'
  | 'access_control'
  | 'behavior_definition';

/** abaplint identifies object TYPE purely from the filename extension. */
const EXTENSION_BY_TYPE: Record<LintObjectType, string> = {
  class: 'clas.abap',
  interface: 'intf.abap',
  program: 'prog.abap',
  function_group: 'fugr.abap',
  table: 'tabl.astabl',
  structure: 'tabl.astabl',
  cds_view: 'ddls.asddls',
  metadata_extension: 'ddlx.asddlx',
  access_control: 'dcls.asdcls',
  behavior_definition: 'bdef.asbdef',
};

export function buildLintFilename(
  objectName: string,
  objectType: LintObjectType,
): string {
  return `${objectName.toLowerCase()}.${EXTENSION_BY_TYPE[objectType]}`;
}

const RELEASE_ALIASES: Record<string, keyof typeof Version> = {
  '750': 'v750',
  '751': 'v751',
  '752': 'v752',
  '753': 'v753',
  '754': 'v754',
  '755': 'v755',
  '756': 'v756',
  '757': 'v757',
  '758': 'v758',
  cloud: 'Cloud',
  btp: 'Cloud',
};

/** DEFAULT release when the caller does not name one: this project's own primary target system. */
const DEFAULT_RELEASE_ALIAS = '758';

export function resolveLintVersion(release?: string): {
  version: Version;
  resolvedAlias: string;
} {
  const alias = (release ?? DEFAULT_RELEASE_ALIAS).trim().toLowerCase();
  const key = RELEASE_ALIASES[alias];
  if (key && Version[key] !== undefined) {
    return { version: Version[key], resolvedAlias: alias };
  }
  // Unrecognised release string: fall back rather than throw — this is advisory tooling, and a
  // caller passing an unusual value (a future release abaplint does not know yet) should still
  // get a result using the newest release this abaplint build understands, not a hard failure.
  return {
    version: Version.v758,
    resolvedAlias: `${DEFAULT_RELEASE_ALIAS} (unrecognised "${release}")`,
  };
}

export interface LintIssue {
  rule: string;
  message: string;
  line: number;
  column: number;
  end_line: number;
  end_column: number;
  severity: 'error' | 'warning' | 'info';
  fixable: boolean;
}

function toSeverity(sev: Severity): 'error' | 'warning' | 'info' {
  if (sev === Severity.Error) return 'error';
  if (sev === Severity.Warning) return 'warning';
  return 'info';
}

function toLintIssue(issue: {
  getKey(): string;
  getMessage(): string;
  getStart(): { getRow(): number; getCol(): number };
  getEnd(): { getRow(): number; getCol(): number };
  getSeverity(): Severity;
  getDefaultFix(): unknown;
}): LintIssue {
  return {
    rule: issue.getKey(),
    message: issue.getMessage(),
    line: issue.getStart().getRow(),
    column: issue.getStart().getCol(),
    end_line: issue.getEnd().getRow(),
    end_column: issue.getEnd().getCol(),
    severity: toSeverity(issue.getSeverity()),
    fixable: issue.getDefaultFix() !== undefined,
  };
}

export function lintAbapSource(
  source: string,
  filename: string,
  version: Version,
  excludeRules?: readonly string[],
): LintIssue[] {
  const registry = new Registry(Config.getDefault(version));
  registry.addFile(new MemoryFile(filename, source));
  registry.parse();

  const exclude = new Set(excludeRules ?? []);
  return registry
    .findIssues()
    .map(toLintIssue)
    .filter((i) => !exclude.has(i.rule));
}

export interface LintAndFixResult {
  fixed_source: string;
  applied_fixes: number;
  fixed_rules: string[];
  remaining_issues: LintIssue[];
}

/** Upper bound so a pathological rule interaction cannot loop forever. */
const MAX_FIX_ITERATIONS = 50;

/**
 * Apply every fix abaplint itself proposes, one at a time, re-parsing between each — because a
 * fix can change line numbers and invalidate every OTHER pending fix's position. Stops when no
 * further issue in the current pass carries a fix, or the iteration cap is hit (in which case the
 * remaining issues are still reported, never silently dropped).
 */
export function lintAndFix(
  source: string,
  filename: string,
  version: Version,
  excludeRules?: readonly string[],
): LintAndFixResult {
  const registry = new Registry(Config.getDefault(version));
  registry.addFile(new MemoryFile(filename, source));
  registry.parse();

  const fixedRules = new Set<string>();
  let appliedFixes = 0;

  for (let i = 0; i < MAX_FIX_ITERATIONS; i++) {
    const issues = registry.findIssues();
    const withFix = issues.find((issue) => issue.getDefaultFix() !== undefined);
    if (!withFix) break;

    const fix = withFix.getDefaultFix();
    if (!fix) break;
    Edits.applyEditSingle(registry, fix);
    registry.parse();
    appliedFixes++;
    fixedRules.add(withFix.getKey());
  }

  const exclude = new Set(excludeRules ?? []);
  const remainingIssues = registry
    .findIssues()
    .map(toLintIssue)
    .filter((i) => !exclude.has(i.rule));

  const file = registry.getFileByName(filename);
  const fixedSource = file ? file.getRaw() : source;

  return {
    fixed_source: fixedSource,
    applied_fixes: appliedFixes,
    fixed_rules: [...fixedRules],
    remaining_issues: remainingIssues,
  };
}
