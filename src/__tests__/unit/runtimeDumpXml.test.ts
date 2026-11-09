/**
 * Runtime-dump parsing, ID normalisation and chapter slicing.
 *
 * Pinned against a REAL `BEHAVIOR_CONTRACT_VIOLATION` dump captured live on an
 * S/4 2023 system (both the `dump:dump` document and the first 110 lines of its
 * `/formatted` text, which span chapters kap0/kap1/kap2/kap3/kap5). Only the
 * foreign identifiers were substituted — user, host, SID and the terminated
 * program — per this repo's rule that a measurement's source belongs in the
 * comment and a customer's names do not. Every structural byte, the fixed-width
 * padding inside the dump id, and the line offsets are untouched, because those
 * are exactly what these tests exist to pin.
 *
 * The dump was recorded under `language="ZH"`, which is not incidental: it is
 * the case that proves chapter selection cannot go through the localised
 * `title`.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  normalizeRuntimeDumpId,
  parseDumpDocument,
  sliceDumpChapters,
  summariseDump,
} from '../../lib/runtimeDumpXml';

const DUMP_XML = readFileSync(
  join(__dirname, 'fixtures', 'runtimeDump.default.xml'),
  'utf8',
);
const DUMP_FORMATTED = readFileSync(
  join(__dirname, 'fixtures', 'runtimeDump.formatted.txt'),
  'utf8',
);

/** The id exactly as RuntimeListFeeds emits it, padding and all. */
const FEED_ID =
  '/sap/bc/adt/vit/runtime/dumps/20260924063758ABCHOST01_ABC_10%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20SOME.USR%20%20%20%20310%20%20%20%20%20%20%2019';
const BARE_ID =
  '20260924063758ABCHOST01_ABC_10%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20SOME.USR%20%20%20%20310%20%20%20%20%20%20%2019';

describe('normalizeRuntimeDumpId — the two tools must compose', () => {
  it('strips the feed href prefix, which is a DIFFERENT path from the readable one', () => {
    expect(normalizeRuntimeDumpId(FEED_ID)).toBe(BARE_ID);
  });

  it('leaves a bare id untouched', () => {
    expect(normalizeRuntimeDumpId(BARE_ID)).toBe(BARE_ID);
  });

  it('accepts the dump document own self link', () => {
    expect(normalizeRuntimeDumpId(`/sap/bc/adt/runtime/dump/${BARE_ID}`)).toBe(
      BARE_ID,
    );
  });

  it('accepts an absolute URL and a view suffix', () => {
    expect(
      normalizeRuntimeDumpId(
        `https://abchost01.example.com:44310/sap/bc/adt/runtime/dump/${BARE_ID}/formatted`,
      ),
    ).toBe(BARE_ID);
  });

  it('does NOT re-encode the %20 padding, which would 404', () => {
    expect(normalizeRuntimeDumpId(FEED_ID)).toContain('%20%20%20%20');
    expect(normalizeRuntimeDumpId(FEED_ID)).not.toContain('%2520');
  });

  it('still refuses a path it does not recognise, naming what is left', () => {
    expect(() => normalizeRuntimeDumpId('/some/other/thing')).toThrow(
      /still contains "\/"/,
    );
  });

  it('refuses an empty id', () => {
    expect(() => normalizeRuntimeDumpId('   ')).toThrow(/required/i);
  });
});

describe('parseDumpDocument — against the real captured payload', () => {
  it('reads the header facts the old scanner never looked for', () => {
    const doc = parseDumpDocument(DUMP_XML)!;
    expect(doc.header.error).toBe('BEHAVIOR_CONTRACT_VIOLATION');
    expect(doc.header.terminated_program).toBe('ZMY_DUMP_REPORT');
    expect(doc.header.author).toBe('SOME.USR');
    expect(doc.header.server_instance).toBe('ABCHOST01_ABC_10');
    expect(doc.header.title).toContain('BEHAVIOR_CONTRACT_VIOLATION');
    expect(doc.header.language).toBe('ZH');
  });

  it('reads every chapter with its line offset', () => {
    const doc = parseDumpDocument(DUMP_XML)!;
    expect(doc.chapters).toHaveLength(18);
    const byName = Object.fromEntries(doc.chapters.map((c) => [c.name, c]));
    expect(byName.kap0.line).toBe(10);
    expect(byName.kap1.line).toBe(15);
    expect(byName.kap3.line).toBe(44);
    expect(byName.kap3.category).toBe('ABAP Developer View');
  });

  it('keeps line offsets as numbers and system times as strings with leading zeros', () => {
    const doc = parseDumpDocument(DUMP_XML)!;
    expect(typeof doc.chapters[0].line).toBe('number');
    expect(doc.header.system_time).toBe('06:37:58');
  });

  it('exposes the links, including the formatted one', () => {
    const doc = parseDumpDocument(DUMP_XML)!;
    const contents = doc.links.find((l) => l.relation === 'contents');
    expect(contents?.uri).toContain('/formatted');
  });

  it('returns undefined for a non-XML payload rather than throwing', () => {
    expect(parseDumpDocument('plain text dump')).toBeUndefined();
    expect(parseDumpDocument(undefined)).toBeUndefined();
  });
});

