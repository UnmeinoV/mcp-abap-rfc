/**
 * Keys read from process.env (guardrails, audit log, timeouts, result size,
 * RFC trace dir) are BRIDGED from the env file: without it a key written in
 * the file was accepted and silently ignored — for SAP_DENY_TOOLS a guardrail
 * that looks configured and is not. Precedence is the RFC keys' rule: a key
 * the file defines wins over the shell, even when empty.
 */
jest.mock('../../lib/connectionFactory', () => ({
  ...jest.requireActual('../../lib/connectionFactory'),
  createAbapConnection: jest.fn(() => ({ connect: jest.fn(async () => {}) })),
}));

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { defaultRfcTraceDir } from '../../lib/connectionFactory';
import { BaseHandlerGroup } from '../../lib/handlers/base/BaseHandlerGroup';
import type { HandlerEntry } from '../../lib/handlers/interfaces';
import { CompositeHandlersRegistry } from '../../lib/handlers/registry/CompositeHandlersRegistry';
import {
  applyEnvFileBridge,
  BRIDGED_ENV_KEYS,
  bridgeEnvFileKeys,
  isBridgedEnvKey,
} from '../../lib/rfcEnv';
import { BaseMcpServer } from '../../server/BaseMcpServer';
import type { ConnectionContext } from '../../server/ConnectionContext';

function tmpEnvFile(content: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'envbridge-'));
  const f = path.join(dir, 'x.env');
  fs.writeFileSync(f, content);
  return f;
}

describe('bridgeEnvFileKeys', () => {
  it('bridges exactly the documented keys and every SAP_TIMEOUT_* key', () => {
    expect([...BRIDGED_ENV_KEYS].sort()).toEqual([
      'MCP_MAX_RESULT_CHARS',
      'RFC_TRACE_DIR',
      'SAP_ALLOWED_PACKAGES',
      'SAP_AUDIT_LOG_FILE',
      'SAP_DENY_TOOLS',
    ]);
    for (const key of [
      'SAP_TIMEOUT_DEFAULT',
      'SAP_TIMEOUT_CSRF',
      'SAP_TIMEOUT_LONG',
    ]) {
      expect(isBridgedEnvKey(key)).toBe(true);
    }
    // RFC keys are NOT bridged here (rfcEnv publishes those itself), nor the password.
    for (const key of ['SAP_PASSWORD', 'SAP_ASHOST', 'SAP_CLIENT', 'OTHER']) {
      expect(isBridgedEnvKey(key)).toBe(false);
    }
  });

  it('copies the file values into the env', () => {
    const env: NodeJS.ProcessEnv = {};
    const bridged = bridgeEnvFileKeys(
      {
        SAP_DENY_TOOLS: 'Delete*',
        SAP_ALLOWED_PACKAGES: 'Z*,$TMP',
        SAP_AUDIT_LOG_FILE: '/var/log/a.jsonl',
        SAP_TIMEOUT_DEFAULT: '90000',
        SAP_TIMEOUT_LONG: '120000',
        MCP_MAX_RESULT_CHARS: '200000',
        RFC_TRACE_DIR: '/var/trc',
        SAP_PASSWORD: 'secret',
      },
      'f.env',
      env,
    );
    expect(env).toEqual({
      SAP_DENY_TOOLS: 'Delete*',
      SAP_ALLOWED_PACKAGES: 'Z*,$TMP',
      SAP_AUDIT_LOG_FILE: '/var/log/a.jsonl',
      SAP_TIMEOUT_DEFAULT: '90000',
      SAP_TIMEOUT_LONG: '120000',
      MCP_MAX_RESULT_CHARS: '200000',
      RFC_TRACE_DIR: '/var/trc',
    });
    expect(bridged).not.toContain('SAP_PASSWORD');
    expect(env.SAP_PASSWORD).toBeUndefined();
  });

  it('the file wins over the shell', () => {
    const env: NodeJS.ProcessEnv = {
      SAP_DENY_TOOLS: 'ShellTool',
      SAP_TIMEOUT_DEFAULT: '1000',
    };
    bridgeEnvFileKeys(
      { SAP_DENY_TOOLS: 'FileTool', SAP_TIMEOUT_DEFAULT: '90000' },
      'f.env',
      env,
    );
    expect(env.SAP_DENY_TOOLS).toBe('FileTool');
    expect(env.SAP_TIMEOUT_DEFAULT).toBe('90000');
  });

  it('an EMPTY key in the file wins over the shell', () => {
    const env: NodeJS.ProcessEnv = {
      SAP_DENY_TOOLS: 'ShellTool',
      SAP_ALLOWED_PACKAGES: 'Z*',
    };
    bridgeEnvFileKeys({ SAP_DENY_TOOLS: '' }, 'f.env', env);
    expect(env.SAP_DENY_TOOLS).toBe('');
    // A key the file does not mention keeps its shell value.
    expect(env.SAP_ALLOWED_PACKAGES).toBe('Z*');
  });

  it('a bad MCP_MAX_RESULT_CHARS in the file is refused, naming the key and the file', () => {
    for (const bad of ['0', 'abc', '500001', '1.5']) {
      const env: NodeJS.ProcessEnv = {};
      expect(() =>
        bridgeEnvFileKeys({ MCP_MAX_RESULT_CHARS: bad }, '/x/router.env', env),
      ).toThrow(/MCP_MAX_RESULT_CHARS=.* \(in \/x\/router\.env\)/);
      expect(env.MCP_MAX_RESULT_CHARS).toBeUndefined();
    }
  });

  it('a key set on the command line wins over the file', () => {
    const env: NodeJS.ProcessEnv = { MCP_MAX_RESULT_CHARS: '300000' };
    bridgeEnvFileKeys({ MCP_MAX_RESULT_CHARS: '200000' }, 'f.env', env, [
      'MCP_MAX_RESULT_CHARS',
    ]);
    expect(env.MCP_MAX_RESULT_CHARS).toBe('300000');
  });
});

