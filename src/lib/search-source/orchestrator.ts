import type { HandlerContext } from '../handlers/interfaces';
import { scanLines } from './lineScanner';
import {
  createPackageContentsFetcher,
  type EnumerateInput,
  enumerateScanTargets,
  type PackageContentsFetcher,
  type ScanObjectType,
} from './packageEnumerator';
import {
  createPackagePatternResolver,
  type PackageResolverDeps,
  resolvePackagePatterns,
} from './packageResolver';
import {
  createSourceReaderDeps,
  type ReadFailure,
  type ReadSourceUnitsDeps,
  readSourceUnits,
  type SourceVersion,
} from './sourceReader';

export interface OrchestratorInput {
  query: string;
  query2?: string;
  exclude?: string[];
  packages: string[];
  include_subpackages?: boolean;
  object_filter?: string;
  object_types?: readonly ScanObjectType[];
  exclude_comments?: boolean;
  max_hits_per_object?: number;
  emit_no_hits?: boolean;
  max_objects?: number;
  concurrency?: number;
  version?: SourceVersion;
  /** Internal scan deadline in ms. When exceeded, returns hits gathered so far with truncated.by_timeout=true. */
  time_budget_ms?: number;
  /** Read a class's CCDEF/CCIMP/CCAU/CCMAC includes as well (default true). */
  class_includes?: boolean;
  /** Return the compact hit shape {object, include, line, text}. */
  hits_only?: boolean;
  /** Cap the serialized size of `results`; sets truncated.by_max_bytes. */
  max_bytes?: number;
}

export interface SearchHit {
  devclass: string;
  object_type: ScanObjectType;
  object_name: string;
  include: string;
  line: number;
  snippet: string;
}

/** Compact hit shape used when hits_only is set. */
export interface CompactHit {
  object: string;
  include: string;
  line: number;
  text: string;
}

export interface NoHitEntry {
  devclass: string;
  object_type: ScanObjectType;
  object_name: string;
}

export interface OrchestratorResult {
  results: SearchHit[] | CompactHit[];
  no_hits?: NoHitEntry[];
  scanned: {
    packages: number;
    objects: number;
    /** Source units actually read (a class contributes up to 5). */
    sources: number;
    /**
     * Total lines actually scanned. This is the honest coverage number: "0 hits
     * over 32 lines" for a 951-line class is a scan that read almost nothing,
     * and without this the two are indistinguishable (I-23).
     */
    source_lines: number;
    /** Source units that could not be read; see read_failures. */
    read_failures: number;
  };
  /**
   * Units the scan could not read. A failed read yields no hits, which is
   * byte-identical to "no match", so it is reported rather than swallowed.
   */
  read_failures?: ReadFailure[];
  /** Hits dropped by max_bytes. */
  results_omitted?: number;
  truncated: {
    by_object_cap: boolean;
    by_max_objects: boolean;
    /** True when a time_budget_ms deadline was exceeded; results contain hits gathered before the cutoff. */
    by_timeout: boolean;
    /** True when max_bytes cut the result list. */
    by_max_bytes: boolean;
  };
}

export interface OrchestratorDeps {
  fetchPackageContents: PackageContentsFetcher;
  sourceReader: ReadSourceUnitsDeps;
  resolvePackages: (entries: string[]) => Promise<string[]>;
  /** Injectable clock for deterministic tests. Defaults to Date.now. */
  now?: () => number;
}

const DEFAULTS = {
  include_subpackages: true,
  object_types: ['PROG', 'FUGR', 'CLAS'] as const,
  exclude_comments: false,
  max_hits_per_object: 100,
  emit_no_hits: false,
  max_objects: 500,
  concurrency: 8,
  version: 'active' as SourceVersion,
};

async function runWithLimit<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>,
  onStop?: () => void,
  shouldStop?: () => boolean,
): Promise<void> {
  let next = 0;
  async function pump(): Promise<void> {
    while (true) {
      if (shouldStop?.()) {
        onStop?.();
        return;
      }
      const idx = next++;
      if (idx >= items.length) return;
      await worker(items[idx]);
    }
  }
  const n = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: n }, () => pump()));
}

