import { XMLParser } from 'fast-xml-parser';
import { createAdtClient } from '../clients';
import type { HandlerContext } from '../handlers/interfaces';
import { encodeSapObjectName, makeAdtRequestWithTimeout } from '../utils';
import type { EnumeratedObject, ScanObjectType } from './packageEnumerator';

export type SourceVersion = 'active' | 'inactive';

export interface SourceUnit {
  include: string;
  lines: string[];
}

/**
 * The four ADT sub-includes of a class. `source/main` does NOT contain them.
 *
 * MEASURED on S/4HANA 2023 FPS02: a RAP behavior pool's source/main is a 7-line
 * skeleton while its `implementations` include (CCIMP) holds 89 lines — all of
 * the logic. A class whose unit tests live in `testclasses` had 227 lines in main
 * and 394 in the include. Scanning main alone therefore reads almost none of the
 * code and answers "no hits" for text it never opened, which is the I-23 defect:
 * indistinguishable from "read nothing".
 */
export const CLASS_INCLUDE_PARTS = [
  'definitions',
  'implementations',
  'testclasses',
  'macros',
] as const;

export type ClassIncludePart = (typeof CLASS_INCLUDE_PARTS)[number];

/** Classic ABAP names, so an ABAPer recognises the unit in a hit. */
const CLASS_INCLUDE_LABEL: Record<ClassIncludePart, string> = {
  definitions: 'CCDEF',
  implementations: 'CCIMP',
  testclasses: 'CCAU',
  macros: 'CCMAC',
};

/**
 * A source unit that could NOT be read.
 *
 * Reported rather than swallowed: a failed read contributes zero hits, which is
 * byte-identical to "this object does not contain the query" unless the failure
 * is surfaced.
 */
export interface ReadFailure {
  object_name: string;
  unit: string;
  reason: string;
}

export interface ReadSourceUnitsOptions {
  /** Read a class's CCDEF/CCIMP/CCAU/CCMAC includes as well (default true). */
  classIncludes?: boolean;
  onReadFailure?: (failure: ReadFailure) => void;
}

export interface FugrChild {
  objecttype: string;
  objectname: string;
}

export interface ReadSourceUnitsDeps {
  readProgram(
    programName: string,
    version: SourceVersion,
  ): Promise<string | null>;
  readInclude(includeName: string): Promise<string | null>;
  readClassMain(
    className: string,
    version: SourceVersion,
  ): Promise<string | null>;
  /**
   * Optional so a caller that only exercises the main include (and every existing
   * test double) keeps working; when absent, class sub-includes are skipped.
   */
  readClassInclude?(
    className: string,
    part: ClassIncludePart,
    version: SourceVersion,
  ): Promise<string | null>;
  fetchFugrStructure(fugrName: string): Promise<FugrChild[]>;
  readFugrFm(fugrName: string, fmName: string): Promise<string | null>;
  logger?: { debug?: (msg: string) => void; warn?: (msg: string) => void };
}

function splitLines(text: string): string[] {
  return text.split(/\r?\n/);
}

async function safe<T>(
  op: () => Promise<T>,
  logger: ReadSourceUnitsDeps['logger'],
  desc: string,
  onFailure?: (reason: string) => void,
): Promise<T | null> {
  try {
    return await op();
  } catch (e: any) {
    const reason = String(e?.message ?? e);
    logger?.debug?.(`[search-source] ${desc} failed: ${reason}`);
    // A swallowed read failure looks exactly like "no match in this object".
    // Hand it back so the scan can say what it could not read.
    onFailure?.(reason);
    return null;
  }
}

function isViewFm(name: string): boolean {
  return name.length >= 4 && name.slice(0, 4).toUpperCase() === 'VIEW';
}

function sortFugrChildren(children: FugrChild[]): FugrChild[] {
  return [...children].sort((a, b) => {
    if (a.objecttype !== b.objecttype)
      return a.objecttype < b.objecttype ? -1 : 1;
    return a.objectname < b.objectname ? -1 : 1;
  });
}

