import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  assertAuthTypeSupportsSapClients,
  connectionParamsForClient,
  describeSapClients,
  getSapClientConfig,
  loadSapClientConfig,
  markClientConnected,
  parseSapClientConfig,
  resetSapClientConfig,
  responsibleOverrideForClient,
} from '../../lib/sapClients';

afterEach(() => resetSapClientConfig());

describe('parseSapClientConfig', () => {
  it('is off without SAP_CLIENTS', () => {
    expect(parseSapClientConfig({ SAP_CLIENT: '100' })).toBeUndefined();
  });

  it('is off with a single client', () => {
    expect(
      parseSapClientConfig({ SAP_CLIENTS: '100', SAP_CLIENT: '100' }),
    ).toBeUndefined();
  });

  it('normalises the list: trims and de-duplicates', () => {
    expect(
      parseSapClientConfig({
        SAP_CLIENTS: ' 100, 800 ,100,',
        SAP_CLIENT: '100',
      }),
    ).toEqual({
      defaultClient: '100',
      clients: ['100', '800'],
      credentials: {},
    });
  });

  it('refuses a malformed client number', () => {
    expect(() =>
      parseSapClientConfig({ SAP_CLIENTS: '100,80', SAP_CLIENT: '100' }),
    ).toThrow(/80 is not a 3-digit client number/);
  });

  it('refuses a missing default client', () => {
    expect(() => parseSapClientConfig({ SAP_CLIENTS: '100,800' })).toThrow(
      /SAP_CLIENT \(the default client\) must be set/,
    );
  });

  it('refuses a default client that is not in the list', () => {
    expect(() =>
      parseSapClientConfig({ SAP_CLIENTS: '100,800', SAP_CLIENT: '200' }),
    ).toThrow(/SAP_CLIENT=200 is not in SAP_CLIENTS=100,800/);
  });

  it('reads per-client credentials', () => {
    const cfg = parseSapClientConfig({
      SAP_CLIENTS: '100,800',
      SAP_CLIENT: '100',
      SAP_CLIENT_800_USERNAME: 'OTHER.USER',
      SAP_CLIENT_800_PASSWORD: 'pw-800',
    });
    expect(cfg?.credentials).toEqual({
      '800': { username: 'OTHER.USER', password: 'pw-800' },
    });
  });

  it('refuses credentials for a client that is not in the list, without printing the value', () => {
    let message = '';
    try {
      parseSapClientConfig({
        SAP_CLIENTS: '100,800',
        SAP_CLIENT: '100',
        SAP_CLIENT_300_USERNAME: 'X',
        SAP_CLIENT_300_PASSWORD: 'secret-value',
      });
    } catch (e) {
      message = (e as Error).message;
    }
    expect(message).toMatch(/names client 300, which is not in SAP_CLIENTS/);
    expect(message).not.toContain('secret-value');
  });

  it('refuses a username without a password', () => {
    expect(() =>
      parseSapClientConfig({
        SAP_CLIENTS: '100,800',
        SAP_CLIENT: '100',
        SAP_CLIENT_800_USERNAME: 'OTHER.USER',
      }),
    ).toThrow(/must be set together; only USERNAME is/);
  });

  it('refuses numbered credentials when SAP_CLIENTS is not set', () => {
    expect(() =>
      parseSapClientConfig({
        SAP_CLIENT: '100',
        SAP_CLIENT_800_USERNAME: 'U',
        SAP_CLIENT_800_PASSWORD: 'P',
      }),
    ).toThrow(/only apply with two or more clients/);
  });

  it('ignores unrelated SAP_CLIENT_* keys such as OAuth ids', () => {
    expect(
      parseSapClientConfig({
        SAP_CLIENTS: '100,800',
        SAP_CLIENT: '100',
        SAP_CLIENT_ID: 'x',
        SAP_CLIENT_SECRET: 'y',
      })?.credentials,
    ).toEqual({});
  });
});

