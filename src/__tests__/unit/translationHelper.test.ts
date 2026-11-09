/**
 * SE63 translation tools (GetTranslation / UpdateTranslation /
 * SetupTranslationHelper) and the RFC helper they call.
 *
 * The property that matters most for an agent that has never heard of the
 * helper: every way the helper can be unusable produces an error that names
 * the next step (SetupTranslationHelper, after asking the user) — never a
 * bare RFC error and never a success-shaped result.
 */

import { handleAddTranslationToTransport } from '../../handlers/translation/high/handleAddTranslationToTransport';
import {
  handleSetupTranslationHelper,
  helperTfdirSql,
} from '../../handlers/translation/high/handleSetupTranslationHelper';
import { handleUpdateTranslation } from '../../handlers/translation/high/handleUpdateTranslation';
import { handleGetTranslation } from '../../handlers/translation/readonly/handleGetTranslation';
import {
  callLxeHelper,
  describeRfcError,
  LxeHelperUnavailable,
  markHelperRewritten,
  normalizeLxeLanguage,
  normalizeLxeObject,
  resetHelperRewrittenFlag,
  sapLanguageOfLxe,
  toTextPairs,
} from '../../lib/translation/lxeHelper';

afterEach(() => resetHelperRewrittenFlag());

import {
  LXE_HELPER_READ,
  LXE_HELPER_READ_SOURCE,
  LXE_HELPER_RECORD,
  LXE_HELPER_RECORD_SOURCE,
  LXE_HELPER_VERSION,
  LXE_HELPER_WRITE,
  LXE_HELPER_WRITE_SOURCE,
} from '../../lib/translation/lxeHelperAbap';

const FU_NOT_FOUND = {
  name: 'ABAPError',
  key: 'FU_NOT_FOUND',
  message: `ID:FL Type:E Number:046 ${LXE_HELPER_READ}`,
};

function rfcConnection(
  impl: (name: string, params: Record<string, unknown>) => any,
) {
  return { callFunction: jest.fn(async (n: string, p: any) => impl(n, p)) };
}

function text(result: any): string {
  return String(result?.content?.[0]?.text ?? '');
}

describe('normalizeLxeLanguage', () => {
  it('keeps an LXE code, fixing its case', () => {
    expect(normalizeLxeLanguage('ZHCN')).toEqual({
      lxe: 'zhCN',
      requested: 'ZHCN',
      expanded: false,
    });
    expect(normalizeLxeLanguage('zh++').lxe).toBe('zh++');
  });

  it('expands an ISO code or a SAP key to one variant and says so', () => {
    expect(normalizeLxeLanguage('ZH')).toMatchObject({
      lxe: 'zhCN',
      expanded: true,
    });
    expect(normalizeLxeLanguage('zf').lxe).toBe('zhTW');
    expect(normalizeLxeLanguage('1').lxe).toBe('zhCN');
    expect(normalizeLxeLanguage('E').lxe).toBe('enUS');
  });

  it('refuses what it does not know instead of guessing', () => {
    expect(() => normalizeLxeLanguage('xx')).toThrow(/LXE code/);
    expect(() => normalizeLxeLanguage('vietnamese')).toThrow(/LXE code/);
    // SAP's 'i' (Indonesian) next to 'I' (Italian): a lower-case single
    // letter is too easy to mean the other one.
    expect(() => normalizeLxeLanguage('i')).toThrow();
  });
});

describe('sapLanguageOfLxe', () => {
  it('maps LXE codes, including ++ variants, to the SAP key', () => {
    expect(sapLanguageOfLxe('zhCN')).toBe('1');
    expect(sapLanguageOfLxe('zh++')).toBe('1');
    expect(sapLanguageOfLxe('zhTW')).toBe('M');
    expect(sapLanguageOfLxe('enUS')).toBe('E');
    expect(sapLanguageOfLxe('qqQQ')).toBeUndefined();
  });
});

