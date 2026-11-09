import type { IAbapConnection } from '@mcp-abap-adt/interfaces';
import {
  getSystemContext,
  resetSystemContextCache,
  resolveSystemContext,
  runWithSystemContext,
  setSystemContext,
} from '../../lib/systemContext';

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe('optional async system context scope', () => {
  beforeEach(() => resetSystemContextCache());
  afterEach(() => resetSystemContextCache());

  test('nested and empty scopes never inherit or mutate the legacy global context', async () => {
    setSystemContext({
      masterSystem: 'GLOBAL',
      responsible: 'GLOBAL_USER',
      isLegacy: true,
    });
    await runWithSystemContext(
      { masterSystem: 'OUTER', isLegacy: false },
      async () => {
        expect(getSystemContext().masterSystem).toBe('OUTER');
        await runWithSystemContext(undefined, async () => {
          expect(getSystemContext()).toEqual({});
          await resolveSystemContext({} as IAbapConnection, {
            masterSystem: 'INNER',
            responsible: 'INNER_USER',
          });
          expect(getSystemContext().masterSystem).toBe('INNER');
          resetSystemContextCache();
          expect(getSystemContext()).toEqual({});
        });
        expect(getSystemContext()).toEqual({
          masterSystem: 'OUTER',
          isLegacy: false,
        });
      },
    );
    expect(getSystemContext()).toEqual({
      masterSystem: 'GLOBAL',
      responsible: 'GLOBAL_USER',
      isLegacy: true,
    });
  });

  test('overlapping requests retain independent values across asynchronous interleaving', async () => {
    const firstSet = deferred();
    const secondSet = deferred();
    const a = runWithSystemContext(
      { responsible: 'A', isLegacy: false },
      async () => {
        firstSet.resolve();
        await secondSet.promise;
        expect(getSystemContext().responsible).toBe('A');
        setSystemContext({ masterLanguage: 'DE' });
        return getSystemContext();
      },
    );
    const b = runWithSystemContext(
      { responsible: 'B', isLegacy: false },
      async () => {
        await firstSet.promise;
        setSystemContext({ masterLanguage: 'JA' });
        secondSet.resolve();
        await a;
        expect(getSystemContext().responsible).toBe('B');
        return getSystemContext();
      },
    );
    expect(await Promise.all([a, b])).toEqual([
      { responsible: 'A', isLegacy: false, masterLanguage: 'DE' },
      { responsible: 'B', isLegacy: false, masterLanguage: 'JA' },
    ]);
    expect(getSystemContext()).toEqual({});
  });
});
