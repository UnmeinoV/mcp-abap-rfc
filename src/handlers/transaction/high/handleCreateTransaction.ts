/**
 * CreateTransaction — a REPORT transaction (SE93 "program and selection
 * screen", optional start variant) through the RFC helper Z_MCP_TRAN_CREATE,
 * which wraps RPY_TRANSACTION_INSERT (see lib/transaction/tranHelperAbap.ts).
 *
 * The verdict is not the helper's word: after it reports success, TSTC, TSTCT,
 * TSTCP, TADIR and (with a request) E071 are read back here through the Data
 * Preview, and any difference is an error naming what differs.
 */

import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { selectRows } from '../../../lib/rfcHelper/installer';
import {
  callRfcHelper,
  RfcHelperUnavailable,
} from '../../../lib/rfcHelper/rfcHelper';
import { TRAN_HELPER_CREATE } from '../../../lib/transaction/tranHelperAbap';
import { TRAN_HELPER_SPEC } from '../../../lib/transaction/tranHelperSpec';
import { return_error } from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'CreateTransaction',
  available_in: ['onprem', 'legacy'] as const,
  description:
    'Create a report transaction code (SE93 "program and selection screen", optional start variant), verified by reading TSTC/TSTCT/TSTCP/TADIR back. NEEDS an RFC connection and the helper ZMCP_TRAN on the system — if missing, the error says to run SetupTransactionHelper (ask the user first).',
  notes: `Report transactions only (type R): the program must be EXECUTABLE (TRDIR-SUBC 1). Created through
RPY_TRANSACTION_INSERT, the module SE93 itself uses, via the RFC-enabled helper Z_MCP_TRAN_CREATE.

Refused BEFORE anything is written: a code outside the customer namespace (Z*, Y*, /ns/) or that
already exists; a program that does not exist or is not executable; a selection_screen other than
1000 that the program does not have (a program without screen 1000 — no PARAMETERS yet — is allowed
with a warning); a variant that does not exist; a missing package; a transportable package without
transport_request, or a request that is missing, released, or not a workbench request/task.

variant: a system variant (CUS&... / SAP&..., checked in client 000) works in every client; any
other variant is client-specific and is checked in the current client, with a warning.

The short text is stored in the logon language of the RFC session (reported as language) — that is
the transaction's original language.

Verified after creation: TSTC (program, screen, CINFO 80 = report transaction), TSTCT (text), TSTCP
(the variant, or none), TADIR (package), and E071 (the request or one of its tasks) when a
transport_request is given. dry_run runs every check and creates nothing.`,
  inputSchema: {
    type: 'object',
    properties: {
      transaction_code: { type: 'string', description: 'e.g. ZMM28.' },
      program_name: { type: 'string', description: 'Executable program.' },
      description: { type: 'string', description: 'Short text, max 36.' },
      package_name: { type: 'string' },
      transport_request: { type: 'string' },
      selection_screen: {
        type: 'string',
        description: 'Default 1000.',
      },
      variant: { type: 'string', description: 'Start variant (optional).' },
      dry_run: { type: 'boolean', description: 'Check only.' },
    },
    required: [
      'transaction_code',
      'program_name',
      'description',
      'package_name',
    ],
  },
} as const;

interface CreateTransactionArgs {
  transaction_code: string;
  program_name: string;
  description: string;
  package_name: string;
  transport_request?: string;
  selection_screen?: string | number;
  variant?: string;
  dry_run?: boolean;
}

/** Z* / Y* (2..20 chars) or /namespace/NAME. */
export const TCODE_PATTERN =
  /^(?:[ZY][A-Z0-9_]{1,19}|\/[A-Z0-9_]+\/[A-Z0-9_]+)$/;