describe('normalizeLxeObject', () => {
  it('upper-cases repository names but not names of other types', () => {
    expect(normalizeLxeObject('dtel', ' zmy_de ')).toEqual({
      objtype: 'DTEL',
      objname: 'ZMY_DE',
    });
    expect(normalizeLxeObject('SOTR', 'MixedCase').objname).toBe('MixedCase');
  });
  it('refuses a type that is not an LXE type', () => {
    expect(() => normalizeLxeObject('DATA_ELEMENT', 'X')).toThrow(/LXE/);
  });
});

describe('callLxeHelper — every unusable state names the next step', () => {
  it('not RFC: says the tools need an RFC connection', async () => {
    await expect(callLxeHelper({}, LXE_HELPER_READ, {})).rejects.toMatchObject({
      problem: 'not_rfc',
      message: expect.stringMatching(/RFC connection/),
    });
  });

  it('not installed: names SetupTranslationHelper and asking the user', async () => {
    const conn = rfcConnection(() => {
      throw FU_NOT_FOUND;
    });
    const error = await callLxeHelper(conn, LXE_HELPER_READ, {}).catch(
      (e) => e,
    );
    expect(error).toBeInstanceOf(LxeHelperUnavailable);
    expect(error.problem).toBe('missing');
    expect(error.message).toMatch(/SetupTranslationHelper/);
    expect(error.message).toMatch(/ask the user/);
  });

  it('outdated (no EV_VERSION at all): refuses and names SetupTranslationHelper', async () => {
    const conn = rfcConnection(() => ({ EV_STATUS: 'S' }));
    const error = await callLxeHelper(conn, LXE_HELPER_READ, {}).catch(
      (e) => e,
    );
    expect(error.problem).toBe('outdated');
    expect(error.message).toMatch(/\(none\)/);
    expect(error.message).toMatch(/SetupTranslationHelper/);
  });

  // Measured live: after SetupTranslationHelper rewrote an already-called
  // module, the same process kept seeing the OLD signature (NW RFC SDK cache).
  // "Run setup again" there would loop forever; the message must say restart.
  it('outdated AFTER an in-process rewrite says restart, not setup again', async () => {
    markHelperRewritten();
    const conn = rfcConnection(() => ({ EV_STATUS: 'S' }));
    const error = await callLxeHelper(conn, LXE_HELPER_READ, {}).catch(
      (e) => e,
    );
    expect(error.problem).toBe('outdated');
    expect(error.message).toMatch(/RESTART THE MCP SERVER/);
    expect(error.message).toMatch(/do not run SetupTranslationHelper again/);
  });

  it('another RFC failure is reported with the SAP key, not "[object Object]"', async () => {
    const conn = rfcConnection(() => {
      throw { key: 'RFC_ERROR_SYSTEM_FAILURE', message: 'dump' };
    });
    await expect(callLxeHelper(conn, LXE_HELPER_READ, {})).rejects.toThrow(
      /RFC_ERROR_SYSTEM_FAILURE: dump/,
    );
    expect(describeRfcError({})).toBe('{}');
  });

  it('the right version passes the result through', async () => {
    const conn = rfcConnection(() => ({ EV_VERSION: LXE_HELPER_VERSION }));
    await expect(callLxeHelper(conn, LXE_HELPER_READ, {})).resolves.toEqual({
      EV_VERSION: LXE_HELPER_VERSION,
    });
  });
});

describe('shipped ABAP source', () => {
  it.each([
    [LXE_HELPER_READ, LXE_HELPER_READ_SOURCE],
    [LXE_HELPER_WRITE, LXE_HELPER_WRITE_SOURCE],
    [LXE_HELPER_RECORD, LXE_HELPER_RECORD_SOURCE],
  ])('%s exports and sets the helper version the server checks', (name, source) => {
    expect(source.toLowerCase()).toContain(`function ${name.toLowerCase()}`);
    expect(source).toContain('VALUE(ev_version) TYPE char10');
    expect(source).toContain(`ev_version = '${LXE_HELPER_VERSION}'.`);
  });

  it('the writer refuses the original language before it writes', () => {
    const refuse = LXE_HELPER_WRITE_SOURCE.indexOf('is the ORIGINAL language');
    const write = LXE_HELPER_WRITE_SOURCE.indexOf(
      "CALL FUNCTION 'LXE_OBJ_TEXT_PAIR_WRITE'",
    );
    expect(refuse).toBeGreaterThan(0);
    expect(write).toBeGreaterThan(refuse);
  });
});

