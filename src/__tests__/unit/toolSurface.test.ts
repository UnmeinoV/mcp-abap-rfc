/**
 * The tool surface of the RFC server: on-premise is the default system type
 * (cloud does not exist), so with SAP_SYSTEM_TYPE unset every tool of the
 * fixture is registered. Driven through the real BaseMcpServer.registerHandlers
 * (which applies the available_in filter) and the real MCP protocol.
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { ArgumentsParser } from '../../lib/config/ArgumentsParser';
import {
  CompactHandlersGroup,
  HighLevelHandlersGroup,
  LowLevelHandlersGroup,
  ReadOnlyHandlersGroup,
  ReadVsGetDedupStrategy,
  SearchHandlersGroup,
  SystemHandlersGroup,
} from '../../lib/handlers/groups';
import type { IHandlerGroup } from '../../lib/handlers/interfaces';
import { CompositeHandlersRegistry } from '../../lib/handlers/registry/CompositeHandlersRegistry';
import { loadRfcEnv } from '../../lib/rfcEnv';
import { BaseMcpServer } from '../../server/BaseMcpServer';
import fixture from './__fixtures__/onpremToolNames.json';

class SurfaceServer extends BaseMcpServer {
  constructor(systemType?: 'onprem' | 'legacy') {
    super({ name: 'surface', systemType });
  }
  register(r: CompositeHandlersRegistry) {
    this.registerHandlers(r);
  }
}

// Same construction as launcher.createHandlersRegistry / scripts/list-tools.mjs
// (that function is local to startServer, so it cannot be imported).
function registry(exposition: string[]): CompositeHandlersRegistry {
  const ctx = { connection: undefined as never, logger: undefined };
  const overriding: IHandlerGroup[] = [];
  if (exposition.includes('high'))
    overriding.push(new HighLevelHandlersGroup(ctx));
  if (exposition.includes('low'))
    overriding.push(new LowLevelHandlersGroup(ctx));
  if (exposition.includes('compact'))
    overriding.push(new CompactHandlersGroup(ctx));
  const names = new Set<string>();
  for (const g of overriding)
    for (const e of g.getHandlers()) names.add(e.toolDefinition.name);
  const groups: IHandlerGroup[] = [];
  if (exposition.includes('readonly')) {
    groups.push(
      new ReadOnlyHandlersGroup(ctx, names, new ReadVsGetDedupStrategy()),
    );
    groups.push(new SystemHandlersGroup(ctx));
  }
  groups.push(...overriding, new SearchHandlersGroup(ctx));
  // The union of all four groups (the fixture's superset key) is not a launchable
  // exposition and repeats names across groups; keep the first of each, like the
  // Set in scripts/list-tools.mjs.
  const seen = new Set<string>();
  const deduped = groups.map((g) => {
    const entries = g.getHandlers().filter((e) => {
      if (seen.has(e.toolDefinition.name)) return false;
      seen.add(e.toolDefinition.name);
      return true;
    });
    return { ...g, getHandlers: () => entries } as IHandlerGroup;
  });
  return new CompositeHandlersRegistry(deduped);
}

async function listNames(exposition: string[]): Promise<string[]> {
  const server = new SurfaceServer();
  server.register(registry(exposition));
  const [s, c] = InMemoryTransport.createLinkedPair();
  await server.connect(s);
  const mcp = new Client({ name: 't', version: '0' });
  await mcp.connect(c);
  const { tools } = await mcp.listTools();
  await mcp.close();
  return tools.map((t) => t.name).sort();
}

describe('tool surface without a cloud system type', () => {
  const saved = process.env.SAP_SYSTEM_TYPE;
  beforeEach(() => {
    delete process.env.SAP_SYSTEM_TYPE;
  });
  afterAll(() => {
    if (saved === undefined) delete process.env.SAP_SYSTEM_TYPE;
    else process.env.SAP_SYSTEM_TYPE = saved;
  });

  it('readonly,high with no system type equals the fixture', async () => {
    expect(await listNames(['readonly', 'high'])).toEqual(
      [...fixture['readonly,high']].sort(),
    );
  });

  it('the union of all groups equals the fixture', async () => {
    expect(await listNames(['readonly', 'high', 'low', 'compact'])).toEqual(
      [...fixture['readonly,high,low,compact']].sort(),
    );
  });

  it('--system-type=cloud is refused, naming the value', () => {
    const argv = process.argv;
    process.argv = ['node', 'x', '--system-type=cloud'];
    try {
      expect(() => ArgumentsParser.parse()).toThrow(/cloud/);
    } finally {
      process.argv = argv;
    }
  });
});

describe('--system-type wins over the env file', () => {
  it('file says legacy, CLI says onprem -> onprem', () => {
    const fs = require('node:fs');
    const os = require('node:os');
    const path = require('node:path');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'systype-'));
    const file = path.join(dir, 'a.env');
    fs.writeFileSync(
      file,
      'SAP_ASHOST=10.0.0.1\nSAP_SYSNR=00\nSAP_CLIENT=100\nSAP_USERNAME=U\nSAP_PASSWORD=p\nSAP_SYSTEM_TYPE=legacy\n',
    );
    try {
      expect(loadRfcEnv({ envFile: file, env: {} }).settings.systemType).toBe(
        'legacy',
      );
      expect(
        loadRfcEnv({ envFile: file, env: {}, systemType: 'onprem' }).settings
          .systemType,
      ).toBe('onprem');
    } finally {
      fs.rmSync(dir, { recursive: true });
    }
  });
});
