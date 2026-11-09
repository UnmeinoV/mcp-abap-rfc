import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  exportRfcSettingsToProcessEnv,
  loadRfcEnv,
  maskSaprouterPasswords,
  parseRfcEnv,
  rfcBanner,
} from '../../lib/rfcEnv';

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

const without = (key: string) => {
  const v = { ...ROUTER };
  delete v[key];
  return v;
};

function toEnvText(v: Record<string, string | undefined>): string {
  return Object.entries(v)
    .map(([k, val]) => `${k}=${val ?? ''}`)
    .join('\n');
}

function tmpFile(content: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rfcenv-'));
  const f = path.join(dir, 'x.env');
  fs.writeFileSync(f, content);
  return f;
}

describe('parseRfcEnv', () => {
  it('accepts the harmless SAP_CONNECTION_TYPE / SAP_AUTH_TYPE / SAP_SYSTEM_TYPE values', () => {
    const s = parseRfcEnv(ROUTER, 'f');
    expect(s.serviceUrl).toBe('http://172.16.0.1:8007');
    expect(s.systemType).toBe('onprem');
    expect(s.compression).toBe(false);
    expect(s.saprouter).toBe('/H/1.2.3.4/H/');
    expect(s.language).toBe('ZH');
    expect(s.source).toBe('f');
  });

  it('SAP_CONNECTION_TYPE', () => {
    expect(() =>
      parseRfcEnv({ ...ROUTER, SAP_CONNECTION_TYPE: 'RFC' }, 'f'),
    ).not.toThrow();
    expect(() =>
      parseRfcEnv({ ...ROUTER, SAP_CONNECTION_TYPE: 'http' }, 'f'),
    ).toThrow(/SAP_CONNECTION_TYPE=http.*only RFC/);
  });

  it('SAP_AUTH_TYPE', () => {
    expect(() => parseRfcEnv({ ...ROUTER, SAP_AUTH_TYPE: 'jwt' }, 'f')).toThrow(
      /SAP_AUTH_TYPE=jwt/,
    );
    expect(() => parseRfcEnv(without('SAP_AUTH_TYPE'), 'f')).not.toThrow();
  });

  it('SAP_SYSTEM_TYPE', () => {
    expect(() =>
      parseRfcEnv({ ...ROUTER, SAP_SYSTEM_TYPE: 'cloud' }, 'f'),
    ).toThrow(/SAP_SYSTEM_TYPE=cloud/);
    expect(parseRfcEnv(without('SAP_SYSTEM_TYPE'), 'f').systemType).toBe(
      'onprem',
    );
    expect(
      parseRfcEnv({ ...ROUTER, SAP_SYSTEM_TYPE: 'legacy' }, 'f').systemType,
    ).toBe('legacy');
  });

  it('refuses SAP_URL even when its host matches', () => {
    expect(() =>
      parseRfcEnv({ ...ROUTER, SAP_URL: 'http://172.16.0.1:8007' }, 'f'),
    ).toThrow(/SAP_URL.*SAP_ASHOST \+ SAP_SYSNR/);
  });

  it('missing values', () => {
    expect(() => parseRfcEnv(without('SAP_ASHOST'), 'f')).toThrow(/SAP_ASHOST/);
    expect(() => parseRfcEnv({ ...ROUTER, SAP_SYSNR: '0' }, 'f')).toThrow(
      /two digits/,
    );
    expect(() => parseRfcEnv(without('SAP_SYSNR'), 'f')).toThrow(/SAP_SYSNR/);
    expect(() => parseRfcEnv(without('SAP_CLIENT'), 'f')).toThrow(/SAP_CLIENT/);
    expect(() => parseRfcEnv(without('SAP_USERNAME'), 'f')).toThrow(
      /SAP_USERNAME/,
    );
    expect(() => parseRfcEnv({ ...ROUTER, SAP_PASSWORD: '' }, 'f')).toThrow(
      /SAP_PASSWORD/,
    );
  });

  it('SAP_RFC_COMPRESSION=on enables compression', () => {
    expect(
      parseRfcEnv({ ...ROUTER, SAP_RFC_COMPRESSION: 'on' }, 'f').compression,
    ).toBe(true);
  });

  it('every error names the source', () => {
    const bad: Record<string, string | undefined>[] = [
      { ...ROUTER, SAP_CONNECTION_TYPE: 'http' },
      { ...ROUTER, SAP_AUTH_TYPE: 'jwt' },
      { ...ROUTER, SAP_SYSTEM_TYPE: 'cloud' },
      { ...ROUTER, SAP_URL: 'http://172.16.0.1:8007' },
      without('SAP_ASHOST'),
      { ...ROUTER, SAP_SYSNR: '0' },
      without('SAP_SYSNR'),
      without('SAP_CLIENT'),
      without('SAP_USERNAME'),
      { ...ROUTER, SAP_PASSWORD: '' },
    ];
    for (const v of bad) {
      expect(() => parseRfcEnv(v, 'MY_SOURCE_X')).toThrow(/MY_SOURCE_X/);
    }
  });
});

