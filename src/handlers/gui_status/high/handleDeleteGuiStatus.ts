/**
 * DeleteGuiStatus — delete ONE GUI status of a customer program, as SE41 does
 * (LSMPEF00 del_status_internal): the status row and its active-function rows,
 * through the RFC helper Z_MCP_CUA_DELETE_STATUS (lib/guiStatus/cuaHelperAbap.ts).
 * Its key set, toolbar and menu bar stay in the interface, as SE41 leaves them;
 * the helper names the ones no other status uses.
 *
 * The verdict is not the helper's word: the interface is read before the call
 * and again after it; the status must be gone and every OTHER status must read
 * exactly as before (verifyStatusDeleted); with a transport request, E071 must
 * hold the program.
 */

import { CUA_HELPER_DELETE_STATUS } from '../../../lib/guiStatus/cuaHelperAbap';
import { CUA_HELPER_SPEC } from '../../../lib/guiStatus/cuaHelperSpec';
import {
  type CuaRaw,
  fetchCua,
  findStatusRow,
  GuiInterfaceNotFound,
  statusNames,
  verifyStatusDeleted,
} from '../../../lib/guiStatus/guiStatus';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  callRfcHelper,
  RfcHelperUnavailable,
} from '../../../lib/rfcHelper/rfcHelper';
import { return_error } from '../../../lib/utils';
import { recordedIn, sentence } from './handleAddGuiStatusButton';

export const TOOL_DEFINITION = {
  name: 'DeleteGuiStatus',
  available_in: ['onprem', 'legacy'] as const,
  description:
    'Delete a GUI status of a customer program (SE41 delete status); verified by reading the interface before and after — the status is gone, every other status unchanged. NEEDS an RFC connection and the helper ZMCP_CUA — if missing, the error says to run SetupGuiStatusHelper (ask the user first).',
  notes: `Does what SE41's delete does: removes the status and its active-function entries. Its function key
set, application toolbar and menu bar STAY in the interface, as in SE41 (other statuses may use them;
SE41 removes unused ones only with Utilities > Delete unused objects) — the result warns which of them
no other status uses now. Function codes are not deleted. A program still running SET PF-STATUS
'<status>' then shows no status — check with SearchSource first.

Refused BEFORE anything is written: a program outside Z*/Y*/ns, not executable / module pool, or
without a GUI interface; a status that does not exist (the error lists the statuses); a pending
inactive version of the interface; a transportable program without transport_request or with a
released / non-workbench request. dry_run runs every check and writes nothing.`,
  inputSchema: {
    type: 'object',
    properties: {
      program_name: { type: 'string' },
      status: { type: 'string', description: 'Status to delete.' },
      transport_request: { type: 'string' },
      dry_run: { type: 'boolean', description: 'Check only.' },
    },
    required: ['program_name', 'status'],
  },
} as const;

interface DeleteGuiStatusArgs {
  program_name: string;
  status: string;
  transport_request?: string;
  dry_run?: boolean;
}

export interface StatusEditInput {
  program: string;
  status: string;
  request?: string;
}

const PROGRAM_PATTERN = /^(?:[ZY][A-Z0-9_]{0,39}|\/[A-Z0-9_]+\/[A-Z0-9_]+)$/;
const STATUS_PATTERN = /^[A-Z0-9_]{1,20}$/;

function upper(v: unknown): string {
  return String(v ?? '')
    .trim()
    .toUpperCase();
}

/** Normalise and refuse a malformed program / status before anything reaches SAP. */
export function normalizeStatusEdit(args: {
  program_name?: string;
  status?: string;
  transport_request?: string;
}): StatusEditInput {
  const program = upper(args?.program_name);
  if (program.length > 40 || !PROGRAM_PATTERN.test(program)) {
    throw new Error(
      `program_name "${args?.program_name ?? ''}" must be a customer program (Z*, Y* or /namespace/...)`,
    );
  }
  const status = upper(args?.status);
  if (!STATUS_PATTERN.test(status)) {
    throw new Error(
      `status "${args?.status ?? ''}" must be 1-20 characters A-Z, 0-9 or _`,
    );
  }
  const request = upper(args?.transport_request) || undefined;
  return { program, status, request };
}

/**
 * The interface as it is before an edit, and the refusal of a status it does
 * not have — so the before/after comparison has a baseline. Throws plain
 * errors: nothing has been written yet.
 */
