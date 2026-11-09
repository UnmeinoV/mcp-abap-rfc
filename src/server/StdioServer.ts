import type { Logger } from '@mcp-abap-adt/logger';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { noopLogger } from '../lib/handlerLogger.js';
import type { IHandlersRegistry } from '../lib/handlers/interfaces.js';
import type { RfcSettings } from '../lib/rfcEnv.js';
import { getServerBuildInfo } from '../lib/serverVersion.js';
import { BaseMcpServer } from './BaseMcpServer.js';

// The version in package.json, also reported by GetSession and error banners.
const DEFAULT_VERSION = getServerBuildInfo().server_version;

export interface StdioServerOptions {
  name?: string;
  version?: string;
  logger?: Logger;
}

/**
 * The stdio server: connects over RFC from the settings of one env file,
 * once at startup, and serves MCP over stdin/stdout.
 */
export class StdioServer extends BaseMcpServer {
  constructor(
    private readonly handlersRegistry: IHandlersRegistry,
    private readonly settings: RfcSettings,
    opts?: StdioServerOptions,
  ) {
    super({
      name: opts?.name ?? 'mcp-abap-rfc',
      version: opts?.version ?? DEFAULT_VERSION,
      logger: opts?.logger ?? noopLogger,
      systemType: settings.systemType,
    });
  }

  async start(): Promise<void> {
    await this.setConnectionContext(this.settings);
    this.registerHandlers(this.handlersRegistry);

    const transport = new StdioServerTransport();
    await this.connect(transport);
  }
}