describe('toTextPairs', () => {
  it('maps the RFC rows and trims the char padding', () => {
    expect(
      toTextPairs([
        {
          TEXTKEY: 'SCRTEXT_S ',
          S_TEXT: 'Canary ',
          T_TEXT: '',
          UNITMLT: 6,
          UPPCASE: 'X',
        },
      ]),
    ).toEqual([
      {
        key: 'SCRTEXT_S',
        source: 'Canary',
        target: '',
        max_length: 6,
        upper_case: true,
      },
    ]);
  });
});

describe('GetTranslation', () => {
  const pairs = [
    {
      TEXTKEY: 'DDTEXT',
      S_TEXT: 'Sales order',
      T_TEXT: '销售订单',
      UNITMLT: 60,
    },
    { TEXTKEY: 'SCRTEXT_S', S_TEXT: 'SO', T_TEXT: '', UNITMLT: 10 },
  ];

  it('reports the pairs and which keys are untranslated', async () => {
    const conn = rfcConnection(() => ({
      EV_VERSION: LXE_HELPER_VERSION,
      EV_STATUS: 'S',
      EV_ORIG_LANG: 'enUS',
      EV_MESSAGE: '2 text pair(s)',
      ET_TEXTS: pairs,
    }));
    const result = await handleGetTranslation({ connection: conn } as any, {
      object_type: 'dtel',
      object_name: 'zmy_de',
      language: 'ZH',
    });
    expect(result.isError).toBe(false);
    const body = JSON.parse(text(result));
    expect(body).toMatchObject({
      object_type: 'DTEL',
      object_name: 'ZMY_DE',
      language: 'zhCN',
      language_requested: 'ZH',
      original_language: 'enUS',
      target_is_original_language: false,
      untranslated_keys: ['SCRTEXT_S'],
    });
    expect(conn.callFunction).toHaveBeenCalledWith(LXE_HELPER_READ, {
      IV_OBJTYPE: 'DTEL',
      IV_OBJNAME: 'ZMY_DE',
      IV_TARGET_LANG: 'zhCN',
      IV_SOURCE_LANG: '',
      IV_CUSTMNR: '999999',
    });
  });

  it('reading the original language is flagged, not reported as translated', async () => {
    const conn = rfcConnection(() => ({
      EV_VERSION: LXE_HELPER_VERSION,
      EV_STATUS: 'S',
      EV_ORIG_LANG: 'zhCN',
      ET_TEXTS: pairs,
    }));
    const body = JSON.parse(
      text(
        await handleGetTranslation({ connection: conn } as any, {
          object_type: 'DTEL',
          object_name: 'X',
          language: '1',
        }),
      ),
    );
    expect(body.target_is_original_language).toBe(true);
    expect(body.untranslated_keys).toEqual([]);
  });

  it('a helper failure status is an error carrying its message', async () => {
    const conn = rfcConnection(() => ({
      EV_VERSION: LXE_HELPER_VERSION,
      EV_STATUS: 'F',
      EV_MESSAGE: 'DTEL NOPE: no original language found',
    }));
    const result = await handleGetTranslation({ connection: conn } as any, {
      object_type: 'DTEL',
      object_name: 'NOPE',
      language: 'zhCN',
    });
    expect(result.isError).toBe(true);
    expect(text(result)).toMatch(/no original language found/);
  });

  it('a missing helper is an error telling the agent what to do', async () => {
    const conn = rfcConnection(() => {
      throw FU_NOT_FOUND;
    });
    const result = await handleGetTranslation({ connection: conn } as any, {
      object_type: 'DTEL',
      object_name: 'X',
      language: 'zhCN',
    });
    expect(result.isError).toBe(true);
    expect(text(result)).toMatch(/SetupTranslationHelper/);
  });
});

