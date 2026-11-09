/**
 * SearchSource coverage contract (F-7 / I-23).
 *
 * The defect: a class was scanned as ONE source unit (source/main), which does
 * not contain the method bodies of local classes, the unit tests or the macros.
 * Measured on S/4HANA 2023 FPS02, a RAP behavior pool's source/main is a 7-line
 * skeleton while its CCIMP include holds the 89 lines of actual logic — so the
 * scan answered "no hits" for code it had never opened, which a caller cannot
 * tell apart from "this text is not there".
 */

import {
  type OrchestratorDeps,
  runSearchSource,
} from '../../../lib/search-source/orchestrator';
import {
  type ReadFailure,
  type ReadSourceUnitsDeps,
  readSourceUnits,
  type SourceUnit,
} from '../../../lib/search-source/sourceReader';

const CLASS_TARGET = {
  devclass: 'ZMY_PKG',
  object_type: 'CLAS' as const,
  object_name: 'ZMY_CLASS',
};

/** Deps whose main include is a skeleton and whose CCIMP holds the real code. */
function depsWithIncludes(
  overrides: Partial<ReadSourceUnitsDeps> = {},
): ReadSourceUnitsDeps {
  return {
    async readProgram() {
      return null;
    },
    async readInclude() {
      return null;
    },
    async readClassMain() {
      return 'CLASS zmy_class DEFINITION PUBLIC.\nENDCLASS.';
    },
    async readClassInclude(_name, part) {
      if (part === 'implementations') {
        return 'METHOD handle.\n  DATA(lv) = needle_in_ccimp.\nENDMETHOD.';
      }
      if (part === 'testclasses') return 'CLASS ltc_x DEFINITION FOR TESTING.';
      return '';
    },
    async fetchFugrStructure() {
      return [];
    },
    async readFugrFm() {
      return null;
    },
    ...overrides,
  };
}

async function collect(
  deps: ReadSourceUnitsDeps,
  options?: Parameters<typeof readSourceUnits>[3],
): Promise<SourceUnit[]> {
  const out: SourceUnit[] = [];
  for await (const unit of readSourceUnits(
    deps,
    CLASS_TARGET,
    'active',
    options,
  )) {
    out.push(unit);
  }
  return out;
}

describe('readSourceUnits — class include coverage', () => {
  it('reads main AND the four class includes, labelled by their classic names', async () => {
    const units = await collect(depsWithIncludes());
    expect(units.map((u) => u.include)).toEqual([
      'ZMY_CLASS',
      'ZMY_CLASS (CCDEF)',
      'ZMY_CLASS (CCIMP)',
      'ZMY_CLASS (CCAU)',
      'ZMY_CLASS (CCMAC)',
    ]);
  });

  it('the code that only exists in CCIMP is actually scanned', async () => {
    const units = await collect(depsWithIncludes());
    const ccimp = units.find((u) => u.include.endsWith('(CCIMP)'));
    expect(ccimp?.lines.join('\n')).toContain('needle_in_ccimp');
    // and it is NOT reachable from main, which is the whole point
    const main = units.find((u) => u.include === 'ZMY_CLASS');
    expect(main?.lines.join('\n')).not.toContain('needle_in_ccimp');
  });

  it('classIncludes:false restores the main-only behaviour', async () => {
    const units = await collect(depsWithIncludes(), { classIncludes: false });
    expect(units.map((u) => u.include)).toEqual(['ZMY_CLASS']);
  });

  it('REPORTS a unit it could not read instead of yielding nothing silently', async () => {
    const failures: ReadFailure[] = [];
    const units = await collect(
      depsWithIncludes({
        async readClassInclude(_name, part) {
          if (part === 'implementations') throw new Error('HTTP 403');
          return '';
        },
      }),
      { onReadFailure: (f) => failures.push(f) },
    );
    // the unreadable unit is absent from the yielded units …
    expect(units.map((u) => u.include)).not.toContain('ZMY_CLASS (CCIMP)');
    // … but it is NOT silent: a failed read yields zero hits, which without this
    // is byte-identical to "the query is not in this object".
    expect(failures).toEqual([
      {
        object_name: 'ZMY_CLASS',
        unit: 'ZMY_CLASS (CCIMP)',
        reason: expect.stringContaining('403'),
      },
    ]);
  });
});

describe('runSearchSource — coverage and shaping', () => {
  const deps = (): OrchestratorDeps => ({
    fetchPackageContents: async () => [
      {
        name: 'ZMY_CLASS',
        adtType: 'CLAS/OC',
        packageName: 'ZMY_PKG',
        isPackage: false,
      },
    ],
    resolvePackages: async () => ['ZMY_PKG'],
    sourceReader: depsWithIncludes(),
  });

  it('finds a hit that lives only in CCIMP, and names the unit', async () => {
    const result = await runSearchSource(deps(), {
      query: 'needle_in_ccimp',
      packages: ['ZMY_PKG'],
    });
    expect(result.results).toHaveLength(1);
    expect((result.results[0] as any).include).toBe('ZMY_CLASS (CCIMP)');
  });

  it('reports source_lines so a zero-hit scan can be judged by what it read', async () => {
    const result = await runSearchSource(deps(), {
      query: 'nothing_matches_this',
      packages: ['ZMY_PKG'],
    });
    expect(result.results).toHaveLength(0);
    expect(result.scanned.sources).toBe(5);
    // The number that separates "no match" from "read almost nothing".
    expect(result.scanned.source_lines).toBeGreaterThan(4);
    expect(result.scanned.read_failures).toBe(0);
  });

  it('surfaces read failures on the result', async () => {
    const d = deps();
    d.sourceReader = depsWithIncludes({
      async readClassInclude(_n, part) {
        if (part === 'implementations') throw new Error('HTTP 500');
        return '';
      },
    });
    const result = await runSearchSource(d, {
      query: 'needle_in_ccimp',
      packages: ['ZMY_PKG'],
    });
    expect(result.results).toHaveLength(0);
    expect(result.scanned.read_failures).toBe(1);
    expect(result.read_failures?.[0].unit).toBe('ZMY_CLASS (CCIMP)');
  });

  it('hits_only returns the compact shape', async () => {
    const result = await runSearchSource(deps(), {
      query: 'needle_in_ccimp',
      packages: ['ZMY_PKG'],
      hits_only: true,
    });
    expect(result.results[0]).toEqual({
      object: 'ZMY_CLASS',
      include: 'ZMY_CLASS (CCIMP)',
      line: expect.any(Number),
      text: expect.stringContaining('needle_in_ccimp'),
    });
  });

  it('max_bytes drops WHOLE hits and says how many', async () => {
    const d = deps();
    d.sourceReader = depsWithIncludes({
      async readClassMain() {
        return ['hit one', 'hit two', 'hit three'].join('\n');
      },
    });
    const full = await runSearchSource(d, {
      query: 'hit',
      packages: ['ZMY_PKG'],
    });
    expect(full.results).toHaveLength(3);
    expect(full.truncated.by_max_bytes).toBe(false);

    const capped = await runSearchSource(d, {
      query: 'hit',
      packages: ['ZMY_PKG'],
      hits_only: true,
      max_bytes: 120,
    });
    expect(capped.results.length).toBeLessThan(3);
    expect(capped.truncated.by_max_bytes).toBe(true);
    expect(capped.results_omitted).toBe(3 - capped.results.length);
    // every kept entry is a COMPLETE hit — never a half-serialized one
    for (const hit of capped.results as any[]) {
      expect(typeof hit.line).toBe('number');
      expect(typeof hit.text).toBe('string');
    }
  });
});
