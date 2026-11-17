/**
 * Issue #6: a FIRST install of an RFC helper must not end in "restart the MCP
 * server" because an earlier call in the same process failed.
 *
 * The NW RFC SDK caches function descriptions per process, so a helper that
 * was called and then rewritten is refused until a restart. But a module that
 * did not exist before the write (TFDIR) and never answered here cannot have a
 * cached description — a dropped connection or a timeout before the install
 * leaves nothing behind. The upgrade case must stay exactly as strict.
 *
 * The installer runs against a fake SAP: TFDIR / TADIR rows and module sources
 * live in `sap`, the four ADT handlers it uses write into it, and the RFC
 * caller answers from it — FU_NOT_FOUND for a module that is not there.
 */

const sap = {
  /** module name -> helper version in its active source */
  modules: new Map<string, string>(),
  groupExists: false,
};

jest.mock('../../lib/clients', () => ({
  createAdtClient: () => ({
    getUtils: () => ({
      getSqlQuery: async ({ sql_query }: { sql_query: string }) => ({
        status: 200,
        data: sql_query,
      }),
    }),
  }),
}));

jest.mock('../../handlers/system/readonly/handleGetSqlQuery', () => ({
  parseSqlQueryXml: (sql: string) => {
    if (/FROM tadir/i.test(sql)) {
      return {
        rows: sap.groupExists
          ? [{ OBJ_NAME: 'ZMCP_TRAN', DEVCLASS: '$TMP' }]
          : [],
      };
    }
    return {
      rows: [...sap.modules.keys()].map((name) => ({
        FUNCNAME: name,
        PNAME: 'SAPLZMCP_TRAN',
        FMODE: 'R',
      })),
    };
  },
}));

const ok = { isError: false, content: [{ type: 'text', text: '{}' }] };

jest.mock('../../handlers/function/high/handleCreateFunctionGroup', () => ({
  handleCreateFunctionGroup: async () => {
    sap.groupExists = true;
    return ok;
  },
}));

jest.mock('../../handlers/function/high/handleCreateFunctionModule', () => ({
  handleCreateFunctionModule: async () => ok,
}));

jest.mock('../../handlers/function/high/handleUpdateFunctionModule', () => ({
  handleUpdateFunctionModule: async (_c: unknown, args: any) => {
    const version = String(args.source_code).match(
      /ev_version\s*=\s*'([^']*)'/i,
    )?.[1];
    sap.modules.set(args.function_module_name, version ?? '');
    return ok;
  },
}));

jest.mock(
  '../../handlers/function_module/high/handleGetFunctionModule',
  () => ({
    handleGetFunctionModule: async (_c: unknown, args: any) => ({
      isError: false,
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            function_module_data: `  ev_version = '${sap.modules.get(args.function_module_name) ?? ''}'.`,
          }),
        },
      ],
    }),
  }),
);

import { installRfcHelper } from '../../lib/rfcHelper/installer';
import {
  callRfcHelper,
  hasStaleSignature,
  markRewritten,
  noteHelperCalled,
  RESTART_REQUIRED_MARKER,
  resetRewritten,
} from '../../lib/rfcHelper/rfcHelper';
import { TRAN_HELPER_SPEC as SPEC } from '../../lib/transaction/tranHelperSpec';

const FIRST = SPEC.modules[0].name;
const COMMUNICATION_FAILURE = {
  key: 'RFC_COMMUNICATION_FAILURE',
  message: 'connection closed',
};

/** An RFC connection onto the fake SAP; `failNext` calls fail first. */
function connection(failNext = 0) {
  let failures = failNext;
  return {
    invalidateSession: jest.fn(async () => undefined),
    callFunction: jest.fn(async (name: string) => {
      if (failures > 0) {
        failures -= 1;
        throw COMMUNICATION_FAILURE;
      }
      if (!sap.modules.has(name)) throw { key: 'FU_NOT_FOUND' };
      return { EV_VERSION: sap.modules.get(name), EV_STATUS: 'S' };
    }),
  };
}

const text = (r: any) => String(r?.content?.[0]?.text ?? '');
const install = (c: unknown, args = {}) =>
  installRfcHelper({ connection: c } as any, SPEC, args);

beforeEach(() => {
  sap.modules.clear();
  sap.groupExists = false;
});
afterEach(() => resetRewritten());