describe('loadRfcEnv', () => {
  it('env file wins over a leftover shell SAP_SYSNR', () => {
    const envFile = tmpFile(toEnvText(ROUTER));
    const { settings } = loadRfcEnv({
      envFile,
      env: { SAP_SYSNR: '00', SAP_ASHOST: '9.9.9.9' },
    });
    expect(settings.sysnr).toBe('07');
    expect(settings.ashost).toBe('172.16.0.1');
    expect(settings.source).toBe(envFile);
  });

  it('shell fills keys the file omits', () => {
    const envFile = tmpFile(toEnvText(without('SAP_LANGUAGE')));
    const { settings } = loadRfcEnv({ envFile, env: { SAP_LANGUAGE: 'EN' } });
    expect(settings.language).toBe('EN');
  });

  it('empty key in file beats shell', () => {
    const envFile = tmpFile(
      `${toEnvText(without('SAP_SAPROUTER'))}\nSAP_SAPROUTER=\n`,
    );
    const { settings } = loadRfcEnv({
      envFile,
      env: { SAP_SAPROUTER: '/H/9.9.9.9/H/' },
    });
    expect(settings.saprouter).toBeUndefined();
  });

  it('without a file the environment alone is used', () => {
    const { settings } = loadRfcEnv({ env: ROUTER as NodeJS.ProcessEnv });
    expect(settings.source).toBe('the environment');
    expect(settings.sysnr).toBe('07');
  });

  it('reports an unreadable file', () => {
    expect(() =>
      loadRfcEnv({ envFile: '/nonexistent/x.env', env: {} }),
    ).toThrow(/\/nonexistent\/x\.env/);
  });
});

