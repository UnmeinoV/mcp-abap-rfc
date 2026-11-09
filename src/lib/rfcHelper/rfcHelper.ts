/**
 * Calling an RFC helper — a small Z function group this server installs on the
 * SAP system to reach function modules that are not RFC-enabled and have no ADT
 * resource (SE63's LXE modules, SE93's RPY_TRANSACTION_*).
 *
 * The source of each helper ships with the server (an RfcHelperSpec) and is
 * installed by its setup tool (lib/rfcHelper/installer.ts). An agent that has
 * never heard of the helper must still get there: every way a helper can be
 * unusable — not RFC, not installed, outdated, newer — is an
 * RfcHelperUnavailable whose message names the one thing to do next.
 */

import { getRfcFunctionCaller } from '../connectionFactory';

export interface RfcHelperModule {
  name: string;
  description: string;
  source: string;
  /** A harmless call that only makes the module report EV_VERSION. */
  probeParams: Record<string, unknown>;
}

export interface RfcHelperSpec {
  /** e.g. "SE63 translation helper". */
  label: string;
  /** The function group, e.g. ZMCP_LXE. */
  group: string;
  groupDescription: string;
  /** Bump on ANY source change — the tools refuse another version. */
  version: string;
  /** The tool that installs/updates this helper. */
  setupTool: string;
  /** Who needs it, for messages: e.g. "Translation tools". */
  usedBy: string;
  modules: RfcHelperModule[];
}

export type RfcHelperProblem = 'not_rfc' | 'missing' | 'outdated' | 'newer';

export class RfcHelperUnavailable extends Error {
  constructor(
    readonly problem: RfcHelperProblem,
    message: string,
  ) {
    super(message);
    this.name = 'RfcHelperUnavailable';
  }
}

/** True when an installed helper reports a higher version than this build ships. */
export function isNewerVersion(
  spec: RfcHelperSpec,
  installed: string,
): boolean {
  const have = Number.parseInt(String(installed ?? '').trim(), 10);
  const want = Number.parseInt(spec.version, 10);
  return Number.isFinite(have) && Number.isFinite(want) && have > want;
}

/** sap-rfc-lite rejects with plain objects (ABAPError), not Error instances. */
export function describeRfcError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object') {
    const e = error as Record<string, unknown>;
    const parts = [e.key, e.message].filter(Boolean).map(String);
    return parts.length > 0 ? parts.join(': ') : JSON.stringify(error);
  }
  return String(error);
}

function isFunctionNotFound(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as Record<string, unknown>;
  return (
    e.key === 'FU_NOT_FOUND' || String(e.message ?? '').includes('FU_NOT_FOUND')
  );
}

/**
 * Helpers whose source was rewritten by THIS process.
 *
 * MEASURED 2026-11-05 (S4D, compiled server over RFC): after the source of an
 * already-called module gained an EXPORTING parameter, the same process kept
 * calling it with the OLD signature — EV_VERSION never came back — even after
 * the ABAP session was closed and reopened, while a fresh process saw it at
 * once. The NW RFC SDK caches function descriptions per process (it has
 * RfcRemoveFunctionDesc, but sap-rfc-lite does not expose it). Only a restart
 * clears it, so the error must say restart, not "run setup again".
 */
const rewrittenInThisProcess = new Set<string>();

export function markRewritten(spec: RfcHelperSpec): void {
  rewrittenInThisProcess.add(spec.group);
}

export function wasRewritten(spec: RfcHelperSpec): boolean {
  return rewrittenInThisProcess.has(spec.group);
}

/** Test hook. */
export function resetRewritten(): void {
  rewrittenInThisProcess.clear();
}

function setupHint(spec: RfcHelperSpec): string {
  return (
    `Install it once with the tool ${spec.setupTool} (package $TMP by ` +
    `default, no transport). It writes Z code into the SAP system — function ` +
    `group ${spec.group} with ${spec.modules.length} RFC-enabled modules — so ` +
    `ask the user before calling it.`
  );
}

/**
 * Call one helper module. Throws RfcHelperUnavailable when the helper cannot be
 * used at all, and refuses an installed helper whose version differs from the
 * source this server ships.
 */
export async function callRfcHelper(
  spec: RfcHelperSpec,
  connection: unknown,
  functionName: string,
  params: Record<string, unknown>,
): Promise<Record<string, any>> {
  const call = getRfcFunctionCaller(connection);
  if (!call) {
    throw new RfcHelperUnavailable(
      'not_rfc',
      `${spec.usedBy} need an RFC connection (SAP_CONNECTION_TYPE=rfc): ` +
        `they call the RFC function modules of the ${spec.label} ${spec.group}, ` +
        'and ADT over HTTP has no way to call a function module.',
    );
  }
  let result: Record<string, any>;
  try {
    result = await call(functionName, params);
  } catch (error) {
    if (isFunctionNotFound(error)) {
      throw new RfcHelperUnavailable(
        'missing',
        `The ${spec.label} is not installed on this SAP system ` +
          `(function module ${functionName} does not exist). ${setupHint(spec)}`,
      );
    }
    throw new Error(
      `RFC call ${functionName} failed: ${describeRfcError(error)}`,
    );
  }
  const installed = String(result?.EV_VERSION ?? '').trim();
  if (isNewerVersion(spec, installed)) {
    throw new RfcHelperUnavailable(
      'newer',
      `The ${spec.label} on this system is version "${installed}", ` +
        `NEWER than the version "${spec.version}" this server build ships: ` +
        `another, newer server build installed it. Update or restart THIS server ` +
        `(e.g. /mcp reconnect after a rebuild). Do NOT run ${spec.setupTool} ` +
        `from this build — it would downgrade the helper for everyone.`,
    );
  }
  if (installed !== spec.version) {
    if (wasRewritten(spec)) {
      throw new RfcHelperUnavailable(
        'outdated',
        `The ${spec.label} was updated by ${spec.setupTool} in ` +
          `this server process, but the process still sees the old version ` +
          `"${installed || '(none)'}": the SAP NW RFC SDK caches function ` +
          `signatures per process. RESTART THE MCP SERVER (e.g. /mcp reconnect) ` +
          `— do not run ${spec.setupTool} again.`,
      );
    }
    throw new RfcHelperUnavailable(
      'outdated',
      `The ${spec.label} on this system is version ` +
        `"${installed || '(none)'}", this server needs version ` +
        `"${spec.version}". Run ${spec.setupTool} again to update it ` +
        `(it overwrites the source of ${spec.modules.map((m) => m.name).join(', ')}; ` +
        `ask the user first).`,
    );
  }
  return result;
}
