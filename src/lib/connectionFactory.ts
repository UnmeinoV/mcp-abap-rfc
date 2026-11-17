/**
 * The one place this repo creates an ABAP connection.
 *
 * Wraps `@mcp-abap-adt/connection`'s `createAbapConnection` so that an RFC
 * connection can reach a system that is only reachable through a SAProuter.
 *
 * WHY RFC AND NOT HTTP THROUGH THE ROUTER (measured 2026-10-12): a SAProuter
 * whose saprouttab carries only `S` entries permits NI_MSG_IO routes (SAP GUI,
 * RFC) and refuses raw ones (`route permission denied`, -94). An HTTP request
 * sent inside an NI_MSG_IO route does reach the ICM, but the router then reads
 * the ICM's raw reply as an NI frame — `HTTP` as a length, 1213486160 — and
 * drops the connection (`Network packet too big`). So HTTP cannot cross such a
 * router at all, and RFC (the transport SAP GUI is already using) can.
 *
 * WHAT THE DEPENDENCY LACKS: `RfcAbapConnection` builds its NW RFC parameters
 * itself (ashost/sysnr/client/user/passwd) with no `saprouter` and with the
 * logon language hard-coded to EN. Its parameter object is passed to the SDK
 * as a free key/value map, so the missing keys are added here:
 *   - `saprouter` from SAP_SAPROUTER (e.g. `/H/1.2.3.4/H/`)
 *   - `lang` from SAP_LANGUAGE, so RFC logs on in the same language the HTTP
 *     path pins with `sap-language` (an object's original language is the
 *     logon language — see the P1 entry in CLAUDE.md)
 *
 * The parameters live on a field the dependency does not export. If a future
 * version moves it, this REFUSES to build the connection instead of quietly
 * connecting without the router: a connection that silently skips the route
 * would fail later with a network timeout that names nothing.
 */
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { createAbapConnection as createDependencyConnection } from '@mcp-abap-adt/connection';
import { annotateSapException } from './sapExceptionMessage';

type CreateArgs = Parameters<typeof createDependencyConnection>;
type AbapConnectionInstance = ReturnType<typeof createDependencyConnection>;

/**
 * What the dependency's HTTP connection sends when the caller names no Accept.
 * Its RFC connection sends NO Accept at all, and ADT then refuses some
 * resources with a bare 400 — measured 2026-10-13 on
 * /programs/includes/{name}/source/main (GetInclude, and SearchSource's
 * function-group includes): 400 without an Accept, 200 with this one.
 */
export const DEFAULT_ACCEPT =
  'application/xml, application/json, text/plain, */*';

interface RfcInternals {
  rfcParams?: Record<string, string>;
  rfcClient?: {
    alive?: boolean;
    call?: (name: string, params: Record<string, unknown>) => Promise<any>;
  } | null;
  callFunction?: RfcFunctionCaller;
  connect: () => Promise<void>;
  close?: () => Promise<void>;
  invalidateSession?: () => Promise<void>;
  sessionType?: string;
  makeAdtRequest: (options: RfcRequestOptions) => Promise<unknown>;
}

interface RfcRequestOptions {
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * The ONE ABAP session an RFC connection keeps has run out of temporary
 * subroutine pools. Measured 2026-10-14 through the SAProuter: Data Preview
 * generates them per query and never frees them in that session, so the 19th
 * GetSqlQuery of a fresh connection failed with this runtime error — and so
 * did every request after it, until the session was reset. HTTP is stateless
 * per request and never accumulates them.
 */
function isSubpoolExhausted(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.includes('GENERATE_SUBPOOL_DIR_FULL')
  );
}

/** Safe to send twice: a GET, or Data Preview (a POST that only reads). */
function isRead(options: RfcRequestOptions): boolean {
  const method = String(options?.method ?? 'GET').toUpperCase();
  return (
    method === 'GET' ||
    method === 'HEAD' ||
    String(options?.url ?? '').includes('/sap/bc/adt/datapreview/')
  );
}

function withDefaultAccept(options: RfcRequestOptions): RfcRequestOptions {
  const headers = options?.headers ?? {};
  if (Object.keys(headers).some((name) => name.toLowerCase() === 'accept')) {
    return options;
  }
  return { ...options, headers: { Accept: DEFAULT_ACCEPT, ...headers } };
}

