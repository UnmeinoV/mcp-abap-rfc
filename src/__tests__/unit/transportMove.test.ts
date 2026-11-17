/**
 * MoveTransportObjects: which route, which entries, and a verdict that only
 * comes from reading both object lists back — never from a call returning.
 */

import { handleMoveTransportObjects } from '../../handlers/transport/high/handleMoveTransportObjects';
import { resetHelperRewrittenFlag } from '../../lib/translation/lxeHelper';
import {
  LXE_HELPER_MOVE,
  LXE_HELPER_MOVE_SOURCE,
  LXE_HELPER_VERSION,
} from '../../lib/translation/lxeHelperAbap';
import {
  buildMoveObjectsXml,
  chooseRoute,
  type E071Row,
  judgeMove,
  moveSentence,
  resolveEntries,
  type TrHeader,
} from '../../lib/transportMove';

afterEach(() => resetHelperRewrittenFlag());

const row = (p: Partial<E071Row>): E071Row => ({
  trkorr: 'ABCK900001',
  as4pos: '000001',
  pgmid: 'R3TR',
  object: 'CLAS',
  obj_name: 'ZCL_X',
  lockflag: '',
  lang: '',
  ...p,
});

const hdr = (p: Partial<TrHeader>): TrHeader => ({
  trkorr: 'ABCK900001',
  trfunction: 'K',
  trstatus: 'D',
  strkorr: '',
  as4user: 'ME',
  ...p,
});

describe('chooseRoute', () => {
  it('request <-> its own task goes to the helper', () => {
    expect(
      chooseRoute(
        hdr({}),
        hdr({ trkorr: 'ABCK900002', trfunction: 'S', strkorr: 'ABCK900001' }),
      ),
    ).toBe('same_request_helper');
  });
  it('two tasks of one request go to the helper', () => {
    expect(
      chooseRoute(
        hdr({ trkorr: 'ABCK900002', strkorr: 'ABCK900001' }),
        hdr({ trkorr: 'ABCK900003', strkorr: 'ABCK900001' }),
      ),
    ).toBe('same_request_helper');
  });
  it('different requests go to SAP', () => {
    expect(
      chooseRoute(
        hdr({ trkorr: 'ABCK900002', strkorr: 'ABCK900001' }),
        hdr({ trkorr: 'ABCK900012', strkorr: 'ABCK900011' }),
      ),
    ).toBe('sap_move');
  });
});

describe('resolveEntries', () => {
  const rows = [
    row({ as4pos: '1', pgmid: 'CORR', object: 'MERG', obj_name: 'X' }),
    row({ as4pos: '2' }),
    row({
      as4pos: '3',
      pgmid: 'LANG',
      object: 'DTED',
      obj_name: 'ZDE',
      lang: '1',
    }),
    row({
      as4pos: '4',
      pgmid: 'LANG',
      object: 'DTED',
      obj_name: 'ZDE',
      lang: 'E',
    }),
  ];

  it('select picks every match and never CORR', () => {
    expect(
      resolveEntries('S', rows, undefined, { pgmid: 'lang' }).map(
        (r) => r.as4pos,
      ),
    ).toEqual(['3', '4']);
  });

  it('select matching nothing is refused', () => {
    expect(() =>
      resolveEntries('S', rows, undefined, { object_type: 'MERG' }),
    ).toThrow(/No entry/);
  });

  it('an entry matching several rows must be disambiguated', () => {
    expect(() =>
      resolveEntries(
        'S',
        rows,
        [{ object_type: 'DTED', object_name: 'ZDE' }],
        undefined,
      ),
    ).toThrow(/matches 2 entries/);
    expect(
      resolveEntries(
        'S',
        rows,
        [{ object_type: 'dted', object_name: 'zde', lang: '1' }],
        undefined,
      )[0].as4pos,
    ).toBe('3');
  });

  it('missing, CORR, duplicate and both-or-neither are refused', () => {
    expect(() =>
      resolveEntries(
        'S',
        rows,
        [{ object_type: 'PROG', object_name: 'Z' }],
        undefined,
      ),
    ).toThrow(/not in the object list/);
    expect(() =>
      resolveEntries(
        'S',
        rows,
        [{ pgmid: 'CORR', object_type: 'MERG', object_name: 'X' }],
        undefined,
      ),
    ).toThrow(/organisational/);
    expect(() =>
      resolveEntries(
        'S',
        rows,
        [
          { object_type: 'CLAS', object_name: 'ZCL_X' },
          { object_type: 'CLAS', object_name: 'ZCL_X' },
        ],
        undefined,
      ),
    ).toThrow(/twice/);
    expect(() => resolveEntries('S', rows, undefined, undefined)).toThrow(
      /exactly one/,
    );
    expect(() =>
      resolveEntries(
        'S',
        rows,
        [{ object_type: 'CLAS', object_name: 'ZCL_X' }],
        { pgmid: 'LANG' },
      ),
    ).toThrow(/exactly one/);
  });
});

