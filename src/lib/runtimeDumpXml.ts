/**
 * ABAP short-dump (`dump:dump`) parsing, ID normalisation and chapter slicing.
 *
 * Written against the REAL payload captured on DM2/310 for a
 * `BEHAVIOR_CONTRACT_VIOLATION` dump, not from documentation. Three things that
 * payload settles, each of which had already cost a caller a work-around:
 *
 * 1. **`RuntimeListFeeds` hands out a full ADT PATH, and the dump read endpoint
 *    wants the bare tail.** The feed's atom entry id is
 *    `/sap/bc/adt/vit/runtime/dumps/{id}` while the readable resource is
 *    `/sap/bc/adt/runtime/dump/{id}` — a DIFFERENT path, not just a prefix to
 *    drop blindly. Measured: the tail against `/runtime/dump/` answers 200, the
 *    feed href as-is answers 404. `normalizeRuntimeDumpId` bridges the two so
 *    the documented "list, then read" flow actually composes.
 *
 * 2. **The `dump:dump` document carries NO chapter bodies — only their line
 *    offsets into the `/formatted` view.** So "give me just the Error analysis
 *    chapter" is a slice of the formatted text at those offsets, which is why
 *    `sliceDumpChapters` takes the text and the chapter list together.
 *
 * 3. **A chapter's `title` is LOCALISED and its `name` is not.** This dump was
 *    recorded under `language="ZH"`, so its chapters read `错误分析`, not
 *    "Error analysis" — selecting chapters by English title would have matched
 *    nothing on the very dump that motivated the feature. The stable keys are
 *    `name` (`kap0`, `kap1`, `kap3`, …) and `category` ("ABAP Developer View",
 *    which SAP does NOT translate). `CHAPTER_ALIASES` maps readable,
 *    language-independent selectors onto the `name` keys.
 */

import { XMLParser } from 'fast-xml-parser';

export interface DumpChapter {
  name: string;
  title?: string;
  category?: string;
  line?: number;
  chapter_order?: number;
  category_order?: number;
}

export interface DumpLink {
  relation?: string;
  uri?: string;
  content_type?: string;
}

export interface DumpHeader {
  title?: string;
  error?: string;
  exception?: string;
  terminated_program?: string;
  author?: string;
  datetime?: string;
  system_date?: string;
  system_time?: string;
  server_instance?: string;
  language?: string;
}

export interface DumpDocument {
  header: DumpHeader;
  chapters: DumpChapter[];
  links: DumpLink[];
}

/**
 * Language-independent chapter selectors onto SAP's own `name` keys.
 *
 * These `kap*` names are the stable identifiers in the dump document; the
 * human titles beside them are whatever language the dump was recorded in.
 */
export const CHAPTER_ALIASES: Record<string, string> = {
  short_text: 'kap0',
  what_happened: 'kap1',
  what_can_you_do: 'kap2',
  error_analysis: 'kap3',
  system_environment: 'kap5',
  user_and_transaction: 'kap6',
  where_terminated: 'kap7',
  system_fields: 'kap9',
  selected_variables: 'kap10',
  active_calls: 'kap11',
  internal_notes: 'kap12',
  kernel_calls: 'kap13',
  relevant_programs: 'kap14',
  memory_usage: 'kap40',
};

function str(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  const s = String(value).trim();
  return s.length > 0 ? s : undefined;
}

function num(value: unknown): number | undefined {
  const s = str(value);
  if (s === undefined) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Make a `RuntimeListFeeds` dump id usable by the dump read endpoint.
 *
 * Accepts the bare id, the feed's full `/sap/bc/adt/vit/runtime/dumps/{id}`
 * href, the document's own `/sap/bc/adt/runtime/dump/{id}` self link, an
 * absolute URL of either, and any of those carrying a `/formatted`,
 * `/summary` or `/unformatted` view suffix. The `%20` padding inside the id is
 * left EXACTLY as it arrives — it is already percent-encoded on the wire and
 * re-encoding it produces a 404.
 */
export function normalizeRuntimeDumpId(rawId: string): string {
  let id = (rawId ?? '').trim();
  if (!id) {
    throw new Error(
      'dump_id is required. Use RuntimeListFeeds to find dump IDs first.',
    );
  }

  // Absolute URL → path.
  const schemeMatch = /^[a-z][a-z0-9+.-]*:\/\/[^/]+(\/.*)$/i.exec(id);
  if (schemeMatch) id = schemeMatch[1];

  for (const prefix of [
    '/sap/bc/adt/vit/runtime/dumps/',
    '/sap/bc/adt/runtime/dump/',
  ]) {
    if (id.startsWith(prefix)) {
      id = id.slice(prefix.length);
      break;
    }
  }

  for (const suffix of ['/formatted', '/summary', '/unformatted']) {
    if (id.endsWith(suffix)) {
      id = id.slice(0, -suffix.length);
      break;
    }
  }

  if (id.includes('/')) {
    throw new Error(
      `Runtime dump ID still contains "/" after stripping the known ADT dump prefixes: "${id}". ` +
        'Pass either the bare dump id or a /sap/bc/adt/vit/runtime/dumps/… or /sap/bc/adt/runtime/dump/… reference.',
    );
  }

  return id;
}

export function parseDumpDocument(xml: unknown): DumpDocument | undefined {
  if (typeof xml !== 'string' || !xml.trim().startsWith('<')) return undefined;

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    isArray: (name) => name === 'dump:chapter' || name === 'dump:link',
    // Dump ids, system times and line offsets are SAP strings whose leading
    // zeros carry meaning; the same coercion this project has already paid for
    // in three other parsers.
    parseTagValue: false,
    parseAttributeValue: false,
  });

  let parsed: any;
  try {
    parsed = parser.parse(xml);
  } catch {
    return undefined;
  }

  const root = parsed?.['dump:dump'];
  if (!root) return undefined;

  const chapters = asArray<any>(root['dump:chapters']?.['dump:chapter'])
    .map((c) => ({
      name: str(c?.['@_name']) ?? '',
      title: str(c?.['@_title']),
      category: str(c?.['@_category']),
      line: num(c?.['@_line']),
      chapter_order: num(c?.['@_chapterOrder']),
      category_order: num(c?.['@_categoryOrder']),
    }))
    .filter((c) => c.name.length > 0);

  const links = asArray<any>(root['dump:links']?.['dump:link']).map((l) => ({
    relation: str(l?.['@_relation']),
    uri: str(l?.['@_uri']),
    content_type: str(l?.['@_contentType']),
  }));

  return {
    header: {
      title: str(root['@_title']),
      error: str(root['@_error']),
      exception: str(root['@_exception']),
      terminated_program: str(root['@_terminatedProgram']),
      author: str(root['@_author']),
      datetime: str(root['@_datetime']),
      system_date: str(root['@_systemDate']),
      system_time: str(root['@_systemTime']),
      server_instance: str(root['@_serverInstance']),
      language: str(root['@_language']),
    },
    chapters,
    links,
  };
}

