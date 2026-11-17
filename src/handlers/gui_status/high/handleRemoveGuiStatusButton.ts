/**
 * RemoveGuiStatusButton — remove ONE function's button from the application
 * toolbar of ONE GUI status: the inverse of AddGuiStatusButton, through the
 * RFC helper Z_MCP_CUA_REMOVE_BUTTON (lib/guiStatus/cuaHelperAbap.ts), which
 * follows SE41 (del_ref_but / renum_but_entry / del_ref_entries_fun).
 *
 * The verdict is not the helper's word: the interface is read before the call
 * and again after it (verifyButtonRemoved): the toolbar must be the old one
 * minus the entry with later entries moved left, the key gone unless kept, the
 * function gone exactly when the helper says so, every other status unchanged;
 * with a transport request, E071 must hold the program.
 */

import { CUA_HELPER_REMOVE_BUTTON } from '../../../lib/guiStatus/cuaHelperAbap';
import { CUA_HELPER_SPEC } from '../../../lib/guiStatus/cuaHelperSpec';
import {
  describeStatus,
  fetchCua,
  findStatusRow,
  planButtonRemoval,
  verifyButtonRemoved,
} from '../../../lib/guiStatus/guiStatus';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  callRfcHelper,
  RfcHelperUnavailable,
} from '../../../lib/rfcHelper/rfcHelper';
import { return_error } from '../../../lib/utils';
import { recordedIn, sentence } from './handleAddGuiStatusButton';
import {
  editFailure,
  normalizeStatusEdit,
  readBeforeEdit,
  type StatusEditInput,
} from './handleDeleteGuiStatus';

export const TOOL_DEFINITION = {
  name: 'RemoveGuiStatusButton',
  available_in: ['onprem', 'legacy'] as const,
  description:
    "Remove a function's button from the application toolbar of a GUI status (SE41) — also ALV standard codes like &ABC in a copied status; later buttons move one slot left. Verified by reading the interface before and after. NEEDS an RFC connection and the helper ZMCP_CUA — if missing, the error says to run SetupGuiStatusHelper (ask the user first).",
  notes: `As SE41: the toolbar entry goes and the entries after it move one slot left. Unless keep_function_key,
the function's key binding in the status's key set goes too (keep it to leave the function reachable by
its F-key); a function then referenced by no key and no menu is removed from the interface with its
active-function entries (function_deleted), otherwise it stays defined (warned). The program's own
sy-ucomm handling is not touched.

Refused BEFORE anything is written: a program outside Z*/Y*/ns, not executable / module pool, or
without a GUI interface; a status that does not exist, is a context menu, or SHARES its function key
set with another status (the change would appear there too — CopyGuiStatus to a new name first); a
function that is not on the status's toolbar (the error lists the toolbar); a pending inactive version
of the interface; a transportable program without transport_request or with a released /
non-workbench request. dry_run runs every check and writes nothing.`,
  inputSchema: {
    type: 'object',
    properties: {
      program_name: { type: 'string' },
      status: { type: 'string' },
      function_code: {
        type: 'string',
        description: 'Code on the toolbar, e.g. ZEXPORT or &ABC.',
      },
      keep_function_key: {
        type: 'boolean',
        description: 'Keep the F-key binding (default false).',
      },
      transport_request: { type: 'string' },
      dry_run: { type: 'boolean', description: 'Check only.' },
    },
    required: ['program_name', 'status', 'function_code'],
  },
} as const;

interface RemoveGuiStatusButtonArgs {
  program_name: string;
  status: string;
  function_code: string;
  keep_function_key?: boolean;
  transport_request?: string;
  dry_run?: boolean;
}

export interface RemoveButtonInput extends StatusEditInput {
  fcode: string;
  keepKey: boolean;
}

/** Any code SAP accepts in a toolbar (ALV's start with & or %), no blanks or quotes. */
const REMOVE_FCODE_PATTERN = /^[^\s'`]{1,20}$/;

export function normalizeRemoveButton(
  args: RemoveGuiStatusButtonArgs,
): RemoveButtonInput {
  const base = normalizeStatusEdit(args);
  const fcode = String(args?.function_code ?? '')
    .trim()
    .toUpperCase();
  if (!REMOVE_FCODE_PATTERN.test(fcode)) {
    throw new Error(
      `function_code "${args?.function_code ?? ''}" must be 1-20 characters without blanks or quotes`,
    );
  }
  return { ...base, fcode, keepKey: args?.keep_function_key === true };
}

export async function handleRemoveGuiStatusButton(
  context: HandlerContext,
  args: RemoveGuiStatusButtonArgs,
) {
  const { connection, logger } = context;
  let state: 'none' | 'written' | 'unknown' = 'none';
  try {
    const input = normalizeRemoveButton(args);
    const dryRun = args?.dry_run === true;
    const before = await readBeforeEdit(
      connection,
      input.program,
      input.status,
    );
    const plan = planButtonRemoval(before, input.status, input.fcode);
    if (plan.slots.length === 0) {
      const sta = findStatusRow(before, input.status);
      const bar = sta
        ? describeStatus(before, sta)
            .toolbar.filter((t) => !t.separator)
            .map((t) => t.function)
        : [];
      throw new Error(
        `Function ${input.fcode} is not on the application toolbar of status ${input.status} (toolbar: ${bar.join(', ') || 'empty'})`,
      );
    }
    state = 'unknown';
    const result = await callRfcHelper(
      CUA_HELPER_SPEC,
      connection,
      CUA_HELPER_REMOVE_BUTTON,
      {
        IV_PROGRAM: input.program,
        IV_STATUS: input.status,
        IV_FUNCTION: input.fcode,
        IV_KEEP_KEY: input.keepKey ? 'X' : '',
        IV_REQUEST: input.request ?? '',
        IV_TEST: dryRun ? 'X' : '',
      },
    );
    const status = String(result.EV_STATUS ?? '').trim();
    const written = String(result.EV_WRITTEN ?? '').trim() === 'X';
    const message = sentence(String(result.EV_MESSAGE ?? ''));
    const language = String(result.EV_LANGUAGE ?? '').trim();
    const functionDeleted =
      String(result.EV_FUNCTION_DELETED ?? '').trim() === 'X';
    const label = `RemoveGuiStatusButton ${input.program} ${input.status} ${input.fcode}`;
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
      function_code: input.fcode,
      toolbar_slots: plan.slots,
      function_keys: plan.function_keys,
      keep_function_key: input.keepKey,
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
    const problems = verifyButtonRemoved(
      before,
      after,
      input.status,
      input.fcode,
      input.keepKey,
      functionDeleted,
    );
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
        `Button ${input.fcode} was removed in ${input.program}, but the independent read-back differs: ${problems.join('; ')}. Check it in SE41.`,
      );
    }
    return jsonResult({
      success: true,
      written: true,
      ...base,
      function_deleted: functionDeleted,
      write_state: String(result.EV_WRITE_STATE ?? '').trim() || null,
      transport_request: input.request ?? null,
      ...(input.request ? { recorded_in: onRequest } : {}),
      ...(warnings.length ? { warnings } : {}),
      message: `${message} Read back: the toolbar is the old one without ${input.fcode}, every other status reads as before${input.request ? '; E071 checked' : ''}.`,
    });
  } catch (error) {
    if (!(error instanceof RfcHelperUnavailable)) {
      logger?.error('RemoveGuiStatusButton failed', error as any);
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
