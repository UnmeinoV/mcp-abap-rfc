/**
 * DeployDdic / SetupDdicHelper / the DDIC deploy helper.
 *
 * The verdict must come from the read-back (DD02L/DD40L/TADIR/E071), a failure
 * must never claim "nothing was written" unless that is provable, and the tool
 * must present itself as a complement to CreateStructure / CreateTableType,
 * not a replacement.
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
  TOOL_DEFINITION as DEPLOY_TOOL,
  handleDeployDdic,
  normalizeDeployDdic,
} from '../../handlers/ddic/high/handleDeployDdic';
import { TOOL_DEFINITION as SETUP_TOOL } from '../../handlers/ddic/high/handleSetupDdicHelper';
import {
  DDIC_HELPER_DEPLOY,
  DDIC_HELPER_DEPLOY_SOURCE,
  DDIC_HELPER_VERSION,
} from '../../lib/ddic/ddicHelperAbap';
import { DDIC_HELPER_SPEC } from '../../lib/ddic/ddicHelperSpec';
import { resetRewritten } from '../../lib/rfcHelper/rfcHelper';

const V = DDIC_HELPER_VERSION;

function conn(impl: (name: string, params: any) => any) {
  return { callFunction: jest.fn(async (n: string, p: any) => impl(n, p)) };
}
const text = (r: any) => String(r?.content?.[0]?.text ?? '');

const spec = {
  schema: 'ddic-deploy/1',
  objects: [
    {
      kind: 'structure',
      name: 'zmy_req',
      label: 'Request',
      fields: [
        { name: '.INCLUDE', type: 'ZMY_HEADER' },
        { name: 'ITEMS', type: 'ZMY_ITEM_TT' },
      ],
    },
    {
      kind: 'tableType',
      name: 'ZMY_ITEM_TT',
      label: 'Items',
      rowType: 'ZMY_ITEM',
    },
    {
      kind: 'structure',
      name: 'ZMY_ITEM',
      label: 'Item',
      fields: [
        { name: 'MATNR', type: 'MATNR' },
        {
          name: 'MENGE',
          dataType: 'QUAN',
          length: 13,
          decimals: 3,
          label: 'Quantity',
          refTable: 'T006',
          refField: 'MSEHI',
        },
      ],
    },
  ],
};
const baseArgs = { spec, package_name: 'zmy_pkg' };

const okLog = [
  'ORDER ZMY_ITEM ZMY_ITEM_TT ZMY_REQ',
  'ZMY_ITEM CORR RC=0',
  'ZMY_ITEM PUT RC=0',
  'ZMY_ITEM ACTIVATE SUBRC=0 RC=0',
].join('\n');

function goodReadBack(
  opts: { inactiveLeft?: boolean; request?: boolean } = {},
) {
  rowsBySql.clear();
  rowsBySql.set('FROM dd02l', [
    { TABNAME: 'ZMY_REQ', AS4LOCAL: 'A' },
    { TABNAME: 'ZMY_ITEM', AS4LOCAL: 'A' },
    ...(opts.inactiveLeft ? [{ TABNAME: 'ZMY_ITEM', AS4LOCAL: 'N' }] : []),
  ]);
  rowsBySql.set('FROM dd40l', [{ TYPENAME: 'ZMY_ITEM_TT', AS4LOCAL: 'A' }]);
  rowsBySql.set('FROM tadir', [
    { OBJ_NAME: 'ZMY_REQ', DEVCLASS: 'ZMY_PKG' },
    { OBJ_NAME: 'ZMY_ITEM', DEVCLASS: 'ZMY_PKG' },
    { OBJ_NAME: 'ZMY_ITEM_TT', DEVCLASS: 'ZMY_PKG' },
  ]);
  if (opts.request) {
    rowsBySql.set('FROM e070 WHERE trkorr IN', [
      { TRKORR: 'ABCK900002', STRKORR: 'ABCK900001' },
    ]);
    rowsBySql.set('FROM e071', [
      { TRKORR: 'ABCK900002', OBJ_NAME: 'ZMY_REQ' },
      { TRKORR: 'ABCK900002', OBJ_NAME: 'ZMY_ITEM' },
      { TRKORR: 'ABCK900002', OBJ_NAME: 'ZMY_ITEM_TT' },
    ]);
  }
}

beforeEach(() => {
  rowsBySql.clear();
  resetRewritten();
});

describe('tool definitions', () => {
  it('DeployDdic presents itself as a complement to the ADT tools', () => {
    expect(DEPLOY_TOOL.description).toContain('CreateStructure');
    expect(DEPLOY_TOOL.description).toContain('NESTED');
    expect(DEPLOY_TOOL.notes).toContain('both routes stay');
    expect(DEPLOY_TOOL.description).toContain('SetupDdicHelper');
  });

  // Review of MR !1: the schema says object, so the text must not promise a string.
  it('the spec parameter is described as what the schema declares', () => {
    const p = DEPLOY_TOOL.inputSchema.properties.spec;
    expect(p.type).toBe('object');
    expect(p.description).not.toMatch(/string/i);
  });

  it('SetupDdicHelper says it writes Z code and is only needed for DeployDdic', () => {
    expect(SETUP_TOOL.description).toContain('WRITES Z CODE');
    expect(SETUP_TOOL.notes).toContain('work without it');
  });
});

describe('normalizeDeployDdic', () => {
  it('accepts an object or a JSON string and upper-cases names', () => {
    const a = normalizeDeployDdic(baseArgs);
    const b = normalizeDeployDdic({ ...baseArgs, spec: JSON.stringify(spec) });
    expect(a.objects.map((o) => o.name)).toEqual([
      'ZMY_REQ',
      'ZMY_ITEM_TT',
      'ZMY_ITEM',
    ]);
    expect(b.objects).toEqual(a.objects);
    expect(a.pkg).toBe('ZMY_PKG');
  });

  it.each([
    [{ ...spec, schema: 'x' }, 'schema'],
    [{ ...spec, objects: [] }, 'at least one'],
    [{ ...spec, objects: [{ ...spec.objects[1], name: 'MY_TT' }] }, 'Z*/Y*'],
    [
      { ...spec, objects: [spec.objects[1], spec.objects[1]] },
      'more than once',
    ],
    [
      {
        ...spec,
        objects: [
          {
            kind: 'structure',
            name: 'ZMY_X',
            label: 'x',
            fields: [{ name: 'A', type: 'MATNR', dataType: 'CHAR' }],
          },
        ],
      },
      'exactly one of type or dataType',
    ],
    [
      { ...spec, objects: [{ kind: 'tableType', name: 'ZMY_T', label: 't' }] },
      'rowType',
    ],
  ])('refuses a malformed spec before SAP (%#)', (bad, msg) => {
    expect(() => normalizeDeployDdic({ ...baseArgs, spec: bad })).toThrow(msg);
  });
});