describe('a first install after an earlier failure in the same process', () => {
  it('order 1: tool call hits a dropped connection, then FU_NOT_FOUND, then setup', async () => {
    const c = connection(1);
    await expect(callRfcHelper(SPEC, c, FIRST, {})).rejects.toThrow(
      /RFC_COMMUNICATION_FAILURE/,
    );
    await expect(callRfcHelper(SPEC, c, FIRST, {})).rejects.toThrow(
      new RegExp(SPEC.setupTool),
    );

    const result = await install(c);
    expect(result.isError).toBe(false);
    expect(JSON.parse(text(result))).toMatchObject({
      changed: true,
      rfc_verified: true,
      restart_required: false,
    });
    expect(text(result)).not.toContain(RESTART_REQUIRED_MARKER);
    expect(hasStaleSignature(SPEC)).toBe(false);

    // The helper is usable in this process, and setup again changes nothing.
    const answer = await callRfcHelper(SPEC, c, FIRST, {});
    expect(answer.EV_VERSION).toBe(SPEC.version);
    const again = JSON.parse(text(await install(c)));
    expect(again).toMatchObject({ changed: false, restart_required: false });
  });

  it("order 2: setup's own version probe hits a dropped connection", async () => {
    const c = connection(1);
    const result = await install(c);
    expect(result.isError).toBe(false);
    expect(JSON.parse(text(result))).toMatchObject({
      changed: true,
      rfc_verified: true,
      restart_required: false,
    });
    await expect(callRfcHelper(SPEC, c, FIRST, {})).resolves.toMatchObject({
      EV_VERSION: SPEC.version,
    });
  });
});

describe('an upgrade stays as strict as before', () => {
  const installOld = () => {
    sap.groupExists = true;
    for (const m of SPEC.modules) sap.modules.set(m.name, '0');
  };

  it('called (answered) then rewritten: restart, and every further call refused', async () => {
    installOld();
    const c = connection();
    await expect(callRfcHelper(SPEC, c, FIRST, {})).rejects.toThrow(
      new RegExp(`Run ${SPEC.setupTool} again`),
    );

    const body = JSON.parse(text(await install(c)));
    expect(body).toMatchObject({
      changed: true,
      rfc_verified: false,
      restart_required: true,
    });
    expect(body.message).toContain(RESTART_REQUIRED_MARKER);

    const calls = c.callFunction.mock.calls.length;
    const refusal = await callRfcHelper(SPEC, c, FIRST, {}).catch((e) => e);
    expect(refusal.message).toContain(RESTART_REQUIRED_MARKER);
    expect(refusal.message).toMatch(/RESTART THE MCP SERVER/);
    expect(c.callFunction.mock.calls.length).toBe(calls);

    const again = JSON.parse(text(await install(c)));
    expect(again).toMatchObject({ changed: false, restart_required: true });
  });

  it('an existing module whose only call FAILED is still treated as cached', async () => {
    installOld();
    const c = connection(SPEC.modules.length);
    const body = JSON.parse(text(await install(c)));
    expect(body).toMatchObject({ changed: true, restart_required: true });
  });

  it('an installed helper keeps working after one dropped connection', async () => {
    sap.groupExists = true;
    for (const m of SPEC.modules) sap.modules.set(m.name, SPEC.version);
    const c = connection(1);
    await expect(callRfcHelper(SPEC, c, FIRST, {})).rejects.toThrow(
      /RFC_COMMUNICATION_FAILURE/,
    );
    await expect(callRfcHelper(SPEC, c, FIRST, {})).resolves.toMatchObject({
      EV_VERSION: SPEC.version,
    });
  });
});

describe('what counts as a cached signature', () => {
  it('a module that ANSWERED here is stale after a rewrite even if TFDIR no longer listed it', () => {
    // Deleted on the system and installed again: the description is still cached.
    noteHelperCalled(SPEC, FIRST);
    markRewritten(SPEC, FIRST, false);
    expect(hasStaleSignature(SPEC)).toBe(true);
  });

  it('a failed call counts only when the module existed before the write', () => {
    noteHelperCalled(SPEC, FIRST, COMMUNICATION_FAILURE);
    markRewritten(SPEC, FIRST, false);
    expect(hasStaleSignature(SPEC)).toBe(false);
    markRewritten(SPEC, FIRST, true);
    expect(hasStaleSignature(SPEC)).toBe(true);
  });

  it('without a module name the conservative answer is used', () => {
    noteHelperCalled(SPEC, FIRST, COMMUNICATION_FAILURE);
    markRewritten(SPEC);
    expect(hasStaleSignature(SPEC)).toBe(true);
  });
});
