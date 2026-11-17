/**
 * AddGuiStatusButton — add ONE new function code as a button on the
 * application toolbar of ONE existing GUI status (SE41), through the RFC
 * helper Z_MCP_CUA_ADD_BUTTON (lib/guiStatus/cuaHelperAbap.ts), which follows
 * SE41's own save path.
 *
 * The verdict is not the helper's word: after it reports success the ACTIVE
 * interface is read again here with RS_CUA_INTERNAL_FETCH, and the function's
 * text, key, toolbar slot and status entry must all be there; with a
 * transport request, E071 must hold the interface under it or a task.
 */

import {
  ALLOWED_FUNCTION_KEYS,
  CUA_HELPER_ADD_BUTTON,
} from '../../../lib/guiStatus/cuaHelperAbap';
import { CUA_HELPER_SPEC } from '../../../lib/guiStatus/cuaHelperSpec';
import {
  fetchCua,
  functionKeyName,
  locateFunction,
} from '../../../lib/guiStatus/guiStatus';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { selectRows } from '../../../lib/rfcHelper/installer';
import {
  callRfcHelper,
  RfcHelperUnavailable,
} from '../../../lib/rfcHelper/rfcHelper';
import { return_error } from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'AddGuiStatusButton',
  available_in: ['onprem', 'legacy'] as const,
  description:
    'Add a NEW function code as a button on the application toolbar of an existing GUI status of a program (SE41): text, optional icon and quick info, a free function key (chosen if omitted) and the next toolbar slot; verified by reading the active interface back. NEEDS an RFC connection and the helper ZMCP_CUA — if missing, the error says to run SetupGuiStatusHelper (ask the user first).',
  notes: `Only the GUI part: the program must still handle the new code (CASE sy-ucomm / the ALV user_command).
Follows SE41's save path inside the helper: RS_ACCESS_PERMISSION (authority + lock) ->
RS_CUA_INTERNAL_FETCH -> checks -> RS_CORR_INSERT -> RS_CUA_INTERNAL_WRITE (inactive when the
working area is active, then RS_WORKING_OBJECTS_ACTIVATE) -> read back.

Refused BEFORE anything is written: a program outside Z*/Y*/ns, not executable / module pool, or
without a GUI interface; a status that does not exist, is a context menu, or SHARES its function
key set with another status (the button would appear there too — shared_key_set_with in
GetGuiStatus; CopyGuiStatus to a new name gives a status its own key set); a function code that already exists in the interface (this adds a NEW one); an
occupied or unusable function_key (allowed 05-09, 13-48; default: first free of 13-48 without 15);
a full toolbar (35 slots); an unknown icon; a pending inactive version of the interface; a
transportable program without transport_request or with a released / non-workbench request.

function_code: A-Z, 0-9, _ (codes starting with & are ALV's own). The text goes into the program's
ORIGINAL language (reported as language); other languages show no text until translated.
The button is appended after the last used slot. dry_run runs every check and writes nothing.`,
  inputSchema: {
    type: 'object',
    properties: {
      program_name: { type: 'string' },
      status: { type: 'string', description: 'Existing GUI status.' },
      function_code: { type: 'string', description: 'New code, e.g. ZEXPORT.' },
      text: { type: 'string', description: 'Function text, max 40.' },
      icon: { type: 'string', description: 'Icon name, e.g. ICON_EXPORT.' },
      icon_text: { type: 'string', description: 'Text beside the icon.' },
      quick_info: { type: 'string', description: 'Tooltip, max 60.' },
      function_key: {
        type: 'string',
        description: '05-09 or 13-48 (default: first free).',
      },
      transport_request: { type: 'string' },
      dry_run: { type: 'boolean', description: 'Check only.' },
    },
    required: ['program_name', 'status', 'function_code', 'text'],
  },
} as const;

interface AddGuiStatusButtonArgs {
  program_name: string;
  status: string;
  function_code: string;
  text: string;
  icon?: string;
  icon_text?: string;
  quick_info?: string;
  function_key?: string | number;
  transport_request?: string;
  dry_run?: boolean;
}

export interface AddButtonInput {
  program: string;
  status: string;
  fcode: string;
  text: string;
  icon?: string;
  iconText?: string;
  info?: string;
  fkey?: string;
  request?: string;
}