/** The NW RFC parameters this repo adds on top of the dependency's own. */
export function rfcParamOverrides(
  env: NodeJS.ProcessEnv = process.env,
): Record<string, string> {
  const overrides: Record<string, string> = {};
  const saprouter = env.SAP_SAPROUTER?.trim();
  if (saprouter) overrides.saprouter = saprouter;
  const lang = env.SAP_LANGUAGE?.trim();
  if (lang) overrides.lang = lang.toUpperCase();
  // With compression on, a request whose body compresses badly (base64 — a
  // checkrun artifact, an upload) dumps on the server with XML_FORMAT_ERROR
  // while the RFC parameters are deserialized, before SADT_REST_RFC_ENDPOINT
  // runs. Measured 2026-10-20: 120 KB of random base64 fails, 60 KB passes,
  // 267 KB of repetitive text passes; with NO_COMPRESSION all of them pass.
  if (env.SAP_RFC_COMPRESSION?.trim().toLowerCase() !== 'on') {
    overrides.no_compression = '1';
  }
  return overrides;
}

/**
 * The NW RFC SDK writes `rfc<pid>_<thread>.trc` files into the CURRENT
 * DIRECTORY even at trace level 0 — measured: 3 files per server start. For an
 * MCP server that is the user's project, where they get committed by the next
 * `git add -A`; they also carry the hostname, OS user and working directory.
 * Unless the user chose a directory, send them to the temp dir. Must run before
 * the SDK is loaded, which happens on the first connect().
 */
export function defaultRfcTraceDir(env: NodeJS.ProcessEnv = process.env): void {
  if (env.RFC_TRACE_DIR?.trim()) return;
  const dir = path.join(os.tmpdir(), 'mcp-abap-rfc-rfc-trace');
  try {
    fs.mkdirSync(dir, { recursive: true });
    env.RFC_TRACE_DIR = dir;
  } catch {
    // Leave the SDK's default rather than fail the connection over trace files.
  }
}

/**
 * Logons SAP REFUSED in this process, by logon identity (issue #1).
 *
 * WHY PROCESS-WIDE: SAP locks a user after `login/fails_to_user_lock` failed
 * logons, and over RFC every request after a lost session calls connect()
 * again — so with a password that went stale, each tool call was one more
 * failed logon and a handful of calls locked the account. A per-connection
 * flag would not stop it: on stdio a connection whose logon failed is evicted
 * from BaseMcpServer's cache and the next call builds a NEW one. Only a
 * restart clears an entry; a corrected password means a new process anyway.
 * Only a REFUSED logon is remembered — a network failure is retried as before.
 */
const refusedLogons = new Map<string, Error>();

/** Forget every refused logon — for tests only. */
export function resetRefusedRfcLogons(): void {
  refusedLogons.clear();
}

/** Who logs on where; the password is deliberately not part of it. */
function rfcLogonKey(params: Record<string, string>): string {
  const pick = (k: string) => String(params[k] ?? '').trim();
  return JSON.stringify([
    pick('ashost'),
    pick('sysnr'),
    pick('mshost'),
    pick('group'),
    pick('saprouter'),
    pick('client'),
    pick('user').toUpperCase(),
  ]);
}

/**
 * The SDK rejects a refused logon with an error OBJECT (`codeString` /
 * `key` RFC_LOGON_FAILURE, `group` 3 = LOGON_FAILURE); the dependency turns it
 * into `Failed to open RFC connection: <its JSON>`. Both shapes are accepted.
 */
export function isRfcLogonFailure(error: unknown): boolean {
  const e = error as Record<string, unknown> | undefined;
  if (e && typeof e === 'object') {
    if (e.codeString === 'RFC_LOGON_FAILURE' || e.key === 'RFC_LOGON_FAILURE')
      return true;
    // group 3 = LOGON_FAILURE in the SDK's RFC_ERROR_GROUP.
    if (e.group === 3 && typeof e.codeString === 'string') return true;
  }
  const message = error instanceof Error ? error.message : String(error ?? '');
  return (
    /"(?:codeString|key)"\s*:\s*"RFC_LOGON_FAILURE"/.test(message) ||
    /"group"\s*:\s*3(?!\d)/.test(message)
  );
}

function refusedAgain(first: Error): Error {
  return new Error(
    `${first.message} — SAP REFUSED this logon earlier in this process, so ` +
      'no new logon was attempted and nothing was sent to SAP (every failed ' +
      'logon counts toward the user lock). Fix the credentials and restart ' +
      'the MCP server.',
  );
}

