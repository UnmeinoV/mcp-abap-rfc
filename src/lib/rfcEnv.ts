/**
 * Reads and validates the RFC env file. RFC only: no URL, no HTTP, no auth
 * broker. The file may still carry the keys written for the original HTTP/RFC
 * server (SAP_CONNECTION_TYPE=rfc, SAP_AUTH_TYPE=basic, SAP_SYSTEM_TYPE=onprem)
 * and is accepted unchanged.
 */
import * as fs from 'node:fs';
import * as dotenv from 'dotenv';
import {
  MAX_RESULT_CHARS_CEILING,
  parseMaxResultChars,
} from './config/maxResultChars';
import { assertRfcAddress, rfcServiceUrl } from './rfcAddress';

export interface RfcSettings {
  ashost: string;
  sysnr: string;
  client: string;
  username: string;
  password: string;
  language?: string;
  saprouter?: string;
  compression: boolean; // SAP_RFC_COMPRESSION=on
  systemType: 'onprem' | 'legacy';
  masterSystem?: string;
  responsible?: string;
  serviceUrl: string; // internal, handed to the dependency
  source: string; // env file path, or 'the environment'
}

type Values = Record<string, string | undefined>;

function val(v: Values, key: string): string | undefined {
  const x = v[key]?.trim();
  return x ? x : undefined;
}

/**
 * `fileKeys`: the keys the env file defines (empty set: no env file). With it,
 * a REFUSED value names where it came from — the file, or the shell (which the
 * user must unset, because editing the file would not help). Without it every
 * message says `(in <source>)`.
 */
export function parseRfcEnv(
  values: Values,
  source: string,
  fileKeys?: ReadonlySet<string>,
): RfcSettings {
  const where = ` (in ${source})`;
  const refusedAt = (key: string): string =>
    !fileKeys || fileKeys.has(key)
      ? where
      : ' (in the shell environment — unset it)';

  const connType = val(values, 'SAP_CONNECTION_TYPE');
  if (connType && connType.toLowerCase() !== 'rfc') {
    throw new Error(
      `SAP_CONNECTION_TYPE=${connType}${refusedAt('SAP_CONNECTION_TYPE')}: this server supports only RFC. Remove the key or set SAP_CONNECTION_TYPE=rfc.`,
    );
  }
  const authType = val(values, 'SAP_AUTH_TYPE');
  if (authType && authType.toLowerCase() !== 'basic') {
    throw new Error(
      `SAP_AUTH_TYPE=${authType}${refusedAt('SAP_AUTH_TYPE')}: this server supports only basic (user/password) logon.`,
    );
  }
  const sysType = val(values, 'SAP_SYSTEM_TYPE')?.toLowerCase();
  if (sysType && sysType !== 'onprem' && sysType !== 'legacy') {
    throw new Error(
      `SAP_SYSTEM_TYPE=${sysType}${refusedAt('SAP_SYSTEM_TYPE')}: must be onprem or legacy (cloud systems are not reachable over RFC).`,
    );
  }
  if (val(values, 'SAP_URL')) {
    throw new Error(
      `SAP_URL${refusedAt('SAP_URL')} is not used over RFC. Remove it and name the system with SAP_ASHOST + SAP_SYSNR.`,
    );
  }
  const ashost = val(values, 'SAP_ASHOST');
  if (!ashost) {
    throw new Error(
      `SAP_ASHOST is required${where}: the application server host or IP.`,
    );
  }
  assertRfcAddress(
    { ...values, SAP_CONNECTION_TYPE: 'rfc' },
    source,
    refusedAt,
  );
  const sysnr = val(values, 'SAP_SYSNR') as string;

  const client = val(values, 'SAP_CLIENT');
  if (!client) throw new Error(`SAP_CLIENT is required${where}.`);
  const username = val(values, 'SAP_USERNAME');
  if (!username) throw new Error(`SAP_USERNAME is required${where}.`);
  const password = val(values, 'SAP_PASSWORD');
  if (!password) throw new Error(`SAP_PASSWORD is required${where}.`);

  return {
    ashost,
    sysnr,
    client,
    username,
    password,
    language: val(values, 'SAP_LANGUAGE'),
    saprouter: val(values, 'SAP_SAPROUTER'),
    compression: val(values, 'SAP_RFC_COMPRESSION')?.toLowerCase() === 'on',
    systemType: sysType === 'legacy' ? 'legacy' : 'onprem',
    masterSystem: val(values, 'SAP_MASTER_SYSTEM'),
    responsible: val(values, 'SAP_RESPONSIBLE'),
    serviceUrl: rfcServiceUrl(ashost, sysnr),
    source,
  };
}

/** The key/value pairs of an env file; an unreadable file is an error naming it. */
export function readEnvFile(envFile: string): Record<string, string> {
  let text: string;
  try {
    text = fs.readFileSync(envFile, 'utf8');
  } catch (e) {
    throw new Error(`Cannot read env file ${envFile}: ${(e as Error).message}`);
  }
  return dotenv.parse(text);
}

/**
 * A key the env file defines wins over the shell, even when empty; the shell
 * only fills keys the file does not mention.
 */
export function loadRfcEnv(opts: {
  envFile?: string;
  env?: NodeJS.ProcessEnv;
  /** --system-type: wins over SAP_SYSTEM_TYPE in the env file. */
  systemType?: 'onprem' | 'legacy';
}): { settings: RfcSettings } {
  const env = opts.env ?? process.env;
  let merged: Values = { ...env };
  let source = 'the environment';
  let fileKeys: Set<string> = new Set();
  if (opts.envFile) {
    const fileValues = readEnvFile(opts.envFile);
    merged = { ...env, ...fileValues };
    source = opts.envFile;
    fileKeys = new Set(Object.keys(fileValues));
  }
  const settings = parseRfcEnv(merged, source, fileKeys);
  if (opts.systemType) settings.systemType = opts.systemType;
  return { settings };
}

