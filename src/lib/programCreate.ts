/**
 * CreateProgram: the include payload and the type verdict, free of I/O.
 *
 * MEASURED 2026-11-03 on S4D/100 (S/4HANA, over RFC): `CreateProgram` with
 * `program_type: 'include'` POSTed `program:programType="I"` to
 * `/sap/bc/adt/programs/programs`, SAP answered 201, and TRDIR held SUBC '1' —
 * an EXECUTABLE program, reported as a created include. `program:application`
 * was dropped the same way (TRDIR-APPL blank for 'M'). Both are the
 * "input accepted and discarded" shape this repo refuses to ship.
 *
 * The `/programs/programs` collection creates PROG/P only. An include is its
 * own ADT resource, `/sap/bc/adt/programs/includes` (PROG/I, root
 * `include:abapInclude`), so includes are created there; and every create is
 * read back from TRDIR so the response states what SAP stored, not what was
 * asked for.
 */

/** TRDIR-SUBC per tool program_type. */
export const PROGRAM_TYPE_SUBC: Record<string, string> = {
  executable: '1',
  include: 'I',
  module_pool: 'M',
  function_group: 'F',
  class_pool: 'K',
  interface_pool: 'J',
};

export const INCLUDE_CONTENT_TYPE =
  'application/vnd.sap.adt.programs.includes.v2+xml';

function escapeXmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export interface IncludeCreateArgs {
  name: string;
  description: string;
  packageName: string;
  masterLanguage?: string;
  responsible?: string;
  /** Main program the include belongs to (sets ADT's container reference). */
  mainProgram?: string;
}

export function buildIncludeCreateXml(args: IncludeCreateArgs): string {
  const name = args.name.toUpperCase();
  const lang = (args.masterLanguage || 'EN').toUpperCase();
  const description = escapeXmlAttribute(args.description.slice(0, 60));
  const responsible = args.responsible
    ? ` adtcore:responsible="${escapeXmlAttribute(args.responsible.toUpperCase())}"`
    : '';
  const main = args.mainProgram?.trim().toUpperCase();
  const container = main
    ? `\n  <include:containerRef adtcore:name="${escapeXmlAttribute(main)}" adtcore:type="PROG/P" adtcore:uri="/sap/bc/adt/programs/programs/${encodeURIComponent(main.toLowerCase())}"/>`
    : '';
  return `<?xml version="1.0" encoding="UTF-8"?><include:abapInclude xmlns:include="http://www.sap.com/adt/programs/includes" xmlns:adtcore="http://www.sap.com/adt/core" adtcore:description="${description}" adtcore:language="${lang}" adtcore:name="${escapeXmlAttribute(name)}" adtcore:type="PROG/I" adtcore:masterLanguage="${lang}"${responsible}>
  <adtcore:packageRef adtcore:name="${escapeXmlAttribute(args.packageName.toUpperCase())}"/>${container}
</include:abapInclude>`;
}

export type ProgramTypeVerdict = 'as_requested' | 'wrong_type' | 'unverified';

export interface ProgramTypeJudgement {
  verdict: ProgramTypeVerdict;
  requested_subc: string;
  stored_subc: string | null;
  application_requested: string | null;
  application_stored: string | null;
  /** True when an application was asked for and TRDIR holds something else. */
  application_ignored: boolean;
}

export function judgeProgramType(
  programType: string,
  requestedApplication: string | undefined,
  stored: { subc: string; appl: string } | null,
): ProgramTypeJudgement {
  const requested = PROGRAM_TYPE_SUBC[programType] ?? '1';
  const applReq =
    requestedApplication && requestedApplication !== '*'
      ? requestedApplication.toUpperCase()
      : null;
  if (!stored) {
    return {
      verdict: 'unverified',
      requested_subc: requested,
      stored_subc: null,
      application_requested: applReq,
      application_stored: null,
      application_ignored: false,
    };
  }
  const subc = stored.subc.trim().toUpperCase();
  const appl = stored.appl.trim().toUpperCase();
  return {
    verdict: subc === requested ? 'as_requested' : 'wrong_type',
    requested_subc: requested,
    stored_subc: subc,
    application_requested: applReq,
    application_stored: appl || null,
    application_ignored: applReq !== null && appl !== applReq,
  };
}
