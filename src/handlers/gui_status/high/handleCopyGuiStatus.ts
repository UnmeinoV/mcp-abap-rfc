/**
 * CopyGuiStatus — copy ONE GUI status from any program (typically SAP's ALV
 * template SAPLKKBL STANDARD_FULLSCREEN) into a customer program under a new
 * name: SE41's "copy status", through the RFC helper Z_MCP_CUA_COPY_STATUS,
 * which calls SE41's own RS_CUA_COPY_STA (lib/guiStatus/cuaHelperAbap.ts).
 *
 * The verdict is not the helper's word: after it reports success, source and
 * target are read again here with RS_CUA_INTERNAL_FETCH (texts in the
 * target's original language) and compared slot by slot
 * (compareStatusCopy); with a transport request, E071 must hold the target.
 */

import { CUA_HELPER_COPY_STATUS } from '../../../lib/guiStatus/cuaHelperAbap';
import { CUA_HELPER_SPEC } from '../../../lib/guiStatus/cuaHelperSpec';
import {
  compareStatusCopy,
  describeStatus,
  fetchCua,
  findStatusRow,
} from '../../../lib/guiStatus/guiStatus';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  callRfcHelper,
  RfcHelperUnavailable,
} from '../../../lib/rfcHelper/rfcHelper';
import { return_error } from '../../../lib/utils';
import { recordedIn, sentence } from './handleAddGuiStatusButton';

export const TOOL_DEFINITION = {
  name: 'CopyGuiStatus',
  available_in: ['onprem', 'legacy'] as const,
  description:
    'Copy a GUI status (SE41 copy) from any program into a customer program under a new name — e.g. SAPLKKBL STANDARD_FULLSCREEN for an ALV toolbar of your own. The copy gets its own key set and toolbar; verified by reading both back. NEEDS an RFC connection and the helper ZMCP_CUA — if missing, the error says to run SetupGuiStatusHelper (ask the user first).',
  notes: `Runs SE41's own copy, RS_CUA_COPY_STA without dialogs: the copy gets its OWN function key set,
toolbar and menu bar (so it shares nothing with other statuses and AddGuiStatusButton can extend it);
a function code the target already has with other attributes gets an additional text, the target's
existing texts are not overwritten. A target program without any GUI interface yet is fine (the
interface is created). Texts are copied in the TARGET's original language: functions the source has
no text for in that language are copied without text (warned, with the count); OTHER languages
are not copied — the copy shows no text there until translated (measured).

Refused BEFORE anything is written: a target outside Z*/Y*/ns or not executable / module pool, a target
status that already exists, a source program or status that does not exist, a pending inactive
interface of the target, a transportable target without transport_request or with a released /
non-workbench request. dry_run runs every check and writes nothing.
Then use SET PF-STATUS '<target_status>' (or for ALV: i_callback_pf_status_set) in the program; it
must handle the function codes it does not leave to ALV.`,
  inputSchema: {
    type: 'object',
    properties: {
      source_program: {
        type: 'string',
        description: 'Program holding the status, e.g. SAPLKKBL.',
      },
      source_status: {
        type: 'string',
        description: 'Status to copy, e.g. STANDARD_FULLSCREEN.',
      },
      target_program: { type: 'string', description: 'Customer program.' },
      target_status: {
        type: 'string',
        description: 'New status name (default: source_status).',
      },
      transport_request: { type: 'string' },
      dry_run: { type: 'boolean', description: 'Check only.' },
    },
    required: ['source_program', 'source_status', 'target_program'],
  },
} as const;

interface CopyGuiStatusArgs {
  source_program: string;
  source_status: string;
  target_program: string;
  target_status?: string;
  transport_request?: string;
  dry_run?: boolean;
}

export interface CopyStatusInput {
  sourceProgram: string;
  sourceStatus: string;
  targetProgram: string;
  targetStatus: string;
  request?: string;
}

const TARGET_PATTERN = /^(?:[ZY][A-Z0-9_]{0,39}|\/[A-Z0-9_]+\/[A-Z0-9_]+)$/;
const SOURCE_PATTERN = /^[A-Z0-9_/]{1,40}$/;
const STATUS_PATTERN = /^[A-Z0-9_]{1,20}$/;

function upper(v: unknown): string {
  return String(v ?? '')
    .trim()
    .toUpperCase();
}

