/**
 * Server Configuration Manager
 *
 * Reads the YAML config file (--config), then the command line, into an
 * IServerConfig, and produces the help text.
 */

import { ArgumentsParser } from './ArgumentsParser.js';
import type { HandlerSet, IServerConfig } from './IServerConfig.js';
import {
  applyYamlConfigToArgs,
  generateConfigTemplateIfNeeded,
  loadYamlConfig,
  parseConfigArg,
} from './yamlConfig.js';

export type { HandlerSet } from './IServerConfig.js';

const HANDLER_SETS: readonly HandlerSet[] = [
  'readonly',
  'high',
  'low',
  'compact',
];

/**
 * --exposition=<sets>. An unknown set name (e.g. a typo "hihg") is refused,
 * naming it and the valid values — dropping it silently would start the
 * server without the tools the user asked for.
 */
export function parseExpositionValue(value: string | undefined): HandlerSet[] {
  if (!value) return [];
  const names = value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const unknown = names.filter(
    (name) => !HANDLER_SETS.includes(name as HandlerSet),
  );
  if (unknown.length > 0) {
    throw new Error(
      `Unknown --exposition set ${unknown.map((n) => `"${n}"`).join(', ')}: valid values are ${HANDLER_SETS.join(', ')}.`,
    );
  }
  return names as HandlerSet[];
}

export class ServerConfigManager {
  private config: IServerConfig | null = null;

  /**
   * Current configuration, YAML applied first (command line wins).
   */
  async getConfig(): Promise<IServerConfig> {
    if (this.config) {
      return { ...this.config };
    }
    this.loadYamlConfigIfNeeded();
    this.config = this.parseCommandLine();
    return { ...this.config };
  }

  /**
   * Current configuration without the YAML file (unless getConfig ran first).
   */
  getConfigSync(): IServerConfig {
    if (!this.config) {
      this.config = this.parseCommandLine();
    }
    return { ...this.config };
  }

  private loadYamlConfigIfNeeded(): void {
    const configPath = parseConfigArg();
    if (!configPath) return;

    const templateGenerated = generateConfigTemplateIfNeeded(configPath);
    if (templateGenerated) {
      process.stderr.write(
        '[MCP-CONFIG] Template generated. Edit it and rerun with --config.\n',
      );
      process.exit(0);
    }

    const yamlConfig = loadYamlConfig(configPath);
    if (yamlConfig) {
      applyYamlConfigToArgs(yamlConfig);
    }
  }

  private parseCommandLine(): IServerConfig {
    const parsed = ArgumentsParser.parse();
    const exposition = this.parseExposition();

    return {
      exposition: exposition.length > 0 ? exposition : ['readonly', 'high'],
      configFile: parseConfigArg(),
      envFile: parsed.env,
      systemType: parsed.systemType,
    };
  }

  /**
   * Format: --exposition=readonly,high,low,compact
   */
  private parseExposition(): HandlerSet[] {
    return parseExpositionValue(ArgumentsParser.getArgument('--exposition'));
  }

  static getHandlerSetsDescription(): string {
    return `
HANDLER EXPOSITION:
  --exposition=<sets>              Comma-separated handler sets to expose
                                   Options: readonly, high, low, compact
                                   Default: readonly,high

                                   Handler Sets:
                                   - readonly: Get*, Check*, Validate*, Lock*, Unlock*
                                               (read operations, validation, locking)
                                               Also includes: search, system
                                   - high:     Create*, Update*High
                                               (safe create/update via ADT)
                                   - low:      Update*Low, Delete*, Activate*
                                               (direct/dangerous operations)
                                   - compact:  HandlerCreate, HandlerGet,
                                               HandlerUpdate, HandlerDelete
                                               (object_type-routed facade)
                                   - search:   SearchObject (included with readonly)
                                   - system:   GetWhereUsed, GetTypeInfo, GetObjectInfo,
                                               GetAbapAST, GetSession, etc.
                                               (included with readonly)

                                   Examples:
                                   --exposition=readonly       (readonly + search + system)
                                   --exposition=readonly,high  (readonly + high + search + system)
                                   --exposition=high           (high only, NO search/system)
                                   --exposition=compact        (compact facade only)
`;
  }

  static generateHelp(additionalSections?: string): string {
    return `
mcp-abap-rfc - SAP ABAP development tools over RFC, as an MCP server

USAGE:
  mcp-abap-rfc --env-path=<file> [options]

DESCRIPTION:
  MCP server (stdio) for SAP ABAP systems. Talks to the system over RFC
  (SADT_REST_RFC_ENDPOINT, SAP NW RFC SDK), including through a SAProuter.

OPTIONS:
  --help, -h                       Show this help message
  --version, -v                    Show the version
  --env-path=<path>                RFC env file (see SAP CONNECTION below)
                                   Alternative: MCP_ENV_PATH env var.
                                   Without it the SAP_* keys come from the shell
                                   environment only (no implicit ./.env).
  --system-type=<type>             onprem (default) | legacy
                                   Controls which tools are available.
                                   Alternative: SAP_SYSTEM_TYPE in the env file;
                                   the flag overrides the file
  --max-result-chars=<n>           Declare _meta["anthropic/maxResultSizeChars"]=<n> on every tool (max 500000)
                                   Claude clients otherwise save results over 50,000 chars to a file;
                                   set it for clients without file tools (e.g. a read-only chat bot)
                                   Alternative: MCP_MAX_RESULT_CHARS env var
  --config=<path>                  YAML config file (alias --conf); keys: env-path, exposition.
                                   If the file does not exist, a template is generated.
                                   Command line arguments override config file values.
${ServerConfigManager.getHandlerSetsDescription()}
EXAMPLES:
  mcp-abap-rfc --env-path=/path/to/my-system.env
  mcp-abap-rfc --env-path=my-system.env --exposition=readonly
  mcp-abap-rfc --config=my-config.yaml
${additionalSections || ''}
`;
  }
}