describe('buildMoveObjectsXml', () => {
  it('carries target, action and escaped entries', () => {
    const xml = buildMoveObjectsXml('abck900002', [row({ obj_name: 'Z<&"' })]);
    expect(xml).toContain('tm:number="ABCK900002"');
    expect(xml).toContain('tm:useraction="moveobjects"');
    expect(xml).toContain(
      '<tm:abap_object tm:pgmid="R3TR" tm:type="CLAS" tm:name="Z&lt;&amp;&quot;"/>',
    );
  });
});

describe('judgeMove / moveSentence', () => {
  const e = row({ pgmid: 'LANG', object: 'DTED', obj_name: 'ZDE', lang: '1' });

  it('moved only when in target AND gone from source', () => {
    const j = judgeMove([e], [], [row({ ...e, trkorr: 'T' })]);
    expect(j.verdict).toBe('moved');
    expect(moveSentence('S', 'T', 1, j)).toMatch(/confirmed/);
  });

  it('in both lists is not a move', () => {
    const j = judgeMove([e], [e], [e]);
    expect(j.verdict).toBe('not_moved');
    expect(j.not_moved[0]).toMatchObject({
      in_target: true,
      still_in_source: true,
    });
  });

  it('a LANG entry in another language does not count', () => {
    expect(judgeMove([e], [], [row({ ...e, lang: 'E' })]).verdict).toBe(
      'not_moved',
    );
  });

  it('partial and unverified never claim a move', () => {
    const e2 = row({ obj_name: 'ZCL_Y' });
    const j = judgeMove([e, e2], [e2], [e]);
    expect(j.verdict).toBe('partial');
    expect(moveSentence('S', 'T', 2, j)).toMatch(/^PARTIAL/);
    const u = judgeMove([e], null, [e]);
    expect(u.verdict).toBe('unverified');
    expect(moveSentence('S', 'T', 1, u)).toMatch(/^UNVERIFIED/);
    expect(moveSentence('S', 'T', 1, u)).not.toMatch(/moved from/);
  });
});

describe('Z_MCP_LXE_MOVE source', () => {
  const src = LXE_HELPER_MOVE_SOURCE;
  const firstWrite = src.indexOf('DELETE FROM e071');

  it('checks everything before the first write', () => {
    expect(firstWrite).toBeGreaterThan(0);
    for (const guard of [
      "CALL FUNCTION 'TRINT_CHECK_REQUEST_CHANGEABLE'",
      'belong to |',
      "lockflag = 'X'",
      "IF iv_test = 'X'",
      "CALL FUNCTION 'ENQUEUE_E_TRKORR'",
    ]) {
      const at = src.indexOf(guard);
      expect(at).toBeGreaterThan(0);
      expect(at).toBeLessThan(firstWrite);
    }
  });

  it('rolls back on a failed append and reads back before success', () => {
    const append = src.indexOf("CALL FUNCTION 'TRINT_APPEND_COMM'");
    expect(append).toBeGreaterThan(firstWrite);
    expect(src.slice(append)).toMatch(/ROLLBACK WORK/);
    const commit = src.indexOf('COMMIT WORK');
    const lastSuccess = src.lastIndexOf("ev_status = 'S'");
    expect(commit).toBeGreaterThan(append);
    expect(lastSuccess).toBeGreaterThan(commit);
  });

  it('carries the helper version', () => {
    expect(src).toContain(`ev_version = '${LXE_HELPER_VERSION}'`);
  });
});

