/**
 * CreateTransaction / DeleteTransaction / the SE93 helper.
 *
 * The verdict must come from the read-back (TSTC/TSTCT/TSTCP/TADIR/E071), and
 * a failure must never claim "nothing was written" unless that is provable.
 */

const rowsBySql = new Map<string, Array<Record<string, string>>>();
jest.mock('../../lib/rfcHelper/installer', () => ({
  ...jest.requireActual('../../lib/rfcHelper/installer'),
  selectRows: jest.fn(async (_ctx: unknown, sql: string) => {
    for (const [needle, rows] of rowsBySql)
      if (sql.includes(needle)) return rows;
    return [];
  }),
}));

import {
  handleCreateTransaction,
  normalizeCreateTransaction,
  TCODE_PATTERN,
} from '../../handlers/transaction/high/handleCreateTransaction';
import { handleDeleteTransaction } from '../../handlers/transaction/high/handleDeleteTransaction';
import { resetRewritten } from '../../lib/rfcHelper/rfcHelper';
import {
  TRAN_HELPER_CREATE,
  TRAN_HELPER_CREATE_SOURCE,
  TRAN_HELPER_DELETE_SOURCE,
  TRAN_HELPER_VERSION,
} from '../../lib/transaction/tranHelperAbap';
import { TRAN_HELPER_SPEC } from '../../lib/transaction/tranHelperSpec';
import { LXE_HELPER_SPEC } from '../../lib/translation/lxeHelperSpec';

const V = TRAN_HELPER_VERSION;

function conn(impl: (name: string, params: any) => any) {
  return { callFunction: jest.fn(async (n: string, p: any) => impl(n, p)) };
}
const text = (r: any) => String(r?.content?.[0]?.text ?? '');

function goodReadBack(opts: { variant?: string; request?: boolean } = {}) {
  rowsBySql.clear();
  rowsBySql.set('FROM tstc WHERE', [
    { PGMNA: 'ZMY_PROG', DYPNO: '1000', CINFO: '80' },
  ]);
  rowsBySql.set('FROM tstct', [{ TTEXT: 'My report' }]);
  rowsBySql.set('FROM tstcp', opts.variant ? [{ PARAM: opts.variant }] : []);
  rowsBySql.set('FROM tadir', [{ DEVCLASS: 'ZMY_PKG', MASTERLANG: 'E' }]);
  if (opts.request) {
    rowsBySql.set('FROM e070 WHERE strkorr', [{ TRKORR: 'ABCK900002' }]);
    rowsBySql.set('FROM e071', [{ TRKORR: 'ABCK900002' }]);
  }
}

const baseArgs = {
  transaction_code: 'zmy28',
  program_name: 'zmy_prog',
  description: 'My report',
  package_name: 'zmy_pkg',
};

afterEach(() => {
  rowsBySql.clear();
  resetRewritten();
});

describe('normalizeCreateTransaction', () => {
  it('accepts customer codes only and pads the screen', () => {
    expect(
      normalizeCreateTransaction({ ...baseArgs, selection_screen: 100 }),
    ).toMatchObject({
      tcode: 'ZMY28',
      program: 'ZMY_PROG',
      pkg: 'ZMY_PKG',
      screen: '0100',
    });
    expect(TCODE_PATTERN.test('/ABC/MY_TCODE')).toBe(true);
    for (const bad of ['SE38', 'Z', 'Z MY', 'ZTOOLONGTRANSACTION123']) {
      expect(() =>
        normalizeCreateTransaction({ ...baseArgs, transaction_code: bad }),
      ).toThrow(/customer transaction code/);
    }
    expect(() =>
      normalizeCreateTransaction({ ...baseArgs, description: 'x'.repeat(37) }),
    ).toThrow(/36/);
  });
});