describe('shipped ABAP source', () => {
  it('reports the helper version the server checks', () => {
    expect(DDIC_HELPER_DEPLOY_SOURCE).toContain(
      'VALUE(ev_version) TYPE char10',
    );
    expect(DDIC_HELPER_DEPLOY_SOURCE).toContain(`ev_version = '${V}'.`);
    expect(DDIC_HELPER_DEPLOY_SOURCE).toContain(`Helper version ${V}.`);
  });

  it('every refusal runs before the first write (RS_CORR_INSERT)', () => {
    const write = DDIC_HELPER_DEPLOY_SOURCE.indexOf(
      "CALL FUNCTION 'RS_CORR_INSERT'",
    );
    expect(write).toBeGreaterThan(0);
    for (const guard of [
      'must have schema ddic-deploy/1',
      'is transportable: a transport request is required',
      'is not modifiable',
      'not in the customer namespace',
      'appears more than once',
      'already exists',
      'needs refTable and refField',
      'is referenced but is neither in the spec',
      'Circular reference',
      'is not a structure - nothing was written',
      'TEST MODE',
    ]) {
      const at = DDIC_HELPER_DEPLOY_SOURCE.indexOf(guard);
      expect(at).toBeGreaterThan(0);
      expect(at).toBeLessThan(write);
    }
  });

  // Review of MR !1: a failure reported an empty text, or a message left over
  // from an earlier call.
  it('a failure reports only a message raised by the failing call, never an empty one', () => {
    const src = DDIC_HELPER_DEPLOY_SOURCE;
    // [call, the call that runs before it on the same path]; the two
    // activations share one note taken before their IF, after both PUTs.
    const pairs: Array<[string, string | null]> = [
      ['RS_CORR_INSERT', null],
      ['DDIF_TABL_PUT', 'RS_CORR_INSERT'],
      ['DDIF_TTYP_PUT', 'DDIF_TABL_PUT'],
      ['DDIF_TABL_ACTIVATE', 'DDIF_TTYP_PUT'],
      ['DDIF_TTYP_ACTIVATE', 'DDIF_TTYP_PUT'],
    ];
    for (const [fm, before] of pairs) {
      const call = src.indexOf(`CALL FUNCTION '${fm}'`);
      const previous = before ? src.indexOf(`CALL FUNCTION '${before}'`) : 0;
      const step = src.lastIndexOf(`lv_step = '${fm}'.`, call);
      const noted = src.lastIndexOf('lv_sym = |{ sy-msgid }', call);
      expect(call).toBeGreaterThan(previous);
      expect(step).toBeGreaterThan(previous);
      expect(noted).toBeGreaterThan(previous);
    }
    const failure = src.indexOf('IF lv_rc <> 0.');
    const compare = src.indexOf('<> lv_sym', failure);
    const message = src.indexOf('MESSAGE ID sy-msgid', failure);
    const fallback = src.indexOf('without a message', failure);
    expect(compare).toBeGreaterThan(failure);
    expect(message).toBeGreaterThan(compare);
    expect(fallback).toBeGreaterThan(message);
  });

  it('reads back from the DDIC tables before reporting S', () => {
    const lastActivate = DDIC_HELPER_DEPLOY_SOURCE.lastIndexOf(
      "'DDIF_TTYP_ACTIVATE'",
    );
    const readback = DDIC_HELPER_DEPLOY_SOURCE.indexOf('READBACK OK');
    const finalS = DDIC_HELPER_DEPLOY_SOURCE.lastIndexOf("ev_status = 'S'.");
    expect(readback).toBeGreaterThan(lastActivate);
    expect(finalS).toBeGreaterThan(readback);
  });

  it('every probe passes all of its module’s mandatory importing parameters', () => {
    for (const m of DDIC_HELPER_SPEC.modules) {
      const mandatory = [
        ...m.source.matchAll(
          /VALUE\((iv_\w+)\) TYPE \w+(?!.*(?:OPTIONAL|DEFAULT))\s*$/gm,
        ),
      ].map((x) => x[1].toUpperCase());
      expect(mandatory).toEqual(['IV_SPEC', 'IV_PACKAGE']);
      for (const p of mandatory)
        expect(Object.keys(m.probeParams)).toContain(p);
    }
  });

  it('fits SAP limits: group text <= 40, module text <= 74, names <= 26 / 30', () => {
    expect(DDIC_HELPER_SPEC.groupDescription.length).toBeLessThanOrEqual(40);
    expect(DDIC_HELPER_SPEC.group.length).toBeLessThanOrEqual(26);
    for (const m of DDIC_HELPER_SPEC.modules) {
      expect(m.description.length).toBeLessThanOrEqual(74);
      expect(m.name.length).toBeLessThanOrEqual(30);
    }
  });
});

