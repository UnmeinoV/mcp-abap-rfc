/**
 * The stdio server connects from RfcSettings alone — no auth broker. The
 * REAL connection factory and the REAL dependency RFC connection are used;
 * only the SDK binding is mocked, so the parameter object asserted here is
 * exactly what the NW RFC SDK would receive.
 */

const clientCtor = jest.fn();

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
        this.alive = false;
      }
      call() {
        return Promise.resolve({
          RESPONSE: { STATUS_LINE: { STATUS_CODE: 200 }, MESSAGE_BODY: '' },
        });
      }
    },
  }),
  { virtual: true },
);

import { CompositeHandlersRegistry } from '../../lib/handlers/registry/CompositeHandlersRegistry';
import { parseRfcEnv } from '../../lib/rfcEnv';
import { resetSapClientConfig } from '../../lib/sapClients';
import { resetSystemContextCache } from '../../lib/systemContext';
import { StdioServer } from '../../server/StdioServer';

const ROUTER: Record<string, string | undefined> = {
  SAP_ASHOST: '172.16.0.1',
  SAP_SYSNR: '07',
  SAP_CLIENT: '800',
  SAP_USERNAME: 'SOME.USER',
  SAP_PASSWORD: 'x',
  SAP_LANGUAGE: 'ZH',
  SAP_SAPROUTER: '/H/1.2.3.4/H/',
  SAP_CONNECTION_TYPE: 'rfc',
  SAP_AUTH_TYPE: 'basic',
  SAP_SYSTEM_TYPE: 'onprem',
};

const TOUCHED = [
  'SAP_ASHOST',
  'SAP_SYSNR',
  'SAP_CLIENT',
  'SAP_USERNAME',
  'SAP_SYSTEM_TYPE',
  'SAP_LANGUAGE',
  'SAP_SAPROUTER',
  'SAP_RFC_COMPRESSION',
  'SAP_MASTER_SYSTEM',
  'SAP_RESPONSIBLE',
  'SAP_CONNECTION_TYPE',
  'SAP_URL',
  'SAP_CLIENTS',
];

class ProbeServer extends StdioServer {
  connectFrom(settings: ReturnType<typeof parseRfcEnv>) {
    return this.setConnectionContext(settings);
  }
  open() {
    return this.getConnection();
  }
}

describe('stdio server connects from RfcSettings', () => {
  const saved: Record<string, string | undefined> = {};
  beforeEach(() => {
    for (const k of TOUCHED) {
      saved[k] = process.env[k];
      delete process.env[k];
    }
    clientCtor.mockClear();
    resetSystemContextCache();
    resetSapClientConfig();
  });
  afterEach(() => {
    for (const k of TOUCHED) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
    resetSystemContextCache();
  });

  it('hands the SDK the address, client, route and language of the env file', async () => {
    const server = new ProbeServer(
      new CompositeHandlersRegistry([]),
      parseRfcEnv(ROUTER, 'f'),
    );
    await server.connectFrom(parseRfcEnv(ROUTER, 'f'));
    clientCtor.mockClear(); // the system-context probe is not the subject

    await server.open();
    expect(clientCtor).toHaveBeenCalledTimes(1);
    const params = clientCtor.mock.calls[0][0];
    expect(params).toMatchObject({
      ashost: '172.16.0.1',
      sysnr: '07',
      client: '800',
      saprouter: '/H/1.2.3.4/H/',
      lang: 'ZH',
    });
    expect(params.no_compression).toBe('1');
  });

  it('reuses one connection for every call (one RFC logon per process)', async () => {
    const server = new ProbeServer(
      new CompositeHandlersRegistry([]),
      parseRfcEnv(ROUTER, 'f'),
    );
    await server.connectFrom(parseRfcEnv(ROUTER, 'f'));
    clientCtor.mockClear();

    const first = await server.open();
    const second = await server.open();
    expect(second).toBe(first);
    expect(clientCtor).toHaveBeenCalledTimes(1);
  });
});
