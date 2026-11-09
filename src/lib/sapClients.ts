/**
 * Several SAP clients of ONE system, served by one process.
 *
 * SAP_CLIENTS lists the clients a caller may target with the `sap_client`
 * argument every tool gains (injected in BaseMcpServer); SAP_CLIENT stays the
 * default. Per-client credentials are optional:
 * SAP_CLIENT_<n>_USERNAME / SAP_CLIENT_<n>_PASSWORD.
 *
 * WHY THIS READS THE ENV FILE ITSELF: with --env-path the .env is NOT loaded
 * into process.env — the launcher bridges a fixed list of keys, and a missing
 * entry there is how SAP_SAPROUTER silently vanished once. Numbered keys cannot
 * be listed, so they are read here, and passwords stay in this module instead
 * of being copied into process.env where child processes would inherit them.
 *
 * Every refusal names the KEY, never a value.
 */
import * as fs from 'node:fs';
import * as dotenv from 'dotenv';

export interface SapClientCredentials {
  username: string;
  password: string;
}

export interface SapClientConfig {
  defaultClient: string;
  clients: string[];
  credentials: Record<string, SapClientCredentials>;
}

const CLIENT_NUMBER = /^\d{3}$/;
const CREDENTIAL_KEY = /^SAP_CLIENT_([^_]+)_(USERNAME|PASSWORD)$/;

let active: SapClientConfig | undefined;
const connected = new Set<string>();

function isClientKey(key: string): boolean {
  return (
    key === 'SAP_CLIENTS' || key === 'SAP_CLIENT' || CREDENTIAL_KEY.test(key)
  );
}

export function parseSapClientConfig(
  source: Record<string, string | undefined>,
): SapClientConfig | undefined {
  const credentialKeys = Object.keys(source).filter(
    (key) => CREDENTIAL_KEY.test(key) && source[key],
  );
  const raw = source.SAP_CLIENTS?.trim();
  const clients = raw
    ? [
        ...new Set(
          raw
            .split(',')
            .map((c) => c.trim())
            .filter(Boolean),
        ),
      ]
    : [];

  if (clients.length < 2) {
    if (credentialKeys.length > 0) {
      throw new Error(
        `${credentialKeys.join(', ')}: per-client credentials only apply with two or more clients in SAP_CLIENTS.`,
      );
    }
    const single = clients[0];
    const defaultClient = source.SAP_CLIENT?.trim();
    if (single && defaultClient && single !== defaultClient) {
      throw new Error(
        `SAP_CLIENT=${defaultClient} is not in SAP_CLIENTS=${single}.`,
      );
    }
    return undefined;
  }

  const malformed = clients.filter((c) => !CLIENT_NUMBER.test(c));
  if (malformed.length > 0) {
    throw new Error(
      `SAP_CLIENTS: ${malformed.join(', ')} is not a 3-digit client number.`,
    );
  }
  const defaultClient = source.SAP_CLIENT?.trim() ?? '';
  if (!defaultClient) {
    throw new Error(
      'SAP_CLIENTS is set, so SAP_CLIENT (the default client) must be set too.',
    );
  }
  if (!clients.includes(defaultClient)) {
    throw new Error(
      `SAP_CLIENT=${defaultClient} is not in SAP_CLIENTS=${clients.join(',')}.`,
    );
  }

  const partial: Record<string, Partial<SapClientCredentials>> = {};
  for (const key of credentialKeys) {
    const [, client, field] = CREDENTIAL_KEY.exec(key) as RegExpExecArray;
    if (!clients.includes(client)) {
      throw new Error(
        `${key} names client ${client}, which is not in SAP_CLIENTS=${clients.join(',')}.`,
      );
    }
    partial[client] ??= {};
    partial[client][field === 'USERNAME' ? 'username' : 'password'] =
      source[key];
  }
  const credentials: Record<string, SapClientCredentials> = {};
  for (const [client, c] of Object.entries(partial)) {
    if (!c.username || !c.password) {
      throw new Error(
        `SAP_CLIENT_${client}_USERNAME and SAP_CLIENT_${client}_PASSWORD must be set together; only ${c.username ? 'USERNAME' : 'PASSWORD'} is.`,
      );
    }
    credentials[client] = { username: c.username, password: c.password };
  }

  return { defaultClient, clients, credentials };
}

/**
 * Which source decides each multi-client key.
 *
 * With an explicit env file the CONNECTION reads SAP_CLIENT from that file
 * (brokerFactory), so the file must decide here too: a key the file defines
 * wins over the shell, even when its value is empty — `SAP_CLIENTS=` in the
 * file is how a file says "one client", and a shell leftover must not undo it.
 * When the file defines SAP_CLIENTS it owns the client list, so the shell's
 * SAP_CLIENT_<n>_* keys (which only mean something against that list) are
 * ignored as well. The shell fills in only keys the file does not mention.
 * Ticket mode's automatically discovered .env is a fallback instead: defined
 * shell keys win, including empty values. If the shell defines SAP_CLIENTS,
 * its list must not inherit numbered credentials from the fallback file.
 */
