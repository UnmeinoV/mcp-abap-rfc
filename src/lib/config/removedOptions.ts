/**
 * Options of the original HTTP/BTP/JWT server that this RFC-only stdio server
 * does not have. They are REFUSED, naming the option, never silently ignored:
 * a dropped `--transport=http` or `--mcp=X` would start a server the caller
 * did not ask for, and nothing would say so.
 */

interface RemovedOption {
  /** Exact option name; `prefix` options match any `<name>…` */
  name: string;
  prefix?: boolean;
  hint: string;
}

const NO_BROKER =
  'there is no auth broker or destination store; name the RFC env file with --env-path=<file>';
const NO_HTTP = 'there is no HTTP/SSE server; remove the option';

const REMOVED: RemovedOption[] = [
  { name: '--mcp', hint: NO_BROKER },
  { name: '--auth-broker', hint: NO_BROKER },
  { name: '--auth-broker-path', hint: NO_BROKER },
  { name: '--env', hint: 'use --env-path=<file> (no sessions store lookup)' },
  { name: '--unsafe', hint: NO_BROKER },
  {
    name: '--browser',
    prefix: true,
    hint: 'there is no browser logon over RFC; remove the option',
  },
  { name: '--http-', prefix: true, hint: NO_HTTP },
  { name: '--port', hint: NO_HTTP },
  { name: '--host', hint: NO_HTTP },
  { name: '--path', hint: NO_HTTP },
  { name: '--post-path', hint: NO_HTTP },
  { name: '--sse-', prefix: true, hint: NO_HTTP },
  { name: '--tls-', prefix: true, hint: NO_HTTP },
  { name: '--allow-direct-sap-headers', hint: NO_HTTP },
  { name: '--no-direct-sap-headers', hint: NO_HTTP },
  { name: '--allow-destination-header', hint: NO_HTTP },
];

/** Options that remain accepted, but only with this value (case-insensitive). */
const ACCEPTED_VALUE: Record<string, string> = {
  '--transport': 'stdio',
  '--connection-type': 'rfc',
};

function refusal(option: string, hint: string): Error {
  return new Error(
    `${option} is not supported by mcp-abap-rfc (RFC over stdio only): ${hint}.`,
  );
}

/** `--opt=value` → `--opt`; `--opt` → `--opt`. */
function optionName(arg: string): string {
  const eq = arg.indexOf('=');
  return eq === -1 ? arg : arg.slice(0, eq);
}

/**
 * Throws `<option> is not supported by mcp-abap-rfc (RFC over stdio only): <hint>.`
 * for the first removed option found. `argv` is the argument list without
 * `node` and the script path.
 */
export function assertNoRemovedOptions(
  argv: string[],
  env: NodeJS.ProcessEnv,
): void {
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const name = optionName(arg);

    // Accepted as no-ops with the one value this server has; any other value
    // is refused, naming it.
    const onlyValue = ACCEPTED_VALUE[name];
    if (onlyValue) {
      const value = arg.includes('=')
        ? arg.slice(arg.indexOf('=') + 1)
        : argv[i + 1];
      if (value?.trim().toLowerCase() !== onlyValue) {
        throw refusal(
          name,
          `only ${onlyValue} is supported${value ? ` (got "${value}")` : ''}; remove the option or pass ${name}=${onlyValue}`,
        );
      }
      continue;
    }

    const removed = REMOVED.find((r) =>
      r.prefix ? name.startsWith(r.name) : name === r.name,
    );
    if (removed) throw refusal(name, removed.hint);
  }

  const transport = env.MCP_TRANSPORT?.trim();
  if (transport && transport.toLowerCase() !== 'stdio') {
    throw refusal(
      `MCP_TRANSPORT=${transport}`,
      'this server speaks MCP over stdio only; unset it or set MCP_TRANSPORT=stdio',
    );
  }
}