/**
 * Keys that downstream code reads from process.env (the write guard, the audit
 * log, the dependency's timeouts, the result-size meta, the NW RFC SDK's trace
 * directory) and that an env file may set. Without the bridge a key written in
 * the file would be accepted and silently ignored — for SAP_DENY_TOOLS and
 * SAP_ALLOWED_PACKAGES that is a guardrail that looks configured and is not.
 */
export const BRIDGED_ENV_KEYS: readonly string[] = [
  'SAP_DENY_TOOLS',
  'SAP_ALLOWED_PACKAGES',
  'SAP_AUDIT_LOG_FILE',
  'MCP_MAX_RESULT_CHARS',
  'RFC_TRACE_DIR',
];
/** Every key with this prefix is bridged too (SAP_TIMEOUT_DEFAULT / _CSRF / _LONG). */
export const BRIDGED_ENV_PREFIXES: readonly string[] = ['SAP_TIMEOUT_'];

export function isBridgedEnvKey(key: string): boolean {
  return (
    BRIDGED_ENV_KEYS.includes(key) ||
    BRIDGED_ENV_PREFIXES.some((prefix) => key.startsWith(prefix))
  );
}

/**
 * Copies the bridged keys the env file defines into `env`, with the same
 * precedence as the RFC keys: a key the file defines wins over the shell, even
 * when empty; a key the file does not mention keeps its shell value.
 * `cliKeys`: keys a command-line option already set (e.g.
 * --max-result-chars), which win over the file. A bad MCP_MAX_RESULT_CHARS in
 * the file stops startup, naming the key and the file. Returns the keys set.
 */
export function bridgeEnvFileKeys(
  fileValues: Record<string, string>,
  envFile: string,
  env: NodeJS.ProcessEnv = process.env,
  cliKeys: readonly string[] = [],
): string[] {
  const bridged: string[] = [];
  for (const [key, value] of Object.entries(fileValues)) {
    if (!isBridgedEnvKey(key) || cliKeys.includes(key)) continue;
    if (key === 'MCP_MAX_RESULT_CHARS') {
      try {
        parseMaxResultChars(value);
      } catch {
        throw new Error(
          `MCP_MAX_RESULT_CHARS=${value} (in ${envFile}) must be an integer between 1 and ${MAX_RESULT_CHARS_CEILING}, or empty.`,
        );
      }
    }
    env[key] = value;
    bridged.push(key);
  }
  return bridged;
}

/**
 * The launcher's step: bridge the env file's keys (if there is a file), then
 * validate the EFFECTIVE MCP_MAX_RESULT_CHARS — the file's, the command
 * line's, or the shell's — so a bad value stops startup whichever it came
 * from. Runs before the RFC module is loaded, so an RFC_TRACE_DIR from the file
 * is in place before the NW RFC SDK starts writing traces.
 */
export function applyEnvFileBridge(opts: {
  envFile?: string;
  env?: NodeJS.ProcessEnv;
  cliKeys?: readonly string[];
}): string[] {
  const env = opts.env ?? process.env;
  const bridged = opts.envFile
    ? bridgeEnvFileKeys(
        readEnvFile(opts.envFile),
        opts.envFile,
        env,
        opts.cliKeys,
      )
    : [];
  parseMaxResultChars(env.MCP_MAX_RESULT_CHARS);
  return bridged;
}

function setOrDelete(
  env: NodeJS.ProcessEnv,
  key: string,
  v: string | undefined,
): void {
  if (v === undefined) delete env[key];
  else env[key] = v;
}

/** Publishes the settings under the keys downstream code reads from process.env. Never the password. */
export function exportRfcSettingsToProcessEnv(
  s: RfcSettings,
  env: NodeJS.ProcessEnv = process.env,
): void {
  env.SAP_ASHOST = s.ashost;
  env.SAP_SYSNR = s.sysnr;
  env.SAP_CLIENT = s.client;
  env.SAP_USERNAME = s.username;
  env.SAP_SYSTEM_TYPE = s.systemType;
  setOrDelete(env, 'SAP_LANGUAGE', s.language);
  setOrDelete(env, 'SAP_SAPROUTER', s.saprouter);
  setOrDelete(env, 'SAP_RFC_COMPRESSION', s.compression ? 'on' : undefined);
  setOrDelete(env, 'SAP_MASTER_SYSTEM', s.masterSystem);
  setOrDelete(env, 'SAP_RESPONSIBLE', s.responsible);
  delete env.SAP_CONNECTION_TYPE;
  delete env.SAP_URL;
}

/**
 * A SAProuter string with its passwords masked: the value after /P/ (route
 * password) and /W/ (password of the next hop) is replaced by three
 * asterisks, e.g. `/H/r1/S/3299/W/secret/H/host` keeps everything but `secret`.
 */
export function maskSaprouterPasswords(route: string): string {
  return route.replace(/(\/[PW]\/)[^/]*/gi, '$1***');
}

/** The startup banner line. Never the password, nor a SAProuter password. */
export function rfcBanner(s: RfcSettings): string {
  return (
    `[MCP] RFC ${s.ashost} instance ${s.sysnr}, client ${s.client}, user ${s.username}` +
    `${s.saprouter ? `, SAProuter ${maskSaprouterPasswords(s.saprouter)}` : ''}` +
    `${s.language ? `, language ${s.language}` : ''} (from ${s.source})`
  );
}
