import { AsyncLocalStorage } from 'node:async_hooks';
import { getSystemInformation } from '@mcp-abap-adt/adt-clients';
import type { IAbapConnection } from '@mcp-abap-adt/interfaces';
import { registerConnectionResetHook } from './connectionEvents';

export interface IAdtSystemContext {
  masterSystem?: string;
  responsible?: string;
  client?: string;
  isLegacy?: boolean;
  /** Master/original language for created objects (adtcore:masterLanguage). From SAP_LANGUAGE; library defaults to EN when unset. */
  masterLanguage?: string;
}

// Existing callers retain their process-global cache. Ticket servers opt into
// a fresh scope per tool call; an empty scope never inherits this global cache.
let cached: IAdtSystemContext | undefined;
const scopedContext = new AsyncLocalStorage<{
  context?: IAdtSystemContext;
}>();

export function runWithSystemContext<T>(
  context: IAdtSystemContext | undefined,
  work: () => T,
): T {
  return scopedContext.run(
    { context: context ? { ...context } : undefined },
    work,
  );
}

function readContext(): IAdtSystemContext | undefined {
  const scope = scopedContext.getStore();
  return scope ? scope.context : cached;
}

function writeContext(context: IAdtSystemContext | undefined): void {
  const scope = scopedContext.getStore();
  if (scope) scope.context = context;
  else cached = context;
}

// Per-call override (multi-client: the user a non-default client logs on
// with), applied on top of whichever context is in force — the global cache or
// a ticket server's per-call scope above. Request-scoped, so two concurrent
// calls for different clients cannot read each other's.
const scopedOverride = new AsyncLocalStorage<Partial<IAdtSystemContext>>();

export function runWithSystemContextOverride<T>(
  override: Partial<IAdtSystemContext>,
  fn: () => T,
): T {
  return scopedOverride.run(override, fn);
}

/**
 * Detect whether the connected system is legacy (BASIS < 7.50).
 *
 * Uses SAP_SYSTEM_TYPE env var (default: onprem).
 * Auto-detection via /sap/bc/adt/core/discovery was removed because it is
 * unreliable — the result depends on shell environment, proxy config, and
 * whether the ICM port requires a pre-established session.
 *
 *   SAP_SYSTEM_TYPE=legacy  → legacy (BASIS < 7.50)
 *   SAP_SYSTEM_TYPE=onprem  → modern on-premise (default)
 */
function detectLegacy(): boolean {
  return process.env.SAP_SYSTEM_TYPE?.toLowerCase() === 'legacy';
}

export async function resolveSystemContext(
  connection: IAbapConnection,
  overrides?: Partial<IAdtSystemContext>,
): Promise<IAdtSystemContext> {
  let cached = readContext();
  // Priority 1: explicit overrides (from HTTP headers)
  if (overrides && (overrides.masterSystem || overrides.responsible)) {
    cached = {
      masterSystem: overrides.masterSystem,
      responsible: overrides.responsible,
      masterLanguage: overrides.masterLanguage ?? process.env.SAP_LANGUAGE,
      isLegacy: cached?.isLegacy ?? detectLegacy(),
    };
    writeContext(cached);
    return cached;
  }

  if (cached) return cached;

  // Detect legacy from SAP_SYSTEM_TYPE (default: onprem → not legacy)
  const isLegacy = detectLegacy();

  // Priority 2: env vars (on-prem or explicitly configured)
  const masterSystem = process.env.SAP_MASTER_SYSTEM;
  const responsible = process.env.SAP_RESPONSIBLE || process.env.SAP_USERNAME;
  const masterLanguage = process.env.SAP_LANGUAGE;

  if (masterSystem || responsible || masterLanguage) {
    cached = { masterSystem, responsible, masterLanguage, isLegacy };
    writeContext(cached);
    return cached;
  }

  // No env-configured context: try the getSystemInformation API
  try {
    const info = await getSystemInformation(connection);
    cached = {
      masterSystem: info?.systemID,
      responsible: info?.userName,
      client: info?.client,
      masterLanguage,
      isLegacy,
    };
  } catch {
    cached = { masterLanguage, isLegacy };
  }

  writeContext(cached);
  return cached;
}

export function getSystemContext(): IAdtSystemContext {
  const base = readContext() || {};
  const override = scopedOverride.getStore();
  if (override && Object.keys(override).length > 0) {
    return { ...base, ...override };
  }
  return base;
}

/**
 * Set system context explicitly (safe, no HTTP requests).
 * Use this when system info is known upfront (e.g., from BTP destination metadata).
 */
export function setSystemContext(context: Partial<IAdtSystemContext>): void {
  const cached = readContext();
  writeContext({
    ...cached,
    ...context,
    isLegacy: context.isLegacy ?? cached?.isLegacy ?? detectLegacy(),
  });
}

export function resetSystemContextCache() {
  writeContext(undefined);
}

registerConnectionResetHook(resetSystemContextCache);
