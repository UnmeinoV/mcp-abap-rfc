/**
 * One server, several clients — driven through the REAL MCP protocol
 * (in-memory transport) and the REAL BaseMcpServer wrapper. Only the
 * connection factory is mocked: each fake connection remembers which client
 * it was created for, and the probe handlers report the connection they got.
 */
const mockCreated: Array<Record<string, unknown>> = [];
const mockFailing = new Set<string>();

jest.mock('../../lib/connectionFactory', () => ({
  createAbapConnection: jest.fn((params: Record<string, unknown>) => {
    mockCreated.push(params);
    return {
      client: params.client,
      connect: jest.fn(async () => {
        if (mockFailing.has(String(params.client))) {
          throw new Error(`logon refused for ${params.client}`);
        }
      }),
    };
  }),
}));

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import type { HandlerContext } from '../../handlers/interfaces';
import { BaseHandlerGroup } from '../../lib/handlers/base/BaseHandlerGroup';
import type { HandlerEntry } from '../../lib/handlers/interfaces';
import { CompositeHandlersRegistry } from '../../lib/handlers/registry/CompositeHandlersRegistry';
import {
  loadSapClientConfig,
  resetSapClientConfig,
} from '../../lib/sapClients';
import {
  getSystemContext,
  resetSystemContextCache,
  setSystemContext,
} from '../../lib/systemContext';
import { BaseMcpServer } from '../../server/BaseMcpServer';
import type { ConnectionContext } from '../../server/ConnectionContext';

type Call = { client: string; args: unknown; responsible?: string };

class ProbeGroup extends BaseHandlerGroup {
  protected groupName = 'Probe';
  calls: Call[] = [];

  getHandlers(): HandlerEntry[] {
    return [
      {
        // The shape 200 real handlers use: reads the group's shared context.
        toolDefinition: {
          name: 'ProbeArgsOnly',
          description: 'probe',
          inputSchema: {
            type: 'object',
            properties: { x: { type: 'string' } },
          },
        },
        handler: (args: unknown) => this.record(this.context, args),
      },
      {
        toolDefinition: {
          name: 'ProbeWithContext',
          description: 'probe',
          inputSchema: { type: 'object', properties: {} },
        },
        handler: (context: HandlerContext, args: unknown) =>
          this.record(context, args),
      },
      {
        toolDefinition: {
          name: 'ProbeFails',
          description: 'probe',
          inputSchema: { type: 'object', properties: {} },
        },
        handler: async () => ({
          isError: true,
          content: [{ type: 'text', text: 'boom' }],
        }),
      },
    ] as HandlerEntry[];
  }

