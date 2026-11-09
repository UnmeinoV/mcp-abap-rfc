/**
 * The two-transport create defect (round 3, R3-D1).
 *
 * Leg 1 of a create can land in a DIFFERENT request than the caller passed —
 * SAP resolves the object's transport assignment for the package, so a TASK
 * number gets the object locked in its PARENT request. Leg 2 then presents the
 * task and is refused. These tests pin the retry's gate: it must follow SAP only
 * on a genuine lock conflict, must never re-send the request that was just
 * refused, and must never turn a success into a failure.
 */

import {
  describeTransportRecovery,
  extractConflictingRequest,
  runUnderResolvedTransport,
} from '../../lib/transportConflict';

/** The live shape, as reported: exception type plus a localisable sentence. */
const LOCK_CONFLICT_BODY =
  '<?xml version="1.0" encoding="utf-8"?><exc:exception>' +
  '<type id="ExceptionResourceLockConflict"/>' +
  '<message lang="EN">Object R3TR DTEL ZMY_ELEMENT is already locked in request ' +
  'AAAK900001 of user SOME.USER</message></exc:exception>';

function lockConflict(body = LOCK_CONFLICT_BODY) {
  const error: any = new Error('Request failed with status code 403');
  error.response = { status: 403, data: body };
  return error;
}

describe('extractConflictingRequest', () => {
  it('returns the request SAP named, not the one that was passed', () => {
    expect(extractConflictingRequest(lockConflict(), 'AAAK900002')).toBe(
      'AAAK900001',
    );
  });

  it('never returns the request that was just refused', () => {
    // A body that quotes ONLY the requested request must not produce a retry:
    // re-sending the same value is a guaranteed second failure.
    const body = LOCK_CONFLICT_BODY.replace('AAAK900001', 'AAAK900002');
    expect(
      extractConflictingRequest(lockConflict(body), 'AAAK900002'),
    ).toBeUndefined();
  });

  it('is case-insensitive about the request the caller passed', () => {
    expect(extractConflictingRequest(lockConflict(), 'aaak900002')).toBe(
      'AAAK900001',
    );
  });

  it('ignores a failure that is not a lock conflict, even when it quotes a request', () => {
    const error: any = new Error('Request failed with status code 400');
    error.response = {
      status: 400,
      data:
        '<exc:exception><type id="ExceptionInvalidData"/>' +
        '<message lang="EN">Transport AAAK900001 is released</message></exc:exception>',
    };
    expect(extractConflictingRequest(error, 'AAAK900002')).toBeUndefined();
  });

  it('reads the message when there is no response body', () => {
    const error = new Error(
      'ExceptionResourceLockConflict: already locked in request AAAK900001',
    );
    expect(extractConflictingRequest(error, 'AAAK900002')).toBe('AAAK900001');
  });

  it('returns undefined for a non-error value', () => {
    expect(extractConflictingRequest(undefined, 'AAAK900002')).toBeUndefined();
    expect(extractConflictingRequest(null)).toBeUndefined();
  });
});

describe('runUnderResolvedTransport', () => {
  it('passes the caller request through when nothing conflicts', async () => {
    const op = jest.fn().mockResolvedValue('written');
    const outcome = await runUnderResolvedTransport(
      op,
      'AAAK900002',
      'Data element ZMY_ELEMENT',
    );
    expect(op).toHaveBeenCalledTimes(1);
    expect(op).toHaveBeenCalledWith('AAAK900002');
    expect(outcome).toMatchObject({
      result: 'written',
      transport_used: 'AAAK900002',
      reassigned: false,
    });
    expect(outcome.warning).toBeUndefined();
  });

  it('retries once under the request SAP named, and says so', async () => {
    const op = jest
      .fn()
      .mockRejectedValueOnce(lockConflict())
      .mockResolvedValueOnce('written');
    const outcome = await runUnderResolvedTransport(
      op,
      'AAAK900002',
      'Data element ZMY_ELEMENT',
    );
    expect(op.mock.calls).toEqual([['AAAK900002'], ['AAAK900001']]);
    expect(outcome.transport_used).toBe('AAAK900001');
    expect(outcome.reassigned).toBe(true);
    // The caller must be able to see BOTH numbers: reporting only the one they
    // passed while writing into another is the echo defect this fixes.
    expect(outcome.warning).toContain('AAAK900001');
    expect(outcome.warning).toContain('AAAK900002');
  });

  it('retries at most once — a second conflict propagates', async () => {
    const op = jest.fn().mockRejectedValue(lockConflict());
    await expect(
      runUnderResolvedTransport(op, 'AAAK900002', 'Data element ZMY_ELEMENT'),
    ).rejects.toThrow('403');
    expect(op).toHaveBeenCalledTimes(2);
  });

  it('does not retry a failure that is not a lock conflict', async () => {
    const other: any = new Error('Request failed with status code 400');
    other.response = { status: 400, data: 'ExceptionInvalidData' };
    const op = jest.fn().mockRejectedValue(other);
    await expect(
      runUnderResolvedTransport(op, 'AAAK900002', 'Data element ZMY_ELEMENT'),
    ).rejects.toThrow('400');
    expect(op).toHaveBeenCalledTimes(1);
  });
});

describe('describeTransportRecovery', () => {
  it('names the Update tool and the request, and does not say "delete"', () => {
    const advice = describeTransportRecovery('UpdateDataElement', 'AAAK900001');
    expect(advice).toContain('UpdateDataElement');
    expect(advice).toContain('AAAK900001');
    // The old advice ("delete it before retrying") is the expensive, wrong path:
    // a DTEL delete in a transportable package leaves a deletion marker to
    // transport, and the reporting project recovered all four objects with an
    // update instead.
    expect(advice).toMatch(/deleting it is not necessary/i);
  });
});