// ---- handler, against an in-memory E070/E071 --------------------------------

function previewXml(
  columns: string[],
  rows: Array<Record<string, string>>,
): string {
  const cols = columns
    .map(
      (c) =>
        `<dataPreview:columns><dataPreview:metadata dataPreview:name="${c}" dataPreview:type="C" dataPreview:description="${c}"/><dataPreview:dataSet>${rows
          .map((r) =>
            r[c]
              ? `<dataPreview:data>${r[c]}</dataPreview:data>`
              : '<dataPreview:data/>',
          )
          .join('')}</dataPreview:dataSet></dataPreview:columns>`,
    )
    .join('');
  return `<?xml version="1.0" encoding="utf-8"?><dataPreview:tableData xmlns:dataPreview="http://www.sap.com/adt/dataPreview"><dataPreview:totalRows>0</dataPreview:totalRows>${cols}</dataPreview:tableData>`;
}

interface FakeSap {
  e070: Array<Record<string, string>>;
  e071: Array<Record<string, string>>;
  onMove?: (body: string, url: string) => void;
  onHelper?: (params: any) => any;
  failReadsAfterCall?: boolean;
}

function fakeConnection(sap: FakeSap) {
  let called = false;
  const connection: any = {
    makeAdtRequest: jest.fn(async (req: any) => {
      if (req.url.endsWith('/datapreview/freestyle')) {
        const sql = String(req.data);
        if (called && sap.failReadsAfterCall && /FROM e071/.test(sql)) {
          throw new Error('read failed');
        }
        if (/FROM e070/.test(sql)) {
          return {
            status: 200,
            data: previewXml(
              ['TRKORR', 'TRFUNCTION', 'TRSTATUS', 'STRKORR', 'AS4USER'],
              sap.e070.filter((r) => sql.includes(`'${r.TRKORR}'`)),
            ),
          };
        }
        const tr = /trkorr = '([^']+)'/.exec(sql)?.[1];
        return {
          status: 200,
          data: previewXml(
            [
              'TRKORR',
              'AS4POS',
              'PGMID',
              'OBJECT',
              'OBJ_NAME',
              'LOCKFLAG',
              'LANG',
            ],
            sap.e071.filter((r) => r.TRKORR === tr),
          ),
        };
      }
      if (req.url.endsWith('/moveobjects')) {
        called = true;
        sap.onMove?.(String(req.data), req.url);
        return { status: 200, data: '' };
      }
      throw new Error(`unexpected ${req.url}`);
    }),
    callFunction: jest.fn(async (name: string, params: any) => {
      if (name !== LXE_HELPER_MOVE) throw new Error(`unexpected ${name}`);
      called = true;
      return {
        EV_VERSION: LXE_HELPER_VERSION,
        ...(sap.onHelper?.(params) ?? {}),
      };
    }),
  };
  return connection;
}

const parse = (r: any) => JSON.parse(String(r?.content?.[0]?.text ?? '{}'));
const errText = (r: any) => String(r?.content?.[0]?.text ?? '');

