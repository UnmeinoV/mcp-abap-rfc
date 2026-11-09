/**
 * LintSourceLocal Handler - local ABAP static analysis, no SAP round-trip.
 *
 * Runs `@abaplint/core` entirely offline against a source string. Unlike `Check*`/the pre-write
 * check inside `Update*` (both of which ask SAP, and therefore both require the object to already
 * exist), this works on a bare fragment before anything is created, and surfaces style/best-
 * practice rules SAP's own syntax check does not enforce.
 *
 * `description_empty` is ALWAYS excluded: it complains that no companion `.xml` metadata file was
 * found, which is guaranteed on every call this handler makes (a single in-memory source string,
 * never a class XML sidecar) — a structural artifact of how this tool invokes abaplint, not a
 * judgement about the submitted code. Every other rule is abaplint's own default severity,
 * unfiltered — this project is not curating "which rules matter" on the caller's behalf.
 */

import type { Version } from '@abaplint/core';
import {
  buildLintFilename,
  type LintObjectType,
  lintAbapSource,
  lintAndFix,
  resolveLintVersion,
} from '../../../lib/abapLint';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  type AxiosResponse,
  return_error,
  return_response,
} from '../../../lib/utils';

const OBJECT_TYPES: readonly LintObjectType[] = [
  'class',
  'interface',
  'program',
  'function_group',
  'table',
  'structure',
  'cds_view',
  'metadata_extension',
  'access_control',
  'behavior_definition',
];

/** Always excluded — see file header. Not user-configurable: it is never about the caller's code. */
const ALWAYS_EXCLUDED_RULES = ['description_empty'];

const MAX_ISSUES_DEFAULT = 200;

export const TOOL_DEFINITION = {
  name: 'LintSourceLocal',
  description:
    '[read-only, offline] Static ABAP analysis via abaplint — no SAP call, works on a fragment before anything is created. Complements Check*/Update*, which require the object to already exist on SAP.',
  notes: `abaplint's own default severities are used unfiltered (150+ rules) except
"description_empty", which is always excluded — it fires because this tool never supplies a
companion class-XML sidecar, not because of anything in the submitted source. A caller who finds
another rule noisy for their case can pass it in exclude_rules. release accepts "757".."758" or
"cloud"/"btp"; an unrecognised value falls back to 758 rather than erroring, and the response says
so. With auto_fix:true, abaplint's own quick-fixes are applied in a bounded loop (re-parsing
between each, since a fix can shift line numbers) and the response returns fixed_source plus
whatever could not be auto-fixed — never a partial/half-applied source.`,
  inputSchema: {
    type: 'object',
    properties: {
      source_code: {
        type: 'string',
        description: 'ABAP or CDS source to analyse.',
      },
      object_name: {
        type: 'string',
        description: 'Object name (used only to build the filename).',
      },
      object_type: {
        type: 'string',
        enum: OBJECT_TYPES,
        description: 'Sets which file extension is used (not sniffed).',
      },
      release: {
        type: 'string',
        description: 'SAP_BASIS release, or "cloud". DEFAULT: "758".',
        default: '758',
      },
      auto_fix: {
        type: 'boolean',
        description:
          'Apply auto-fixes and return fixed_source. DEFAULT: false.',
      },
      exclude_rules: {
        type: 'array',
        items: { type: 'string' },
        description: 'Rule keys to omit from the result.',
      },
      max_issues: {
        type: 'number',
        description: `Cap on issues returned. DEFAULT: ${MAX_ISSUES_DEFAULT}.`,
        default: MAX_ISSUES_DEFAULT,
      },
    },
    required: ['source_code', 'object_name', 'object_type'],
  },
} as const;

interface LintSourceLocalArgs {
  source_code: string;
  object_name: string;
  object_type: LintObjectType;
  release?: string;
  auto_fix?: boolean;
  exclude_rules?: string[];
  max_issues?: number;
}

export async function handleLintSourceLocal(
  _context: HandlerContext,
  args: LintSourceLocalArgs,
) {
  try {
    if (!args.source_code)
      return return_error(new Error('source_code is required'));
    if (!args.object_name)
      return return_error(new Error('object_name is required'));
    if (!args.object_type || !OBJECT_TYPES.includes(args.object_type)) {
      return return_error(
        new Error(`object_type must be one of: ${OBJECT_TYPES.join(', ')}`),
      );
    }

    const filename = buildLintFilename(args.object_name, args.object_type);
    const { version, resolvedAlias } = resolveLintVersion(args.release);
    const excludeRules = [
      ...ALWAYS_EXCLUDED_RULES,
      ...(args.exclude_rules ?? []),
    ];
    const maxIssues = args.max_issues ?? MAX_ISSUES_DEFAULT;

    if (args.auto_fix) {
      const result = lintAndFix(
        args.source_code,
        filename,
        version,
        excludeRules,
      );
      const truncated = result.remaining_issues.length > maxIssues;
      return return_response({
        data: JSON.stringify(
          {
            success: true,
            filename_used: filename,
            release_used: resolvedAlias,
            applied_fixes: result.applied_fixes,
            fixed_rules: result.fixed_rules,
            fixed_source: result.fixed_source,
            remaining_issue_count: result.remaining_issues.length,
            remaining_issues: truncated
              ? result.remaining_issues.slice(0, maxIssues)
              : result.remaining_issues,
            ...(truncated
              ? {
                  truncated: true,
                  issues_omitted: result.remaining_issues.length - maxIssues,
                }
              : {}),
          },
          null,
          2,
        ),
      } as AxiosResponse);
    }

    const issues = lintAbapSource(
      args.source_code,
      filename,
      version,
      excludeRules,
    );
    const errorCount = issues.filter((i) => i.severity === 'error').length;
    const warningCount = issues.filter((i) => i.severity === 'warning').length;
    const infoCount = issues.filter((i) => i.severity === 'info').length;
    const truncated = issues.length > maxIssues;

    return return_response({
      data: JSON.stringify(
        {
          success: true,
          filename_used: filename,
          release_used: resolvedAlias,
          issue_count: issues.length,
          errors_count: errorCount,
          warnings_count: warningCount,
          info_count: infoCount,
          issues: truncated ? issues.slice(0, maxIssues) : issues,
          ...(truncated
            ? { truncated: true, issues_omitted: issues.length - maxIssues }
            : {}),
        },
        null,
        2,
      ),
    } as AxiosResponse);
  } catch (error: any) {
    return return_error(
      new Error(`LintSourceLocal failed: ${error?.message ?? error}`),
    );
  }
}

// Re-exported so callers of this module get the concrete abaplint Version type without importing
// @abaplint/core themselves.
export type { Version };
