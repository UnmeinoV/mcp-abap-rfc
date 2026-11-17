/**
 * GetGuiStatus — a program's GUI interface (SE41): its statuses, and for one
 * status the application toolbar, the function keys and which functions are
 * active. Read over RFC with RS_CUA_INTERNAL_FETCH (RFC-enabled, no helper);
 * see lib/guiStatus/guiStatus.ts.
 */

import {
  describeStatus,
  fetchCua,
  findStatusRow,
  statusNames,
  titles,
} from '../../../lib/guiStatus/guiStatus';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { sapLanguageKey } from '../../../lib/messageClassXml';
import { return_error } from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'GetGuiStatus',
  available_in: ['onprem', 'legacy'] as const,
  description:
    '[read-only] Read the GUI interface of a program (SE41): its GUI statuses and titles, and for one status its application toolbar (slot, function key, function code, text, icon, active), its function keys and its active functions. Needs an RFC connection (no helper).',
  notes: `Read with RS_CUA_INTERNAL_FETCH, the module SE41 itself uses — RFC-enabled, so no Z helper is
needed; ADT has no GUI-status resource. Without status the answer lists the statuses (type, text,
toolbar size, key-set sharing) and titles; with status it gives that status in full.
Function keys are numbered as SAP does: 01-12 F1-F12, 13-24 Shift-F1..F12, 25-36 Ctrl-F1..F12,
37-48 Ctrl-Shift-F1..F12; higher numbers are SAP standard keys (Ctrl-F, Ctrl-P, …). A toolbar slot
whose key is "S" is a separator. shared_key_set_with names statuses that use the SAME function
key set: a key or button added there appears in all of them. Texts are in language (default: the
interface's own language, EUDB-LANGU = the original language).`,
  inputSchema: {
    type: 'object',
    properties: {
      program_name: {
        type: 'string',
        description: 'Program, e.g. ZMY_REPORT.',
      },
      status: {
        type: 'string',
        description: 'One GUI status in full (omit for the list).',
      },
      language: {
        type: 'string',
        description: 'Text language: ZH / EN or 1 / E. Default: original.',
      },
    },
    required: ['program_name'],
  },
} as const;

interface GetGuiStatusArgs {
  program_name: string;
  status?: string;
  language?: string;
}

export async function handleGetGuiStatus(
  context: HandlerContext,
  args: GetGuiStatusArgs,
) {
  const { connection, logger } = context;
  try {
    const program = String(args?.program_name ?? '')
      .trim()
      .toUpperCase();
    if (!program || program.length > 40) {
      throw new Error('program_name is required (at most 40 characters)');
    }
    const status = String(args?.status ?? '')
      .trim()
      .toUpperCase();

    const requested = args?.language ? sapLanguageKey(args.language) : '';
    const raw = await fetchCua(connection, program, requested || undefined);
    const language = String(raw.LANGUAGE_USED ?? '').trim();
    const base = {
      success: true,
      program,
      language: language || null,
      interface_language: String(raw.LANGU ?? '').trim() || null,
      created_by: String(raw.AUTHOR ?? '').trim() || null,
      changed_by: String(raw.CAUTHOR ?? '').trim() || null,
      changed_on: String(raw.CDATE ?? '').trim() || null,
    };

    if (status) {
      const sta = findStatusRow(raw, status);
      if (!sta) {
        throw new Error(
          `${program} has no GUI status ${status} (statuses: ${statusNames(raw).join(', ') || 'none'}).`,
        );
      }
      return jsonResult({ ...base, ...describeStatus(raw, sta) });
    }

    return jsonResult({
      ...base,
      statuses: (raw.STA ?? []).map((sta) => {
        const v = describeStatus(raw, sta);
        return {
          status: v.status,
          type: v.type,
          text: v.text,
          toolbar_buttons: v.toolbar.filter((t) => !t.separator).length,
          active_functions: v.active_function_count,
          ...(v.shared_key_set_with.length
            ? { shared_key_set_with: v.shared_key_set_with }
            : {}),
        };
      }),
      titles: titles(raw),
      function_count: new Set(
        (raw.FUN ?? []).map((f) => String(f.CODE ?? '').trim()),
      ).size,
    });
  } catch (error) {
    logger?.error('GetGuiStatus failed', error as any);
    return return_error(error);
  }
}

function jsonResult(payload: unknown) {
  return {
    isError: false,
    content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
  };
}
