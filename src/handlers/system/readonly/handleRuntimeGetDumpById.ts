import { AdtRuntimeClient } from '@mcp-abap-adt/adt-clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  CHAPTER_ALIASES,
  normalizeRuntimeDumpId,
  parseDumpDocument,
  sliceDumpChapters,
  summariseDump,
} from '../../../lib/runtimeDumpXml';
import { return_error, return_response } from '../../../lib/utils';
import { parseRuntimePayloadToJson } from './runtimePayloadParser';

export const TOOL_DEFINITION = {
  name: 'RuntimeGetDumpById',
  available_in: ['onprem'] as const,
  description:
    '[runtime] Read one ABAP runtime dump. Accepts the id RuntimeListFeeds returns verbatim. Use chapters to get just the sections that explain the dump instead of the whole ~120 KB text.',
  notes: `Takes the RuntimeListFeeds id AS-IS: that id is the full ADT path
(/sap/bc/adt/vit/runtime/dumps/{id}) while the readable resource is a DIFFERENT path
(/sap/bc/adt/runtime/dump/{id}), so the prefix is stripped here rather than rejected. An
absolute URL, the document's own self link, and a /formatted|/summary|/unformatted suffix
are all accepted too.

summary is built from the dump's own shape, so it always names error (the exception class)
and terminated_program, plus available_chapters — the list of what chapters can ask for.

chapters cuts named sections out of the formatted text (two reads: metadata + text).
Select them language-independently: ${Object.keys(CHAPTER_ALIASES).join(', ')}, or a raw
chapter name (kap0, kap3, …) or category ("ABAP Developer View"). A chapter's TITLE is in
the language the dump was recorded in — a ZH dump has no chapter called "Error analysis" —
so titles work but are not portable. Selectors that match nothing come back in
chapters_not_matched, so an empty result is never read as "that chapter is empty".

view=formatted returns the whole SAPGUI-style text (~120 KB on a real dump) and is rarely
what you want; chapters is the middle option between it and summary.`,
  inputSchema: {
    type: 'object',
    properties: {
      dump_id: {
        type: 'string',
        description:
          'Dump ID, exactly as RuntimeListFeeds returns it (full ADT path accepted).',
      },
      view: {
        type: 'string',
        enum: ['default', 'summary', 'formatted'],
        description:
          'Payload to read: default (XML), summary (HTML), formatted (full long text).',
        default: 'default',
      },
      response_mode: {
        type: 'string',
        enum: ['payload', 'summary', 'both'],
        description:
          '"summary" — key facts only, "payload" — full parsed dump, "both".',
        default: 'both',
      },
      chapters: {
        type: 'array',
        items: { type: 'string', minLength: 1 },
        description:
          'Return only these chapters of the dump text, e.g. ["what_happened","error_analysis"]. See notes for selectors.',
      },
    },
    required: ['dump_id'],
  },
} as const;

interface RuntimeGetDumpByIdArgs {
  dump_id: string;
  view?: 'default' | 'summary' | 'formatted';
  response_mode?: 'payload' | 'summary' | 'both';
  chapters?: string[];
}

export async function handleRuntimeGetDumpById(
  context: HandlerContext,
  args: RuntimeGetDumpByIdArgs,
) {
  const { connection, logger } = context;

  try {
    const dumpId = normalizeRuntimeDumpId(args?.dump_id);
    const view = args.view ?? 'default';
    const responseMode = args.response_mode ?? 'both';
    const wantedChapters = Array.isArray(args.chapters)
      ? args.chapters.filter((c) => typeof c === 'string' && c.trim().length)
      : [];

    const runtimeClient = new AdtRuntimeClient(connection, logger);
    const dumps = runtimeClient.getDumps();

    const response = await dumps.getById(dumpId, { view });
    const parsedPayload = parseRuntimePayloadToJson(response.data);

    const result: Record<string, unknown> = {
      success: true,
      dump_id: dumpId,
      view,
      status: response.status,
    };

    // The chapter metadata lives only in the XML document. When the caller asked
    // for another view, read it separately rather than reporting a summary the
    // view cannot support.
    let doc = parseDumpDocument(response.data);
    if (!doc && (wantedChapters.length > 0 || responseMode !== 'payload')) {
      try {
        const meta = await dumps.getById(dumpId, { view: 'default' });
        doc = parseDumpDocument(meta.data);
      } catch (error) {
        logger?.debug?.(
          `Could not read the dump metadata document for ${dumpId}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    if (responseMode === 'summary' || responseMode === 'both') {
      result.summary = doc
        ? summariseDump(doc)
        : {
            unavailable:
              'The dump metadata document could not be read, so no summary was built. ' +
              'The payload below is what SAP returned.',
          };
    }

    if (wantedChapters.length > 0) {
      if (!doc) {
        result.chapters_error =
          'Chapters were requested but the dump metadata document could not be read, ' +
          'so the chapter offsets are unknown.';
      } else {
        const formatted =
          view === 'formatted' && typeof response.data === 'string'
            ? response.data
            : String(
                (await dumps.getById(dumpId, { view: 'formatted' })).data ?? '',
              );
        const sliced = sliceDumpChapters(
          formatted,
          doc.chapters,
          wantedChapters,
        );
        result.chapters = sliced.chapters;
        result.chapters_not_matched = sliced.not_matched;
      }
    }

    if (responseMode === 'payload' || responseMode === 'both') {
      result.payload = parsedPayload;
    }

    return return_response({
      data: JSON.stringify(result, null, 2),
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      config: response.config,
    });
  } catch (error: any) {
    logger?.error('Error reading runtime dump by ID:', error);
    return return_error(error);
  }
}