const PROGRAM_PATTERN = /^(?:[ZY][A-Z0-9_]{0,39}|\/[A-Z0-9_]+\/[A-Z0-9_]+)$/;
export const FCODE_PATTERN = /^[A-Z0-9_]{1,20}$/;

function upper(v: unknown): string {
  return String(v ?? '')
    .trim()
    .toUpperCase();
}

/** Normalise and refuse malformed input before anything reaches SAP. */
export function normalizeAddButton(
  args: AddGuiStatusButtonArgs,
): AddButtonInput {
  const program = upper(args?.program_name);
  if (program.length > 40 || !PROGRAM_PATTERN.test(program)) {
    throw new Error(
      `program_name "${args?.program_name ?? ''}" must be a customer program (Z*, Y* or /namespace/...)`,
    );
  }
  const status = upper(args?.status);
  if (!status || status.length > 20) {
    throw new Error('status is required (at most 20 characters)');
  }
  const fcode = upper(args?.function_code);
  if (!FCODE_PATTERN.test(fcode)) {
    throw new Error(
      `function_code "${args?.function_code ?? ''}" must be 1-20 characters A-Z, 0-9 or _ (codes starting with & belong to ALV)`,
    );
  }
  const text = String(args?.text ?? '').trim();
  if (!text || text.length > 40) {
    throw new Error(
      `text is required, at most 40 characters (got ${text.length})`,
    );
  }
  const iconText = String(args?.icon_text ?? '').trim() || undefined;
  if (iconText && iconText.length > 40) {
    throw new Error('icon_text is at most 40 characters');
  }
  const info = String(args?.quick_info ?? '').trim() || undefined;
  if (info && info.length > 60)
    throw new Error('quick_info is at most 60 characters');
  const icon = upper(args?.icon) || undefined;
  if (icon && (icon.length > 30 || !/^ICON_[A-Z0-9_]+$/.test(icon))) {
    throw new Error(
      `icon "${args?.icon}" must be an icon name such as ICON_EXPORT`,
    );
  }
  let fkey: string | undefined;
  if (
    args?.function_key !== undefined &&
    String(args.function_key).trim() !== ''
  ) {
    const raw = String(args.function_key).trim();
    fkey = /^\d{1,2}$/.test(raw) ? raw.padStart(2, '0') : raw;
    if (!ALLOWED_FUNCTION_KEYS.includes(fkey)) {
      throw new Error(
        `function_key "${raw}" cannot carry a toolbar button here: use 05-09 or 13-48 (13 = Shift-F1, 25 = Ctrl-F1, 37 = Ctrl-Shift-F1)`,
      );
    }
  }
  const request = upper(args?.transport_request) || undefined;
  return { program, status, fcode, text, icon, iconText, info, fkey, request };
}

/** End a helper message as a sentence, so suffixes do not run into it. */
export function sentence(text: string): string {
  const t = text.trim();
  return t && !/[.!?]$/.test(t) ? `${t}.` : t;
}

