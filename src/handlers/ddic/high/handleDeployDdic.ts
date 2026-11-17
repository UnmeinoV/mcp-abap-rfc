/**
 * DeployDdic — create a whole tree of DDIC structures and table types (deep
 * nesting included) from ONE spec, in one RFC call to the helper
 * Z_MCP_DDIC_DEPLOY (see lib/ddic/ddicHelperAbap.ts).
 *
 * It complements, and does not replace, CreateStructure / CreateTableType:
 * those stay the tools for one or two objects and for changing existing ones.
 *
 * The verdict is not the helper's word: after it reports success, DD02L / DD40L
 * (active version, no inactive one left), TADIR (package) and, with a request,
 * E071 are read back here through the Data Preview, and any difference is an
 * error naming what differs.
 */

import { DDIC_HELPER_DEPLOY } from '../../../lib/ddic/ddicHelperAbap';
import { DDIC_HELPER_SPEC } from '../../../lib/ddic/ddicHelperSpec';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { selectRows } from '../../../lib/rfcHelper/installer';
import {
  callRfcHelper,
  RfcHelperUnavailable,
} from '../../../lib/rfcHelper/rfcHelper';
import { return_error } from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'DeployDdic',
  available_in: ['onprem', 'legacy'] as const,
  description:
    'Create MANY / DEEPLY NESTED DDIC structures and table types in ONE call from a spec (schema ddic-deploy/1): the order is computed from the references, every object is activated and read back. Use it for interface structures with several levels (header -> items table -> sub-items ...). For one or two objects, or to change an existing one, CreateStructure / CreateTableType / UpdateStructure are the simpler route. NEEDS an RFC connection and the helper ZMCP_DDIC — if missing, the error says to run SetupDdicHelper (ask the user first).',
  notes: `When to use which: both routes stay. DeployDdic pays off when a tree of objects must exist
together — each object of a nested structure has to be active before the next can reference it, so
through ADT that is 2-3 serial requests per object, plus DDL annotations (QUAN/CURR references) and
the build order to get right one by one. Measured on one 14-object, 7-level spec: one DeployDdic-style
call created and read back all 14; an agent using the ADT tools stopped at 8 of 14. For a single
structure or a field added to an existing one, the ADT tools are simpler and need no helper.

Spec: {"schema":"ddic-deploy/1","objects":[...]}; each object {kind:"structure"|"tableType", name, label}.
A structure has fields: {name, type} where type is a data element, structure or table type (which one
is looked up in the DDIC); or {name, dataType, length, decimals?, label} for a built-in type;
{name:".INCLUDE", type:<structure>} includes a structure; a CURR/QUAN field needs refTable + refField
(the reference table may be the structure itself). A table type has rowType (structure or data
element): standard table, standard key, non-unique. The order of the objects does not matter.

Refused BEFORE anything is written: an object outside Z*/Y*, a duplicate, a missing label/fields/
rowType, an object that already exists (create only), a reference that is neither in the spec nor an
active DDIC type, a circular reference, a CURR/QUAN field without reference, a missing package, a
transportable package without transport_request, or a request that is missing, released, or not a
workbench request/task. dry_run runs every check, reports the computed order and creates nothing.

Written object by object (RS_CORR_INSERT, DDIF_TABL_PUT / DDIF_TTYP_PUT, DDIF_*_ACTIVATE); a failure
stops there, objects created before it are KEPT and named. Verified afterwards: DD02L / DD40L
(active, no inactive version left), TADIR package and, with a request, E071.`,
  inputSchema: {
    type: 'object',
    properties: {
      spec: {
        type: 'object',
        additionalProperties: true,
        description: 'The ddic-deploy/1 spec as a JSON object.',
      },
      package_name: { type: 'string' },
      transport_request: { type: 'string' },
      dry_run: { type: 'boolean', description: 'Check and order only.' },
    },
    required: ['spec', 'package_name'],
  },
} as const;

interface DeployDdicArgs {
  spec: unknown;
  package_name: string;
  transport_request?: string;
  dry_run?: boolean;
}

export interface DdicObjectRef {
  kind: 'structure' | 'tableType';
  name: string;
}

