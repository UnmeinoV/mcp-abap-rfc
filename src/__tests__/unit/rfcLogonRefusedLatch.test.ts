/**
 * Issue #1: after SAP REFUSES an RFC logon, the process must not log on again.
 *
 * SAP locks a user after `login/fails_to_user_lock` failed logons, and over
 * RFC every request after a lost session called connect() again — one failed
 * logon per tool call. The latch is process-wide, keyed by logon identity,
 * because on stdio a connection whose logon failed is evicted and REBUILT.
 *
 * The REAL dependency connection is opened against a mocked SDK, so the test
 * counts actual SDK logon attempts, not calls into our own wrapper.
 */

let openBehaviour: () => Promise<void> = async () => {};
const opens = jest.fn();

jest.mock(
  '@mcp-abap-adt/sap-rfc-lite',
  () => ({
    Client: class {
      alive = false;
      async open() {
        opens();
        await openBehaviour();
        this.alive = true;
        return this;
      }
      async close() {
        this.alive = false;
      }
      call() {
        return Promise.resolve({
          RESPONSE: { STATUS_LINE: { STATUS_CODE: 200 }, MESSAGE_BODY: 'ok' },
        });
      }
    },
  }),
  { virtual: true },
);

import {
  createAbapConnection,
  isRfcLogonFailure,
  resetRefusedRfcLogons,
} from '../../lib/connectionFactory';

const LOGON_REFUSED = {
  name: 'RfcLibError',
  group: 3,
  code: 2,
  codeString: 'RFC_LOGON_FAILURE',
  key: 'RFC_LOGON_FAILURE',
  message: 'Name or password is incorrect (repeat logon)',
};
const UNREACHABLE = {
  name: 'RfcLibError',
  group: 4,
  code: 1,
  codeString: 'RFC_COMMUNICATION_FAILURE',
  key: 'RFC_COMMUNICATION_FAILURE',
  message: 'partner not reached',
};

const config = (user = 'SOME.USER') => ({
  url: 'http://172.16.0.1:8000',
  authType: 'basic' as const,
  username: user,
  password: 'wrong',
  client: '100',
  connectionType: 'rfc' as const,
});

const read = (c: any) =>
  c.makeAdtRequest({ url: '/sap/bc/adt/discovery', method: 'GET' });

async function failure(p: Promise<unknown>): Promise<string> {
  try {
    await p;
  } catch (e) {
    return (e as Error).message;
  }
  throw new Error('expected a failure');
}

describe('RFC logon refused: no second logon in this process (#1)', () => {
  beforeEach(() => {
    resetRefusedRfcLogons();
    opens.mockClear();
  });

  it('5 reads (2 concurrent, across a rebuilt connection) cost ONE logon', async () => {
    openBehaviour = () => Promise.reject(LOGON_REFUSED);
    const first = createAbapConnection(config());
    const messages = [
      ...(await Promise.all([failure(read(first)), failure(read(first))])),
      await failure(read(first)),
    ];
    // stdio evicts the failed connection and builds a new one.
    const rebuilt = createAbapConnection(config());
    messages.push(await failure(read(rebuilt)));
    messages.push(await failure((rebuilt as any).connect()));

    expect(opens).toHaveBeenCalledTimes(1);
    for (const m of messages) {
      expect(m).toContain('Failed to open RFC connection:');
      expect(m).toContain('"codeString":"RFC_LOGON_FAILURE"');
    }
    expect(messages[4]).toContain('REFUSED this logon earlier in this process');
  });

  it('a refused logon does not block a DIFFERENT user', async () => {
    openBehaviour = () => Promise.reject(LOGON_REFUSED);
    await failure(read(createAbapConnection(config('SOME.USER'))));
    openBehaviour = async () => {};
    await read(createAbapConnection(config('OTHER.USER')));
    expect(opens).toHaveBeenCalledTimes(2);
  });

  it('an unreachable server is retried on the next request', async () => {
    openBehaviour = () => Promise.reject(UNREACHABLE);
    const c = createAbapConnection(config());
    await failure(read(c));
    openBehaviour = async () => {};
    await read(c);
    expect(opens).toHaveBeenCalledTimes(2);
  });

  it('a good logon still reopens after a session reset', async () => {
    openBehaviour = async () => {};
    const c: any = createAbapConnection(config());
    await read(c);
    await c.invalidateSession();
    await read(c);
    expect(opens).toHaveBeenCalledTimes(2);
  });

  it('recognises both the SDK object and the dependency-wrapped message', () => {
    expect(isRfcLogonFailure(LOGON_REFUSED)).toBe(true);
    expect(
      isRfcLogonFailure(
        new Error(
          `Failed to open RFC connection: ${JSON.stringify(LOGON_REFUSED)}`,
        ),
      ),
    ).toBe(true);
    expect(isRfcLogonFailure(UNREACHABLE)).toBe(false);
    expect(
      isRfcLogonFailure(
        new Error(
          `Failed to open RFC connection: ${JSON.stringify(UNREACHABLE)}`,
        ),
      ),
    ).toBe(false);
  });
});