function lit(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

export interface CreateTransactionInput {
  tcode: string;
  program: string;
  text: string;
  pkg: string;
  request?: string;
  screen: string;
  variant?: string;
}

/** Normalise and refuse malformed input before anything reaches SAP. */
export function normalizeCreateTransaction(
  args: CreateTransactionArgs,
): CreateTransactionInput {
  const tcode = String(args?.transaction_code ?? '')
    .trim()
    .toUpperCase();
  if (tcode.length > 20 || !TCODE_PATTERN.test(tcode)) {
    throw new Error(
      `transaction_code "${args?.transaction_code ?? ''}" must be a customer transaction code: Z*/Y* or /namespace/..., at most 20 characters`,
    );
  }
  const program = String(args?.program_name ?? '')
    .trim()
    .toUpperCase();
  if (!program || program.length > 40) {
    throw new Error('program_name is required (at most 40 characters)');
  }
  const text = String(args?.description ?? '').trim();
  if (!text || text.length > 36) {
    throw new Error(
      `description is required, at most 36 characters (got ${text.length})`,
    );
  }
  const pkg = String(args?.package_name ?? '')
    .trim()
    .toUpperCase();
  if (!pkg) throw new Error('package_name is required');
  const request =
    String(args?.transport_request ?? '')
      .trim()
      .toUpperCase() || undefined;
  const rawScreen = String(args?.selection_screen ?? '1000').trim();
  if (!/^\d{1,4}$/.test(rawScreen)) {
    throw new Error(`selection_screen "${rawScreen}" must be a screen number`);
  }
  const screen = rawScreen.padStart(4, '0');
  const variant =
    String(args?.variant ?? '')
      .trim()
      .toUpperCase() || undefined;
  if (variant && variant.length > 14) {
    throw new Error('variant is at most 14 characters');
  }
  return { tcode, program, text, pkg, request, screen, variant };
}

async function verifyCreated(
  context: HandlerContext,
  input: CreateTransactionInput,
): Promise<{ problems: string[]; verified: Record<string, unknown> }> {
  const problems: string[] = [];
  const t = lit(input.tcode);
  const tstc = await selectRows(
    context,
    `SELECT pgmna, dypno, cinfo FROM tstc WHERE tcode = ${t}`,
  );
  const row = tstc[0];
  if (!row) {
    problems.push('TSTC has no row');
  } else {
    if (String(row.PGMNA ?? '').trim() !== input.program) {
      problems.push(`TSTC program is ${row.PGMNA}`);
    }
    if (
      String(row.DYPNO ?? '')
        .trim()
        .padStart(4, '0') !== input.screen
    ) {
      problems.push(`TSTC screen is ${row.DYPNO}`);
    }
    if (
      String(row.CINFO ?? '')
        .trim()
        .toUpperCase() !== '80'
    ) {
      problems.push(`TSTC CINFO is ${row.CINFO}, not 80 (report transaction)`);
    }
  }
  // TSTCT is language-dependent and the Data Preview refuses the SPRAS column,
  // so the text is looked for among all rows.
  const texts = (
    await selectRows(context, `SELECT ttext FROM tstct WHERE tcode = ${t}`)
  ).map((r) => String(r.TTEXT ?? '').trim());
  if (!texts.includes(input.text)) {
    problems.push(
      `TSTCT does not hold the text (found: ${texts.join(' | ') || 'none'})`,
    );
  }
  const params = (
    await selectRows(context, `SELECT param FROM tstcp WHERE tcode = ${t}`)
  ).map((r) => String(r.PARAM ?? '').trim());
  if (input.variant ? params[0] !== input.variant : params.length > 0) {
    problems.push(
      `TSTCP holds ${params.length ? params.join(', ') : 'nothing'} (expected ${input.variant ?? 'nothing'})`,
    );
  }
  const tadir = await selectRows(
    context,
    `SELECT devclass, masterlang FROM tadir WHERE pgmid = 'R3TR' AND object = 'TRAN' AND obj_name = ${t}`,
  );
  const devclass = String(tadir[0]?.DEVCLASS ?? '').trim();
  if (devclass !== input.pkg) {
    problems.push(`TADIR package is ${devclass || 'missing'}`);
  }
  let onRequest: string | undefined;
  if (input.request) {
    const korr = [
      input.request,
      ...(
        await selectRows(
          context,
          `SELECT trkorr FROM e070 WHERE strkorr = ${lit(input.request)}`,
        )
      ).map((r) => String(r.TRKORR ?? '').trim()),
    ];
    const e071 = await selectRows(
      context,
      `SELECT trkorr FROM e071 WHERE pgmid = 'R3TR' AND object = 'TRAN' AND obj_name = ${t}`,
    );
    onRequest = e071
      .map((r) => String(r.TRKORR ?? '').trim())
      .find((k) => korr.includes(k));
    if (!onRequest) {
      problems.push(`no E071 entry under ${input.request} or its tasks`);
    }
  }
  return {
    problems,
    verified: {
      tstc: row
        ? {
            program: String(row.PGMNA ?? '').trim(),
            selection_screen: String(row.DYPNO ?? '').trim(),
            cinfo: String(row.CINFO ?? '').trim(),
          }
        : null,
      texts,
      variant: params[0] ?? null,
      package: devclass || null,
      original_language: String(tadir[0]?.MASTERLANG ?? '').trim() || null,
      ...(input.request ? { recorded_in: onRequest ?? null } : {}),
    },
  };
}

async function residueAfterFailure(
  context: HandlerContext,
  tcode: string,
): Promise<string> {
  try {
    const t = lit(tcode);
    const tstc = await selectRows(
      context,
      `SELECT tcode FROM tstc WHERE tcode = ${t}`,
    );
    const tadir = await selectRows(
      context,
      `SELECT devclass FROM tadir WHERE pgmid = 'R3TR' AND object = 'TRAN' AND obj_name = ${t}`,
    );
    if (tstc.length === 0 && tadir.length === 0) {
      return 'Checked afterwards: no TSTC and no TADIR entry — nothing was created.';
    }
    return `Checked afterwards: ${tstc.length ? 'TSTC HAS a row' : 'no TSTC row'}, ${tadir.length ? `TADIR HAS an entry (package ${String(tadir[0].DEVCLASS ?? '').trim()})` : 'no TADIR entry'} — clean up in SE93 / SE03 before retrying.`;
  } catch {
    return 'Whether anything was left behind could NOT be checked — look at SE93 before retrying.';
  }
}

export async function handleCreateTransaction(
  context: HandlerContext,
  args: CreateTransactionArgs,
) {
  const { connection, logger } = context;
  // 'none' = provably nothing written; 'created' = the error text already says
  // what exists; 'unknown' = the call may have run partly.
  let state: 'none' | 'created' | 'unknown' = 'none';
  try {
    const input = normalizeCreateTransaction(args);
    const dryRun = args?.dry_run === true;
    state = 'unknown';
    const result = await callRfcHelper(
      TRAN_HELPER_SPEC,
      connection,
      TRAN_HELPER_CREATE,
      {
        IV_TCODE: input.tcode,
        IV_PROGRAM: input.program,
        IV_TEXT: input.text,
        IV_PACKAGE: input.pkg,
        IV_SCREEN: input.screen,
        IV_VARIANT: input.variant ?? '',
        IV_REQUEST: input.request ?? '',
        IV_TEST: dryRun ? 'X' : '',
      },
    );
    const status = String(result.EV_STATUS ?? '').trim();
    const message = String(result.EV_MESSAGE ?? '').trim();
    const warning = String(result.EV_WARNING ?? '').trim();
    if (status !== 'S') {
      // The helper's own checks refuse before anything is written. A failure
      // INSIDE RPY_TRANSACTION_INSERT may come after RS_CORR_INSERT ran, so
      // what is left is read back rather than assumed.
      if (!dryRun && message.startsWith('RPY_TRANSACTION_INSERT')) {
        const residue = await residueAfterFailure(context, input.tcode);
        state = 'created';
        throw new Error(
          `CreateTransaction ${input.tcode}: ${message} ${residue}`,
        );
      }
      // Refused by the helper's own checks, which run before any write.
      state = 'none';
      throw new Error(`CreateTransaction ${input.tcode}: ${message}`);
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
                transaction_code: input.tcode,
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
    const { problems, verified } = await verifyCreated(context, input);
    if (problems.length > 0) {
      throw new Error(
        `Transaction ${input.tcode} was created, but the read-back differs: ${problems.join('; ')}. Check it in SE93, or remove it with DeleteTransaction.`,
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
              transaction_code: input.tcode,
              type: 'report transaction',
              program: input.program,
              selection_screen: input.screen,
              variant: input.variant ?? null,
              package: input.pkg,
              transport_request: input.request ?? null,
              language: String(result.EV_LANGUAGE ?? '').trim() || null,
              verified,
              ...(warnings.length ? { warnings } : {}),
              message: `${message}; TSTC/TSTCT/TSTCP/TADIR${input.request ? '/E071' : ''} read back and match.`,
            },
            null,
            2,
          ),
        },
      ],
    };
  } catch (error) {
    if (!(error instanceof RfcHelperUnavailable)) {
      logger?.error('CreateTransaction failed', error as any);
    }
    const text = error instanceof Error ? error.message : String(error);
    // An unusable helper means the call never ran.
    const nothing = state === 'none' || error instanceof RfcHelperUnavailable;
    const suffix =
      state === 'created'
        ? ''
        : nothing
          ? ' Nothing was written.'
          : ' Whether the transaction was (partly) created is UNKNOWN — check with GetTransaction before retrying.';
    return return_error(new Error(`${text}${suffix}`));
  }
}
