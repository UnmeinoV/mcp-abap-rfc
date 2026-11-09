/**
 * The local connection factory must deliver SAP_SAPROUTER / SAP_LANGUAGE to
 * the NW RFC SDK, and must refuse rather than connect without the route.
 *
 * The parameters are patched onto a field the dependency does not export, so
 * the test that matters is the one at the bottom: the REAL dependency
 * connection, opened against a mocked SDK binding, must hand the SDK a
 * parameter object carrying `saprouter`. A patch that lands on an object the
 * dependency no longer reads would pass every other test here.
 */

const clientCtor = jest.fn();
const clientEvents: string[] = [];
const clientCall = jest.fn(async (_fm: string, _params: unknown) => ({
  RESPONSE: { STATUS_LINE: { STATUS_CODE: 200 }, MESSAGE_BODY: 'ok' },
}));

jest.mock(
  '@mcp-abap-adt/sap-rfc-lite',
  () => ({
    Client: class {
      alive = false;
      constructor(params: Record<string, string>) {
        clientCtor(params);
      }
      async open() {
        this.alive = true;
        return this;
      }
      async close() {
        clientEvents.push('close');
        this.alive = false;
      }
      call(fm: string, params: unknown) {
        return clientCall(fm, params);
      }
    },
  }),
  { virtual: true },
);

import {
  applyRfcOverrides,
  createAbapConnection,
  defaultRfcTraceDir,
  endRfcSession,
  getRfcFunctionCaller,
  rfcParamOverrides,
} from '../../lib/connectionFactory';

const rfcConfig = {
  url: 'http://172.16.0.1:8000',
  authType: 'basic' as const,
  username: 'SOME.USER',
  password: 'secret',
  client: '100',
  connectionType: 'rfc' as const,
};

describe('rfcParamOverrides', () => {
  it('maps SAP_SAPROUTER and an upper-cased SAP_LANGUAGE', () => {
    expect(
      rfcParamOverrides({
        SAP_SAPROUTER: ' /H/1.2.3.4/H/ ',
        SAP_LANGUAGE: 'zh',
      }),
    ).toEqual({
      saprouter: '/H/1.2.3.4/H/',
      lang: 'ZH',
      no_compression: '1',
    });
  });

  // Measured 2026-10-20 (S4D, through the SAProuter): with compression on, a
  // request whose MESSAGE_BODY compresses badly — 120 KB of random base64, or
  // the base64 checkrun artifact of a 156 KB program — dumps on the server with
  // XML_FORMAT_ERROR while SAPMSSY1 deserializes the RFC parameters, before
  // SADT_REST_RFC_ENDPOINT runs. The same three bodies pass with NO_COMPRESSION.
  it('turns RFC compression off when nothing is set', () => {
    expect(rfcParamOverrides({})).toEqual({ no_compression: '1' });
  });

  it('keeps the SDK default compression when SAP_RFC_COMPRESSION=on', () => {
    expect(rfcParamOverrides({ SAP_RFC_COMPRESSION: ' On ' })).toEqual({});
  });
});

describe('defaultRfcTraceDir', () => {
  it('sends SDK trace files to the temp dir, not the working directory', () => {
    const env: NodeJS.ProcessEnv = {};
    defaultRfcTraceDir(env);
    expect(env.RFC_TRACE_DIR).toMatch(/mcp-abap-rfc-rfc-trace$/);
    expect(env.RFC_TRACE_DIR?.startsWith(process.cwd())).toBe(false);
  });

  it("keeps the user's own choice", () => {
    const env: NodeJS.ProcessEnv = { RFC_TRACE_DIR: '/var/log/rfc' };
    defaultRfcTraceDir(env);
    expect(env.RFC_TRACE_DIR).toBe('/var/log/rfc');
  });
});

