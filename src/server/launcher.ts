import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  ArgumentsParser,
  assertNoRemovedOptions,
  ServerConfigManager,
} from '../lib/config/index.js';
import { validateExposition } from '../lib/config/validateExposition.js';
import { defaultRfcTraceDir } from '../lib/connectionFactory.js';
import {
  CompactHandlersGroup,
  HighLevelHandlersGroup,
  LowLevelHandlersGroup,
  ReadOnlyHandlersGroup,
  SearchHandlersGroup,
  SystemHandlersGroup,
} from '../lib/handlers/groups/index.js';
import { ReadVsGetDedupStrategy } from '../lib/handlers/groups/strategies/index.js';
import type {
  HandlerContext,
  IHandlerGroup,
} from '../lib/handlers/interfaces.js';
import { CompositeHandlersRegistry } from '../lib/handlers/registry/CompositeHandlersRegistry.js';
import { applyEnvFileBridge, loadRfcEnv, rfcBanner } from '../lib/rfcEnv.js';
import { assertRfcModuleLoadable } from '../lib/rfcModule.js';
import { loadSapClientConfig } from '../lib/sapClients.js';
import { StdioServer } from './StdioServer.js';

const stderrLogger = {
  info: (...args: any[]) => console.error(...args),
  warn: (...args: any[]) => console.error(...args),
  error: (...args: any[]) => console.error(...args),
  debug: (...args: any[]) => console.error(...args),
};

const silentLogger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
};
const loggerForTransport =
  process.env.DEBUG_AUTH_LOG === 'true' ? stderrLogger : silentLogger;

// Keep strong reference to running server instance to avoid premature GC/exit
let activeServer: StdioServer | undefined;

function hasArg(name: string): boolean {
  return process.argv.includes(name);
}