function lit(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

const CJK = /[぀-ヿ㐀-鿿가-힯]/;
const CJK_LANGUAGES = new Set(['1', 'M', 'J', '3']);

export async function recordedIn(
  context: HandlerContext,
  program: string,
  request: string,
): Promise<string | undefined> {
  const korr = [
    request,
    ...(
      await selectRows(
        context,
        `SELECT trkorr FROM e070 WHERE strkorr = ${lit(request)}`,
      )
    ).map((r) => String(r.TRKORR ?? '').trim()),
  ];
  const e071 = await selectRows(
    context,
    `SELECT trkorr, pgmid, object FROM e071 WHERE obj_name = ${lit(program)} AND object IN ('CUAD','PROG')`,
  );
  return e071
    .map((r) => String(r.TRKORR ?? '').trim())
    .find((k) => korr.includes(k));
}

export async function handleAddGuiStatusButton(
  context: HandlerContext,
  args: AddGuiStatusButtonArgs,
) {
  const { connection, logger } = context;
  // 'none' = provably nothing written; 'written' = the error says what exists;
  // 'unknown' = the call may have run partly.
  let state: 'none' | 'written' | 'unknown' = 'none';
  try {
    const input = normalizeAddButton(args);
    const dryRun = args?.dry_run === true;
    state = 'unknown';
    const result = await callRfcHelper(
      CUA_HELPER_SPEC,
      connection,
      CUA_HELPER_ADD_BUTTON,
      {
        IV_PROGRAM: input.program,
        IV_STATUS: input.status,
        IV_FUNCTION: input.fcode,
        IV_TEXT: input.text,
        IV_ICON: input.icon ?? '',
        IV_ICON_TEXT: input.iconText ?? '',
        IV_INFO_TEXT: input.info ?? '',
        IV_FKEY: input.fkey ?? '',
        IV_REQUEST: input.request ?? '',
        IV_TEST: dryRun ? 'X' : '',
      },
    );
    const status = String(result.EV_STATUS ?? '').trim();
    const written = String(result.EV_WRITTEN ?? '').trim() === 'X';
    const message = sentence(String(result.EV_MESSAGE ?? ''));
    const language = String(result.EV_LANGUAGE ?? '').trim();
    const fkey = String(result.EV_FKEY ?? '').trim();
    const slot = String(result.EV_POSITION ?? '').trim();
    if (status !== 'S') {
      state = written ? 'written' : 'none';
      throw new Error(
        `AddGuiStatusButton ${input.program} ${input.status}: ${message}${written ? ' The interface WAS changed — check it with GetGuiStatus / SE41.' : ''}`,
      );
    }

    const warnings: string[] = [];
    const extra = String(result.EV_WARNING ?? '').trim();
    if (extra) warnings.push(extra);
    if (CJK.test(input.text) && language && !CJK_LANGUAGES.has(language)) {
      warnings.push(
        `The text contains CJK characters but is stored in the program's original language ${language}, so a logon in ${language} shows it as it is. A text for another language is a translation (SE63), not this text.`,
      );
    }
    const planned = {
      function_key: fkey,
      key_name: functionKeyName(fkey),
      toolbar_slot: slot,
    };
    if (dryRun) {
      state = 'none';
      return jsonResult({
        success: true,
        dry_run: true,
        written: false,
        program: input.program,
        status: input.status,
        function_code: input.fcode,
        language: language || null,
        ...planned,
        ...(warnings.length ? { warnings } : {}),
        message,
      });
    }

    state = 'written';
    const problems: string[] = [];
    const back = locateFunction(
      await fetchCua(connection, input.program, language || undefined),
      input.status,
      input.fcode,
    );
    if (!back.status_found) problems.push(`status ${input.status} is gone`);
    if (back.text !== input.text)
      problems.push(`text reads "${back.text ?? 'none'}"`);
    if (back.function_key !== fkey) {
      problems.push(
        `key reads ${back.function_key ?? 'none'} (helper said ${fkey})`,
      );
    }
    if (back.slot !== slot)
      problems.push(`toolbar slot reads ${back.slot ?? 'none'}`);
    if (!back.active) problems.push('the function is not active in the status');
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
        `Button ${input.fcode} was written to ${input.program}, but the independent read-back differs: ${problems.join('; ')}. Check it in SE41.`,
      );
    }
    return jsonResult({
      success: true,
      written: true,
      program: input.program,
      status: input.status,
      function_code: input.fcode,
      text: input.text,
      ...(input.icon ? { icon: input.icon } : {}),
      ...planned,
      language: language || null,
      write_state: String(result.EV_WRITE_STATE ?? '').trim() || null,
      transport_request: input.request ?? null,
      ...(input.request ? { recorded_in: onRequest } : {}),
      ...(warnings.length ? { warnings } : {}),
      message: `${message} Read back from the active interface${input.request ? ' and E071' : ''}. The program must still handle sy-ucomm = '${input.fcode}'.`,
    });
  } catch (error) {
    if (!(error instanceof RfcHelperUnavailable)) {
      logger?.error('AddGuiStatusButton failed', error as any);
    }
    const text = error instanceof Error ? error.message : String(error);
    const nothing = state === 'none' || error instanceof RfcHelperUnavailable;
    const suffix =
      state === 'written'
        ? ''
        : nothing
          ? ' Nothing was written.'
          : ' Whether the interface was changed is UNKNOWN — check it with GetGuiStatus before retrying.';
    return return_error(new Error(`${text}${suffix}`));
  }
}

function jsonResult(payload: unknown) {
  return {
    isError: false,
    content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
  };
}