describe('UpdateTranslation', () => {
  it('sends only the passed keys, upper-cased, and reports before/after', async () => {
    const conn = rfcConnection(() => ({
      EV_VERSION: LXE_HELPER_VERSION,
      EV_STATUS: 'S',
      EV_ORIG_LANG: 'enUS',
      EV_MESSAGE: '1 text(s) written to zhCN and verified by read-back',
      ET_BEFORE: [{ TEXTKEY: 'SCRTEXT_M', S_TEXT: 'Order', T_TEXT: '' }],
      ET_AFTER: [{ TEXTKEY: 'SCRTEXT_M', S_TEXT: 'Order', T_TEXT: '订单' }],
    }));
    const result = await handleUpdateTranslation({ connection: conn } as any, {
      object_type: 'DTEL',
      object_name: 'ZMY_DE',
      language: 'zhCN',
      texts: [{ key: 'scrtext_m', text: '订单' }],
    });
    expect(result.isError).toBe(false);
    const body = JSON.parse(text(result));
    expect(body).toMatchObject({
      written: true,
      verified_by_read_back: true,
      changes: [{ key: 'SCRTEXT_M', before: '', after: '订单' }],
    });
    expect(body.transport).toMatch(/LXE_LOG/);
    expect(conn.callFunction.mock.calls[0][1]).toMatchObject({
      IT_TEXTS: [{ TEXTKEY: 'SCRTEXT_M', T_TEXT: '订单' }],
      IV_TEST: '',
    });
  });

  it("the helper's refusal is an error, never a success", async () => {
    const conn = rfcConnection(() => ({
      EV_VERSION: LXE_HELPER_VERSION,
      EV_STATUS: 'F',
      EV_MESSAGE: 'Refused: target language enUS is the ORIGINAL language',
    }));
    const result = await handleUpdateTranslation({ connection: conn } as any, {
      object_type: 'DTEL',
      object_name: 'ZMY_DE',
      language: 'EN',
      texts: [{ key: 'DDTEXT', text: 'x' }],
    });
    expect(result.isError).toBe(true);
    expect(text(result)).toMatch(/ORIGINAL language/);
  });

  it('dry_run sets IV_TEST and claims nothing was written', async () => {
    const conn = rfcConnection(() => ({
      EV_VERSION: LXE_HELPER_VERSION,
      EV_STATUS: 'S',
      ET_BEFORE: [],
      ET_AFTER: [],
    }));
    const body = JSON.parse(
      text(
        await handleUpdateTranslation({ connection: conn } as any, {
          object_type: 'DTEL',
          object_name: 'ZMY_DE',
          language: 'zhCN',
          texts: [{ key: 'DDTEXT', text: 'x' }],
          dry_run: true,
        }),
      ),
    );
    expect(conn.callFunction.mock.calls[0][1].IV_TEST).toBe('X');
    expect(body).toMatchObject({
      written: false,
      verified_by_read_back: false,
      transport: null,
    });
  });

  it('refuses a duplicate or empty key before calling SAP', async () => {
    const conn = rfcConnection(() => ({}));
    const dup = await handleUpdateTranslation({ connection: conn } as any, {
      object_type: 'DTEL',
      object_name: 'X',
      language: 'zhCN',
      texts: [
        { key: 'DDTEXT', text: 'a' },
        { key: 'ddtext', text: 'b' },
      ],
    });
    expect(dup.isError).toBe(true);
    expect(text(dup)).toMatch(/given twice/);
    expect(conn.callFunction).not.toHaveBeenCalled();
  });
});