describe('a refused key names where its value came from', () => {
  const REFUSED: Array<[string, string, RegExp]> = [
    ['SAP_CONNECTION_TYPE', 'http', /SAP_CONNECTION_TYPE=http/],
    ['SAP_AUTH_TYPE', 'jwt', /SAP_AUTH_TYPE=jwt/],
    ['SAP_SYSTEM_TYPE', 'cloud', /SAP_SYSTEM_TYPE=cloud/],
    ['SAP_URL', 'http://172.16.0.1:8007', /SAP_URL/],
    ['SAP_SYSNR', '7', /SAP_SYSNR=7/],
    ['SAP_ASHOST', 'http://x', /SAP_ASHOST=http:\/\/x/],
  ];

  it('the env file defines it: "(in <file>)"', () => {
    for (const [key, bad, pattern] of REFUSED) {
      const envFile = tmpFile(toEnvText({ ...ROUTER, [key]: bad }));
      let message = '';
      try {
        loadRfcEnv({ envFile, env: {} });
      } catch (e) {
        message = (e as Error).message;
      }
      expect(message).toMatch(pattern);
      expect(message).toContain(`(in ${envFile})`);
      expect(message).not.toContain('shell environment');
    }
  });

  it('only the shell has it: "(in the shell environment — unset it)"', () => {
    for (const [key, bad, pattern] of REFUSED) {
      const envFile = tmpFile(toEnvText(without(key)));
      let message = '';
      try {
        loadRfcEnv({ envFile, env: { [key]: bad } });
      } catch (e) {
        message = (e as Error).message;
      }
      expect(message).toMatch(pattern);
      expect(message).toContain('(in the shell environment — unset it)');
      expect(message).not.toContain(envFile);
    }
  });

  it('no env file: the shell', () => {
    expect(() =>
      loadRfcEnv({ env: { ...ROUTER, SAP_AUTH_TYPE: 'jwt' } }),
    ).toThrow('SAP_AUTH_TYPE=jwt (in the shell environment — unset it)');
  });

  it('a MISSING key still names the file', () => {
    const envFile = tmpFile(toEnvText(without('SAP_CLIENT')));
    expect(() => loadRfcEnv({ envFile, env: {} })).toThrow(
      `SAP_CLIENT is required (in ${envFile})`,
    );
  });
});

describe('startup banner', () => {
  it('masks the passwords after /P/ and /W/ in a SAProuter string', () => {
    expect(
      maskSaprouterPasswords('/H/1.2.3.4/S/3299/W/s3cr3t/H/5.6.7.8/H/'),
    ).toBe('/H/1.2.3.4/S/3299/W/***/H/5.6.7.8/H/');
    expect(maskSaprouterPasswords('/H/r1/P/pw1/H/r2/W/pw2/H/host')).toBe(
      '/H/r1/P/***/H/r2/W/***/H/host',
    );
    expect(maskSaprouterPasswords('/H/r1/w/pw/H/h')).toBe('/H/r1/w/***/H/h');
    expect(maskSaprouterPasswords('/H/1.2.3.4/H/')).toBe('/H/1.2.3.4/H/');
  });

  it('the banner carries neither the password nor a SAProuter password', () => {
    const s = parseRfcEnv(
      {
        ...ROUTER,
        SAP_PASSWORD: 'logonpw',
        SAP_SAPROUTER: '/H/1.2.3.4/S/3299/W/routerpw/H/',
      },
      'f.env',
    );
    const line = rfcBanner(s);
    expect(line).not.toContain('logonpw');
    expect(line).not.toContain('routerpw');
    expect(line).toBe(
      '[MCP] RFC 172.16.0.1 instance 07, client 800, user SOME.USER, SAProuter /H/1.2.3.4/S/3299/W/***/H/, language ZH (from f.env)',
    );
  });
});

describe('exportRfcSettingsToProcessEnv', () => {
  it('writes keys, removes SAP_URL / SAP_CONNECTION_TYPE, never the password', () => {
    const s = parseRfcEnv(ROUTER, 'f');
    const env: NodeJS.ProcessEnv = {
      SAP_SYSNR: '00',
      SAP_URL: 'http://x:8000',
      SAP_CONNECTION_TYPE: 'rfc',
    };
    exportRfcSettingsToProcessEnv(s, env);
    expect(env.SAP_SYSNR).toBe('07');
    expect(env.SAP_ASHOST).toBe('172.16.0.1');
    expect(env.SAP_CLIENT).toBe('800');
    expect(env.SAP_USERNAME).toBe('SOME.USER');
    expect(env.SAP_LANGUAGE).toBe('ZH');
    expect(env.SAP_SAPROUTER).toBe('/H/1.2.3.4/H/');
    expect(env.SAP_SYSTEM_TYPE).toBe('onprem');
    expect('SAP_URL' in env).toBe(false);
    expect('SAP_CONNECTION_TYPE' in env).toBe(false);
    expect(env.SAP_PASSWORD).toBeUndefined();
  });
});