describe('applyEnvFileBridge', () => {
  it('reads the file and bridges it', () => {
    const envFile = tmpEnvFile(
      'SAP_ASHOST=10.0.0.1\nSAP_DENY_TOOLS=DeleteClass\nSAP_TIMEOUT_CSRF=20000\n',
    );
    const env: NodeJS.ProcessEnv = { SAP_DENY_TOOLS: 'Other' };
    expect(applyEnvFileBridge({ envFile, env }).sort()).toEqual([
      'SAP_DENY_TOOLS',
      'SAP_TIMEOUT_CSRF',
    ]);
    expect(env).toEqual({
      SAP_DENY_TOOLS: 'DeleteClass',
      SAP_TIMEOUT_CSRF: '20000',
    });
  });

  it('without a file it changes nothing, and still validates a shell MCP_MAX_RESULT_CHARS', () => {
    const env: NodeJS.ProcessEnv = { SAP_DENY_TOOLS: 'X' };
    expect(applyEnvFileBridge({ env })).toEqual([]);
    expect(env).toEqual({ SAP_DENY_TOOLS: 'X' });
    expect(() =>
      applyEnvFileBridge({ env: { MCP_MAX_RESULT_CHARS: 'abc' } }),
    ).toThrow(/MCP_MAX_RESULT_CHARS/);
  });

  it('a good value in the file overrides a bad one in the shell', () => {
    const envFile = tmpEnvFile('MCP_MAX_RESULT_CHARS=200000\n');
    const env: NodeJS.ProcessEnv = { MCP_MAX_RESULT_CHARS: 'abc' };
    applyEnvFileBridge({ envFile, env });
    expect(env.MCP_MAX_RESULT_CHARS).toBe('200000');
  });

  it('RFC_TRACE_DIR from the file is the one the trace-dir default keeps', () => {
    const envFile = tmpEnvFile('RFC_TRACE_DIR=/var/my-rfc-traces\n');
    const env: NodeJS.ProcessEnv = { RFC_TRACE_DIR: '/shell/dir' };
    applyEnvFileBridge({ envFile, env });
    defaultRfcTraceDir(env);
    expect(env.RFC_TRACE_DIR).toBe('/var/my-rfc-traces');
  });

  it('an empty RFC_TRACE_DIR in the file drops the shell value, so the temp-dir default applies', () => {
    const envFile = tmpEnvFile('RFC_TRACE_DIR=\n');
    const env: NodeJS.ProcessEnv = { RFC_TRACE_DIR: '/shell/dir' };
    applyEnvFileBridge({ envFile, env });
    defaultRfcTraceDir(env);
    expect(env.RFC_TRACE_DIR).toBe(
      path.join(os.tmpdir(), 'mcp-abap-rfc-rfc-trace'),
    );
  });
});