describe('shipped ABAP source', () => {
  it.each([
    TRAN_HELPER_CREATE_SOURCE,
    TRAN_HELPER_DELETE_SOURCE,
  ])('reports the helper version the server checks', (src) => {
    expect(src).toContain('VALUE(ev_version) TYPE char10');
    expect(src).toContain(`ev_version = '${V}'.`);
  });

  it('every refusal of the create runs before RPY_TRANSACTION_INSERT', () => {
    const insert = TRAN_HELPER_CREATE_SOURCE.indexOf(
      "CALL FUNCTION 'RPY_TRANSACTION_INSERT'",
    );
    expect(insert).toBeGreaterThan(0);
    for (const guard of [
      'not in the customer namespace',
      'already exists',
      'is not an executable program',
      'has no screen',
      'does not exist in client',
      'is transportable: a transport request is required',
      'is not modifiable',
      'TEST MODE',
    ]) {
      const at = TRAN_HELPER_CREATE_SOURCE.indexOf(guard);
      expect(at).toBeGreaterThan(0);
      expect(at).toBeLessThan(insert);
    }
    expect(TRAN_HELPER_CREATE_SOURCE).toContain("transaction_type    = 'R'");
  });

  it('the delete refuses SAP-namespace codes before RPY_TRANSACTION_DELETE', () => {
    const del = TRAN_HELPER_DELETE_SOURCE.indexOf(
      "CALL FUNCTION 'RPY_TRANSACTION_DELETE'",
    );
    const guard = TRAN_HELPER_DELETE_SOURCE.indexOf(
      'not in the customer namespace',
    );
    expect(guard).toBeGreaterThan(0);
    expect(guard).toBeLessThan(del);
  });

  it('every probe passes all of its module’s mandatory importing parameters', () => {
    for (const m of TRAN_HELPER_SPEC.modules) {
      const mandatory = [
        ...m.source.matchAll(
          /VALUE\((iv_\w+)\) TYPE \w+(?!.*(?:OPTIONAL|DEFAULT))\s*$/gm,
        ),
      ].map((x) => x[1].toUpperCase());
      for (const p of mandatory)
        expect(Object.keys(m.probeParams)).toContain(p);
    }
  });
});

describe('CreateTransaction', () => {
  it('success only when the read-back matches; reports where it is recorded', async () => {
    goodReadBack({ variant: 'SAP&DEFAULT', request: true });
    const c = conn(() => ({
      EV_VERSION: V,
      EV_STATUS: 'S',
      EV_MESSAGE: 'Report transaction ZMY28 created',
      EV_LANGUAGE: 'E',
    }));
    const r = await handleCreateTransaction({ connection: c } as any, {
      ...baseArgs,
      variant: 'sap&default',
      transport_request: 'abck900001',
    });
    expect(r.isError).toBe(false);
    const body = JSON.parse(text(r));
    expect(body).toMatchObject({
      created: true,
      transaction_code: 'ZMY28',
      variant: 'SAP&DEFAULT',
      verified: {
        variant: 'SAP&DEFAULT',
        package: 'ZMY_PKG',
        recorded_in: 'ABCK900002',
      },
    });
    expect(c.callFunction).toHaveBeenCalledWith(
      TRAN_HELPER_CREATE,
      expect.objectContaining({
        IV_TCODE: 'ZMY28',
        IV_SCREEN: '1000',
        IV_REQUEST: 'ABCK900001',
        IV_TEST: '',
      }),
    );
  });

  it('a read-back that differs is an error naming what differs — and says it WAS created', async () => {
    goodReadBack();
    rowsBySql.set('FROM tstc WHERE', [
      { PGMNA: 'ZMY_PROG', DYPNO: '1000', CINFO: '00' },
    ]);
    const r = await handleCreateTransaction(
      {
        connection: conn(() => ({
          EV_VERSION: V,
          EV_STATUS: 'S',
          EV_MESSAGE: 'ok',
        })),
      } as any,
      baseArgs,
    );
    expect(r.isError).toBe(true);
    expect(text(r)).toMatch(/was created, but the read-back differs/);
    expect(text(r)).toMatch(/CINFO is 00/);
    expect(text(r)).not.toMatch(/Nothing was written/);
  });

  it('a pre-check refusal says nothing was written', async () => {
    const r = await handleCreateTransaction(
      {
        connection: conn(() => ({
          EV_VERSION: V,
          EV_STATUS: 'F',
          EV_MESSAGE:
            'Program ZMY_PROG is not an executable program (TRDIR-SUBC I)',
        })),
      } as any,
      baseArgs,
    );
    expect(text(r)).toMatch(/not an executable program/);
    expect(text(r)).toMatch(/Nothing was written/);
  });

  it('a failure INSIDE RPY_TRANSACTION_INSERT reports what was left, not an assumption', async () => {
    rowsBySql.clear();
    rowsBySql.set('FROM tadir', [{ DEVCLASS: 'ZMY_PKG' }]);
    const r = await handleCreateTransaction(
      {
        connection: conn(() => ({
          EV_VERSION: V,
          EV_STATUS: 'F',
          EV_MESSAGE:
            'RPY_TRANSACTION_INSERT refused (exception 3): no authorization',
        })),
      } as any,
      baseArgs,
    );
    expect(text(r)).toMatch(/TADIR HAS an entry \(package ZMY_PKG\)/);
    expect(text(r)).not.toMatch(/Nothing was written/);
  });

  it('an RFC failure mid-call is reported as UNKNOWN, never as nothing written', async () => {
    const r = await handleCreateTransaction(
      {
        connection: conn(() => {
          throw { key: 'RFC_ABAP_RUNTIME_FAILURE', message: 'dump' };
        }),
      } as any,
      baseArgs,
    );
    expect(text(r)).toMatch(/UNKNOWN/);
    expect(text(r)).not.toMatch(/Nothing was written/);
  });

  it('dry_run passes IV_TEST and creates nothing', async () => {
    const c = conn(() => ({
      EV_VERSION: V,
      EV_STATUS: 'S',
      EV_MESSAGE: 'TEST MODE',
    }));
    const body = JSON.parse(
      text(
        await handleCreateTransaction({ connection: c } as any, {
          ...baseArgs,
          dry_run: true,
        }),
      ),
    );
    expect(c.callFunction.mock.calls[0][1].IV_TEST).toBe('X');
    expect(body).toMatchObject({ dry_run: true, created: false });
  });

  it('a missing helper names SetupTransactionHelper and nothing was written', async () => {
    const r = await handleCreateTransaction(
      {
        connection: conn(() => {
          throw { key: 'FU_NOT_FOUND', message: 'Z_MCP_TRAN_CREATE' };
        }),
      } as any,
      baseArgs,
    );
    expect(text(r)).toMatch(/SetupTransactionHelper/);
    expect(text(r)).toMatch(/Nothing was written/);
  });
});

