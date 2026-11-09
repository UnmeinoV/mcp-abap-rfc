/**
 * Unlock* handlers must not refuse an unlock just because no session_id was
 * supplied.
 *
 * They used to require it, yet the unlock itself only needs the object name and
 * the lock handle — session_id was used solely by the validation gate, a log
 * line, the echoed response, and `restoreSessionInConnection`, which is already
 * guarded by `if (session_state)`.
 *
 * The consequence was a LEAKED SAP EDIT LOCK: an integration test passing
 * `session_id: ''` got "name, lock_handle, and session_id are required",
 * warned, and moved on — and a later, unrelated run then failed with
 * "User SOME.USER is currently editing ZMCP_SHR_I_BDFL". Same "silent failure
 * now, confusing failure later" family as the rest of this round, so it is
 * pinned here.
 */

const unlockSpy = jest.fn();

jest.mock('../../lib/clients', () => ({
  createAdtClient: () => ({
    getBehaviorDefinition: () => ({
      unlock: (...args: any[]) => {
        unlockSpy(...args);
        return Promise.resolve({ unlockResult: { status: 200 } });
      },
    }),
  }),
}));

import { handleUnlockBehaviorDefinition } from '../../handlers/behavior_definition/low/handleUnlockBehaviorDefinition';

const ctx = () => ({ connection: {} as any, logger: undefined });

/** Read the JSON payload out of a handler response. */
function payload(res: any): any {
  return JSON.parse(res.content[0].text);
}

describe('Unlock without session_id', () => {
  beforeEach(() => unlockSpy.mockClear());

  it('unlocks when session_id is omitted entirely', async () => {
    const res: any = await handleUnlockBehaviorDefinition(
      ctx() as any,
      {
        name: 'ZMCP_SHR_I_BDFL',
        lock_handle: 'LH123',
      } as any,
    );
    expect(res.isError).toBeFalsy();
    expect(payload(res).success).toBe(true);
    // The unlock really was issued, with just name + lock handle.
    expect(unlockSpy).toHaveBeenCalledWith(
      { name: 'ZMCP_SHR_I_BDFL' },
      'LH123',
    );
  });

  it('unlocks when session_id is an empty string (the reported case)', async () => {
    const res: any = await handleUnlockBehaviorDefinition(
      ctx() as any,
      {
        name: 'ZMCP_SHR_I_BDFL',
        lock_handle: 'LH123',
        session_id: '',
      } as any,
    );
    expect(res.isError).toBeFalsy();
    expect(unlockSpy).toHaveBeenCalledTimes(1);
  });

  it('still requires the object name and the lock handle', async () => {
    const noName: any = await handleUnlockBehaviorDefinition(
      ctx() as any,
      {
        lock_handle: 'LH123',
      } as any,
    );
    expect(noName.isError).toBe(true);
    expect(noName.content[0].text).toMatch(/name and lock_handle are required/);

    const noHandle: any = await handleUnlockBehaviorDefinition(
      ctx() as any,
      {
        name: 'ZMCP_X',
      } as any,
    );
    expect(noHandle.isError).toBe(true);
    expect(unlockSpy).not.toHaveBeenCalled();
  });

  it('requires session_id ONLY when session_state is supplied', async () => {
    const res: any = await handleUnlockBehaviorDefinition(
      ctx() as any,
      {
        name: 'ZMCP_X',
        lock_handle: 'LH123',
        session_state: { cookies: 'x' },
      } as any,
    );
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toMatch(
      /session_id is required when session_state is provided/,
    );
    expect(unlockSpy).not.toHaveBeenCalled();
  });
});
