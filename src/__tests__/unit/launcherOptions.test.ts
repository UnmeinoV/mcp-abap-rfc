/**
 * Options of the original HTTP/BTP/JWT server must be REFUSED, naming the
 * option, not silently ignored: a silently dropped `--transport=http` or
 * `--mcp=X` would start a server the caller did not ask for.
 */
import { assertNoRemovedOptions } from '../../lib/config/removedOptions';

const NO_ENV: NodeJS.ProcessEnv = {};

describe('assertNoRemovedOptions', () => {
  it('refuses --transport, naming it', () => {
    expect(() => assertNoRemovedOptions(['--transport=http'], NO_ENV)).toThrow(
      /--transport.*not supported by mcp-abap-rfc/,
    );
  });

  it('refuses --transport given as a separate value', () => {
    expect(() =>
      assertNoRemovedOptions(['--transport', 'sse'], NO_ENV),
    ).toThrow(/--transport.*not supported by mcp-abap-rfc/);
  });

  it('accepts --transport=stdio and --transport stdio as no-ops', () => {
    expect(() =>
      assertNoRemovedOptions(['--transport=stdio'], NO_ENV),
    ).not.toThrow();
    expect(() =>
      assertNoRemovedOptions(['--transport', 'STDIO'], NO_ENV),
    ).not.toThrow();
  });

  it('names the refused --transport value', () => {
    expect(() => assertNoRemovedOptions(['--transport=http'], NO_ENV)).toThrow(
      /\(got "http"\)/,
    );
  });

  it('refuses --mcp=<destination>', () => {
    expect(() => assertNoRemovedOptions(['--mcp=E19'], NO_ENV)).toThrow(
      /--mcp is not supported by mcp-abap-rfc \(RFC over stdio only\): /,
    );
  });

  it('refuses --connection-type=http but accepts --connection-type=rfc', () => {
    expect(() =>
      assertNoRemovedOptions(['--connection-type=http'], NO_ENV),
    ).toThrow(/--connection-type.*not supported by mcp-abap-rfc/);
    expect(() =>
      assertNoRemovedOptions(['--connection-type', 'http'], NO_ENV),
    ).toThrow(/--connection-type/);
    expect(() =>
      assertNoRemovedOptions(['--connection-type=rfc'], NO_ENV),
    ).not.toThrow();
    expect(() =>
      assertNoRemovedOptions(['--connection-type', 'RFC'], NO_ENV),
    ).not.toThrow();
  });

  it('refuses MCP_TRANSPORT other than stdio, accepts stdio', () => {
    expect(() => assertNoRemovedOptions([], { MCP_TRANSPORT: 'sse' })).toThrow(
      /MCP_TRANSPORT.*not supported by mcp-abap-rfc/,
    );
    expect(() =>
      assertNoRemovedOptions([], { MCP_TRANSPORT: 'stdio' }),
    ).not.toThrow();
  });

  it.each([
    ['--auth-broker'],
    ['--auth-broker-path=/tmp/x'],
    ['--browser=chrome'],
    ['--http-port=3000'],
    ['--port=3000'],
    ['--sse-port=3001'],
    ['--tls-cert=a.pem'],
    ['--allow-direct-sap-headers=false'],
    ['--no-direct-sap-headers'],
    ['--allow-destination-header'],
    ['--unsafe'],
    ['--env=trial'],
  ])('refuses %s, naming it', (arg) => {
    const name = arg.split('=')[0];
    expect(() => assertNoRemovedOptions([arg], NO_ENV)).toThrow(
      new RegExp(`^${name} is not supported by mcp-abap-rfc`),
    );
  });

  it('accepts the options that remain', () => {
    expect(() =>
      assertNoRemovedOptions(
        ['--env-path=x', '--exposition=readonly,high'],
        NO_ENV,
      ),
    ).not.toThrow();
    expect(() =>
      assertNoRemovedOptions(
        [
          '--env-path',
          'x.env',
          '--max-result-chars=200000',
          '--config=c.yaml',
          '--system-type=onprem',
        ],
        NO_ENV,
      ),
    ).not.toThrow();
  });
});