/** Normalise and refuse malformed input before anything reaches SAP. */
export function normalizeCopyStatus(args: CopyGuiStatusArgs): CopyStatusInput {
  const sourceProgram = upper(args?.source_program);
  if (!SOURCE_PATTERN.test(sourceProgram)) {
    throw new Error(
      `source_program "${args?.source_program ?? ''}" is not a program name (at most 40 characters)`,
    );
  }
  const sourceStatus = upper(args?.source_status);
  if (!STATUS_PATTERN.test(sourceStatus)) {
    throw new Error(
      `source_status "${args?.source_status ?? ''}" must be 1-20 characters A-Z, 0-9 or _`,
    );
  }
  const targetProgram = upper(args?.target_program);
  if (targetProgram.length > 40 || !TARGET_PATTERN.test(targetProgram)) {
    throw new Error(
      `target_program "${args?.target_program ?? ''}" must be a customer program (Z*, Y* or /namespace/...)`,
    );
  }
  const targetStatus = upper(args?.target_status) || sourceStatus;
  if (!STATUS_PATTERN.test(targetStatus)) {
    throw new Error(
      `target_status "${args?.target_status ?? ''}" must be 1-20 characters A-Z, 0-9 or _`,
    );
  }
  if (sourceProgram === targetProgram && sourceStatus === targetStatus) {
    throw new Error(
      'Copying a status onto itself: give target_status a new name',
    );
  }
  const request = upper(args?.transport_request) || undefined;
  return { sourceProgram, sourceStatus, targetProgram, targetStatus, request };
}

export async function handleCopyGuiStatus(
  context: HandlerContext,
  args: CopyGuiStatusArgs,
) {
  const { connection, logger } = context;
  let state: 'none' | 'written' | 'unknown' = 'none';
  try {
    const input = normalizeCopyStatus(args);
    const dryRun = args?.dry_run === true;
    state = 'unknown';
    const result = await callRfcHelper(
      CUA_HELPER_SPEC,
      connection,
      CUA_HELPER_COPY_STATUS,
      {
        IV_SOURCE_PROGRAM: input.sourceProgram,
        IV_SOURCE_STATUS: input.sourceStatus,
        IV_TARGET_PROGRAM: input.targetProgram,
        IV_TARGET_STATUS: input.targetStatus,
        IV_REQUEST: input.request ?? '',
        IV_TEST: dryRun ? 'X' : '',
      },
    );
    const status = String(result.EV_STATUS ?? '').trim();
    const written = String(result.EV_WRITTEN ?? '').trim() === 'X';
    const message = sentence(String(result.EV_MESSAGE ?? ''));
    const language = String(result.EV_LANGUAGE ?? '').trim();
    const newInterface = String(result.EV_NEW_INTERFACE ?? '').trim() === 'X';
    const label = `CopyGuiStatus ${input.sourceProgram} ${input.sourceStatus} -> ${input.targetProgram} ${input.targetStatus}`;
    if (status !== 'S') {
      state = written ? 'written' : 'none';
      throw new Error(
        `${label}: ${message}${written ? ' The target interface WAS changed — check it with GetGuiStatus / SE41.' : ''}`,
      );
    }
    const warnings: string[] = [];
    const extra = String(result.EV_WARNING ?? '').trim();
    if (extra) warnings.push(extra);
    const base = {
      source_program: input.sourceProgram,
      source_status: input.sourceStatus,
      target_program: input.targetProgram,
      target_status: input.targetStatus,
      language: language || null,
      creates_interface: newInterface,
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
    const lang = language || undefined;
    const source = await fetchCua(connection, input.sourceProgram, lang);
    const target = await fetchCua(connection, input.targetProgram, lang);
    const problems = compareStatusCopy(
      source,
      input.sourceStatus,
      target,
      input.targetStatus,
    );
    let onRequest: string | undefined;
    if (input.request) {
      onRequest = await recordedIn(context, input.targetProgram, input.request);
      if (!onRequest) {
        problems.push(
          `no E071 entry for ${input.targetProgram} under ${input.request} or its tasks`,
        );
      }
    }
    if (problems.length > 0) {
      throw new Error(
        `Status ${input.targetStatus} was written to ${input.targetProgram}, but the independent read-back differs from the source: ${problems.join('; ')}. Check it in SE41.`,
      );
    }
    const sta = findStatusRow(target, input.targetStatus);
    const view = sta ? describeStatus(target, sta) : undefined;
    return jsonResult({
      success: true,
      written: true,
      ...base,
      function_key_set: view?.function_key_set ?? null,
      toolbar_buttons: view?.toolbar.filter((t) => !t.separator).length ?? 0,
      function_keys: view?.function_keys.length ?? 0,
      active_functions: view?.active_function_count ?? 0,
      write_state: String(result.EV_WRITE_STATE ?? '').trim() || null,
      transport_request: input.request ?? null,
      ...(input.request ? { recorded_in: onRequest } : {}),
      ...(warnings.length ? { warnings } : {}),
      message: `${message} Source and copy read back independently and compared slot by slot${input.request ? '; E071 checked' : ''}. Use SET PF-STATUS '${input.targetStatus}' in ${input.targetProgram}.`,
    });
  } catch (error) {
    if (!(error instanceof RfcHelperUnavailable)) {
      logger?.error('CopyGuiStatus failed', error as any);
    }
    const text = error instanceof Error ? error.message : String(error);
    const nothing = state === 'none' || error instanceof RfcHelperUnavailable;
    const suffix =
      state === 'written'
        ? ''
        : nothing
          ? ' Nothing was written.'
          : ' Whether the target interface was changed is UNKNOWN — check it with GetGuiStatus before retrying.';
    return return_error(new Error(`${text}${suffix}`));
  }
}

function jsonResult(payload: unknown) {
  return {
    isError: false,
    content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
  };
}