function showVersion(): void {
  const packageJsonPath = path.join(__dirname, '..', '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  console.log(packageJson.version);
  process.exit(0);
}

/**
 * Environment and env-file sections of the help text
 */
const ENV_HELP_SECTIONS = `
ENVIRONMENT VARIABLES:
    MCP_ENV_PATH                   RFC env file path (same as --env-path)
    MCP_MAX_RESULT_CHARS           Same as --max-result-chars (also in the env file)
    MCP_TRANSPORT                  Only stdio is accepted (any other value is refused)

  Debug Options:
    DEBUG_AUTH_LOG                 Server logger to stderr (true|false)
    DEBUG_HANDLERS                 Enable handler debug logging (true|false)
    DEBUG_CONNECTORS               Enable connector debug logging (true|false)
    DEBUG_CONNECTION_MANAGER       Enable connection manager debug logging (true|false)
    HANDLER_LOG_SILENT             Disable all handler logs (true|false)

SAP CONNECTION (RFC env file, --env-path):
    SAP_ASHOST                     Application server host or IP, as in SAP Logon (required)
    SAP_SYSNR                      Instance number, two digits (required; no default 00)
    SAP_CLIENT                     SAP client number (required)
    SAP_USERNAME                   SAP user (required)
    SAP_PASSWORD                   SAP password (required)
    SAP_LANGUAGE                   Logon language (optional, e.g. EN, ZH)
    SAP_SAPROUTER                  SAProuter route string (e.g. /H/1.2.3.4/H/), for
                                   systems reachable only through a SAProuter
    SAP_RFC_COMPRESSION=on         Keep the NW RFC SDK's payload compression. Off by
                                   default: with it on, large base64 bodies (e.g. the
                                   pre-activation check of a big program) dump on the
                                   server with XML_FORMAT_ERROR.
    SAP_CLIENTS                    Several clients of the SAME system, e.g. 100,800.
                                   Every tool then takes an optional sap_client;
                                   SAP_CLIENT stays the default.
                                   A key set in the env file wins over the
                                   shell; SAP_CLIENTS= (empty) there turns it off.
    SAP_CLIENT_<n>_USERNAME        Optional user for client <n> (with _PASSWORD);
    SAP_CLIENT_<n>_PASSWORD        without them client <n> uses SAP_USERNAME.
    SAP_SYSTEM_TYPE                onprem (default) | legacy
    SAP_MASTER_SYSTEM              SAP system ID (e.g. DEV). Used for create/update
                                   transport binding.
    SAP_RESPONSIBLE                Responsible user (optional, falls back to SAP_USERNAME)
    SAP_DENY_TOOLS                 Tools to refuse, comma-separated, * wildcard (off by default)
    SAP_ALLOWED_PACKAGES           Packages Create* may target (only package_name; off by default)
    SAP_AUDIT_LOG_FILE             JSONL audit log of every tool call (off by default)
    SAP_TIMEOUT_DEFAULT/_CSRF/_LONG  Request timeouts in ms (45000 / 15000 / 60000)
    MCP_MAX_RESULT_CHARS           Same as --max-result-chars (the option wins over it)
    RFC_TRACE_DIR                  NW RFC SDK trace dir (default <tmpdir>/mcp-abap-rfc-rfc-trace)
    SAP_CONNECTION_TYPE=rfc and SAP_AUTH_TYPE=basic are accepted (no other value).
    A key the env file defines wins over the same key in the shell, even when
    empty; a refused key says whether it came from the file or the shell.
    Requires: SAP NW RFC SDK + @mcp-abap-adt/sap-rfc-lite
`;

function showHelp(): void {
  console.error(ServerConfigManager.generateHelp(ENV_HELP_SECTIONS));
}

async function main() {
  // Options of the original HTTP/BTP server are refused, naming the option.
  assertNoRemovedOptions(process.argv.slice(2), process.env);

  // Check for --version first
  if (hasArg('--version') || hasArg('-v')) {
    showVersion();
  }

  // Check for --help
  if (hasArg('--help') || hasArg('-h')) {
    showHelp();
    process.exit(0);
  }

  // Use ServerConfigManager for all config parsing (YAML + command line). It
  // does not touch the RFC module.
  const configManager = new ServerConfigManager();
  const config = await configManager.getConfig();

  // Keys read from process.env (SAP_DENY_TOOLS, SAP_ALLOWED_PACKAGES,
  // SAP_AUDIT_LOG_FILE, SAP_TIMEOUT_*, MCP_MAX_RESULT_CHARS, RFC_TRACE_DIR) are
  // bridged from the env file, which wins over the shell (even when empty);
  // a command-line --max-result-chars wins over both. Before the trace-dir
  // default, so an RFC_TRACE_DIR from the file is the one the SDK uses.
  applyEnvFileBridge({
    envFile: config.envFile,
    cliKeys: ArgumentsParser.getArgument('--max-result-chars')
      ? ['MCP_MAX_RESULT_CHARS']
      : [],
  });

  // Every SAP call needs the native RFC module. It is an optional dependency
  // that `npm ci` drops when it cannot build, so refuse here, naming the fix,
  // rather than start and fail every tool call later. After --version/--help,
  // which work without it.
  // The guard loads the SDK, which drops rfc<pid>.trc into the cwd unless
  // RFC_TRACE_DIR is already set — so set the default first.
  defaultRfcTraceDir();
  assertRfcModuleLoadable();

  if (!config.envFile && !process.env.SAP_ASHOST?.trim()) {
    throw new Error(
      'No SAP system configured. Pass --env-path=<file> (or set MCP_ENV_PATH) naming an RFC env file with ' +
        'SAP_ASHOST, SAP_SYSNR, SAP_CLIENT, SAP_USERNAME and SAP_PASSWORD.',
    );
  }

  // A key the env file defines wins over the shell; a bad file stops startup
  // here, naming the key.
  // Published to process.env by StdioServer.start (setConnectionContext);
  // nothing below needs it earlier.
  const { settings } = loadRfcEnv({
    envFile: config.envFile,
    systemType: config.systemType,
  });

  // Multi-client (SAP_CLIENTS). Read from the env file directly — numbered
  // SAP_CLIENT_<n>_* keys are not exported to process.env — and a bad
  // configuration stops startup here, naming the key.
  const sapClients = loadSapClientConfig({
    envFile: config.envFile,
    envFileIsFallback: false,
  });
  if (sapClients) {
    console.error(
      `[MCP] SAP clients: ${sapClients.clients.join(', ')} (default ${sapClients.defaultClient}); every tool accepts sap_client.`,
    );
  }

  // The handler groups of the one stdio session.
  const createHandlersRegistry = () => {
    const baseContext = {
      connection: undefined as any,
      logger: undefined,
    } satisfies HandlerContext;

    // Build handlers based on exposition config (default to readonly,high)
    const exposition = config.exposition || ['readonly', 'high'];
    validateExposition(exposition);

    // Non-readonly groups are built first so that their tool names can be fed
    // into ReadOnlyHandlersGroup for duplicate suppression (e.g. hide
    // ReadFunctionModule when GetFunctionModule is also exposed).
    const overridingGroups: IHandlerGroup[] = [];
    if (exposition.includes('high')) {
      overridingGroups.push(new HighLevelHandlersGroup(baseContext));
    }
    if (exposition.includes('low')) {
      overridingGroups.push(new LowLevelHandlersGroup(baseContext));
    }
    if (exposition.includes('compact')) {
      overridingGroups.push(new CompactHandlersGroup(baseContext));
    }

    const overridingToolNames = new Set<string>();
    for (const g of overridingGroups) {
      for (const e of g.getHandlers()) {
        overridingToolNames.add(e.toolDefinition.name);
      }
    }

    const handlerGroups: IHandlerGroup[] = [];
    if (exposition.includes('readonly')) {
      handlerGroups.push(
        new ReadOnlyHandlersGroup(
          baseContext,
          overridingToolNames,
          new ReadVsGetDedupStrategy(),
        ),
      );
      handlerGroups.push(new SystemHandlersGroup(baseContext));
    }
    handlerGroups.push(...overridingGroups);
    // SearchHandlersGroup is always included
    handlerGroups.push(new SearchHandlersGroup(baseContext));

    return new CompositeHandlersRegistry(handlerGroups);
  };
  const handlersRegistry = createHandlersRegistry();

  // Never the password, nor a SAProuter /P/ or /W/ password.
  console.error(rfcBanner(settings));

  const server = new StdioServer(handlersRegistry, settings, {
    logger: loggerForTransport,
  });
  activeServer = server;
  await server.start();
}

void main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(
    '[MCP] launcher failed:',
    err instanceof Error ? err.message : String(err),
  );
  process.exit(1);
});