function sameRequestSap(): FakeSap {
  return {
    e070: [
      {
        TRKORR: 'ABCK900001',
        TRFUNCTION: 'K',
        TRSTATUS: 'D',
        STRKORR: '',
        AS4USER: 'OWNER',
      },
      {
        TRKORR: 'ABCK900002',
        TRFUNCTION: 'S',
        TRSTATUS: 'D',
        STRKORR: 'ABCK900001',
        AS4USER: 'ME',
      },
    ],
    e071: [
      {
        TRKORR: 'ABCK900001',
        AS4POS: '000001',
        PGMID: 'CORR',
        OBJECT: 'MERG',
        OBJ_NAME: 'ABCK900009',
      },
      {
        TRKORR: 'ABCK900001',
        AS4POS: '000002',
        PGMID: 'LANG',
        OBJECT: 'DTED',
        OBJ_NAME: 'ZDE',
        LANG: '1',
      },
      {
        TRKORR: 'ABCK900001',
        AS4POS: '000003',
        PGMID: 'LANG',
        OBJECT: 'DOMD',
        OBJ_NAME: 'ZDO',
        LANG: '1',
      },
    ],
  };
}

/** A helper that really moves the named rows in the fake E071. */
function movingHelper(sap: FakeSap) {
  return (p: any) => {
    if (p.IV_TEST === 'X')
      return { EV_STATUS: 'S', EV_MESSAGE: 'checks passed' };
    for (const o of p.IT_OBJECTS) {
      const r = sap.e071.find(
        (x) =>
          x.TRKORR === p.IV_FROM &&
          x.PGMID === o.PGMID &&
          x.OBJECT === o.OBJECT &&
          x.OBJ_NAME === o.OBJ_NAME,
      );
      if (r) r.TRKORR = p.IV_TO;
    }
    return { EV_STATUS: 'S', EV_MESSAGE: 'moved' };
  };
}