  private async record(context: HandlerContext, args: unknown) {
    // Captured BEFORE the await, as a real handler does; the await then lets
    // a concurrent call run in between.
    const client = (context.connection as unknown as { client: string }).client;
    await new Promise((r) => setTimeout(r, 5));
    this.calls.push({
      client,
      args,
      responsible: getSystemContext().responsible,
    });
    return {
      isError: false,
      content: [{ type: 'text', text: JSON.stringify({ client }) }],
    };
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

const stdioContext: ConnectionContext = {
  sessionId: 'default',
  connectionParams: {
    url: 'http://sap.example:8000',
    authType: 'basic',
    username: 'DEFAULT_USER',
    password: 'pw',
    client: '100',
    connectionType: 'rfc',
  },
  metadata: { destination: 'default' },
};

let mcp: Client;
let group: ProbeGroup;

async function start(
  env: NodeJS.ProcessEnv,
  context: ConnectionContext = stdioContext,
) {
  loadSapClientConfig({ env });
  group = new ProbeGroup({ connection: {} as never });
  const server = new TestServer();
  server.use(context);
  server.register(new CompositeHandlersRegistry([group]));
  const [serverSide, clientSide] = InMemoryTransport.createLinkedPair();
  await server.connect(serverSide);
  mcp = new Client({ name: 'test', version: '0' });
  await mcp.connect(clientSide);
}

async function call(name: string, args: Record<string, unknown> = {}) {
  try {
    const r = await mcp.callTool({ name, arguments: args });
    const content = (r.content as Array<{ type: string; text: string }>) ?? [];
    return {
      isError: Boolean(r.isError),
      content,
      text: content.map((c) => c.text).join('\n'),
    };
  } catch (e) {
    return {
      isError: true,
      content: [],
      text: e instanceof Error ? e.message : String(e),
    };
  }
}

const TWO = { SAP_CLIENTS: '100,800', SAP_CLIENT: '100' };
const createdFor = (client: string) =>
  mockCreated.filter((p) => p.client === client).length;

beforeEach(() => {
  mockCreated.length = 0;
  mockFailing.clear();
  resetSystemContextCache();
  setSystemContext({ responsible: 'DEFAULT_USER' });
});
afterEach(async () => {
  await mcp?.close();
  resetSapClientConfig();
  resetSystemContextCache();
});

describe('multi-client routing', () => {
  it('advertises sap_client as an optional enum on every tool', async () => {
    await start(TWO);
    const { tools } = await mcp.listTools();
    for (const tool of tools) {
      const prop = (
        tool.inputSchema.properties as Record<string, { enum?: string[] }>
      ).sap_client;
      expect(prop?.enum).toEqual(['100', '800']);
      expect(tool.inputSchema.required ?? []).not.toContain('sap_client');
    }
  });

  it('routes by sap_client and never passes it to the handler', async () => {
    await start(TWO);
    const r = await call('ProbeArgsOnly', { x: 'a', sap_client: '800' });
    expect(JSON.parse(r.content[0].text)).toEqual({ client: '800' });
    expect(group.calls[0]).toMatchObject({ client: '800', args: { x: 'a' } });
    expect(mockCreated.at(-1)).toMatchObject({ client: '800' });
  });

  it('defaults to SAP_CLIENT and labels the result with the client that answered', async () => {
    await start(TWO);
    const r = await call('ProbeArgsOnly', { x: 'a' });
    expect(JSON.parse(r.content[0].text)).toEqual({ client: '100' });
    expect(r.content.at(-1)).toEqual({ type: 'text', text: 'sap_client: 100' });
    const r800 = await call('ProbeArgsOnly', { sap_client: '800' });
    expect(r800.content.at(-1)).toEqual({
      type: 'text',
      text: 'sap_client: 800',
    });
  });

  it('explicit default reuses the connection', async () => {
    await start(TWO);
    await call('ProbeArgsOnly', { sap_client: '100' });
    await call('ProbeArgsOnly', {});
    await call('ProbeWithContext', { sap_client: '100' });
    expect(createdFor('100')).toBe(1);
  });

  it('opens one connection per client', async () => {
    await start(TWO);
    await call('ProbeArgsOnly', { sap_client: '800' });
    await call('ProbeWithContext', { sap_client: '800' });
    expect(createdFor('800')).toBe(1);
  });

  it('labels failures once', async () => {
    await start(TWO);
    const r = await call('ProbeFails', { sap_client: '800' });
    expect(r.isError).toBe(true);
    expect(r.text).toContain('boom');
    expect(r.text.match(/\[sap_client 800\]/g)).toHaveLength(1);
  });

  it('refuses an unlisted client before connecting', async () => {
    await start(TWO);
    const r = await call('ProbeArgsOnly', { sap_client: '999' });
    expect(r.isError).toBe(true);
    expect(createdFor('999')).toBe(0);
    expect(group.calls).toHaveLength(0);
  });

  it('concurrent calls each get their own client, including args-only handlers', async () => {
    await start(TWO);
    const results = await Promise.all([
      call('ProbeArgsOnly', { sap_client: '800' }),
      call('ProbeArgsOnly', { sap_client: '100' }),
      call('ProbeWithContext', { sap_client: '800' }),
      call('ProbeWithContext', {}),
    ]);
    expect(results.map((r) => JSON.parse(r.content[0].text).client)).toEqual([
      '800',
      '100',
      '800',
      '100',
    ]);
  });

  it('a failed logon is not cached and does not touch other clients', async () => {
    await start(TWO);
    mockFailing.add('800');
    const failed = await call('ProbeArgsOnly', { sap_client: '800' });
    expect(failed.isError).toBe(true);
    expect(failed.text).toContain('logon refused for 800');
    expect(failed.text).toContain('[sap_client 800]');
    expect((await call('ProbeArgsOnly', {})).isError).toBe(false);
    mockFailing.clear();
    const retried = await call('ProbeArgsOnly', { sap_client: '800' });
    expect(JSON.parse(retried.content[0].text)).toEqual({ client: '800' });
    expect(createdFor('800')).toBe(2);
  });

  it('uses per-client credentials and that user as responsible', async () => {
    await start({
      ...TWO,
      SAP_CLIENT_800_USERNAME: 'OTHER.USER',
      SAP_CLIENT_800_PASSWORD: 'pw-800',
    });
    await call('ProbeWithContext', { sap_client: '800' });
    await call('ProbeWithContext', {});
    expect(mockCreated.find((p) => p.client === '800')).toMatchObject({
      username: 'OTHER.USER',
      password: 'pw-800',
    });
    expect(group.calls.map((c) => [c.client, c.responsible])).toEqual([
      ['800', 'OTHER.USER'],
      ['100', 'DEFAULT_USER'],
    ]);
  });

  // Review #1/#2: an HTTP x-sap-client header, another broker destination, or a
  // shell SAP_CLIENT that disagrees with the env file all reach getConnection
  // with a client that is not SAP_CLIENTS' default. Rewriting it to the default
  // would run the call on a client nobody named.
  it('refuses a connection whose own client is not the configured default', async () => {
    await start(TWO, {
      ...stdioContext,
      connectionParams: { ...stdioContext.connectionParams, client: '300' },
    });
    const r = await call('ProbeArgsOnly', { sap_client: '800' });
    expect(r.isError).toBe(true);
    expect(r.text).toContain('client 300');
    expect(r.text).toContain('SAP_CLIENTS=100,800');
    expect(mockCreated).toHaveLength(0);
    expect(group.calls).toHaveLength(0);
  });

  it('changes nothing with a single client', async () => {
    await start({ SAP_CLIENT: '100' });
    const { tools } = await mcp.listTools();
    for (const tool of tools) {
      expect(tool.inputSchema.properties ?? {}).not.toHaveProperty(
        'sap_client',
      );
    }
    const r = await call('ProbeArgsOnly', { x: 'a' });
    expect(r.content).toHaveLength(1);
  });
});
