/**
 * AddTranslationToTransport — the SLXT step for given objects: put their
 * translations (as logged in LXE_LOG by SE63 / UpdateTranslation) on a
 * transport request as LANG entries, via the RFC helper Z_MCP_LXE_RECORD.
 *
 * Read from S4D's source (2026-11-05): SLXT = RS_LXE_LOG_EXPORT →
 * CL_LXE_LOG_EXPORT_LOCAL->write_to_request_local, which per LXE_LOG row calls
 * LXE_OBJ_CREATE_TRANSPORT_ENTRY (LANG E071/E071K), TR_REQ_CHECK_KEY and
 * TR_REQUEST_CHOICE with the dialog suppressed. The helper does exactly that
 * and then reads the request back; the verdict here is the helper's, derived
 * from what is on the request afterwards — never from the call returning.
 */

import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  callLxeHelper,
  LxeHelperUnavailable,
  normalizeLxeLanguage,
  normalizeLxeObject,
} from '../../../lib/translation/lxeHelper';
import {
  LXE_HELPER_RECORD,
  LXE_LOCAL_AREA,
} from '../../../lib/translation/lxeHelperAbap';
import {
  normaliseTransportNumber,
  TRANSPORT_NUMBER_PATTERN,
} from '../../../lib/transportMerge';
import { return_error } from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'AddTranslationToTransport',
  available_in: ['onprem', 'legacy'] as const,
  description:
    "Put objects' translations into a transport request so they reach the next system — SE63/SLXT's language transport (LANG entries), e.g. after UpdateTranslation. Verified by reading the request back. NEEDS an RFC connection and the helper ZMCP_LXE on the system — if missing, the error says to run SetupTranslationHelper (ask the user first).",
  notes: `Does what SLXT (RS_LXE_LOG_EXPORT) does for the objects you name, read from the system source:
for each LXE_LOG row of the object in that language (written by every SE63 save and by
UpdateTranslation), LXE_OBJ_CREATE_TRANSPORT_ENTRY builds the LANG E071/E071K entries — the
transport object type is NOT the LXE type (a data element's texts travel as LANG DTED, a domain's
as LANG DOMD) — TR_REQ_CHECK_KEY checks the table keys and TR_REQUEST_CHOICE (no dialog) appends
them to the request (measured on S4D: the LANG entries land on the request itself, not on a task).

The request must exist, be a REQUEST (not a task), be modifiable, and be a workbench (K) or
transport-of-copies (T) request, as in SLXT; create one with CreateTransport. An object with no
LXE_LOG row in that language (never saved as a translation, in this translation area) is refused
per object (reason not_in_translation_log) rather than recorded empty.

Afterwards the request and its tasks are read back: success only when every entry is found there.
Per-object failures are listed in errors with SLXT's own reasons; the call still records the
objects that worked (verdict "partial"). dry_run builds and checks the entries, writes nothing.`,
  inputSchema: {
    type: 'object',
    properties: {
      transport_request: {
        type: 'string',
        description: 'Modifiable workbench request, e.g. ABCK900001.',
      },
      language: {
        type: 'string',
        description: 'Translation language: zhCN (LXE), ZH (ISO) or 1.',
      },
      objects: {
        type: 'array',
        description: 'e.g. [{"object_type":"DTEL","object_name":"ZMY_DE"}]',
        items: {
          type: 'object',
          properties: {
            object_type: { type: 'string' },
            object_name: { type: 'string' },
          },
          required: ['object_type', 'object_name'],
        },
      },
      dry_run: {
        type: 'boolean',
        description: 'Check only, write nothing.',
      },
      translation_area: {
        type: 'string',
        description: `Default ${LXE_LOCAL_AREA} (local).`,
      },
    },
    required: ['transport_request', 'language', 'objects'],
  },
} as const;

interface AddTranslationToTransportArgs {
  transport_request: string;
  language: string;
  objects: Array<{ object_type: string; object_name: string }>;
  dry_run?: boolean;
  translation_area?: string;
}

/** SLXT's error letters (RS_LXE_LOG_EXPORT header) plus the helper's N / V. */
export const RECORD_ERROR_REASONS: Record<string, string> = {
  B: 'transport_entry_not_built',
  C: 'invalid_table_key',
  D: 'not_appended_to_request',
  E: 'request_write_error',
  N: 'not_in_translation_log',
  V: 'not_found_on_request_after_write',
};

export interface RecordError {
  reason: string;
  object_type?: string;
  object_name?: string;
  transport_object?: string;
  detail?: string;
}