describe('SetupTranslationHelper', () => {
  it('an up-to-date helper is left alone (no SQL, no write)', async () => {
    const conn = rfcConnection(() => ({ EV_VERSION: LXE_HELPER_VERSION }));
    const result = await handleSetupTranslationHelper(
      { connection: conn } as any,
      {},
    );
    expect(result.isError).toBe(false);
    expect(JSON.parse(text(result))).toMatchObject({ changed: false });
    // one version probe per helper module (READ, WRITE, RECORD)
    expect(conn.callFunction).toHaveBeenCalledTimes(3);
  });

  it('refuses a transportable package without a transport request', async () => {
    const conn = rfcConnection(() => {
      throw FU_NOT_FOUND;
    });
    const result = await handleSetupTranslationHelper(
      { connection: conn } as any,
      { package_name: 'ZMY_PKG' },
    );
    expect(result.isError).toBe(true);
    expect(text(result)).toMatch(/transport_request/);
  });
});

describe('Z_MCP_LXE_RECORD source', () => {
  it('never opens a dialog (it runs over RFC) and checks the request first', () => {
    const src = LXE_HELPER_RECORD_SOURCE;
    const choice = src.indexOf("CALL FUNCTION 'TR_REQUEST_CHOICE'");
    expect(choice).toBeGreaterThan(0);
    expect(src.slice(choice, choice + 200)).toMatch(
      /iv_suppress_dialog\s*=\s*'X'/,
    );
    // request existence / task / status / type are checked before any write
    for (const guard of [
      'does not exist',
      'is a task of request',
      'is not modifiable',
      'language entries go into a workbench',
    ]) {
      const at = src.indexOf(guard);
      expect(at).toBeGreaterThan(0);
      expect(at).toBeLessThan(choice);
    }
  });

  it('only claims success from what it read back on the request', () => {
    const src = LXE_HELPER_RECORD_SOURCE;
    const readBack = src.indexOf('SELECT * FROM e071');
    const success = src.indexOf("ev_status = 'S'");
    expect(readBack).toBeGreaterThan(0);
    expect(success).toBeGreaterThan(readBack);
  });
});

