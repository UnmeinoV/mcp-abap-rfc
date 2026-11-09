/**
 * Configuration of the RFC stdio server
 */

export { ArgumentsParser, type ParsedArguments } from './ArgumentsParser.js';
export type { HandlerSet, IServerConfig } from './IServerConfig.js';
export { assertNoRemovedOptions } from './removedOptions.js';
export { ServerConfigManager } from './ServerConfigManager.js';
export type { YamlConfig } from './yamlConfig.js';
export {
  applyYamlConfigToArgs,
  generateConfigTemplateIfNeeded,
  generateYamlConfigTemplate,
  loadYamlConfig,
  parseConfigArg,
  validateYamlConfig,
} from './yamlConfig.js';
