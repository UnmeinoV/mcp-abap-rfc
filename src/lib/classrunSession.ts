/**
 * `classrun` answers a STALE verdict for a class the same session just created.
 *
 * MEASURED ON DM2/310, and the measurement corrects the diagnosis it came from.
 * A field report located the fault in "the reused connection and its bound SAP
 * session" because a fresh curl and a fresh in-process connection both
 * succeeded at the same second. The locus is right; the mechanism is narrower,
 * and the difference decides the fix:
 *
 *   * It is NOT session age or expiry. A control arm ran four identical plain
 *     POSTs on the polluted connection — all four stale — and a 20-second
 *     wall-clock pause before the first call changed nothing. It never
 *     self-heals.
 *   * It is NOT the whole session. On the SAME connection at the same moment, a
 *     long-active untouched class ran perfectly while the freshly-created one
 *     did not. The staleness is per CLASS RESOLUTION, not per connection.
 *   * It is the session's own view of a class it met as a SHELL. `CreateClass`
 *     posts a bare class WITHOUT the `if_oo_adt_classrun` interface; the
 *     following `UpdateClass` adds the interface and activates. The session
 *     that performed the create has already resolved that name as a shell with
 *     no runnable `main`, and keeps that resolution — so SAP's
 *     "does not implement" is literally true of the version this session can
 *     still see, and false of the active version everyone else sees.
 *
 * Cures, measured side by side on three freshly-created classes:
 *
 *   | intervention                          | result                                  |
 *   |---------------------------------------|-----------------------------------------|
 *   | none (control)                        | stale on all 4 attempts                 |
 *   | explicit `x-sap-adt-sessiontype: stateless` | that request still stale, the NEXT one OK |
 *   | `connection.invalidateSession()`      | the very next request OK                |
 *
 * So the session must actually be TERMINATED, not merely asked to be
 * stateless — the same lesson `withExplicitStatelessHeader` records for the
 * nodestructure description bleed. `invalidateSession()` is used here because
 * it costs ONE extra round trip rather than two.
 *
 * WHY RE-DRIVING A POST IS SAFE HERE, stated precisely, because the session
 * retry in `lib/clients.ts` is GET-only on purpose and this is a deliberate
 * exception to it. The argument is NOT "classrun is idempotent" — a class body
 * is arbitrary ABAP and may well write to the database. The argument is that
 * this exact body is SAP's proof that the class DID NOT RUN: no `main` was
 * dispatched, so nothing executed and there is nothing to double. A re-drive
 * is therefore not a second execution, it is the first one.
 */

import type { ILogger } from '@mcp-abap-adt/interfaces';

/** SAP's wording when the session cannot see a runnable `main` on the class. */
export const STALE_CLASSRUN_MARKER = 'does not implement if_oo_adt_classrun';

export function isStaleClassrunVerdict(body: unknown): boolean {
  return typeof body === 'string' && body.includes(STALE_CLASSRUN_MARKER);
}

interface SessionInvalidatingConnection {
  invalidateSession?: () => unknown | Promise<unknown>;
}

export interface ClassrunOutcome<T> {
  response: T;
  /** The session was terminated and the run re-driven. */
  session_refreshed: boolean;
  /** Still the stale wording AFTER a refresh — treat as SAP's genuine verdict. */
  still_stale: boolean;
}

/**
 * Run a classrun call, and if SAP answers with the stale-shell verdict,
 * terminate the session and re-drive the call exactly once.
 */
export async function runClassrunWithSessionRefresh<
  T extends { data?: unknown },
>(
  connection: unknown,
  run: () => Promise<T>,
  logger?: ILogger,
): Promise<ClassrunOutcome<T>> {
  const first = await run();
  if (!isStaleClassrunVerdict(first.data)) {
    return { response: first, session_refreshed: false, still_stale: false };
  }

  const invalidate = (connection as SessionInvalidatingConnection)
    ?.invalidateSession;
  if (typeof invalidate !== 'function') {
    return { response: first, session_refreshed: false, still_stale: true };
  }

  logger?.debug?.(
    'classrun returned the stale-shell verdict; terminating the SAP session and re-driving once',
  );
  try {
    await invalidate.call(connection);
  } catch (error) {
    logger?.warn?.(
      `Failed to invalidate the SAP session before re-driving classrun: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return { response: first, session_refreshed: false, still_stale: true };
  }

  const second = await run();
  return {
    response: second,
    session_refreshed: true,
    still_stale: isStaleClassrunVerdict(second.data),
  };
}

/**
 * The message for a run that stayed stale through a session refresh.
 *
 * Reported as an ERROR rather than as `success: true` with SAP's sentence in
 * the `output` field: those two cases need different actions from the caller
 * (fix the class vs. retry), and an output string that reads like program
 * output is exactly this project's named defect — a value that looks identical
 * whether it means success or vacuum.
 */
export function staleClassrunError(
  className: string,
  sessionRefreshed: boolean,
): Error {
  if (!sessionRefreshed) {
    // The connection offered no way to end its SAP session, so the stale
    // reading was never ruled out. Saying "already terminated" here would be
    // the sentence outrunning what happened.
    return new Error(
      `Class ${className} did not run: SAP reports it does not implement ` +
        'if_oo_adt_classrun~main, and the SAP session could not be terminated to ' +
        'rule out a stale reading of a class this session created. Restart the ' +
        'MCP server (a fresh session) and run it again; if it still fails, check ' +
        'that the class implements if_oo_adt_classrun~main and is activated.',
    );
  }
  return new Error(
    `Class ${className} did not run: SAP reports it does not implement ` +
      'if_oo_adt_classrun~main. The SAP session was already terminated and the ' +
      "run re-driven once, so this is SAP's verdict on the ACTIVE version, not a " +
      'stale session. Check that the class implements if_oo_adt_classrun~main and ' +
      'is activated.',
  );
}

/**
 * The same verdict on the PROFILED path, which is not re-driven automatically.
 *
 * Re-driving `runWithProfiling` would create a second set of trace parameters
 * and another trace file on the system; this round did not measure what that
 * costs, so the caller is told the one-call remedy instead of having it
 * guessed on their behalf.
 */
export function staleProfiledClassrunError(className: string): Error {
  return new Error(
    `Class ${className} did not run under the profiler: SAP reports it does not ` +
      'implement if_oo_adt_classrun~main. If this class was created or activated ' +
      'through this same server session, that verdict is stale — the session still ' +
      'sees the pre-activation shell. Call RuntimeRunClass WITHOUT profile=true ' +
      'once (it terminates the session and re-drives), then retry the profiled run. ' +
      'Otherwise check that the class implements if_oo_adt_classrun~main and is activated.',
  );
}
