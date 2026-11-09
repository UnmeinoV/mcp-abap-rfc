/**
 * The system-context failure (masterSystem/responsible not resolved) is
 * written to stderr UNCONDITIONALLY: the server logger is silent unless
 * DEBUG_AUTH_LOG, and without the warning every Create* fails later with
 * PAK/049, far from the cause.
 */
jest.mock('../../lib/connectionFactory', () => ({
  ...jest.requireActual('../../lib/connectionFactory'),
  createAbapConnection: jest.fn(() => ({ close: jest.fn(async () => {}) })),
}));
jest.mock('../../lib/systemContext', () => ({
  ...jest.requireActual('../../lib/systemContext'),
  resolveSystemContext: jest.fn(async () => {
    throw new Error('logon refused');
  }),
}));

import { CompositeHandlersRegistry } from '../../lib/handlers/registry/CompositeHandlersRegistry';
import { parseRfcEnv } from '../../lib/rfcEnv';
import { StdioServer } from '../../server/StdioServer';

const silent = { info() {}, warn() {}, error() {}, debug() {} };

class ProbeServer extends StdioServer {
  connectFrom(settings: ReturnType<typeof parseRfcEnv>) {
    return this.setConnectionContext(settings);
  }
}

describe('system context failure', () => {
  const KEYS = [
    'SAP_ASHOST',
    'SAP_SYSNR',
    'SAP_CLIENT',
    'SAP_USERNAME',
    'SAP_SYSTEM_TYPE',
    'SAP_LANGUAGE',
    'SAP_SAPROUTER',
    'SAP_RFC_COMPRESSION',
    'SAP_MASTER_SYSTEM',
    'SAP_RESPONSIBLE',
    'SAP_CONNECTION_TYPE',
    'SAP_URL',
  ];
  const saved: Record<string, string | undefined> = {};
  beforeEach(() => {
    for (const k of KEYS) saved[k] = process.env[k];
  });
  afterEach(() => {
    for (const k of KEYS) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
    jest.restoreAllMocks();
  });

  it('is written to stderr even with a silent logger, naming PAK/049', async () => {
    const writes: string[] = [];
    jest.spyOn(process.stderr, 'write').mockImplementation((chunk) => {
      writes.push(String(chunk));
      return true;
    });
    const settings = parseRfcEnv(
      {
        SAP_ASHOST: '10.0.0.1',
        SAP_SYSNR: '00',
        SAP_CLIENT: '100',
        SAP_USERNAME: 'U',
        SAP_PASSWORD: 'secretpw',
      },
      'f.env',
    );
    const server = new ProbeServer(
      new CompositeHandlersRegistry([]),
      settings,
      { logger: silent },
    );
    await server.connectFrom(settings);
    const text = writes.join('');
    expect(text).toMatch(/could not resolve the system context/);
    expect(text).toMatch(/PAK\/049/);
    expect(text).toMatch(/logon refused/);
    expect(text).not.toContain('secretpw');
  });
});
