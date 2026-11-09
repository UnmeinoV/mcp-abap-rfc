import {
  assertRfcModuleLoadable,
  windowsSdkPathUpdate,
} from '../../lib/rfcModule';

function throwing(message: string): () => unknown {
  return () => {
    throw new Error(message);
  };
}

describe('assertRfcModuleLoadable', () => {
  it('a missing module says to run setup:rfc and keeps the cause', () => {
    const cause = "Cannot find module '@mcp-abap-adt/sap-rfc-lite'";
    expect(() => assertRfcModuleLoadable(throwing(cause))).toThrow(
      /npm run setup:rfc/,
    );
    expect(() => assertRfcModuleLoadable(throwing(cause))).toThrow(cause);
  });

  it('an unloadable SDK library says to run setup:rfc and keeps the cause', () => {
    const cause =
      'libsapnwrfc.so: cannot open shared object file: No such file or directory';
    expect(() => assertRfcModuleLoadable(throwing(cause))).toThrow(
      /npm run setup:rfc/,
    );
    expect(() => assertRfcModuleLoadable(throwing(cause))).toThrow(cause);
  });

  it('names the module in the message', () => {
    expect(() => assertRfcModuleLoadable(throwing('x'))).toThrow(
      'The RFC module @mcp-abap-adt/sap-rfc-lite is not built for this machine — run: npm run setup:rfc (cause: x)',
    );
  });

  it('keeps the original error as cause', () => {
    const original = new Error('boom');
    let thrown: unknown;
    try {
      assertRfcModuleLoadable(() => {
        throw original;
      });
    } catch (error) {
      thrown = error;
    }
    expect((thrown as Error).cause).toBe(original);
  });

  it('a loader that returns the module does not throw', () => {
    expect(() => assertRfcModuleLoadable(() => ({}))).not.toThrow();
  });
});

describe('windowsSdkPathUpdate', () => {
  const root = 'C:\\repo';
  const sdk = 'C:\\repo\\runtime\\windows\\nwrfcsdk\\lib';

  it('does nothing outside Windows', () => {
    expect(windowsSdkPathUpdate({ PATH: '/usr/bin' }, 'linux', root)).toBe(
      undefined,
    );
    expect(windowsSdkPathUpdate({ PATH: '/usr/bin' }, 'darwin', root)).toBe(
      undefined,
    );
  });

  it('prepends the SDK lib dir, keeping the key spelling Path', () => {
    expect(
      windowsSdkPathUpdate({ Path: 'C:\\Windows' }, 'win32', root),
    ).toEqual({ key: 'Path', value: `${sdk};C:\\Windows` });
  });

  it('sets PATH when there is none', () => {
    expect(windowsSdkPathUpdate({}, 'win32', root)).toEqual({
      key: 'PATH',
      value: sdk,
    });
  });

  it('is idempotent: no change when the SDK is already first', () => {
    expect(
      windowsSdkPathUpdate({ PATH: `${sdk};C:\\Windows` }, 'win32', root),
    ).toBe(undefined);
  });

  it('assertRfcModuleLoadable applies it before loading', () => {
    const env: NodeJS.ProcessEnv = { Path: 'C:\\Windows' };
    let pathAtLoad: string | undefined;
    assertRfcModuleLoadable(
      () => {
        pathAtLoad = env.Path;
        return {};
      },
      'win32',
      env,
    );
    expect(pathAtLoad).toMatch(/runtime\\windows\\nwrfcsdk\\lib;C:\\Windows$/);
  });

  it('assertRfcModuleLoadable leaves PATH alone on linux', () => {
    const env: NodeJS.ProcessEnv = { PATH: '/usr/bin' };
    assertRfcModuleLoadable(() => ({}), 'linux', env);
    expect(env).toEqual({ PATH: '/usr/bin' });
  });
});