describe('loadSapClientConfig', () => {
  it('reads numbered keys from the env file and never copies a password into process.env', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sapclients-'));
    const file = path.join(dir, 'x.env');
    fs.writeFileSync(
      file,
      [
        'SAP_CLIENT=100',
        'SAP_CLIENTS=100,800',
        'SAP_CLIENT_800_USERNAME=OTHER.USER',
        'SAP_CLIENT_800_PASSWORD=pw-800',
      ].join('\n'),
    );
    const env: NodeJS.ProcessEnv = {};
    const cfg = loadSapClientConfig({ envFile: file, env });
    expect(cfg?.clients).toEqual(['100', '800']);
    expect(cfg?.credentials['800'].password).toBe('pw-800');
    expect(getSapClientConfig()).toBe(cfg);
    expect(env.SAP_CLIENT_800_PASSWORD).toBeUndefined();
    expect(process.env.SAP_CLIENT_800_PASSWORD).toBeUndefined();
  });

  function envFile(lines: string[]): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sapclients-'));
    const file = path.join(dir, 'x.env');
    fs.writeFileSync(file, `${lines.join('\n')}\n`);
    return file;
  }

  // The connection reads SAP_CLIENT from the explicit env file (brokerFactory),
  // so the multi-client keys must come from the same place, or the default
  // client and the connection's client disagree.
  it('lets a key the env file defines win over the shell', () => {
    const cfg = loadSapClientConfig({
      envFile: envFile(['SAP_CLIENT=100', 'SAP_CLIENTS=100,800']),
      env: { SAP_CLIENT: '800', SAP_CLIENTS: '100,800' },
    });
    expect(cfg?.defaultClient).toBe('100');
  });

  it('an empty SAP_CLIENTS= in the env file clears a leftover shell value', () => {
    const cfg = loadSapClientConfig({
      envFile: envFile(['SAP_CLIENT=300', 'SAP_CLIENTS=']),
      env: {
        SAP_CLIENT: '800',
        SAP_CLIENTS: '100,800',
        SAP_CLIENT_800_USERNAME: 'OTHER.USER',
        SAP_CLIENT_800_PASSWORD: 'pw-800',
      },
    });
    expect(cfg).toBeUndefined();
    expect(getSapClientConfig()).toBeUndefined();
  });

  it('when the env file defines SAP_CLIENTS, shell per-client credentials are ignored', () => {
    const cfg = loadSapClientConfig({
      envFile: envFile(['SAP_CLIENT=100', 'SAP_CLIENTS=100,200']),
      env: {
        SAP_CLIENT_800_USERNAME: 'OTHER.USER',
        SAP_CLIENT_800_PASSWORD: 'pw-800',
      },
    });
    expect(cfg?.clients).toEqual(['100', '200']);
    expect(cfg?.credentials).toEqual({});
  });

  it('still takes keys the env file does not mention from the shell', () => {
    const cfg = loadSapClientConfig({
      envFile: envFile(['SAP_CLIENT=100']),
      env: { SAP_CLIENTS: '100,800' },
    });
    expect(cfg?.clients).toEqual(['100', '800']);
  });

  it('a refusal caused by a shell value says where it came from and how to clear it', () => {
    const file = envFile(['SAP_CLIENT=300']);
    expect(() =>
      loadSapClientConfig({ envFile: file, env: { SAP_CLIENTS: '100,800' } }),
    ).toThrow(
      /SAP_CLIENTS came from the shell environment; unset it, or define SAP_CLIENTS \(empty for one client\) in /,
    );
  });

  it('without an env file the shell is the only source', () => {
    const cfg = loadSapClientConfig({
      env: { SAP_CLIENT: '800', SAP_CLIENTS: '100,800' },
    });
    expect(cfg?.defaultClient).toBe('800');
  });

  it('lets the shell replace an implicit file client list and its credentials', () => {
    const cfg = loadSapClientConfig({
      envFile: envFile([
        'SAP_CLIENT=100',
        'SAP_CLIENTS=100,800',
        'SAP_CLIENT_800_USERNAME=FILE.USER',
        'SAP_CLIENT_800_PASSWORD=file-password',
      ]),
      envFileIsFallback: true,
      env: { SAP_CLIENT: '310', SAP_CLIENTS: '310' },
    });
    expect(cfg).toBeUndefined();
  });

  it.each([
    '',
    '   ',
  ])('lets a shell SAP_CLIENTS=%p clear an implicit list and its credentials', (value) => {
    expect(
      loadSapClientConfig({
        envFile: envFile([
          'SAP_CLIENT=100',
          'SAP_CLIENTS=100,800',
          'SAP_CLIENT_800_USERNAME=FILE.USER',
          'SAP_CLIENT_800_PASSWORD=file-password',
        ]),
        envFileIsFallback: true,
        env: { SAP_CLIENT: '310', SAP_CLIENTS: value },
      }),
    ).toBeUndefined();
  });

  it('does not let an implicit empty list hide shell multi-client settings', () => {
    const cfg = loadSapClientConfig({
      envFile: envFile(['SAP_CLIENT=100', 'SAP_CLIENTS=']),
      envFileIsFallback: true,
      env: { SAP_CLIENT: '310', SAP_CLIENTS: '310,800' },
    });
    expect(cfg).toEqual({
      defaultClient: '310',
      clients: ['310', '800'],
      credentials: {},
    });
    expect(() =>
      assertAuthTypeSupportsSapClients('reentrance-ticket', cfg),
    ).toThrow(/needs basic authentication/);
  });

  it('uses implicit file defaults for keys the shell does not define', () => {
    const cfg = loadSapClientConfig({
      envFile: envFile([
        'SAP_CLIENT=100',
        'SAP_CLIENTS=100,800',
        'SAP_CLIENT_800_USERNAME=FILE.USER',
        'SAP_CLIENT_800_PASSWORD=file-password',
      ]),
      envFileIsFallback: true,
      env: { SAP_CLIENTS: undefined },
    });
    expect(cfg).toEqual({
      defaultClient: '100',
      clients: ['100', '800'],
      credentials: {
        '800': { username: 'FILE.USER', password: 'file-password' },
      },
    });
  });

  it('allows shell credentials to override an implicit file without replacing its list', () => {
    const cfg = loadSapClientConfig({
      envFile: envFile([
        'SAP_CLIENT=100',
        'SAP_CLIENTS=100,800',
        'SAP_CLIENT_800_USERNAME=FILE.USER',
        'SAP_CLIENT_800_PASSWORD=file-password',
      ]),
      envFileIsFallback: true,
      env: {
        SAP_CLIENT: '800',
        SAP_CLIENT_800_USERNAME: 'SHELL.USER',
        SAP_CLIENT_800_PASSWORD: 'shell-password',
      },
    });
    expect(cfg?.defaultClient).toBe('800');
    expect(cfg?.credentials).toEqual({
      '800': { username: 'SHELL.USER', password: 'shell-password' },
    });
  });

  it('does not borrow an implicit file password when the shell owns the list', () => {
    expect(() =>
      loadSapClientConfig({
        envFile: envFile([
          'SAP_CLIENT=100',
          'SAP_CLIENTS=100,800',
          'SAP_CLIENT_800_USERNAME=FILE.USER',
          'SAP_CLIENT_800_PASSWORD=file-password',
        ]),
        envFileIsFallback: true,
        env: {
          SAP_CLIENTS: '100,800',
          SAP_CLIENT_800_USERNAME: 'SHELL.USER',
        },
      }),
    ).toThrow(/must be set together; only USERNAME is/);
  });

  it('does not suggest overriding shell errors in a lower-priority implicit file', () => {
    const file = envFile(['SAP_CLIENT=300', 'SAP_CLIENTS=']);
    let message = '';
    try {
      loadSapClientConfig({
        envFile: file,
        envFileIsFallback: true,
        env: { SAP_CLIENTS: '100,800' },
      });
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain('SAP_CLIENTS came from the shell environment');
    expect(message).toContain('change it in the shell environment');
    expect(message).not.toContain(`in ${file}`);
    expect(getSapClientConfig()).toBeUndefined();
  });
});