describe('summariseDump — the two facts it may never omit', () => {
  it('names the exception class and the terminated program', () => {
    const summary = summariseDump(parseDumpDocument(DUMP_XML)!);
    expect(summary.error).toBe('BEHAVIOR_CONTRACT_VIOLATION');
    expect(summary.terminated_program).toBe('ZMY_DUMP_REPORT');
  });

  it('does NOT report a chapter heading as if it were the dump title', () => {
    // The previous scanner answered {title:"System environment", category:"System
    // Environment", line:"96"} — the first chapter's boilerplate — for this exact
    // payload. The title must be the dump's own.
    const summary = summariseDump(parseDumpDocument(DUMP_XML)!);
    expect(String(summary.title)).toContain('BEHAVIOR_CONTRACT_VIOLATION');
    expect(summary).not.toHaveProperty('line');
  });

  it('lists the chapters a caller may then ask for', () => {
    const summary = summariseDump(parseDumpDocument(DUMP_XML)!);
    expect(summary.chapter_count).toBe(18);
    const names = (summary.available_chapters as any[]).map((c) => c.name);
    expect(names).toContain('kap3');
  });
});

describe('sliceDumpChapters — the middle option between 3 fields and 120 KB', () => {
  const doc = parseDumpDocument(DUMP_XML)!;

  it('cuts a chapter at its own offset and stops at the next chapter offset', () => {
    const { chapters } = sliceDumpChapters(DUMP_FORMATTED, doc.chapters, [
      'error_analysis',
    ]);
    expect(chapters).toHaveLength(1);
    expect(chapters[0].name).toBe('kap3');
    // kap3 starts at 44; the next offset in the whole set is kap5 at 96.
    expect(chapters[0].line_count).toBe(52);
    expect(chapters[0].text).toContain(
      'The reason for the runtime error (see the list below) is',
    );
    expect(chapters[0].text).not.toContain('SAP Release');
  });

  it('carries the decisive sentence the old summary lost', () => {
    const { chapters } = sliceDumpChapters(DUMP_FORMATTED, doc.chapters, [
      'what_happened',
    ]);
    expect(chapters[0].text).toContain('ZMY_DUMP_REPORT');
  });

  it('selects language-independently: the alias works where the English title cannot', () => {
    // This dump is in ZH, so there is no chapter titled "Error analysis" at all.
    const byAlias = sliceDumpChapters(DUMP_FORMATTED, doc.chapters, [
      'error_analysis',
    ]);
    const byEnglishTitle = sliceDumpChapters(DUMP_FORMATTED, doc.chapters, [
      'Error analysis',
    ]);
    expect(byAlias.chapters).toHaveLength(1);
    expect(byEnglishTitle.chapters).toHaveLength(0);
    expect(byEnglishTitle.not_matched).toEqual(['Error analysis']);
  });

  it('accepts the raw chapter name and the untranslated category', () => {
    expect(
      sliceDumpChapters(DUMP_FORMATTED, doc.chapters, ['kap3']).chapters[0]
        ?.name,
    ).toBe('kap3');
    const byCategory = sliceDumpChapters(DUMP_FORMATTED, doc.chapters, [
      'User View',
    ]);
    expect(byCategory.chapters.map((c) => c.name).sort()).toEqual([
      'kap1',
      'kap2',
    ]);
  });

  it('accepts the localised title too, for a dump read in that language', () => {
    const byZhTitle = sliceDumpChapters(DUMP_FORMATTED, doc.chapters, [
      '错误分析',
    ]);
    expect(byZhTitle.chapters[0]?.name).toBe('kap3');
  });

  it('reports a selector that matched nothing instead of returning a silent empty list', () => {
    const { chapters, not_matched } = sliceDumpChapters(
      DUMP_FORMATTED,
      doc.chapters,
      ['no_such_chapter'],
    );
    expect(chapters).toEqual([]);
    expect(not_matched).toEqual(['no_such_chapter']);
  });

  it('returns several chapters in document order and never duplicates one', () => {
    const { chapters } = sliceDumpChapters(DUMP_FORMATTED, doc.chapters, [
      'error_analysis',
      'what_happened',
      'kap3',
    ]);
    expect(chapters.map((c) => c.name)).toEqual(['kap1', 'kap3']);
  });

  it('is a small fraction of the whole dump text', () => {
    // The fixture is the first 110 lines only; the dump it came from is 1178
    // lines / 118,335 characters, measured at capture. That full size is the
    // number this feature exists to avoid, so the budget is asserted against it
    // rather than against the truncated fixture.
    const FULL_FORMATTED_CHARS = 118_335;
    const { chapters } = sliceDumpChapters(DUMP_FORMATTED, doc.chapters, [
      'what_happened',
      'error_analysis',
    ]);
    const total = chapters.reduce((n, c) => n + c.text.length, 0);
    expect(total).toBeGreaterThan(0);
    expect(total).toBeLessThan(FULL_FORMATTED_CHARS / 10);
  });
});