export async function runSearchSource(
  deps: OrchestratorDeps,
  input: OrchestratorInput,
): Promise<OrchestratorResult> {
  if (!input.query || input.query.length === 0) {
    throw new Error('query must be a non-empty string');
  }
  if (!input.packages || input.packages.length === 0) {
    throw new Error('packages must contain at least one entry');
  }
  if (input.exclude && input.exclude.length > 3) {
    throw new Error('exclude may not contain more than 3 entries');
  }

  const maxHits = input.max_hits_per_object ?? DEFAULTS.max_hits_per_object;
  const maxObjects = input.max_objects ?? DEFAULTS.max_objects;
  const concurrency = Math.min(
    16,
    Math.max(1, input.concurrency ?? DEFAULTS.concurrency),
  );
  const emitNoHits = input.emit_no_hits ?? DEFAULTS.emit_no_hits;
  const version = input.version ?? DEFAULTS.version;
  const now = deps.now ?? Date.now;
  const timeBudgetMs =
    input.time_budget_ms != null && input.time_budget_ms > 0
      ? input.time_budget_ms
      : null;
  const deadline = timeBudgetMs != null ? now() + timeBudgetMs : null;
  const deadlinePassed = (): boolean => deadline != null && now() >= deadline;

  const resolvedPackages = await deps.resolvePackages(input.packages);
  const enumerateInput: EnumerateInput = {
    packages: resolvedPackages,
    include_subpackages:
      input.include_subpackages ?? DEFAULTS.include_subpackages,
    object_filter: input.object_filter,
    object_types: input.object_types ?? DEFAULTS.object_types,
  };
  const allTargets =
    resolvedPackages.length === 0
      ? []
      : await enumerateScanTargets(deps.fetchPackageContents, enumerateInput);
  const truncatedByMaxObjects = allTargets.length > maxObjects;
  const targets = truncatedByMaxObjects
    ? allTargets.slice(0, maxObjects)
    : allTargets;

  const allHits: SearchHit[] = [];
  const noHits: NoHitEntry[] = [];
  const readFailures: ReadFailure[] = [];
  let sourcesScanned = 0;
  let sourceLinesScanned = 0;
  let truncatedByObjectCap = false;
  let timedOut = false;

  await runWithLimit(
    targets,
    concurrency,
    async (target) => {
      let totalForTarget = 0;
      let capHitForTarget = false;
      const targetHits: SearchHit[] = [];

      for await (const unit of readSourceUnits(
        deps.sourceReader,
        target,
        version,
        {
          classIncludes: input.class_includes,
          onReadFailure: (failure) => readFailures.push(failure),
        },
      )) {
        if (deadlinePassed()) {
          timedOut = true;
          break;
        }
        sourcesScanned++;
        sourceLinesScanned += unit.lines.length;
        const remaining = maxHits - totalForTarget;
        if (remaining <= 0) {
          const probe = scanLines(unit.lines, {
            query: input.query,
            query2: input.query2,
            exclude: input.exclude,
            exclude_comments: input.exclude_comments,
            max_hits: 1,
          });
          if (probe.hits.length > 0) {
            capHitForTarget = true;
            break;
          }
          continue;
        }
        const scan = scanLines(unit.lines, {
          query: input.query,
          query2: input.query2,
          exclude: input.exclude,
          exclude_comments: input.exclude_comments,
          max_hits: remaining,
        });
        for (const h of scan.hits) {
          targetHits.push({
            devclass: target.devclass,
            object_type: target.object_type,
            object_name: target.object_name,
            include: unit.include,
            line: h.line,
            snippet: h.snippet,
          });
        }
        totalForTarget += scan.hits.length;
        if (scan.capped) {
          capHitForTarget = true;
          break;
        }
      }

      if (capHitForTarget) truncatedByObjectCap = true;
      if (targetHits.length === 0 && emitNoHits) {
        noHits.push({
          devclass: target.devclass,
          object_type: target.object_type,
          object_name: target.object_name,
        });
      } else {
        allHits.push(...targetHits);
      }
    },
    () => {
      // onStop may be called by multiple pump coroutines under concurrency > 1; setting a boolean is idempotent.
      timedOut = true;
    },
    deadlinePassed,
  );

  allHits.sort((a, b) => {
    if (a.devclass !== b.devclass) return a.devclass < b.devclass ? -1 : 1;
    if (a.object_name !== b.object_name)
      return a.object_name < b.object_name ? -1 : 1;
    if (a.include !== b.include) return a.include < b.include ? -1 : 1;
    return a.line - b.line;
  });

  if (emitNoHits) {
    noHits.sort((a, b) => {
      if (a.devclass !== b.devclass) return a.devclass < b.devclass ? -1 : 1;
      if (a.object_type !== b.object_type)
        return a.object_type < b.object_type ? -1 : 1;
      return a.object_name < b.object_name ? -1 : 1;
    });
  }

  const shaped: SearchHit[] | CompactHit[] = input.hits_only
    ? allHits.map((hit) => ({
        object: hit.object_name,
        include: hit.include,
        line: hit.line,
        text: hit.snippet,
      }))
    : allHits;

  // max_bytes trims the LIST, never a hit: a half-serialized entry would be
  // worse than a missing one. Whatever is dropped is counted, so the caller is
  // never shown a short list that looks complete.
  let results: SearchHit[] | CompactHit[] = shaped;
  let omitted = 0;
  let truncatedByMaxBytes = false;
  if (input.max_bytes != null && input.max_bytes > 0) {
    const kept: any[] = [];
    let used = 2; // the enclosing []
    for (const hit of shaped as any[]) {
      const size = JSON.stringify(hit).length + 1; // + separator
      if (used + size > input.max_bytes) break;
      used += size;
      kept.push(hit);
    }
    if (kept.length < shaped.length) {
      omitted = shaped.length - kept.length;
      truncatedByMaxBytes = true;
      results = kept as SearchHit[] | CompactHit[];
    }
  }

  const result: OrchestratorResult = {
    results,
    scanned: {
      packages: resolvedPackages.length,
      objects: targets.length,
      sources: sourcesScanned,
      source_lines: sourceLinesScanned,
      read_failures: readFailures.length,
    },
    truncated: {
      by_object_cap: truncatedByObjectCap,
      by_max_objects: truncatedByMaxObjects,
      by_timeout: timedOut,
      by_max_bytes: truncatedByMaxBytes,
    },
  };
  if (emitNoHits) result.no_hits = noHits;
  if (readFailures.length > 0) result.read_failures = readFailures;
  if (omitted > 0) result.results_omitted = omitted;
  return result;
}

export function runSearchSourceWithContext(
  ctx: HandlerContext,
  input: OrchestratorInput,
): Promise<OrchestratorResult> {
  const searchObjects = createPackagePatternResolver(ctx);
  const resolverDeps: PackageResolverDeps = { searchObjects };
  return runSearchSource(
    {
      fetchPackageContents: createPackageContentsFetcher(ctx),
      sourceReader: createSourceReaderDeps(ctx),
      resolvePackages: (entries) =>
        resolvePackagePatterns(resolverDeps, entries),
    },
    input,
  );
}