describe('per-client helpers', () => {
  const cfg = {
    defaultClient: '100',
    clients: ['100', '800'],
    credentials: { '800': { username: 'OTHER.USER', password: 'pw-800' } },
  };

  it('swaps the client, and the credentials only where configured', () => {
    const base = {
      url: 'http://h:8000',
      authType: 'basic',
      username: 'U',
      password: 'P',
      client: '100',
    };
    expect(connectionParamsForClient(base, '800', cfg)).toEqual({
      ...base,
      client: '800',
      username: 'OTHER.USER',
      password: 'pw-800',
    });
    expect(connectionParamsForClient(base, '100', cfg)).toEqual(base);
  });

  it('uses the client user as responsible unless SAP_RESPONSIBLE is set', () => {
    expect(responsibleOverrideForClient('800', cfg, {})).toEqual({
      responsible: 'OTHER.USER',
    });
    expect(responsibleOverrideForClient('100', cfg, {})).toEqual({});
    expect(
      responsibleOverrideForClient('800', cfg, { SAP_RESPONSIBLE: 'BOSS' }),
    ).toEqual({});
  });

  it('refuses jwt when several clients are configured', () => {
    expect(() => assertAuthTypeSupportsSapClients('jwt', cfg)).toThrow(
      /needs basic authentication/,
    );
    expect(() => assertAuthTypeSupportsSapClients('basic', cfg)).not.toThrow();
    expect(() =>
      assertAuthTypeSupportsSapClients('jwt', undefined),
    ).not.toThrow();
  });

  it('describes configured and connected clients', () => {
    expect(describeSapClients()).toBeUndefined();
    loadSapClientConfig({ env: { SAP_CLIENTS: '100,800', SAP_CLIENT: '100' } });
    markClientConnected('800');
    expect(describeSapClients()).toMatchObject({
      default: '100',
      configured: ['100', '800'],
      connected: ['800'],
    });
  });
});