export async function readBeforeEdit(
  connection: unknown,
  program: string,
  status: string,
): Promise<CuaRaw> {
  let before: CuaRaw;
  try {
    before = await fetchCua(connection, program);
  } catch (error) {
    if (error instanceof GuiInterfaceNotFound) {
      throw new Error(`${program} has no GUI interface`);
    }
    throw error;
  }
  if (!findStatusRow(before, status)) {
    throw new Error(
      `Status ${status} does not exist in ${program} (statuses: ${statusNames(before).join(', ') || 'none'})`,
    );
  }
  return before;
}

/** The common suffix of an edit's failure: what is known about the interface. */
export function editFailure(
  state: 'none' | 'written' | 'unknown',
  error: unknown,
): Error {
  const text = error instanceof Error ? error.message : String(error);
  const nothing = state === 'none' || error instanceof RfcHelperUnavailable;
  const suffix =
    state === 'written'
      ? ''
      : nothing
        ? ' Nothing was written.'
        : ' Whether the interface was changed is UNKNOWN — check it with GetGuiStatus before retrying.';
  return new Error(`${suffix ? sentence(text) : text}${suffix}`);
}

export async function handleDeleteGuiStatus(
  context: HandlerContext,
  args: DeleteGuiStatusArgs,
) {
  const { connection, logger } = context;
  let state: 'none' | 'written' | 'unknown' = 'none';
  try {
    const input = normalizeStatusEdit(args);
    const dryRun = args?.dry_run === true;
    const before = await readBeforeEdit(
      connection,
      input.program,
      input.status,
    );
    state = 'unknown';
    const result = await callRfcHelper(
      CUA_HELPER_SPEC,
      connection,
      CUA_HELPER_DELETE_STATUS,
      {
        IV_PROGRAM: input.program,
        IV_STATUS: input.status,
        IV_REQUEST: input.request ?? '',
        IV_TEST: dryRun ? 'X' : '',
      },
    );
    const status = String(result.EV_STATUS ?? '').trim();
    const written = String(result.EV_WRITTEN ?? '').trim() === 'X';
    const message = sentence(String(result.EV_MESSAGE ?? ''));
    const language = String(result.EV_LANGUAGE ?? '').trim();
    const label = `DeleteGuiStatus ${input.program} ${input.status}`;
    if (status !== 'S') {
      state = written ? 'written' : 'none';
      throw new Error(
        `${label}: ${message}${written ? ' The interface WAS changed — check it with GetGuiStatus / SE41.' : ''}`,
      );
    }
    const warnings: string[] = [];
    const extra = String(result.EV_WARNING ?? '').trim();
    if (extra) warnings.push(extra);
    const base = {
      program: input.program,
      status: input.status,
      language: language || null,
    };
    if (dryRun) {
      state = 'none';
      return jsonResult({
        success: true,
        dry_run: true,
        written: false,
        ...base,
        ...(warnings.length ? { warnings } : {}),
        message,
      });
    }

    state = 'written';
    const after = await fetchCua(
      connection,
      input.program,
      before.LANGUAGE_USED,
    );
    const problems = verifyStatusDeleted(before, after, input.status);
    let onRequest: string | undefined;
    if (input.request) {
      onRequest = await recordedIn(context, input.program, input.request);
      if (!onRequest) {
        problems.push(
          `no E071 entry for ${input.program} under ${input.request} or its tasks`,
        );
      }
    }
    if (problems.length > 0) {
      throw new Error(
        `Status ${input.status} was deleted in ${input.program}, but the independent read-back differs: ${problems.join('; ')}. Check it in SE41.`,
      );
    }
    return jsonResult({
      success: true,
      written: true,
      ...base,
      remaining_statuses: statusNames(after),
      write_state: String(result.EV_WRITE_STATE ?? '').trim() || null,
      transport_request: input.request ?? null,
      ...(input.request ? { recorded_in: onRequest } : {}),
      ...(warnings.length ? { warnings } : {}),
      message: `${message} Read back: the status is gone and every other status reads as before${input.request ? '; E071 checked' : ''}.`,
    });
  } catch (error) {
    if (!(error instanceof RfcHelperUnavailable)) {
      logger?.error('DeleteGuiStatus failed', error as any);
    }
    return return_error(editFailure(state, error));
  }
}

function jsonResult(payload: unknown) {
  return {
    isError: false,
    content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
  };
}
