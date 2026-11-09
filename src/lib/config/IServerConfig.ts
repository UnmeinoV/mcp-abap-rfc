/**
 * Server configuration: the options an RFC-only stdio server has.
 */

/** Handler set for exposition control */
export type HandlerSet = 'readonly' | 'high' | 'low' | 'compact';

export interface IServerConfig {
  /** RFC env file (--env-path / MCP_ENV_PATH); absent = the shell environment */
  envFile?: string;
  /** Handler sets to expose */
  exposition?: HandlerSet[];
  /** Path to YAML config file (--config / --conf) */
  configFile?: string;
  /** SAP system type override (--system-type) */
  systemType?: 'onprem' | 'legacy';
}