describe('AddTranslationToTransport', () => {
  const ctx = (impl: (n: string, p: any) => any) =>
    ({ connection: rfcConnection(impl) }) as any;

  it('reports the entries read back and maps SLXT error letters to reasons', async () => {
    const context = ctx(() => ({
      EV_VERSION: LXE_HELPER_VERSION,
      EV_STATUS: 'W',
      EV_MESSAGE: '1 of 2 object(s) recorded on ABCK900001',
      ET_ENTRIES: [
        {
          TRKORR: 'ABCK900002',
          PGMID: 'LANG',
          OBJECT: 'DTED',
          OBJ_NAME: 'ZMY_DE',
          LANG: '1',
        },
      ],
      ET_ERRORS: [{ OBJTYPE: 'DTEL', OBJNAME: 'ZMY_OTHER', ERR_TYPE: 'N' }],
    }));
    const result = await handleAddTranslationToTransport(context, {
      transport_request: 'abck900001',
      language: 'ZH',
      objects: [
        { object_type: 'dtel', object_name: 'zmy_de' },
        { object_type: 'DTEL', object_name: 'ZMY_OTHER' },
      ],
    });
    expect(result.isError).toBe(false);
    const body = JSON.parse(text(result));
    expect(body).toMatchObject({
      verdict: 'partial',
      transport_request: 'ABCK900001',
      language: 'zhCN',
      entries: [
        {
          request: 'ABCK900002',
          pgmid: 'LANG',
          object: 'DTED',
          obj_name: 'ZMY_DE',
          lang: '1',
        },
      ],
      errors: [
        {
          reason: 'not_in_translation_log',
          object_type: 'DTEL',
          object_name: 'ZMY_OTHER',
        },
      ],
    });
    const params = context.connection.callFunction.mock.calls[0][1];
    expect(params).toMatchObject({
      IV_REQUEST: 'ABCK900001',
      IV_TARGET_LANG: 'zhCN',
      IV_TEST: '',
      IT_OBJECTS: [
        { OBJTYPE: 'DTEL', OBJNAME: 'ZMY_DE' },
        { OBJTYPE: 'DTEL', OBJNAME: 'ZMY_OTHER' },
      ],
    });
  });

  it('nothing recorded is an error carrying the reasons, never success', async () => {
    const result = await handleAddTranslationToTransport(
      ctx(() => ({
        EV_VERSION: LXE_HELPER_VERSION,
        EV_STATUS: 'F',
        EV_MESSAGE:
          'ABCK900002 is a task of request ABCK900001 - pass the request',
        ET_ERRORS: [],
      })),
      {
        transport_request: 'ABCK900002',
        language: 'zhCN',
        objects: [{ object_type: 'DTEL', object_name: 'ZMY_DE' }],
      },
    );
    expect(result.isError).toBe(true);
    expect(text(result)).toMatch(/nothing recorded/);
    expect(text(result)).toMatch(/is a task of request/);
  });

  it('dry_run sets IV_TEST and claims neither write nor verification', async () => {
    const context = ctx(() => ({
      EV_VERSION: LXE_HELPER_VERSION,
      EV_STATUS: 'S',
      ET_ENTRIES: [],
      ET_ERRORS: [],
    }));
    const body = JSON.parse(
      text(
        await handleAddTranslationToTransport(context, {
          transport_request: 'ABCK900001',
          language: 'zhCN',
          objects: [{ object_type: 'DTEL', object_name: 'ZMY_DE' }],
          dry_run: true,
        }),
      ),
    );
    expect(context.connection.callFunction.mock.calls[0][1].IV_TEST).toBe('X');
    expect(body).toMatchObject({ written: false, verified_on_request: false });
  });

  it('refuses a malformed request number or a duplicate object before calling SAP', async () => {
    const context = ctx(() => ({}));
    const bad = await handleAddTranslationToTransport(context, {
      transport_request: 'not-a-request',
      language: 'zhCN',
      objects: [{ object_type: 'DTEL', object_name: 'X' }],
    });
    expect(bad.isError).toBe(true);
    const dup = await handleAddTranslationToTransport(context, {
      transport_request: 'ABCK900001',
      language: 'zhCN',
      objects: [
        { object_type: 'DTEL', object_name: 'X' },
        { object_type: 'dtel', object_name: 'x' },
      ],
    });
    expect(text(dup)).toMatch(/given twice/);
    expect(context.connection.callFunction).not.toHaveBeenCalled();
  });

  it('a missing helper module names SetupTranslationHelper', async () => {
    const result = await handleAddTranslationToTransport(
      ctx(() => {
        throw FU_NOT_FOUND;
      }),
      {
        transport_request: 'ABCK900001',
        language: 'zhCN',
        objects: [{ object_type: 'DTEL', object_name: 'X' }],
      },
    );
    expect(text(result)).toMatch(/SetupTranslationHelper/);
  });
});

describe('SetupTranslationHelper TFDIR read', () => {
  // Measured live: a hard-coded IN-list of the first two modules made the
  // installer re-create the third ("already exists") and call it "not
  // RFC-enabled" after a successful install.
  it('names every helper module', () => {
    for (const name of [LXE_HELPER_READ, LXE_HELPER_WRITE, LXE_HELPER_RECORD]) {
      expect(helperTfdirSql()).toContain(`'${name}'`);
    }
  });
});

describe('a helper NEWER than this build', () => {
  it('is not called outdated, and the message forbids running setup', async () => {
    const newer = String(Number(LXE_HELPER_VERSION) + 1);
    const conn = rfcConnection(() => ({ EV_VERSION: newer }));
    const error = await callLxeHelper(conn, LXE_HELPER_READ, {}).catch(
      (e) => e,
    );
    expect(error.problem).toBe('newer');
    expect(error.message).toMatch(/Do NOT run SetupTranslationHelper/);
  });

  it('SetupTranslationHelper refuses to downgrade it', async () => {
    const newer = String(Number(LXE_HELPER_VERSION) + 1);
    const conn = rfcConnection(() => ({ EV_VERSION: newer }));
    const result = await handleSetupTranslationHelper(
      { connection: conn } as any,
      {},
    );
    expect(result.isError).toBe(true);
    expect(text(result)).toMatch(/Refusing to downgrade/);
  });
});