export function loadSapClientConfig(
  options: {
    envFile?: string;
    env?: NodeJS.ProcessEnv;
    /** Opt in for ticket mode's implicit .env; broker-backed files keep precedence. */
    envFileIsFallback?: boolean;
  } = {},
): SapClientConfig | undefined {
  const env = options.env ?? process.env;
  const source: Record<string, string | undefined> = {};
  const fromFile = new Set<string>();
  if (options.envFile && fs.existsSync(options.envFile)) {
    const parsed = dotenv.parse(fs.readFileSync(options.envFile, 'utf8'));
    for (const [key, value] of Object.entries(parsed)) {
      if (isClientKey(key)) {
        source[key] = value;
        fromFile.add(key);
      }
    }
  }
  const fileOwnsClientList = fromFile.has('SAP_CLIENTS');
  if (options.envFileIsFallback && env.SAP_CLIENTS !== undefined) {
    for (const key of fromFile) {
      if (CREDENTIAL_KEY.test(key)) delete source[key];
    }
  }
  const fromShell: string[] = [];
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined || !isClientKey(key)) continue;
    if (!options.envFileIsFallback) {
      if (!value || fromFile.has(key)) continue;
      if (fileOwnsClientList && CREDENTIAL_KEY.test(key)) continue;
    }
    source[key] = value;
    fromShell.push(key);
  }
  try {
    active = parseSapClientConfig(source);
  } catch (error) {
    active = undefined;
    connected.clear();
    if (fromShell.length === 0) throw error;
    const keys = fromShell.sort().join(', ');
    // Which line in the env file would take each shell key out of play.
    const fileKeys = [
      ...new Set(
        fromShell.map((k) =>
          k === 'SAP_CLIENT' ? 'SAP_CLIENT' : 'SAP_CLIENTS',
        ),
      ),
    ]
      .map((k) =>
        k === 'SAP_CLIENTS' ? 'SAP_CLIENTS (empty for one client)' : k,
      )
      .join(' and ');
    const remedy = options.envFileIsFallback
      ? `change ${fromShell.length > 1 ? 'them' : 'it'} in the shell environment (the implicit .env only supplies defaults)`
      : options.envFile
        ? `unset ${fromShell.length > 1 ? 'them' : 'it'}, or define ${fileKeys} in ${options.envFile}`
        : `unset ${fromShell.length > 1 ? 'them' : 'it'}`;
    throw new Error(
      `${(error as Error).message} (${keys} came from the shell environment; ${remedy}.)`,
    );
  }
  connected.clear();
  return active;
}

export function getSapClientConfig(): SapClientConfig | undefined {
  return active;
}

export function resetSapClientConfig(): void {
  active = undefined;
  connected.clear();
}

export function assertAuthTypeSupportsSapClients(
  authType: string | undefined,
  cfg: SapClientConfig | undefined = active,
): void {
  if (cfg && authType !== 'basic') {
    throw new Error(
      `SAP_CLIENTS=${cfg.clients.join(',')} needs basic authentication; this connection uses ${authType ?? 'an unknown auth type'}. A JWT/BTP service instance is bound to one client.`,
    );
  }
}

/**
 * The connection this server was given must BE the default client. An HTTP
 * x-sap-client header, another broker destination, or a shell SAP_CLIENT that
 * disagrees with the env file all arrive here with some other client; routing
 * would otherwise overwrite it with the default and run the call on a client
 * nobody named. An empty client (not yet known) is allowed.
 */
export function assertConnectionIsDefaultClient(
  connectionClient: string | undefined,
  cfg: SapClientConfig,
): void {
  const own = connectionClient?.trim();
  if (own && own !== cfg.defaultClient) {
    throw new Error(
      `This connection is for client ${own}, but SAP_CLIENTS=${cfg.clients.join(',')} makes ${cfg.defaultClient} the default. Refusing to reroute it: align SAP_CLIENT with the connection, or remove SAP_CLIENTS for this server.`,
    );
  }
}

export function connectionParamsForClient<
  T extends { client?: string; username?: string; password?: string },
>(base: T, client: string, cfg: SapClientConfig): T {
  const credentials = cfg.credentials[client];
  return {
    ...base,
    client,
    ...(credentials && {
      username: credentials.username,
      password: credentials.password,
    }),
  };
}

/**
 * Objects created in a client whose user differs from the default must name
 * THAT user as responsible — unless the operator pinned SAP_RESPONSIBLE.
 */
export function responsibleOverrideForClient(
  client: string,
  cfg: SapClientConfig,
  env: NodeJS.ProcessEnv = process.env,
): { responsible?: string } {
  const username = cfg.credentials[client]?.username;
  if (!username || env.SAP_RESPONSIBLE?.trim()) return {};
  return { responsible: username };
}

export function markClientConnected(client: string): void {
  connected.add(client);
}

export function describeSapClients():
  | {
      default: string;
      configured: string[];
      connected: string[];
      usage: string;
    }
  | undefined {
  if (!active) return undefined;
  return {
    default: active.defaultClient,
    configured: [...active.clients],
    connected: active.clients.filter((c) => connected.has(c)),
    usage:
      'Pass sap_client on any tool to target another client of this system; omitted means the default. Every result ends with the client that answered.',
  };
}