export function toRecordErrors(rows: unknown): RecordError[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((r: any) => {
    const code = String(r?.ERR_TYPE ?? '').trim();
    const trtype = String(r?.TRTYPE ?? '').trim();
    const trname = String(r?.TRNAME ?? '').trim();
    const pgmid = String(r?.PGMID ?? '').trim();
    const detail = String(r?.TRKEY ?? '').trim();
    const out: RecordError = {
      reason: RECORD_ERROR_REASONS[code] ?? `slxt_error_${code || 'unknown'}`,
    };
    const objtype = String(r?.OBJTYPE ?? '').trim();
    const objname = String(r?.OBJNAME ?? '').trim();
    if (objtype) out.object_type = objtype;
    if (objname) out.object_name = objname;
    if (trtype || trname) {
      out.transport_object = [pgmid, trtype, trname].filter(Boolean).join(' ');
    }
    if (detail) out.detail = detail;
    return out;
  });
}

export interface RecordedEntry {
  request: string;
  pgmid: string;
  object: string;
  obj_name: string;
  lang: string;
}

export function toRecordedEntries(rows: unknown): RecordedEntry[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((r: any) => ({
    request: String(r?.TRKORR ?? '').trim(),
    pgmid: String(r?.PGMID ?? '').trim(),
    object: String(r?.OBJECT ?? '').trim(),
    obj_name: String(r?.OBJ_NAME ?? '').trim(),
    lang: String(r?.LANG ?? '').trim(),
  }));
}

export async function handleAddTranslationToTransport(
  context: HandlerContext,
  args: AddTranslationToTransportArgs,
) {
  const { connection, logger } = context;
  try {
    const request = normaliseTransportNumber(args?.transport_request);
    if (!TRANSPORT_NUMBER_PATTERN.test(request)) {
      throw new Error(
        `transport_request "${args?.transport_request ?? ''}" is not a transport number (e.g. ABCK900001)`,
      );
    }
    const language = normalizeLxeLanguage(args?.language);
    const area = (args?.translation_area || LXE_LOCAL_AREA).trim();
    const dryRun = args?.dry_run === true;
    if (!Array.isArray(args?.objects) || args.objects.length === 0) {
      throw new Error(
        'objects must be a non-empty array of {object_type, object_name}',
      );
    }
    const seen = new Set<string>();
    const objects = args.objects.map((o) => {
      const { objtype, objname } = normalizeLxeObject(
        o?.object_type,
        o?.object_name,
      );
      const key = `${objtype} ${objname}`;
      if (seen.has(key)) throw new Error(`objects: ${key} is given twice`);
      seen.add(key);
      return { OBJTYPE: objtype, OBJNAME: objname };
    });

    logger?.info(
      `AddTranslationToTransport ${objects.length} object(s) ${language.lxe} -> ${request}${dryRun ? ' (dry run)' : ''}`,
    );
    const result = await callLxeHelper(connection, LXE_HELPER_RECORD, {
      IV_TARGET_LANG: language.lxe,
      IV_REQUEST: request,
      IT_OBJECTS: objects,
      IV_CUSTMNR: area,
      IV_TEST: dryRun ? 'X' : '',
    });

    const status = String(result.EV_STATUS ?? '').trim();
    const message = String(result.EV_MESSAGE ?? '').trim();
    const entries = toRecordedEntries(result.ET_ENTRIES);
    const errors = toRecordErrors(result.ET_ERRORS);

    if (status !== 'S' && status !== 'W') {
      const why = errors.length
        ? ` Errors: ${errors
            .map((e) =>
              `${e.object_type ?? ''} ${e.object_name ?? e.transport_object ?? ''}: ${e.reason}${e.detail ? ` (${e.detail})` : ''}`.trim(),
            )
            .join('; ')}`
        : '';
      return return_error(
        new Error(
          `AddTranslationToTransport ${request} (${language.lxe}): nothing recorded. ${message}.${why}`,
        ),
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
              verdict: status === 'S' ? 'recorded' : 'partial',
              dry_run: dryRun,
              written: !dryRun,
              verified_on_request: !dryRun,
              transport_request: request,
              language: language.lxe,
              ...(language.expanded
                ? { language_requested: language.requested }
                : {}),
              translation_area: area,
              entries,
              errors,
              message,
            },
            null,
            2,
          ),
        },
      ],
    };
  } catch (error) {
    if (!(error instanceof LxeHelperUnavailable)) {
      logger?.error('AddTranslationToTransport failed', error as any);
    }
    return return_error(error);
  }
}