describe('DeployDdic', () => {
  const helperOk = (extra: Record<string, string> = {}) =>
    conn((name, params) => {
      expect(name).toBe(DDIC_HELPER_DEPLOY);
      return {
        EV_VERSION: V,
        EV_STATUS: 'S',
        EV_MESSAGE:
          '3 DDIC objects created and read back as specified in ZMY_PKG',
        EV_WARNING: '',
        EV_LOG: okLog,
        ...extra,
        _params: params,
      };
    });

  it('success only when the read-back matches; reports order and log', async () => {
    goodReadBack({ request: true });
    const connection = helperOk();
    const r = await handleDeployDdic({ connection } as any, {
      ...baseArgs,
      transport_request: 'abck900001',
    });
    expect(r.isError).toBe(false);
    const out = JSON.parse(text(r));
    expect(out.created).toBe(true);
    expect(out.order).toEqual(['ZMY_ITEM', 'ZMY_ITEM_TT', 'ZMY_REQ']);
    expect(out.verified).toEqual({
      active: 3,
      package: 'ZMY_PKG',
      recorded_in_request: 3,
    });
    const sent = (connection.callFunction as jest.Mock).mock.calls[0][1];
    expect(JSON.parse(sent.IV_SPEC).schema).toBe('ddic-deploy/1');
    expect(sent.IV_REQUEST).toBe('ABCK900001');
    expect(sent.IV_TEST).toBe('');
  });

  it('E071 entries are matched through their own E070 parent, not a task list', async () => {
    goodReadBack({ request: true });
    // One object sits in an UNRELATED request: it must not count.
    rowsBySql.set('FROM e071', [
      { TRKORR: 'ABCK900002', OBJ_NAME: 'ZMY_REQ' },
      { TRKORR: 'ABCK900002', OBJ_NAME: 'ZMY_ITEM' },
      { TRKORR: 'ABCK900099', OBJ_NAME: 'ZMY_ITEM_TT' },
    ]);
    rowsBySql.set('FROM e070 WHERE trkorr IN', [
      { TRKORR: 'ABCK900002', STRKORR: 'ABCK900001' },
      { TRKORR: 'ABCK900099', STRKORR: 'ABCK900098' },
    ]);
    const r = await handleDeployDdic({ connection: helperOk() } as any, {
      ...baseArgs,
      transport_request: 'ABCK900001',
    });
    expect(r.isError).toBe(true);
    expect(text(r)).toContain('ZMY_ITEM_TT: no E071 entry under ABCK900001');
    expect(text(r)).not.toContain('ZMY_REQ: no E071');
  });

  it('a read-back answer at the 10-row cap is refused, not read as complete', async () => {
    goodReadBack({ request: true });
    rowsBySql.set(
      'FROM e071',
      Array.from({ length: 10 }, (_, i) => ({
        TRKORR: `ABCK90010${i}`,
        OBJ_NAME: 'ZMY_REQ',
      })),
    );
    const r = await handleDeployDdic({ connection: helperOk() } as any, {
      ...baseArgs,
      transport_request: 'ABCK900001',
    });
    expect(r.isError).toBe(true);
    expect(text(r)).toContain('may be cut');
    expect(text(r)).toContain('The helper reported success');
    expect(text(r)).not.toContain('Nothing was written');
  });

  it('an inactive version left behind is an error — and it does not claim nothing was written', async () => {
    goodReadBack({ inactiveLeft: true });
    const r = await handleDeployDdic(
      { connection: helperOk() } as any,
      baseArgs,
    );
    expect(r.isError).toBe(true);
    expect(text(r)).toContain('ZMY_ITEM still has an inactive version');
    expect(text(r)).not.toContain('Nothing was written');
  });

  it('a pre-check refusal (no write started) says nothing was written', async () => {
    const connection = conn(() => ({
      EV_VERSION: V,
      EV_STATUS: 'F',
      EV_MESSAGE:
        'ZMY_REQ already exists - this helper only creates; nothing was written',
      EV_LOG: '',
    }));
    const r = await handleDeployDdic({ connection } as any, baseArgs);
    expect(r.isError).toBe(true);
    expect(text(r)).toContain('Nothing was written');
  });

  it('a failure after writes started reports what exists, read back', async () => {
    rowsBySql.set('FROM dd02l', [{ TABNAME: 'ZMY_ITEM', AS4LOCAL: 'A' }]);
    rowsBySql.set('FROM dd40l', [{ TYPENAME: 'ZMY_ITEM_TT', AS4LOCAL: 'N' }]);
    const connection = conn(() => ({
      EV_VERSION: V,
      EV_STATUS: 'F',
      EV_MESSAGE: 'ZMY_ITEM_TT failed (see ev_log)',
      EV_LOG: `${okLog}\nZMY_ITEM_TT CORR RC=0\nZMY_ITEM_TT PUT RC=0\nZMY_ITEM_TT ACTIVATE SUBRC=0 RC=8`,
    }));
    const r = await handleDeployDdic({ connection } as any, baseArgs);
    expect(r.isError).toBe(true);
    expect(text(r)).toContain(
      'EXIST and were kept: ZMY_ITEM_TT (inactive), ZMY_ITEM',
    );
    expect(text(r)).not.toContain('Nothing was written');
  });

  it('an RFC failure mid-call is UNKNOWN, never "nothing written"', async () => {
    const connection = conn(() => {
      throw { key: 'RFC_COMMUNICATION_FAILURE', message: 'connection reset' };
    });
    const r = await handleDeployDdic({ connection } as any, baseArgs);
    expect(r.isError).toBe(true);
    expect(text(r)).toContain('UNKNOWN');
  });

  it('dry_run passes IV_TEST, reports the order and reads nothing back', async () => {
    const connection = conn(() => ({
      EV_VERSION: V,
      EV_STATUS: 'S',
      EV_MESSAGE: 'TEST MODE: every check passed, nothing was created.',
      EV_LOG: 'ORDER ZMY_ITEM ZMY_ITEM_TT ZMY_REQ',
    }));
    const r = await handleDeployDdic({ connection } as any, {
      ...baseArgs,
      dry_run: true,
    });
    const out = JSON.parse(text(r));
    expect(out.created).toBe(false);
    expect(out.order).toEqual(['ZMY_ITEM', 'ZMY_ITEM_TT', 'ZMY_REQ']);
    expect(
      (connection.callFunction as jest.Mock).mock.calls[0][1].IV_TEST,
    ).toBe('X');
  });

  it('a missing helper names SetupDdicHelper and nothing was written', async () => {
    const connection = conn(() => {
      throw { key: 'FU_NOT_FOUND', message: 'FU_NOT_FOUND' };
    });
    const r = await handleDeployDdic({ connection } as any, baseArgs);
    expect(r.isError).toBe(true);
    expect(text(r)).toContain('SetupDdicHelper');
    expect(text(r)).toContain('Nothing was written');
  });

  it('a malformed spec is refused before any RFC call', async () => {
    const connection = helperOk();
    const r = await handleDeployDdic({ connection } as any, {
      ...baseArgs,
      spec: '{not json',
    });
    expect(r.isError).toBe(true);
    expect(text(r)).toContain('not valid JSON');
    expect(text(r)).toContain('Nothing was written');
    expect(connection.callFunction).not.toHaveBeenCalled();
  });
});
