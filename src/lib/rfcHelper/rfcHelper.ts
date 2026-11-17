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
 *
 * MEASURED 2026-11-13 (S4D): the same cache also lets a call SUCCEED with a
 * wrong answer. The SE41 helper's EV_MESSAGE went from CHAR 220 to STRING; the
 * installer had called the old module (to read version_before), rewrote it,
 * and its verification call then answered EV_VERSION "2" — while EV_MESSAGE
 * of the next real call came back as mojibake (its bytes decoded with the old
 * CHAR description). So once a group has been rewritten AFTER one of its
 * modules was called in this process, a successful call proves nothing, and
 * every further call is refused with "restart" (staleSignature).
 *
 * REPORTED 2026-11-17 (issue #6): "called" used to be recorded per GROUP and
 * for every failure except FU_NOT_FOUND. A dropped connection before the
 * helper was ever installed therefore made its FIRST install end in "restart",
 * with every later call refused — in a process whose SDK cannot hold a
 * description of modules that did not exist. Now tracked per MODULE, in two
 * grades:
 *   answered  — a call returned a result: the description IS cached.
 *   attempted — a call failed with something other than FU_NOT_FOUND: the
 *               description is cached only if the module existed. Whether it
 *               did is decided by the installer's TFDIR read before the write.
 * A module that never answered here and was not in TFDIR before the write
 * cannot have a cached description, whatever errors came before.
 */
const rewrittenInThisProcess = new Set<string>();
/** Modules that returned a result in this process (signature cached). */
const answeredInThisProcess = new Set<string>();
/** Modules whose call failed other than FU_NOT_FOUND (cached if they existed). */
const attemptedInThisProcess = new Set<string>();
/** Groups rewritten after a call: the cached signature may be wrong. */
const staleInThisProcess = new Set<string>();

/**
 * In every text that asks for a restart, so a host that runs this server as a
 * managed process can recognise it without parsing prose. Search for it
 * anywhere in the text: a result may carry a prefix (tool name, sap_client).
 */
export const RESTART_REQUIRED_MARKER = '[MCP_RESTART_REQUIRED]';

/**
 * Record that a module's source was written by this process.
 *
 * `existedBefore` is the installer's TFDIR read taken before the write. Without
 * a module name (or without that knowledge) the conservative answer is used:
 * any earlier call of the group makes it stale.
 */
export function markRewritten(
  spec: RfcHelperSpec,
  moduleName?: string,
  existedBefore = true,
): void {
  rewrittenInThisProcess.add(spec.group);
  const names = moduleName ? [moduleName] : spec.modules.map((m) => m.name);
  for (const name of names) {
    if (
      answeredInThisProcess.has(name) ||
      (existedBefore && attemptedInThisProcess.has(name))
    ) {
      staleInThisProcess.add(spec.group);
    }
  }
}

export function wasRewritten(spec: RfcHelperSpec): boolean {
  return rewrittenInThisProcess.has(spec.group);
}

/**
 * Record the outcome of calling one module. A call answered FU_NOT_FOUND
 * leaves no description behind and is not recorded.
 */
export function noteHelperCalled(
  _spec: RfcHelperSpec,
  moduleName: string,
  error?: unknown,
): void {
  if (error === undefined) answeredInThisProcess.add(moduleName);
  else if (!isFunctionNotFound(error)) attemptedInThisProcess.add(moduleName);
}

/** True when this process may decode the helper with an outdated signature. */
export function hasStaleSignature(spec: RfcHelperSpec): boolean {
  return staleInThisProcess.has(spec.group);
}

/** Test hook. */
export function resetRewritten(): void {
  rewrittenInThisProcess.clear();
  answeredInThisProcess.clear();
  attemptedInThisProcess.clear();
  staleInThisProcess.clear();
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
  if (hasStaleSignature(spec)) {
    throw new RfcHelperUnavailable(
      'outdated',
      `${RESTART_REQUIRED_MARKER} The ${spec.label} was rewritten by ${spec.setupTool} in this server ` +
        `process after the process had already called it: the SAP NW RFC SDK ` +
        `caches function signatures per process, so its answers here could be ` +
        `decoded with the OLD signature. RESTART THE MCP SERVER (e.g. /mcp ` +
        `reconnect) — do not run ${spec.setupTool} again.`,
    );
  }
  let result: Record<string, any>;
  try {
    result = await call(functionName, params);
    noteHelperCalled(spec, functionName);
  } catch (error) {
    noteHelperCalled(spec, functionName, error);
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
        `${RESTART_REQUIRED_MARKER} The ${spec.label} was updated by ${spec.setupTool} in ` +
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
