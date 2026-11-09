/**
 * UpdateTranslation — write a translation the way SE63 saves it
 * (LXE_OBJ_TEXT_PAIR_WRITE) through the RFC helper Z_MCP_LXE_WRITE.
 *
 * The helper refuses before writing when the target is the ORIGINAL language
 * (the LXE writer does not check this, and for a data element it would
 * overwrite the master DD04T row), and verifies by reading back. This handler
 * only reports what the helper decided — the verdict is the helper's
 * EV_STATUS, never the RFC call merely returning.
 */

import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  callLxeHelper,
  LxeHelperUnavailable,
  normalizeLxeLanguage,
  normalizeLxeObject,
  toTextPairs,
} from '../../../lib/translation/lxeHelper';
import {
  LXE_HELPER_WRITE,
  LXE_LOCAL_AREA,
} from '../../../lib/translation/lxeHelperAbap';
import { return_error } from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'UpdateTranslation',
  available_in: ['onprem', 'legacy'] as const,
  description:
    "Write one object's SE63 translation (e.g. DTEL labels) as SE63 saves it. Only the passed keys change; the original language is refused; verified by read-back; not transported. NEEDS an RFC connection and the helper ZMCP_LXE on the system — if missing, the error says to run SetupTranslationHelper (ask the user first). Keys: GetTranslation.",
  notes: `Writes through LXE_OBJ_TEXT_PAIR_WRITE, the module SE63 saves with, via the RFC-enabled helper
Z_MCP_LXE_WRITE. For a data element this writes the ACTIVE DD04T row of the target language directly:
no inactive version, no activation, the master-language row is not touched (the ADT data-element
PUT cannot do this — it edits the master language only).

Refused BEFORE anything is written: no S_TRANSLAT (ACTVT 02) authorization for the target
language; target = the object's ORIGINAL language (that is an edit of the object, use the object's
own Update* tool); a key the object does not have (the error lists the valid keys); a text longer
than max_length (from GetTranslation — for a data element it is the label length declared in
DD04L, which can be shorter than the field type); lower case on an upper-case-only key.

Keys not passed keep their current translation (the helper reads all pairs and merges). After
writing, the helper reads the object back; success only when every passed text is in the
read-back. dry_run runs every check and writes nothing.

The source language is always the object's original language. Short language codes (ZH, EN, 1, E)
expand to one LXE variant (ZH -> zhCN), reported as language / language_requested.

Transport: saving writes one LXE_LOG row (translation area, language, type, name, user), like
SE63. No request is touched; AddTranslationToTransport (or SLXT) then puts it on a LANG request.`,
  inputSchema: {
    type: 'object',
    properties: {
      object_type: {
        type: 'string',
        description: 'LXE type: DTEL, DOMA, TABT, TRAN, …',
      },
      object_name: {
        type: 'string',
        description: 'Object name.',
      },
      language: {
        type: 'string',
        description: 'Target language: zhCN (LXE), ZH (ISO) or 1 (SAP key).',
      },
      texts: {
        type: 'array',
        description: 'e.g. [{"key":"SCRTEXT_M","text":"销售订单"}]',
        items: {
          type: 'object',
          properties: {
            key: { type: 'string' },
            text: { type: 'string' },
          },
          required: ['key', 'text'],
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
    required: ['object_type', 'object_name', 'language', 'texts'],
  },
} as const;

interface UpdateTranslationArgs {
  object_type: string;
  object_name: string;
  language: string;
  texts: Array<{ key: string; text: string }>;
  dry_run?: boolean;
  translation_area?: string;
}

export async function handleUpdateTranslation(
  context: HandlerContext,
  args: UpdateTranslationArgs,
) {
  const { connection, logger } = context;
  try {
    const { objtype, objname } = normalizeLxeObject(
      args?.object_type,
      args?.object_name,
    );
    const target = normalizeLxeLanguage(args?.language);
    const area = (args?.translation_area || LXE_LOCAL_AREA).trim();
    const dryRun = args?.dry_run === true;

    if (!Array.isArray(args?.texts) || args.texts.length === 0) {
      throw new Error('texts must be a non-empty array of {key, text}');
    }
    const seen = new Set<string>();
    const rows = args.texts.map((t, i) => {
      const key = String(t?.key ?? '')
        .trim()
        .toUpperCase();
      if (!key) throw new Error(`texts[${i}].key is empty`);
      if (seen.has(key)) throw new Error(`texts: key ${key} is given twice`);
      seen.add(key);
      return { TEXTKEY: key, T_TEXT: String(t?.text ?? '') };
    });

    logger?.info(
      `UpdateTranslation ${objtype} ${objname} -> ${target.lxe} (${rows.length} key(s)${dryRun ? ', dry run' : ''})`,
    );
    const result = await callLxeHelper(connection, LXE_HELPER_WRITE, {
      IV_OBJTYPE: objtype,
      IV_OBJNAME: objname,
      IV_TARGET_LANG: target.lxe,
      IV_CUSTMNR: area,
      IT_TEXTS: rows,
      IV_TEST: dryRun ? 'X' : '',
    });

    const message = String(result.EV_MESSAGE ?? '').trim();
    if (String(result.EV_STATUS ?? '').trim() !== 'S') {
      return return_error(
        new Error(
          `UpdateTranslation ${objtype} ${objname} (${target.lxe}): ${message}`,
        ),
      );
    }

    const before = toTextPairs(result.ET_BEFORE);
    const after = toTextPairs(result.ET_AFTER);
    const changes = rows.map((r) => ({
      key: r.TEXTKEY,
      before: before.find((p) => p.key === r.TEXTKEY)?.target ?? '',
      after: after.find((p) => p.key === r.TEXTKEY)?.target ?? '',
    }));

    return {
      isError: false,
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              dry_run: dryRun,
              written: !dryRun,
              verified_by_read_back: !dryRun,
              object_type: objtype,
              object_name: objname,
              language: target.lxe,
              ...(target.expanded
                ? { language_requested: target.requested }
                : {}),
              original_language: String(result.EV_ORIG_LANG ?? '').trim(),
              translation_area: area,
              changes,
              transport: dryRun
                ? null
                : 'none yet — logged in LXE_LOG like an SE63 save; put it on a request with AddTranslationToTransport (or SLXT)',
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
      logger?.error('UpdateTranslation failed', error as any);
    }
    return return_error(error);
  }
}