describe('DeleteTransaction', () => {
  it('refuses an SAP code before calling SAP', async () => {
    const c = conn(() => ({}));
    const r = await handleDeleteTransaction({ connection: c } as any, {
      transaction_code: 'SE38',
    });
    expect(r.isError).toBe(true);
    expect(text(r)).toMatch(/Nothing was deleted/);
    expect(c.callFunction).not.toHaveBeenCalled();
  });

  it('reports TSTC/TSTCT gone and the TADIR state as read', async () => {
    rowsBySql.clear();
    const r = await handleDeleteTransaction(
      {
        connection: conn(() => ({
          EV_VERSION: V,
          EV_STATUS: 'S',
          EV_MESSAGE: 'Transaction ZMY28 deleted',
        })),
      } as any,
      { transaction_code: 'ZMY28' },
    );
    expect(JSON.parse(text(r))).toMatchObject({
      tstc_tstct: 'gone',
      tadir_entry: 'removed',
    });
  });

  it('a "deleted" that still reads back is an error', async () => {
    rowsBySql.clear();
    rowsBySql.set('FROM tstc WHERE', [{ TCODE: 'ZMY28' }]);
    const r = await handleDeleteTransaction(
      {
        connection: conn(() => ({
          EV_VERSION: V,
          EV_STATUS: 'S',
          EV_MESSAGE: 'deleted',
        })),
      } as any,
      { transaction_code: 'ZMY28' },
    );
    expect(r.isError).toBe(true);
    expect(text(r)).toMatch(/still holds it/);
  });
});

describe('helper specs fit SAP limits', () => {
  // Measured live: a 47-character group description made the install fail
  // ("Description of ZMCP_TRAN longer than 40 characters").
  it('function group text <= 40, module text <= 74, names <= 26 / 30', () => {
    for (const spec of [TRAN_HELPER_SPEC, LXE_HELPER_SPEC]) {
      expect(spec.groupDescription.length).toBeLessThanOrEqual(40);
      expect(spec.group.length).toBeLessThanOrEqual(26);
      for (const m of spec.modules) {
        expect(m.description.length).toBeLessThanOrEqual(74);
        expect(m.name.length).toBeLessThanOrEqual(30);
      }
    }
  });
});
