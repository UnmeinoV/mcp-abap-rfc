/**
 * The CreateTransport post-create "locked" quirk recovery, and the owner gate.
 *
 * CreateTransport's post-create finalize/read can race a transient CTS enqueue
 * on the freshly-allocated request number, throwing "Internal error: Request
 * <NUMBER> is locked; action canceled" even though the request WAS created.
 * handleCreateTransport recovers by extracting the number and confirming via a
 * GET; if it exists, the create is reported as success. This branch is
 * nondeterministic to trigger live, so it is covered here with mocks.
 *
 * Since F-12 the create is a direct POST from lib/transportCreate rather than a
 * dependency call, so both the POST and the confirming GET arrive through
 * makeAdtRequestWithTimeout and are told apart by method.
 */

const mockMakeAdt = jest.fn();
jest.mock('../../lib/utils', () => ({
  ...jest.requireActual('../../lib/utils'),
  makeAdtRequestWithTimeout: (...args: any[]) => mockMakeAdt(...args),
}));

import { handleCreateTransport } from '../../handlers/transport/high/handleCreateTransport';

const lockedError = (num: string) => {
  const err: any = new Error(
    `Internal error: Request ${num} is locked; action canceled`,
  );
  err.response = {
    status: 500,
    data: `<?xml version="1.0"?><exc:exception><message lang="EN">Internal error: Request ${num} is locked; action canceled</message></exc:exception>`,
  };
  return err;
};

const ctx = () => ({ connection: {} as any, logger: undefined }) as any;
const args = (extra: Record<string, unknown> = {}) =>
  ({
    description: 'test',
    transport_type: 'workbench',
    owner: 'SOME.USER',
    ...extra,
  }) as any;

/** POST = the create, GET = the existence confirmation. */
const route = (onPost: () => any, onGet: () => any) =>
  mockMakeAdt.mockImplementation((_conn: any, _url: string, method: string) =>
    method === 'POST' ? onPost() : onGet(),
  );

describe('handleCreateTransport — post-create "locked" quirk recovery', () => {
  beforeEach(() => mockMakeAdt.mockReset());

  it('recovers to success when the "locked" request actually exists', async () => {
    route(
      () => Promise.reject(lockedError('ABCK900099')),
      () => Promise.resolve({ status: 200, data: '<ok/>' }),
    );

    const res: any = await handleCreateTransport(ctx(), args());

    expect(res.isError).toBe(false);
    const payload = JSON.parse(res.content[0].text);
    expect(payload.success).toBe(true);
    expect(payload.transport_request).toBe('ABCK900099');
    expect(String(payload.warning)).toMatch(/locked/i);
    const getCall = mockMakeAdt.mock.calls.find((c) => c[2] === 'GET');
    expect(getCall?.[1]).toContain('ABCK900099');
  });

  it('surfaces the original error when the "locked" request does NOT exist', async () => {
    route(
      () => Promise.reject(lockedError('ABCK900098')),
      () => Promise.reject(new Error('404 not found')),
    );

    await expect(handleCreateTransport(ctx(), args())).rejects.toThrow(
      /Failed to create transport/i,
    );
  });
});

describe('handleCreateTransport — what reaches CTS', () => {
  beforeEach(() => mockMakeAdt.mockReset());

  const created = (target: string) => ({
    status: 200,
    statusText: 'OK',
    data: `<?xml version="1.0"?><tm:root xmlns:tm="http://www.sap.com/cts/adt/tm"><tm:request tm:number="ABCK900011" tm:desc="test" tm:type="K" tm:target="${target}"><tm:task tm:owner="SOME.USER"/></tm:request></tm:root>`,
  });

  it('sends the target unwrapped — the F-12 regression', async () => {
    route(
      () => Promise.resolve(created('VVV')),
      () => Promise.resolve({ status: 200 }),
    );

    const res: any = await handleCreateTransport(
      ctx(),
      args({ target_system: 'VVV' }),
    );

    const body = mockMakeAdt.mock.calls.find((c) => c[2] === 'POST')?.[4];
    expect(body).toContain('tm:target="VVV"');
    expect(body).not.toContain('/VVV/');

    const payload = JSON.parse(res.content[0].text);
    expect(payload.target_system).toBe('VVV');
    expect(payload.target_system_requested).toBe('VVV');
    expect(payload.warning).toBeUndefined();
  });

  it('warns when CTS recorded a different target than the one requested', async () => {
    route(
      () => Promise.resolve(created('LOCAL')),
      () => Promise.resolve({ status: 200 }),
    );

    const res: any = await handleCreateTransport(
      ctx(),
      args({ target_system: 'VVV' }),
    );
    const payload = JSON.parse(res.content[0].text);
    // Reporting the requested target here is the echo defect: a LOCAL request
    // would pass for a VVV one until the first write against the package.
    expect(payload.target_system).toBe('LOCAL');
    expect(payload.target_system_requested).toBe('VVV');
    expect(String(payload.warning)).toContain('LOCAL');
  });

  it('refuses with a caller-actionable error when no owner can be resolved', async () => {
    const saved = [process.env.SAP_RESPONSIBLE, process.env.SAP_USERNAME];
    process.env.SAP_RESPONSIBLE = '';
    process.env.SAP_USERNAME = '';
    try {
      const { resetSystemContextCache } = require('../../lib/systemContext');
      resetSystemContextCache?.();
      await expect(
        handleCreateTransport(ctx(), {
          description: 'test',
          transport_type: 'workbench',
        } as any),
      ).rejects.toThrow(/owner/i);
      // It must NOT be relabelled as a create failure.
      await expect(
        handleCreateTransport(ctx(), {
          description: 'test',
        } as any),
      ).rejects.not.toThrow(/Failed to create transport/i);
    } finally {
      process.env.SAP_RESPONSIBLE = saved[0] ?? '';
      process.env.SAP_USERNAME = saved[1] ?? '';
    }
  });
});