export function applyRfcOverrides(
  connection: AbapConnectionInstance,
  env: NodeJS.ProcessEnv = process.env,
): void {
  defaultRfcTraceDir(env);
  const rfc = connection as unknown as RfcInternals;
  const overrides = rfcParamOverrides(env);
  if (!rfc.rfcParams || typeof rfc.rfcParams !== 'object') {
    // Without no_compression only large base64 bodies fail, and they fail
    // with their own dump — not worth refusing the connection over.
    const required = Object.keys(overrides).filter(
      (key) => key !== 'no_compression',
    );
    if (required.length > 0) {
      throw new Error(
        `Cannot apply RFC settings (${required.join(', ')}): ` +
          'the installed @mcp-abap-adt/connection no longer exposes the RFC ' +
          'parameter object this server patches. Refusing to connect without ' +
          'them — a route-less connection would fail later with a timeout ' +
          'that does not say why.',
      );
    }
    return;
  }
  Object.assign(rfc.rfcParams, overrides);

  // Every logon of this connection — send(), callFunction() and a caller's
  // own connect() (BaseMcpServer.openConnection) — goes through this latch.
  const rawConnect = rfc.connect.bind(connection);
  const params = rfc.rfcParams;
  rfc.connect = async () => {
    const key = rfcLogonKey(params);
    const refused = refusedLogons.get(key);
    if (refused) throw refusedAgain(refused);
    try {
      await rawConnect();
    } catch (error) {
      if (isRfcLogonFailure(error)) {
        refusedLogons.set(
          key,
          error instanceof Error ? error : new Error(String(error)),
        );
      }
      throw error;
    }
  };

  // The dependency's RFC connection throws "not open" until connect() is
  // called, and only some call sites call it. Open it on first use instead, so
  // every path that creates a connection works the same way over RFC. Every
  // request also gets the HTTP path's default Accept (see DEFAULT_ACCEPT).
  const original = rfc.makeAdtRequest.bind(connection);
  let opening: Promise<void> | undefined;
  // A session reset in progress, and the requests it must not cut off: the
  // dependency's RFC client has no request queue, so closing it under an
  // in-flight request fails that request with an error that names nothing.
  let resetting: Promise<void> | undefined;
  const inFlight = new Set<Promise<unknown>>();
  // Bumped by every reset, so requests that failed together in one session
  // reset it once, not once each.
  let generation = 0;

  const send = async (
    options: RfcRequestOptions,
    sentIn: { generation: number },
  ) => {
    while (resetting) await resetting;
    if (!rfc.rfcClient?.alive) {
      opening ??= rfc.connect().finally(() => {
        opening = undefined;
      });
      await opening;
    }
    sentIn.generation = generation;
    const request = original(withDefaultAccept(options));
    inFlight.add(request);
    try {
      return await request;
    } finally {
      inFlight.delete(request);
    }
  };

  // The HTTP connection can terminate its SAP session (invalidateSession);
  // the dependency's RFC connection cannot. Closing the RFC client ends that
  // ABAP session, and send() opens a fresh one on the next request — after
  // requests already in flight have finished, while new ones wait for it.
  const close = rfc.close?.bind(connection);
  const resetSession = close
    ? async () => {
        resetting ??= (async () => {
          await Promise.allSettled([...inFlight]);
          await close();
          generation++;
        })().finally(() => {
          resetting = undefined;
        });
        await resetting;
      }
    : undefined;

  // The dependency's RFC connection throws "not open" until connect() is
  // called, and only some call sites call it, so send() opens it on first use.
  // Every request also gets the HTTP path's default Accept (DEFAULT_ACCEPT).
  rfc.makeAdtRequest = async (options: RfcRequestOptions) => {
    const sentIn = { generation };
    try {
      return await send(options, sentIn);
    } catch (error) {
      if (!isSubpoolExhausted(error) || !resetSession) throw error;
      const err = error as Error;
      if (rfc.sessionType === 'stateful') {
        err.message +=
          ' — the RFC session ran out of temporary subroutine pools. It was ' +
          'not reset because it is stateful and may hold the locks of an ' +
          'operation in progress; finish or abandon that operation, and the ' +
          'next stateless request will reset it.';
        throw err;
      }
      if (sentIn.generation === generation) await resetSession();
      else while (resetting) await resetting;
      if (!isRead(options)) {
        err.message +=
          ' — the RFC session ran out of temporary subroutine pools, so the ' +
          'session has been reset and the next request will work. This ' +
          'request was not re-sent because it is not a read: check whether ' +
          'it took effect before retrying it.';
        throw err;
      }
      return send(options, sentIn);
    }
  };

  // A plain RFC function call on the SAME ABAP session the ADT requests use —
  // for function modules ADT has no resource for (see lib/translation). It
  // waits for a session reset and opens the connection exactly like send().
  rfc.callFunction = async (name, params) => {
    while (resetting) await resetting;
    if (!rfc.rfcClient?.alive) {
      opening ??= rfc.connect().finally(() => {
        opening = undefined;
      });
      await opening;
    }
    const client = rfc.rfcClient;
    if (!client?.call) {
      throw new Error(
        'The installed @mcp-abap-adt/connection RFC client offers no call() — ' +
          'cannot call an RFC function module.',
      );
    }
    const request = client.call(name, params);
    inFlight.add(request);
    try {
      return await request;
    } finally {
      inFlight.delete(request);
    }
  };

  // lib/classrunSession.ts's stale-shell remedy needs this; without it that
  // remedy silently never ran over RFC.
  if (typeof rfc.invalidateSession !== 'function' && resetSession) {
    rfc.invalidateSession = resetSession;
  }
}