// --- Through the real write guard: BaseMcpServer.registerHandlers ---------

class ProbeGroup extends BaseHandlerGroup {
  protected groupName = 'Probe';
  called: string[] = [];
  getHandlers(): HandlerEntry[] {
    const probe = (name: string) => ({
      toolDefinition: {
        name,
        description: 'probe',
        inputSchema: { type: 'object', properties: {} },
      },
      handler: async () => {
        this.called.push(name);
        return { isError: false, content: [{ type: 'text', text: 'ran' }] };
      },
    });
    return [probe('DeleteClass'), probe('GetClass')] as HandlerEntry[];
  }
}

class TestServer extends BaseMcpServer {
  constructor() {
    super({ name: 'test' });
  }
  use(context: ConnectionContext) {
    this.connectionContext = context;
  }
  register(registry: CompositeHandlersRegistry) {
    this.registerHandlers(registry);
  }
}

const context: ConnectionContext = {
  sessionId: 'default',
  connectionParams: {
    url: 'http://sap.example:8000',
    authType: 'basic',
    username: 'U',
    password: 'pw',
    client: '100',
    connectionType: 'rfc',
  },
  metadata: { destination: 'default' },
};

describe('SAP_DENY_TOOLS from the env file refuses a tool through the real write guard', () => {
  const saved = process.env.SAP_DENY_TOOLS;
  let mcp: Client | undefined;
  afterEach(async () => {
    await mcp?.close();
    mcp = undefined;
    if (saved === undefined) delete process.env.SAP_DENY_TOOLS;
    else process.env.SAP_DENY_TOOLS = saved;
  });

  async function startWith(group: ProbeGroup): Promise<Client> {
    const server = new TestServer();
    server.use(context);
    server.register(new CompositeHandlersRegistry([group]));
    const [serverSide, clientSide] = InMemoryTransport.createLinkedPair();
    await server.connect(serverSide);
    const client = new Client({ name: 'test', version: '0' });
    await client.connect(clientSide);
    return client;
  }

  async function callText(client: Client, name: string): Promise<string> {
    try {
      const r = await client.callTool({ name, arguments: {} });
      return (r.content as Array<{ text: string }>).map((c) => c.text).join();
    } catch (e) {
      return e instanceof Error ? e.message : String(e);
    }
  }

  it('the file denies DeleteClass, the shell had nothing: refused, handler never ran', async () => {
    delete process.env.SAP_DENY_TOOLS;
    applyEnvFileBridge({
      envFile: tmpEnvFile('SAP_DENY_TOOLS=DeleteClass\n'),
    });
    const group = new ProbeGroup({ connection: {} as never });
    mcp = await startWith(group);
    const text = await callText(mcp, 'DeleteClass');
    expect(text).toMatch(/refused by SAP_DENY_TOOLS/);
    expect(group.called).toEqual([]);
  });

  it('an empty SAP_DENY_TOOLS in the file lifts a shell deny', async () => {
    process.env.SAP_DENY_TOOLS = 'DeleteClass';
    applyEnvFileBridge({ envFile: tmpEnvFile('SAP_DENY_TOOLS=\n') });
    const group = new ProbeGroup({ connection: {} as never });
    mcp = await startWith(group);
    const text = await callText(mcp, 'DeleteClass');
    expect(text).not.toMatch(/SAP_DENY_TOOLS/);
    expect(group.called).toEqual(['DeleteClass']);
  });
});
