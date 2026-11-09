/**
 * The classrun stale-shell verdict and its one-shot session refresh.
 *
 * The behaviour these pin was measured live (see lib/classrunSession.ts for the
 * three-arm comparison); what this file guards is that the handler layer cannot
 * regress into the two shapes that made the defect expensive: silently
 * re-sending a POST that really did execute, and reporting SAP's refusal as if
 * it were the class's own output.
 */

import {
  isStaleClassrunVerdict,
  runClassrunWithSessionRefresh,
  staleClassrunError,
  staleProfiledClassrunError,
} from '../../lib/classrunSession';

const STALE = 'Error: Class does not implement if_oo_adt_classrun~main method!';
const REAL_OUTPUT = 'ping ok SOME.USR 20260924 093329';

describe('isStaleClassrunVerdict', () => {
  it('recognises SAP own wording', () => {
    expect(isStaleClassrunVerdict(STALE)).toBe(true);
  });

  it('does not fire on real class output', () => {
    expect(isStaleClassrunVerdict(REAL_OUTPUT)).toBe(false);
  });

  it('does not fire on a non-string payload', () => {
    expect(isStaleClassrunVerdict(undefined)).toBe(false);
    expect(isStaleClassrunVerdict({ data: STALE })).toBe(false);
  });
});

describe('runClassrunWithSessionRefresh', () => {
  it('does not touch the session when the first run succeeds', async () => {
    const invalidateSession = jest.fn();
    const run = jest.fn().mockResolvedValue({ data: REAL_OUTPUT });

    const outcome = await runClassrunWithSessionRefresh(
      { invalidateSession },
      run,
    );

    expect(run).toHaveBeenCalledTimes(1);
    expect(invalidateSession).not.toHaveBeenCalled();
    expect(outcome.session_refreshed).toBe(false);
    expect(outcome.still_stale).toBe(false);
    expect(outcome.response.data).toBe(REAL_OUTPUT);
  });

  it('terminates the session and re-drives EXACTLY once on the stale verdict', async () => {
    const invalidateSession = jest.fn().mockResolvedValue(undefined);
    const run = jest
      .fn()
      .mockResolvedValueOnce({ data: STALE })
      .mockResolvedValueOnce({ data: REAL_OUTPUT });

    const outcome = await runClassrunWithSessionRefresh(
      { invalidateSession },
      run,
    );

    expect(invalidateSession).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledTimes(2);
    expect(outcome.session_refreshed).toBe(true);
    expect(outcome.still_stale).toBe(false);
    expect(outcome.response.data).toBe(REAL_OUTPUT);
  });

  it('re-drives at most once — a persistently stale class is not hammered', async () => {
    const invalidateSession = jest.fn().mockResolvedValue(undefined);
    const run = jest.fn().mockResolvedValue({ data: STALE });

    const outcome = await runClassrunWithSessionRefresh(
      { invalidateSession },
      run,
    );

    expect(run).toHaveBeenCalledTimes(2);
    expect(outcome.still_stale).toBe(true);
  });

  it('reports still_stale rather than retrying when the connection cannot invalidate', async () => {
    const run = jest.fn().mockResolvedValue({ data: STALE });

    const outcome = await runClassrunWithSessionRefresh({}, run);

    expect(run).toHaveBeenCalledTimes(1);
    expect(outcome.session_refreshed).toBe(false);
    expect(outcome.still_stale).toBe(true);
  });

  it('does not re-drive when invalidating the session itself failed', async () => {
    const invalidateSession = jest
      .fn()
      .mockRejectedValue(new Error('no session to drop'));
    const run = jest.fn().mockResolvedValue({ data: STALE });
    const warn = jest.fn();

    const outcome = await runClassrunWithSessionRefresh(
      { invalidateSession },
      run,
      { warn } as any,
    );

    // The re-drive is only safe BECAUSE the session was actually terminated;
    // without that, re-sending would just repeat the same stale answer.
    expect(run).toHaveBeenCalledTimes(1);
    expect(outcome.still_stale).toBe(true);
    expect(warn).toHaveBeenCalled();
  });
});

describe('the refusal messages separate the two cases a caller must act on differently', () => {
  it('says the session was already refreshed, so the verdict is about the class', () => {
    const message = staleClassrunError('ZMY_CLASS', true).message;
    expect(message).toContain('ZMY_CLASS');
    expect(message).toContain('re-driven once');
    expect(message).toContain('ACTIVE version');
  });

  it('does not claim a refresh that never happened', () => {
    const message = staleClassrunError('ZMY_CLASS', false).message;
    expect(message).toContain('ZMY_CLASS');
    expect(message).not.toContain('re-driven once');
    expect(message).not.toContain('already terminated');
    expect(message).toContain('could not be terminated');
  });

  it('names the one-call remedy on the profiled path, which is not auto-retried', () => {
    const message = staleProfiledClassrunError('ZMY_CLASS').message;
    expect(message).toContain('RuntimeRunClass');
    expect(message).toContain('profile=true');
  });
});
