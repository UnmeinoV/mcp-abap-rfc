/**
 * An RFC env file may address the system as SAP_ASHOST + SAP_SYSNR instead of
 * SAP_URL. What matters is the end of the chain: loadRfcEnv accepts such a
 * file, and the REAL dependency connection built from the URL it derives
 * hands the SDK exactly that ashost and sysnr.
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

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { createAbapConnection } from '../../lib/connectionFactory';
import { assertRfcAddress, rfcServiceUrl } from '../../lib/rfcAddress';
import { exportRfcSettingsToProcessEnv, loadRfcEnv } from '../../lib/rfcEnv';

const RFC = { SAP_CONNECTION_TYPE: 'rfc' };

describe('assertRfcAddress', () => {
  const saved = process.env.SAP_CONNECTION_TYPE;
  beforeEach(() => {
    delete process.env.SAP_CONNECTION_TYPE;
  });
  afterAll(() => {
    if (saved === undefined) delete process.env.SAP_CONNECTION_TYPE;
    else process.env.SAP_CONNECTION_TYPE = saved;
  });

  it('is a no-op without SAP_ASHOST', () => {
    expect(() => assertRfcAddress({ SAP_URL: 'http://h:8000' })).not.toThrow();
  });

  it('accepts an IP + two-digit instance number on RFC', () => {
    expect(() =>
      assertRfcAddress({ ...RFC, SAP_ASHOST: '10.0.0.5', SAP_SYSNR: '00' }),
    ).not.toThrow();
  });

  it('refuses SAP_ASHOST on an HTTP connection — 80XX would be a guess', () => {
    expect(() =>
      assertRfcAddress({ SAP_ASHOST: '10.0.0.5', SAP_SYSNR: '00' }),
    ).toThrow(/SAP_CONNECTION_TYPE is not "rfc"/);
  });

  it('takes the connection type from process.env when the file has none', () => {
    process.env.SAP_CONNECTION_TYPE = 'rfc';
    expect(() =>
      assertRfcAddress({ SAP_ASHOST: '10.0.0.5', SAP_SYSNR: '00' }),
    ).not.toThrow();
  });

  it('refuses a missing instance number instead of defaulting to 00', () => {
    expect(() => assertRfcAddress({ ...RFC, SAP_ASHOST: '10.0.0.5' })).toThrow(
      /needs SAP_SYSNR/,
    );
  });

  it.each(['0', '000', 'ab'])('refuses SAP_SYSNR=%s', (sysnr) => {
    expect(() =>
      assertRfcAddress({ ...RFC, SAP_ASHOST: '10.0.0.5', SAP_SYSNR: sysnr }),
    ).toThrow(/two digits/);
  });

  it.each([
    'http://10.0.0.5',
    '10.0.0.5:3200',
    '10.0.0.5/x',
    'u@10.0.0.5',
  ])('refuses SAP_ASHOST=%s (a URL, not a host)', (ashost) => {
    expect(() =>
      assertRfcAddress({ ...RFC, SAP_ASHOST: ashost, SAP_SYSNR: '00' }),
    ).toThrow(/not a host name or IP address/);
  });

  it('refuses SAP_URL and SAP_ASHOST naming different servers', () => {
    expect(() =>
      assertRfcAddress({
        ...RFC,
        SAP_URL: 'http://10.0.0.6:8000',
        SAP_ASHOST: '10.0.0.5',
        SAP_SYSNR: '00',
      }),
    ).toThrow(/name different servers/);
  });

  it('accepts SAP_URL and SAP_ASHOST naming the same server', () => {
    expect(() =>
      assertRfcAddress({
        ...RFC,
        SAP_URL: 'http://10.0.0.5:8000',
        SAP_ASHOST: '10.0.0.5',
        SAP_SYSNR: '00',
      }),
    ).not.toThrow();
  });
});

describe('rfcServiceUrl', () => {
  it('derives http://<ashost>:80<sysnr>', () => {
    expect(rfcServiceUrl('10.0.0.5', '42')).toBe('http://10.0.0.5:8042');
  });
});

describe('end to end: env file -> loadRfcEnv -> real RFC connection', () => {
  let dir: string;
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rfc-address-'));
    clientCtor.mockClear();
  });
  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  const writeEnv = () => {
    const file = path.join(dir, 'router.env');
    fs.writeFileSync(
      file,
      [
        'SAP_CONNECTION_TYPE=rfc',
        'SAP_ASHOST=172.16.0.1',
        'SAP_SYSNR=07',
        'SAP_CLIENT=100',
        'SAP_USERNAME=SOME.USER',
        'SAP_PASSWORD=secret',
      ].join('\n'),
    );
    return file;
  };

  it('loadRfcEnv reports the derived URL, and the SDK gets ashost + sysnr', async () => {
    // every key exportRfcSettingsToProcessEnv sets or deletes
    const keys = [
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
    ];
    const saved = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
    try {
      const { settings } = loadRfcEnv({ envFile: writeEnv(), env: {} });
      exportRfcSettingsToProcessEnv(settings); // as setConnectionContext does
      expect(settings.serviceUrl).toBe('http://172.16.0.1:8007');

      const connection: any = createAbapConnection({
        url: settings.serviceUrl,
        authType: 'basic',
        username: 'SOME.USER',
        password: 'secret',
        client: '100',
        connectionType: 'rfc',
      } as any);
      await connection.connect();
      expect(clientCtor.mock.calls[0][0]).toMatchObject({
        ashost: '172.16.0.1',
        sysnr: '07',
      });
    } finally {
      for (const k of keys) {
        if (saved[k] === undefined) delete process.env[k];
        else process.env[k] = saved[k];
      }
    }
  });
});