describe('applyRfcOverrides', () => {
  it('refuses when the dependency no longer exposes rfcParams and a route is configured', () => {
    const stub = { connect: jest.fn(), makeAdtRequest: jest.fn() };
    expect(() =>
      applyRfcOverrides(stub as any, { SAP_SAPROUTER: '/H/1.2.3.4/H/' }),
    ).toThrow(/Refusing to connect without them/);
  });

  it('is a no-op without rfcParams when nothing needs patching', () => {
    const stub = { connect: jest.fn(), makeAdtRequest: jest.fn() };
    expect(() => applyRfcOverrides(stub as any, {})).not.toThrow();
  });

  it('opens the connection once on first use, even for concurrent requests', async () => {
    const stub: any = {
      rfcParams: {},
      rfcClient: null,
      connect: jest.fn(async () => {
        await new Promise((r) => setTimeout(r, 5));
        stub.rfcClient = { alive: true };
      }),
      makeAdtRequest: jest.fn(async () => ({ status: 200 })),
    };
    const original = stub.makeAdtRequest;
    applyRfcOverrides(stub, { SAP_SAPROUTER: '/H/1.2.3.4/H/' });

    await Promise.all([
      stub.makeAdtRequest({ url: '/a' }),
      stub.makeAdtRequest({ url: '/b' }),
    ]);
    await stub.makeAdtRequest({ url: '/c' });

    expect(stub.connect).toHaveBeenCalledTimes(1);
    expect(original).toHaveBeenCalledTimes(3);
    expect(stub.rfcParams).toEqual({
      saprouter: '/H/1.2.3.4/H/',
      no_compression: '1',
    });
  });
});