export async function* readSourceUnits(
  deps: ReadSourceUnitsDeps,
  target: EnumeratedObject,
  version: SourceVersion = 'active',
  options: ReadSourceUnitsOptions = {},
): AsyncGenerator<SourceUnit> {
  const logger = deps.logger;
  const fail = (unit: string) => (reason: string) =>
    options.onReadFailure?.({
      object_name: target.object_name,
      unit,
      reason,
    });
  switch (target.object_type as ScanObjectType) {
    case 'PROG': {
      const src = await safe(
        () => deps.readProgram(target.object_name, version),
        logger,
        `read PROG ${target.object_name}`,
        fail(target.object_name),
      );
      if (src !== null && src !== undefined) {
        yield { include: target.object_name, lines: splitLines(src) };
      }
      return;
    }
    case 'CLAS': {
      const src = await safe(
        () => deps.readClassMain(target.object_name, version),
        logger,
        `read CLAS ${target.object_name}`,
        fail(target.object_name),
      );
      if (src !== null && src !== undefined) {
        yield { include: target.object_name, lines: splitLines(src) };
      }
      // The method bodies of local classes, the unit tests and the macros are
      // NOT in source/main — see CLASS_INCLUDE_PARTS. Reading main alone is how
      // a 89-line RAP handler gets reported as a 7-line object with no hits.
      if (options.classIncludes === false || !deps.readClassInclude) return;
      for (const part of CLASS_INCLUDE_PARTS) {
        const unit = `${target.object_name} (${CLASS_INCLUDE_LABEL[part]})`;
        const includeSrc = await safe(
          // biome-ignore lint/style/noNonNullAssertion: guarded above
          () => deps.readClassInclude!(target.object_name, part, version),
          logger,
          `read CLAS ${unit}`,
          fail(unit),
        );
        if (includeSrc !== null && includeSrc !== undefined) {
          yield { include: unit, lines: splitLines(includeSrc) };
        }
      }
      return;
    }
    case 'FUGR': {
      const children = await safe(
        () => deps.fetchFugrStructure(target.object_name),
        logger,
        `fetch FUGR structure ${target.object_name}`,
        fail(`${target.object_name} (structure)`),
      );
      if (!children) return;
      const seen = new Set<string>();
      const filtered: FugrChild[] = [];
      for (const c of children) {
        if (c.objecttype === 'FUGR/FF' && isViewFm(c.objectname)) continue;
        if (!c.objecttype.startsWith('FUGR/')) continue;
        const key = `${c.objecttype}|${c.objectname}`;
        if (seen.has(key)) continue;
        seen.add(key);
        filtered.push(c);
      }
      const ordered = sortFugrChildren(filtered);
      for (const c of ordered) {
        const src =
          c.objecttype === 'FUGR/FF'
            ? await safe(
                () => deps.readFugrFm(target.object_name, c.objectname),
                logger,
                `read FUGR/FF ${target.object_name}/${c.objectname}`,
                fail(c.objectname),
              )
            : await safe(
                () => deps.readInclude(c.objectname),
                logger,
                `read FUGR include ${c.objectname}`,
                fail(c.objectname),
              );
        if (src !== null && src !== undefined) {
          yield { include: c.objectname, lines: splitLines(src) };
        }
      }
      return;
    }
  }
}

interface FlatStructureNode {
  nodeid?: string;
  parentid?: string;
  objecttype?: string;
  objectname?: string;
}

function parseFugrChildrenFromXml(xml: string): FugrChild[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
  });
  const parsed = parser.parse(xml);
  let nodes = parsed?.['projectexplorer:objectstructure']?.[
    'projectexplorer:node'
  ] as FlatStructureNode | FlatStructureNode[] | undefined;
  if (!nodes) return [];
  if (!Array.isArray(nodes)) nodes = [nodes];
  const out: FugrChild[] = [];
  for (const node of nodes) {
    if (!node.objecttype || !node.objectname) continue;
    if (!node.objecttype.startsWith('FUGR/')) continue;
    out.push({ objecttype: node.objecttype, objectname: node.objectname });
  }
  return out;
}

export function createSourceReaderDeps(
  ctx: HandlerContext,
): ReadSourceUnitsDeps {
  const client = createAdtClient(ctx.connection, ctx.logger);
  return {
    async readProgram(programName, version) {
      const r = await client.getProgram().read({ programName }, version);
      const data = r?.readResult?.data;
      return typeof data === 'string' ? data : null;
    },
    async readInclude(includeName) {
      const r = await makeAdtRequestWithTimeout(
        ctx.connection,
        `/sap/bc/adt/programs/includes/${encodeSapObjectName(includeName)}/source/main`,
        'GET',
        'default',
      );
      return typeof r?.data === 'string' ? r.data : null;
    },
    async readClassMain(className, version) {
      const r = await client.getClass().read({ className }, version);
      const data = r?.readResult?.data;
      return typeof data === 'string' ? data : null;
    },
    async readClassInclude(className, part, version) {
      // /includes/{part} is a separate ADT resource from /source/main; the
      // version selector is the same query parameter the class source uses.
      const r = await makeAdtRequestWithTimeout(
        ctx.connection,
        `/sap/bc/adt/oo/classes/${encodeSapObjectName(className.toLowerCase())}/includes/${part}` +
          (version === 'inactive' ? '?version=inactive' : ''),
        'GET',
        'default',
      );
      return typeof r?.data === 'string' ? r.data : null;
    },
    async fetchFugrStructure(fugrName) {
      const r = await client.getUtils().getObjectStructure('FUGR/F', fugrName);
      return typeof r?.data === 'string'
        ? parseFugrChildrenFromXml(r.data)
        : [];
    },
    async readFugrFm(fugrName, fmName) {
      const r = await makeAdtRequestWithTimeout(
        ctx.connection,
        `/sap/bc/adt/functions/groups/${encodeSapObjectName(fugrName.toLowerCase())}/fmodules/${encodeSapObjectName(fmName.toLowerCase())}/source/main`,
        'GET',
        'default',
      );
      return typeof r?.data === 'string' ? r.data : null;
    },
    logger: ctx.logger,
  };
}