describe('MoveTransportObjects handler', () => {
  it('request -> own task goes through the helper and is confirmed by read-back', async () => {
    const sap = sameRequestSap();
    sap.onHelper = movingHelper(sap);
    const conn = fakeConnection(sap);
    const res = await handleMoveTransportObjects({ connection: conn } as any, {
      source_transport: 'abck900001',
      target_transport: 'ABCK900002',
      select: { pgmid: 'LANG' },
    });
    const out = parse(res);
    expect(out.verdict).toBe('moved');
    expect(out.route).toBe('same_request_helper');
    expect(out.moved).toHaveLength(2);
    const helperCall = conn.callFunction.mock.calls[0][1];
    expect(helperCall.IV_FROM).toBe('ABCK900001');
    expect(helperCall.IT_OBJECTS.map((o: any) => o.PGMID)).toEqual([
      'LANG',
      'LANG',
    ]);
    // CORR stays
    expect(sap.e071.find((r) => r.PGMID === 'CORR')?.TRKORR).toBe('ABCK900001');
    expect(
      conn.makeAdtRequest.mock.calls.some((c: any) =>
        c[0].url.endsWith('/moveobjects'),
      ),
    ).toBe(false);
  });

  it('the helper saying S is not enough: the read-back decides', async () => {
    const sap = sameRequestSap();
    sap.onHelper = (p: any) =>
      p.IV_TEST === 'X'
        ? { EV_STATUS: 'S' }
        : { EV_STATUS: 'S', EV_MESSAGE: 'ok' };
    const res = await handleMoveTransportObjects(
      { connection: fakeConnection(sap) } as any,
      {
        source_transport: 'ABCK900001',
        target_transport: 'ABCK900002',
        select: { pgmid: 'LANG' },
      },
    );
    const out = parse(res);
    expect(out.success).toBe(false);
    expect(out.verdict).toBe('not_moved');
  });

  it('a helper refusal with nothing moved is an error that says so', async () => {
    const sap = sameRequestSap();
    sap.onHelper = () => ({
      EV_STATUS: 'F',
      EV_MESSAGE: 'ABCK900001 cannot be changed by ME',
    });
    const res = await handleMoveTransportObjects(
      { connection: fakeConnection(sap) } as any,
      {
        source_transport: 'ABCK900001',
        target_transport: 'ABCK900002',
        select: { pgmid: 'LANG' },
      },
    );
    expect(res.isError).toBe(true);
    expect(errText(res)).toMatch(/cannot be changed by ME/);
    expect(errText(res)).toMatch(/nothing was moved/);
  });

  it('dry run calls the helper in test mode and writes nothing', async () => {
    const sap = sameRequestSap();
    sap.onHelper = movingHelper(sap);
    const conn = fakeConnection(sap);
    const out = parse(
      await handleMoveTransportObjects({ connection: conn } as any, {
        source_transport: 'ABCK900001',
        target_transport: 'ABCK900002',
        select: { pgmid: 'LANG' },
        dry_run: true,
      }),
    );
    expect(out).toMatchObject({ dry_run: true, written: false });
    expect(conn.callFunction.mock.calls[0][1].IV_TEST).toBe('X');
    expect(sap.e071.filter((r) => r.TRKORR === 'ABCK900002')).toHaveLength(0);
  });

  it('different requests use SAP move, with the entries in the body', async () => {
    const sap: FakeSap = {
      e070: [
        {
          TRKORR: 'ABCK900002',
          TRFUNCTION: 'S',
          TRSTATUS: 'D',
          STRKORR: 'ABCK900001',
          AS4USER: 'ME',
        },
        {
          TRKORR: 'ABCK900012',
          TRFUNCTION: 'S',
          TRSTATUS: 'D',
          STRKORR: 'ABCK900011',
          AS4USER: 'ME',
        },
      ],
      e071: [
        {
          TRKORR: 'ABCK900002',
          AS4POS: '000001',
          PGMID: 'R3TR',
          OBJECT: 'CLAS',
          OBJ_NAME: 'ZCL_X',
        },
      ],
    };
    let body = '';
    sap.onMove = (b, url) => {
      body = b;
      expect(url).toContain('/transportrequests/ABCK900002/moveobjects');
      sap.e071[0].TRKORR = 'ABCK900012';
    };
    const conn = fakeConnection(sap);
    const out = parse(
      await handleMoveTransportObjects({ connection: conn } as any, {
        source_transport: 'ABCK900002',
        target_transport: 'ABCK900012',
        objects: [{ object_type: 'clas', object_name: 'zcl_x' }],
      }),
    );
    expect(out.route).toBe('sap_move');
    expect(out.verdict).toBe('moved');
    expect(body).toContain('tm:name="ZCL_X"');
    expect(conn.callFunction).not.toHaveBeenCalled();
  });

  it('a failed read-back after the call is unverified, never moved', async () => {
    const sap = sameRequestSap();
    sap.onHelper = movingHelper(sap);
    sap.failReadsAfterCall = true;
    const out = parse(
      await handleMoveTransportObjects(
        { connection: fakeConnection(sap) } as any,
        {
          source_transport: 'ABCK900001',
          target_transport: 'ABCK900002',
          select: { pgmid: 'LANG' },
        },
      ),
    );
    expect(out.verdict).toBe('unverified');
    expect(out.success).toBe(false);
  });

  it('refuses before calling SAP: bad number, same number, missing target, released target', async () => {
    const sap = sameRequestSap();
    const conn = fakeConnection(sap);
    const call = (a: any) =>
      handleMoveTransportObjects({ connection: conn } as any, {
        select: { pgmid: 'LANG' },
        ...a,
      });
    expect(
      errText(
        await call({ source_transport: 'X', target_transport: 'ABCK900002' }),
      ),
    ).toMatch(/not a transport number/);
    expect(
      errText(
        await call({
          source_transport: 'ABCK900001',
          target_transport: 'ABCK900001',
        }),
      ),
    ).toMatch(/must differ/);
    expect(
      errText(
        await call({
          source_transport: 'ABCK900001',
          target_transport: 'ABCK900099',
        }),
      ),
    ).toMatch(/does not exist/);
    sap.e070[1].TRSTATUS = 'R';
    expect(
      errText(
        await call({
          source_transport: 'ABCK900001',
          target_transport: 'ABCK900002',
        }),
      ),
    ).toMatch(/not modifiable/);
    expect(conn.callFunction).not.toHaveBeenCalled();
  });
});
