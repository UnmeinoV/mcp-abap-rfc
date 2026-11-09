/**
 * GetTranslation — the text pairs SE63 shows for one object (source text in
 * the original language, target text in the requested language), read through
 * the same entry point SE63 uses (LXE_OBJ_TEXT_PAIR_READ) via the RFC helper
 * Z_MCP_LXE_READ. See src/lib/translation/lxeHelper.ts.
 */

import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  callLxeHelper,
  LxeHelperUnavailable,
  normalizeLxeLanguage,
  normalizeLxeObject,
  sapLanguageOfLxe,
  toTextPairs,
} from '../../../lib/translation/lxeHelper';
import {
  LXE_HELPER_READ,
  LXE_LOCAL_AREA,
} from '../../../lib/translation/lxeHelperAbap';
import { return_error } from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'GetTranslation',
  available_in: ['onprem', 'legacy'] as const,
  description:
    "[read-only] Read the SE63 translation of one object: every text key with its source text (original language), its text in the target language and its max length — e.g. a data element's DDTEXT/REPTEXT/SCRTEXT_S/M/L. PREREQUISITE: an RFC connection and the SE63 helper function group ZMCP_LXE on the SAP system; if it is missing the error says so — install it once with SetupTranslationHelper (ask the user first, it creates Z code).",
  notes: `Reads through LXE_OBJ_TEXT_PAIR_READ, the entry point SE63 itself uses, via the RFC-enabled helper
Z_MCP_LXE_READ (installed by SetupTranslationHelper). An empty target means that key has no
translation in that language. object_type is the LXE (SE63) object type: DTEL, DOMA, TABT, TRAN,
MSAG, MESS, CLAS, … — the same type SE63's short-text editor asks for; object_name is the object's
name as SE63 shows it. language accepts the LXE code (zhCN, enUS, deDE), a 2-letter ISO code (ZH,
EN, ZF = Chinese traditional) or a SAP 1-character key (1, E); a short code expands to one country
variant, reported in language. Reading the ORIGINAL language returns the source text as target
(target_is_original_language: true) — that is not a translation.`,
  inputSchema: {
    type: 'object',
    properties: {
      object_type: {
        type: 'string',
        description: 'LXE object type, e.g. DTEL, DOMA, TABT, TRAN, MSAG.',
      },
      object_name: {
        type: 'string',
        description: 'Object name, e.g. ZMY_DATA_ELEMENT.',
      },
      language: {
        type: 'string',
        description:
          'Target language: zhCN / enUS (LXE), ZH / EN (ISO) or 1 / E.',
      },
      source_language: {
        type: 'string',
        description: 'Source language (default: the original language).',
      },
      translation_area: {
        type: 'string',
        description: `SE63 translation area (default ${LXE_LOCAL_AREA}, local).`,
      },
    },
    required: ['object_type', 'object_name', 'language'],
  },
} as const;

interface GetTranslationArgs {
  object_type: string;
  object_name: string;
  language: string;
  source_language?: string;
  translation_area?: string;
}

function jsonResult(payload: unknown) {
  return {
    isError: false,
    content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
  };
}

export async function handleGetTranslation(
  context: HandlerContext,
  args: GetTranslationArgs,
) {
  const { connection, logger } = context;
  try {
    const { objtype, objname } = normalizeLxeObject(
      args?.object_type,
      args?.object_name,
    );
    const target = normalizeLxeLanguage(args?.language);
    const source = args?.source_language
      ? normalizeLxeLanguage(args.source_language)
      : undefined;
    const area = (args?.translation_area || LXE_LOCAL_AREA).trim();

    logger?.info(`GetTranslation ${objtype} ${objname} -> ${target.lxe}`);
    const result = await callLxeHelper(connection, LXE_HELPER_READ, {
      IV_OBJTYPE: objtype,
      IV_OBJNAME: objname,
      IV_TARGET_LANG: target.lxe,
      IV_SOURCE_LANG: source?.lxe ?? '',
      IV_CUSTMNR: area,
    });

    const message = String(result.EV_MESSAGE ?? '').trim();
    if (String(result.EV_STATUS ?? '').trim() !== 'S') {
      return return_error(new Error(`GetTranslation failed: ${message}`));
    }

    const texts = toTextPairs(result.ET_TEXTS);
    const original = String(result.EV_ORIG_LANG ?? '').trim();
    const targetSap = sapLanguageOfLxe(target.lxe);
    const originalSap = sapLanguageOfLxe(original);
    const isOriginal =
      targetSap && originalSap ? targetSap === originalSap : null;

    return jsonResult({
      success: true,
      object_type: objtype,
      object_name: objname,
      language: target.lxe,
      ...(target.expanded ? { language_requested: target.requested } : {}),
      original_language: original,
      target_is_original_language: isOriginal,
      translation_area: area,
      texts,
      untranslated_keys:
        isOriginal === true
          ? []
          : texts.filter((t) => t.source && !t.target).map((t) => t.key),
      message,
    });
  } catch (error) {
    if (!(error instanceof LxeHelperUnavailable)) {
      logger?.error('GetTranslation failed', error as any);
    }
    return return_error(error);
  }
}