describe('createAbapConnection (real dependency connection)', () => {
  const saved = { ...process.env };
  afterEach(() => {
    process.env = { ...saved };
    clientCtor.mockClear();
    clientCall.mockClear();
  });

  const acceptHeadersSent = () =>
    (clientCall.mock.calls[0] as any[])[1].REQUEST.HEADER_FIELDS.filter(
      (h: { NAME: string }) => h.NAME.toLowerCase() === 'accept',
    );

  // The dependency's HTTP connection sends this Accept when the caller names
  // none; its RFC connection sends no Accept at all, and ADT then answers some
  // resources (e.g. /programs/includes/{name}/source/main) with a bare 400.
  it('sends the same default Accept as the HTTP path when the caller names none', async () => {
    const connection: any = createAbapConnection(rfcConfig as any);
    await connection.makeAdtRequest({ url: '/sap/bc/adt/x', method: 'GET' });

    expect(acceptHeadersSent()).toEqual([
      {
        NAME: 'Accept',
        VALUE: 'application/xml, application/json, text/plain, */*',
      },
    ]);
  });

  it("keeps the caller's own Accept and sends it only once", async () => {
    const connection: any = createAbapConnection(rfcConfig as any);
    await connection.makeAdtRequest({
      url: '/sap/bc/adt/x',
      method: 'GET',
      headers: { accept: 'application/vnd.sap.adt.packages.v1+xml' },
    });

    expect(acceptHeadersSent()).toEqual([
      { NAME: 'accept', VALUE: 'application/vnd.sap.adt.packages.v1+xml' },
    ]);
  });

  it('hands the SDK a parameter object carrying saprouter and lang', async () => {
    process.env.SAP_SAPROUTER = '/H/1.2.3.4/H/';
    process.env.SAP_LANGUAGE = 'zh';
    const connection: any = createAbapConnection(rfcConfig as any);
    await connection.connect();

    expect(clientCtor).toHaveBeenCalledTimes(1);
    expect(clientCtor.mock.calls[0][0]).toMatchObject({
      ashost: '172.16.0.1',
      sysnr: '00',
      client: '100',
      saprouter: '/H/1.2.3.4/H/',
      lang: 'ZH',
      no_compression: '1',
    });
  });

  // The classrun stale-shell remedy (lib/classrunSession.ts) terminates the
  // SAP session and re-drives once. The dependency's RFC connection has no
  // invalidateSession(), so over RFC that remedy silently never ran.
  it('can terminate its SAP session, and the next request logs on afresh', async () => {
    const connection: any = createAbapConnection(rfcConfig as any);
    await connection.makeAdtRequest({ url: '/sap/bc/adt/x', method: 'GET' });
    expect(typeof connection.invalidateSession).toBe('function');

    await connection.invalidateSession();
    await connection.makeAdtRequest({ url: '/sap/bc/adt/x', method: 'GET' });

    expect(clientCtor).toHaveBeenCalledTimes(2);
  });

  // Review #3: the dependency's RFC client has no request queue, so closing it
  // while another tool's request is in flight fails that request with an RFC
  // error that names nothing. The reset must wait for in-flight requests.
  it('lets an in-flight request finish before ending the session', async () => {
    clientEvents.length = 0;
    const connection: any = createAbapConnection(rfcConfig as any);
    await connection.makeAdtRequest({ url: '/sap/bc/adt/warm', method: 'GET' });
    clientCall.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(() => {
            clientEvents.push('slow-call-done');
            resolve({
              RESPONSE: {
                STATUS_LINE: { STATUS_CODE: 200 },
                MESSAGE_BODY: 'ok',
              },
            });
          }, 20),
        ) as any,
    );
    const slow = connection.makeAdtRequest({
      url: '/sap/bc/adt/slow',
      method: 'GET',
    });
    await new Promise((r) => setTimeout(r, 1));
    await connection.invalidateSession();
    await slow;

    expect(clientEvents).toEqual(['slow-call-done', 'close']);
  });

  // lib/translation calls RFC-enabled Z modules directly; ADT has no resource
  // for them. The call must go to the SAME opened client as the ADT requests.
  it('calls a plain RFC function module on the same session, opening it on first use', async () => {
    clientCall.mockImplementationOnce(async () => ({ EV_VERSION: '1' }) as any);
    const connection: any = createAbapConnection(rfcConfig as any);
    const call = getRfcFunctionCaller(connection);
    expect(call).toBeDefined();

    const result = await call!('Z_SOME_RFC', { IV_X: 'A' });

    expect(result).toEqual({ EV_VERSION: '1' });
    expect(clientCtor).toHaveBeenCalledTimes(1);
    expect(clientCall).toHaveBeenCalledWith('Z_SOME_RFC', { IV_X: 'A' });
  });

  // CreateMessageClass over RFC left the new class edit-locked by the
  // connection's own ABAP session; ending the session releases it.
  it('endRfcSession ends the ABAP session; the next request logs on afresh', async () => {
    const connection: any = createAbapConnection(rfcConfig as any);
    await connection.makeAdtRequest({ url: '/sap/bc/adt/x', method: 'GET' });
    expect(await endRfcSession(connection)).toBe('reset');
    await connection.makeAdtRequest({ url: '/sap/bc/adt/x', method: 'GET' });
    expect(clientCtor).toHaveBeenCalledTimes(2);
  });

  it('endRfcSession leaves a stateful session (and its locks) alone', async () => {
    const connection: any = createAbapConnection(rfcConfig as any);
    await connection.makeAdtRequest({ url: '/sap/bc/adt/x', method: 'GET' });
    connection.setSessionType('stateful');
    expect(await endRfcSession(connection)).toBe('skipped_stateful');
    await connection.makeAdtRequest({ url: '/sap/bc/adt/x', method: 'GET' });
    expect(clientCtor).toHaveBeenCalledTimes(1);
  });

  it('builds an RFC connection when the caller names no connection type', () => {
    process.env.SAP_SAPROUTER = '/H/1.2.3.4/H/';
    const { connectionType: _ignored, ...untyped } = rfcConfig;
    const connection: any = createAbapConnection(untyped as any);
    expect(connection.rfcParams).toMatchObject({ saprouter: '/H/1.2.3.4/H/' });
    expect(getRfcFunctionCaller(connection)).toBeDefined();
  });

  it('refuses an HTTP connection, naming it', () => {
    expect(() =>
      createAbapConnection({ ...rfcConfig, connectionType: 'http' } as any),
    ).toThrow(/connectionType 'http'.*RFC only/);
  });

  const SAP_EXCEPTION =
    '<exc:exception xmlns:exc="x"><message lang="EN">Resource not acceptable</message>' +
    '<properties><entry key="T100KEY-ID">SADT_RESOURCE</entry>' +
    '<entry key="T100KEY-NO">044</entry></properties></exc:exception>';

  it("puts SAP's explanation into the message of a failed RFC request", async () => {
    clientCall.mockResolvedValueOnce({
      RESPONSE: {
        STATUS_LINE: { STATUS_CODE: 406 },
        MESSAGE_BODY: SAP_EXCEPTION,
      },
    } as any);
    const connection: any = createAbapConnection(rfcConfig as any);

    await expect(
      connection.makeAdtRequest({ url: '/sap/bc/adt/x', method: 'GET' }),
    ).rejects.toThrow(
      'Request failed with status 406: GET /sap/bc/adt/x — SAP: Resource not acceptable [SADT_RESOURCE/044]',
    );
  });

  // Measured live 2026-10-14: every Data Preview query generates temporary
  // subroutine pools in the ONE ABAP session an RFC connection keeps, and the
  // 19th query of a fresh connection failed with this runtime error — as did
  // every query after it, until the session was reset.
  const subpoolFull = () =>
    Promise.reject({
      name: 'ABAPError',
      group: 2,
      code: 3,
      codeString: 'RFC_ABAP_RUNTIME_FAILURE',
      key: 'GENERATE_SUBPOOL_DIR_FULL',
      message: 'No further temporary subroutine pools can be generated.',
    });
  const ok = () =>
    Promise.resolve({
      RESPONSE: { STATUS_LINE: { STATUS_CODE: 200 }, MESSAGE_BODY: 'ok' },
    });

  describe('when the RFC session runs out of subroutine pools', () => {
    it('resets the session and retries a Data Preview query once', async () => {
      const connection: any = createAbapConnection(rfcConfig as any);
      clientCall
        .mockImplementationOnce(subpoolFull as any)
        .mockImplementationOnce(ok as any);

      const response = await connection.makeAdtRequest({
        url: '/sap/bc/adt/datapreview/freestyle',
        method: 'POST',
        data: 'SELECT * FROM T000',
      });

      expect(response.data).toBe('ok');
      expect(clientCtor).toHaveBeenCalledTimes(2); // logged on afresh
      expect(clientCall).toHaveBeenCalledTimes(2);
    });

    it('resets the session and retries a GET once', async () => {
      const connection: any = createAbapConnection(rfcConfig as any);
      clientCall
        .mockImplementationOnce(subpoolFull as any)
        .mockImplementationOnce(ok as any);

      await connection.makeAdtRequest({ url: '/sap/bc/adt/x', method: 'GET' });

      expect(clientCtor).toHaveBeenCalledTimes(2);
      expect(clientCall).toHaveBeenCalledTimes(2);
    });

    it('resets but does NOT re-send a write, and says so', async () => {
      const connection: any = createAbapConnection(rfcConfig as any);
      clientCall.mockImplementationOnce(subpoolFull as any);

      await expect(
        connection.makeAdtRequest({
          url: '/sap/bc/adt/programs/programs',
          method: 'POST',
          data: '<x/>',
        }),
      ).rejects.toThrow(/session has been reset.*not re-sent/s);
      expect(clientCall).toHaveBeenCalledTimes(1);

      await connection.makeAdtRequest({ url: '/sap/bc/adt/x', method: 'GET' });
      expect(clientCtor).toHaveBeenCalledTimes(2); // the next call works
    });

    it('leaves a stateful session (locks) alone, and says why', async () => {
      const connection: any = createAbapConnection(rfcConfig as any);
      connection.setSessionType('stateful');
      clientCall.mockImplementationOnce(subpoolFull as any);

      await expect(
        connection.makeAdtRequest({ url: '/sap/bc/adt/x', method: 'GET' }),
      ).rejects.toThrow(/not reset because it is stateful/);
      expect(clientCtor).toHaveBeenCalledTimes(1);
      expect(clientCall).toHaveBeenCalledTimes(1);
    });

    it('retries only once', async () => {
      const connection: any = createAbapConnection(rfcConfig as any);
      clientCall
        .mockImplementationOnce(subpoolFull as any)
        .mockImplementationOnce(subpoolFull as any);

      await expect(
        connection.makeAdtRequest({ url: '/sap/bc/adt/x', method: 'GET' }),
      ).rejects.toThrow(/GENERATE_SUBPOOL_DIR_FULL/);
      expect(clientCall).toHaveBeenCalledTimes(2);
    });

    it('resets once for concurrent requests that failed in the same session', async () => {
      const connection: any = createAbapConnection(rfcConfig as any);
      await connection.makeAdtRequest({
        url: '/sap/bc/adt/warm',
        method: 'GET',
      });
      clientCall
        .mockImplementationOnce(subpoolFull as any)
        .mockImplementationOnce(subpoolFull as any);

      await Promise.all([
        connection.makeAdtRequest({ url: '/sap/bc/adt/a', method: 'GET' }),
        connection.makeAdtRequest({ url: '/sap/bc/adt/b', method: 'GET' }),
      ]);

      expect(clientCtor).toHaveBeenCalledTimes(2);
    });
  });
});