/**
 * The compact answer to "what blew up, where".
 *
 * Deliberately built from the dump's OWN shape rather than by scanning for
 * generically-interesting key names: the previous scanner walked a flat list
 * (`title`/`category`/`line`/…), met the chapter array first, and spent its
 * whole budget on chapter boilerplate — so a summary of a
 * `BEHAVIOR_CONTRACT_VIOLATION` in `Z_FSA_P07_REPRO` reported
 * `{title: "System environment", category: "System Environment", line: "96"}`
 * and named neither the error nor the program. The exception class and the
 * terminated program are the two facts a dump summary may never omit.
 */
export function summariseDump(doc: DumpDocument): Record<string, unknown> {
  const { header, chapters } = doc;
  return {
    title: header.title,
    error: header.error,
    exception: header.exception,
    terminated_program: header.terminated_program,
    user: header.author,
    datetime: header.datetime,
    system_date: header.system_date,
    system_time: header.system_time,
    server_instance: header.server_instance,
    // The language the dump TEXT is in — chapter titles follow it, which is why
    // chapters must be selected by name/category, not by their title.
    dump_language: header.language,
    chapter_count: chapters.length,
    available_chapters: chapters.map((c) => ({
      name: c.name,
      title: c.title,
      category: c.category,
    })),
  };
}

export interface SlicedChapter extends DumpChapter {
  text: string;
  line_count: number;
}

export interface ChapterSliceResult {
  chapters: SlicedChapter[];
  /** Selectors that matched no chapter — so an empty result is never read as "the chapter is empty". */
  not_matched: string[];
}

function matchesSelector(chapter: DumpChapter, selector: string): boolean {
  const wanted = selector.trim().toLowerCase();
  if (!wanted) return false;
  const aliased = CHAPTER_ALIASES[wanted];
  if (aliased && chapter.name.toLowerCase() === aliased) return true;
  if (chapter.name.toLowerCase() === wanted) return true;
  if (chapter.category && chapter.category.toLowerCase() === wanted)
    return true;
  if (chapter.title && chapter.title.toLowerCase() === wanted) return true;
  return false;
}

/**
 * Cut the requested chapters out of the `/formatted` dump text.
 *
 * A chapter's body runs from its own `line` up to the next-larger `line` across
 * ALL chapters — the chapters are ordered for display, not by offset, so the
 * boundary cannot be taken from the neighbouring array entry.
 */
export function sliceDumpChapters(
  formattedText: string,
  chapters: DumpChapter[],
  selectors: string[],
): ChapterSliceResult {
  const lines = String(formattedText ?? '').split(/\r?\n/);
  const offsets = chapters
    .map((c) => c.line)
    .filter((l): l is number => typeof l === 'number')
    .sort((a, b) => a - b);

  const matched: SlicedChapter[] = [];
  const notMatched: string[] = [];

  for (const selector of selectors) {
    const hits = chapters.filter((c) => matchesSelector(c, selector));
    if (hits.length === 0) {
      notMatched.push(selector);
      continue;
    }
    for (const hit of hits) {
      if (matched.some((m) => m.name === hit.name)) continue;
      const start = typeof hit.line === 'number' ? hit.line : 1;
      const next = offsets.find((o) => o > start);
      const end = next !== undefined ? next - 1 : lines.length;
      const body = lines.slice(start - 1, end);
      matched.push({
        ...hit,
        text: body.join('\n'),
        line_count: body.length,
      });
    }
  }

  matched.sort((a, b) => (a.line ?? 0) - (b.line ?? 0));
  return { chapters: matched, not_matched: notMatched };
}
