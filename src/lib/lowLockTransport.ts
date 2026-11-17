/**
 * The CORRNR a Lock*Low tool got from SAP, so Update*Low can use it (issue #3).
 *
 * SAP's LOCK answer names the request/task the object is recorded in
 * (CORRNR). The dependency's per-type lock() parses only the handle and drops
 * it, and an Update*Low without `transport_request` then fails on an object in
 * a transportable package with "Parameter corrNr could not be found". The
 * Lock*Low tools now lock through `lockAdtResult` (same POST, same Accept),
 * return CORRNR, and remember it by lock handle; an Update*Low without
 * `transport_request` falls back to it. An explicit argument always wins.
 */

import type { IAbapConnection } from '@mcp-abap-adt/interfaces';
import {
  ACCEPT_LOCK_RESULT2,
  type AdtLockResult,
  lockAdtResult,
} from './adtObjectOps';

/** Lock handles are unique per lock; keep the map bounded anyway. */
const MAX_REMEMBERED = 500;
const corrNrByHandle = new Map<string, string>();

/**
 * Lock exactly as the dependency's lock() does — the session goes stateful
 * and stays so until unlock — but keep SAP's whole answer.
 */
export async function lockForLowTool(
  connection: IAbapConnection,
  objectUrl: string,
): Promise<AdtLockResult> {
  (
    connection as { setSessionType?: (t: 'stateful' | 'stateless') => void }
  ).setSessionType?.('stateful');
  const result = await lockAdtResult(connection, objectUrl, {
    accept: ACCEPT_LOCK_RESULT2,
  });
  if (result.corrNr) {
    corrNrByHandle.set(result.lockHandle, result.corrNr);
    if (corrNrByHandle.size > MAX_REMEMBERED) {
      const oldest = corrNrByHandle.keys().next().value;
      if (oldest !== undefined) corrNrByHandle.delete(oldest);
    }
  }
  return result;
}

/** The fields a Lock*Low result adds: SAP's CORRNR and who owns it. */
export function lockTransportFields(
  result: AdtLockResult,
): Record<string, string | null> {
  return {
    corr_nr: result.corrNr || null,
    ...(result.corrUser ? { corr_user: result.corrUser } : {}),
    ...(result.corrText ? { corr_text: result.corrText } : {}),
  };
}

/**
 * The transport an Update*Low sends: the caller's argument, else the CORRNR
 * SAP returned when this handle was taken by a Lock*Low tool of this process.
 */
export function resolveLowTransport(
  explicit: string | undefined,
  lockHandle: string | undefined,
): { transportRequest?: string; source?: 'argument' | 'lock' } {
  const arg = explicit?.trim();
  if (arg) return { transportRequest: arg, source: 'argument' };
  const fromLock = lockHandle ? corrNrByHandle.get(lockHandle) : undefined;
  return fromLock ? { transportRequest: fromLock, source: 'lock' } : {};
}

/** For tests only. */
export function resetLowLockTransports(): void {
  corrNrByHandle.clear();
}