export interface DeployDdicInput {
  specJson: string;
  objects: DdicObjectRef[];
  pkg: string;
  request?: string;
}

const NAME = /^[ZY][A-Z0-9_]{0,29}$/;

function lit(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

/**
 * Light shape check before anything reaches SAP; the helper repeats every check
 * with the DDIC at hand (existence, references, cycles).
 */
export function normalizeDeployDdic(args: DeployDdicArgs): DeployDdicInput {
  let spec: any = args?.spec;
  // Not advertised (the schema says object): tolerated for clients that send an object parameter as a string.
  if (typeof spec === 'string') {
    try {
      spec = JSON.parse(spec);
    } catch (e) {
      throw new Error(
        `spec is not valid JSON: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }
  if (!spec || typeof spec !== 'object' || spec.schema !== 'ddic-deploy/1') {
    throw new Error('spec must be an object with schema "ddic-deploy/1"');
  }
  if (!Array.isArray(spec.objects) || spec.objects.length === 0) {
    throw new Error('spec.objects must list at least one object');
  }
  const objects: DdicObjectRef[] = [];
  const seen = new Set<string>();
  for (const o of spec.objects) {
    const name = String(o?.name ?? '')
      .trim()
      .toUpperCase();
    if (!NAME.test(name)) {
      throw new Error(
        `object name "${o?.name ?? ''}" must be Z*/Y*, at most 30 characters`,
      );
    }
    if (seen.has(name)) throw new Error(`${name} appears more than once`);
    seen.add(name);
    if (o.kind !== 'structure' && o.kind !== 'tableType') {
      throw new Error(`${name}: kind must be "structure" or "tableType"`);
    }
    const label = String(o?.label ?? '').trim();
    if (!label || label.length > 60) {
      throw new Error(`${name}: label is required, at most 60 characters`);
    }
    if (o.kind === 'structure') {
      if (!Array.isArray(o.fields) || o.fields.length === 0) {
        throw new Error(`${name}: a structure needs fields`);
      }
      for (const f of o.fields) {
        const fname = String(f?.name ?? '').trim();
        if (!fname || fname.length > 30) {
          throw new Error(`${name}: every field needs a name (max 30)`);
        }
        if (!f.type === !f.dataType) {
          throw new Error(
            `${name}-${fname}: give exactly one of type or dataType`,
          );
        }
      }
    } else if (!String(o?.rowType ?? '').trim()) {
      throw new Error(`${name}: a table type needs rowType`);
    }
    objects.push({ kind: o.kind, name });
  }
  const pkg = String(args?.package_name ?? '')
    .trim()
    .toUpperCase();
  if (!pkg) throw new Error('package_name is required');
  const request =
    String(args?.transport_request ?? '')
      .trim()
      .toUpperCase() || undefined;
  return { specJson: JSON.stringify(spec), objects, pkg, request };
}

/**
 * selectRows answers at most 10 rows and says nothing when it cut the answer,
 * so a full answer cannot be told from a complete one: refuse it rather than
 * verify against a list that may be missing the row that matters.
 */
const SELECT_ROWS_CAP = 10;
async function cappedRows(
  context: HandlerContext,
  sql: string,
): Promise<Array<Record<string, string>>> {
  const rows = await selectRows(context, sql);
  if (rows.length >= SELECT_ROWS_CAP) {
    throw new Error(
      `read-back could not be completed: ${SELECT_ROWS_CAP} rows came back (the Data Preview limit), so the answer may be cut — ${sql}`,
    );
  }
  return rows;
}

/** IN-lists small enough for the 10-row Data Preview answer of selectRows. */
function chunks<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size)
    out.push(items.slice(i, i + size));
  return out;
}

async function versionsOf(
  context: HandlerContext,
  objects: DdicObjectRef[],
): Promise<Map<string, string[]>> {
  const states = new Map<string, string[]>(
    objects.map((o) => [o.name, [] as string[]]),
  );
  const byTable: Array<[string, string, DdicObjectRef[]]> = [
    ['dd02l', 'tabname', objects.filter((o) => o.kind === 'structure')],
    ['dd40l', 'typename', objects.filter((o) => o.kind === 'tableType')],
  ];
  for (const [table, key, list] of byTable) {
    // At most two rows per object (A and N): 4 names per query, under the cap.
    for (const part of chunks(list, 4)) {
      const rows = await cappedRows(
        context,
        `SELECT ${key}, as4local FROM ${table} WHERE ${key} IN (${part.map((o) => lit(o.name)).join(', ')})`,
      );
      for (const r of rows) {
        const n = String(r[key.toUpperCase()] ?? '').trim();
        states.get(n)?.push(String(r.AS4LOCAL ?? '').trim());
      }
    }
  }
  return states;
}

async function verifyCreated(
  context: HandlerContext,
  input: DeployDdicInput,
): Promise<{ problems: string[]; verified: Record<string, unknown> }> {
  const problems: string[] = [];
  const states = await versionsOf(context, input.objects);
  for (const o of input.objects) {
    const s = states.get(o.name) ?? [];
    if (!s.includes('A')) problems.push(`${o.name} has no active version`);
    else if (s.length > 1)
      problems.push(`${o.name} still has an inactive version`);
  }
  const packages = new Map<string, string>();
  for (const part of chunks(input.objects, 9)) {
    const rows = await cappedRows(
      context,
      `SELECT obj_name, devclass FROM tadir WHERE pgmid = 'R3TR' AND object IN ('TABL', 'TTYP') AND obj_name IN (${part.map((o) => lit(o.name)).join(', ')})`,
    );
    for (const r of rows)
      packages.set(
        String(r.OBJ_NAME ?? '').trim(),
        String(r.DEVCLASS ?? '').trim(),
      );
  }
  for (const o of input.objects) {
    const p = packages.get(o.name);
    if (p !== input.pkg)
      problems.push(`${o.name}: TADIR package is ${p || 'missing'}`);
  }
  let recorded: string[] | undefined;
  if (input.request) {
    // Which requests hold an E071 entry of each object — then which of those
    // ARE the request or one of its tasks. Resolving parents through E070 by
    // the entries found (not by listing the request's tasks) keeps every read
    // under selectRows' 10-row answer, whatever the number of tasks.
    const entries: Array<{ trkorr: string; name: string }> = [];
    for (const part of chunks(input.objects, 3)) {
      const rows = await cappedRows(
        context,
        `SELECT trkorr, obj_name FROM e071 WHERE pgmid = 'R3TR' AND object IN ('TABL', 'TTYP') AND obj_name IN (${part.map((o) => lit(o.name)).join(', ')})`,
      );
      for (const r of rows)
        entries.push({
          trkorr: String(r.TRKORR ?? '').trim(),
          name: String(r.OBJ_NAME ?? '').trim(),
        });
    }
    const ours = new Set<string>([input.request]);
    const korrs = [...new Set(entries.map((e) => e.trkorr))].filter(
      (k) => k && k !== input.request,
    );
    for (const part of chunks(korrs, 10)) {
      const rows = await cappedRows(
        context,
        `SELECT trkorr, strkorr FROM e070 WHERE trkorr IN (${part.map(lit).join(', ')})`,
      );
      for (const r of rows)
        if (String(r.STRKORR ?? '').trim() === input.request)
          ours.add(String(r.TRKORR ?? '').trim());
    }
    const found = new Set(
      entries.filter((e) => ours.has(e.trkorr)).map((e) => e.name),
    );
    recorded = [...found];
    for (const o of input.objects)
      if (!found.has(o.name))
        problems.push(
          `${o.name}: no E071 entry under ${input.request} or its tasks`,
        );
  }
  return {
    problems,
    verified: {
      active: input.objects.filter((o) =>
        (states.get(o.name) ?? []).includes('A'),
      ).length,
      package: input.pkg,
      ...(recorded ? { recorded_in_request: recorded.length } : {}),
    },
  };
}

/** Which objects of the spec exist now, read back rather than assumed. */
async function residueAfterFailure(
  context: HandlerContext,
  objects: DdicObjectRef[],
): Promise<string> {
  try {
    const states = await versionsOf(context, objects);
    const present = objects
      .filter((o) => (states.get(o.name) ?? []).length > 0)
      .map(
        (o) =>
          `${o.name}${(states.get(o.name) ?? []).includes('A') ? '' : ' (inactive)'}`,
      );
    return present.length
      ? `Read back afterwards: these objects of the spec EXIST and were kept: ${present.join(', ')}.`
      : 'Read back afterwards: none of the objects of the spec exists.';
  } catch {
    return 'What was left behind could NOT be read back — check DD02L / DD40L before retrying.';
  }
}

function logLines(log: unknown): string[] {
  return String(log ?? '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

export async function handleDeployDdic(
  context: HandlerContext,
  args: DeployDdicArgs,
) {
  const { connection, logger } = context;
  // 'none' = provably nothing written; 'created' = the error text already says
  // what exists; 'unknown' = the call may have run partly.
  let state: 'none' | 'created' | 'unknown' = 'none';
  try {
    const input = normalizeDeployDdic(args);
    const dryRun = args?.dry_run === true;
    state = 'unknown';
    const result = await callRfcHelper(
      DDIC_HELPER_SPEC,
      connection,
      DDIC_HELPER_DEPLOY,
      {
        IV_SPEC: input.specJson,
        IV_PACKAGE: input.pkg,
        IV_REQUEST: input.request ?? '',
        IV_TEST: dryRun ? 'X' : '',
      },
    );
    const status = String(result.EV_STATUS ?? '').trim();
    const message = String(result.EV_MESSAGE ?? '').trim();
    const warning = String(result.EV_WARNING ?? '').trim();
    const log = logLines(result.EV_LOG);
    const order = (log.find((l) => l.startsWith('ORDER')) ?? '')
      .replace(/^ORDER\s*/, '')
      .split(/\s+/)
      .filter(Boolean);
    if (status !== 'S') {
      // A CORR line means the write phase had started: what exists is read back.
      if (!dryRun && log.some((l) => / CORR /.test(l))) {
        const residue = await residueAfterFailure(context, input.objects);
        state = 'created';
        throw new Error(
          `DeployDdic: ${message} ${residue} Log: ${log.join(' | ')}`,
        );
      }
      // Refused by the helper's own checks, which run before any write.
      state = 'none';
      throw new Error(`DeployDdic: ${message}`);
    }
    const warnings = warning ? [warning] : [];
    if (dryRun) {
      return {
        isError: false,
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                dry_run: true,
                created: false,
                order,
                ...(warnings.length ? { warnings } : {}),
                message,
              },
              null,
              2,
            ),
          },
        ],
      };
    }
    state = 'created';
    let readBack: Awaited<ReturnType<typeof verifyCreated>>;
    try {
      readBack = await verifyCreated(context, input);
    } catch (e) {
      throw new Error(
        `The helper reported success (${message}), but the ${e instanceof Error ? e.message : String(e)}. Check DD02L / DD40L / TADIR${input.request ? ' / E071' : ''} before retrying. Log: ${log.join(' | ')}`,
      );
    }
    const { problems, verified } = readBack;
    if (problems.length > 0) {
      throw new Error(
        `The helper reported success, but the read-back differs: ${problems.join('; ')}. Log: ${log.join(' | ')}`,
      );
    }
    return {
      isError: false,
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              created: true,
              objects: input.objects.length,
              order,
              package: input.pkg,
              transport_request: input.request ?? null,
              verified,
              log,
              ...(warnings.length ? { warnings } : {}),
              message: `${message}; DD02L/DD40L/TADIR${input.request ? '/E071' : ''} read back and match.`,
            },
            null,
            2,
          ),
        },
      ],
    };
  } catch (error) {
    if (!(error instanceof RfcHelperUnavailable)) {
      logger?.error('DeployDdic failed', error as any);
    }
    const text = error instanceof Error ? error.message : String(error);
    const nothing = state === 'none' || error instanceof RfcHelperUnavailable;
    const suffix =
      state === 'created'
        ? ''
        : nothing
          ? ' Nothing was written.'
          : ' Whether objects were (partly) created is UNKNOWN — check DD02L / DD40L before retrying.';
    return return_error(new Error(`${text}${suffix}`));
  }
}