export type RfcFunctionCaller = (
  name: string,
  params: Record<string, unknown>,
) => Promise<Record<string, any>>;

/**
 * End the ABAP session of an RFC connection so the next request opens a new
 * one — which releases every enqueue that session still holds.
 *
 * WHY (measured 2026-11-05, S4D/100 over RFC): after CreateMessageClass the
 * new class stayed edit-locked by OUR OWN session — AddMessage and
 * UpdateMessageClass in the same process were refused "locked … held by
 * <user>", while a fresh process wrote at once. Over HTTP the explicit
 * `x-sap-adt-sessiontype: stateless` header ends the server session; over RFC
 * the whole connection IS one ABAP session, so the header cannot.
 *
 * Returns 'reset', 'not_rfc', or 'skipped_stateful' — a stateful connection is
 * not reset because another operation's locks may live in that session.
 */
export async function endRfcSession(
  connection: unknown,
): Promise<'reset' | 'not_rfc' | 'skipped_stateful'> {
  const rfc = connection as RfcInternals | null;
  if (!rfc || typeof rfc.callFunction !== 'function') return 'not_rfc';
  if (rfc.sessionType === 'stateful') return 'skipped_stateful';
  if (typeof rfc.invalidateSession !== 'function') return 'not_rfc';
  await rfc.invalidateSession();
  return 'reset';
}

/**
 * The RFC function caller of a connection, or undefined when the connection is
 * not RFC (HTTP has no way to call a function module through ADT).
 */
export function getRfcFunctionCaller(
  connection: unknown,
): RfcFunctionCaller | undefined {
  const fn = (connection as RfcInternals | null)?.callFunction;
  return typeof fn === 'function' ? fn : undefined;
}

/**
 * Every failed request, HTTP or RFC, carries SAP's own explanation in its
 * message (see sapExceptionMessage.ts). Done here because this is the one
 * place every connection is created, so no request path can miss it.
 */
function annotateFailures(connection: AbapConnectionInstance): void {
  const conn = connection as unknown as {
    makeAdtRequest: (options: unknown) => Promise<unknown>;
  };
  const original = conn.makeAdtRequest.bind(connection);
  conn.makeAdtRequest = async (options: unknown) => {
    try {
      return await original(options);
    } catch (error) {
      throw annotateSapException(error);
    }
  };
}

/** RFC only: every connection is an RFC connection; HTTP is refused. */
export function createAbapConnection(
  ...args: CreateArgs
): AbapConnectionInstance {
  const [config, ...rest] = args;
  if (config?.connectionType === 'http') {
    throw new Error(
      "createAbapConnection: connectionType 'http' is not supported — this server is RFC only.",
    );
  }
  const connection = createDependencyConnection(
    { ...config, connectionType: 'rfc' },
    ...rest,
  );
  applyRfcOverrides(connection);
  annotateFailures(connection);
  return connection;
}
