/**
 * YAML configuration file support for mcp-abap-rfc
 * Allows loading startup parameters from a YAML file instead of command-line arguments
 */

import fs from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';

export interface YamlConfig {
  'env-path'?: string;
  exposition?: string | string[]; // Handler sets: readonly, high, low, compact
}

/**
 * Keys of the original server's YAML file. A file still carrying one is
 * refused, naming the key, rather than silently half-applied.
 * `transport: stdio` is accepted (it is what this server does anyway).
 */
const REMOVED_YAML_KEYS = [
  'transport',
  'mcp',
  'env',
  'unsafe',
  'auth-broker',
  'auth-broker-path',
  'allow-direct-sap-headers',
  'http',
  'sse',
];

/**
 * Parse --conf / --config argument from command line
 */
export function parseConfigArg(): string | undefined {
  const args = process.argv;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--conf=')) {
      return arg.slice('--conf='.length);
    } else if (arg === '--conf' && i + 1 < args.length) {
      return args[i + 1];
    } else if (arg.startsWith('--config=')) {
      return arg.slice('--config='.length);
    } else if (arg === '--config' && i + 1 < args.length) {
      return args[i + 1];
    }
  }
  return undefined;
}

/**
 * Validate YAML configuration
 * @returns Object with valid flag and array of error messages
 */
export function validateYamlConfig(config: YamlConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const raw = (config ?? {}) as Record<string, unknown>;

  for (const key of REMOVED_YAML_KEYS) {
    if (!(key in raw)) continue;
    const value = raw[key];
    if (value === null || value === undefined || value === '') continue;
    if (key === 'transport' && String(value).trim().toLowerCase() === 'stdio') {
      continue;
    }
    errors.push(
      `${key} is not supported by mcp-abap-rfc (RFC over stdio only): remove it (supported keys: env-path, exposition)`,
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Load YAML configuration from file
 */
export function loadYamlConfig(configPath: string): YamlConfig | null {
  try {
    const resolvedPath = path.isAbsolute(configPath)
      ? configPath
      : path.resolve(process.cwd(), configPath);

    if (!fs.existsSync(resolvedPath)) {
      return null;
    }

    const fileContent = fs.readFileSync(resolvedPath, 'utf-8');
    const config = (parseYaml(fileContent) ?? {}) as YamlConfig;

    const validation = validateYamlConfig(config);
    if (!validation.valid) {
      throw new Error(
        `YAML config validation failed:\n${validation.errors.map((e) => `  - ${e}`).join('\n')}`,
      );
    }

    return config;
  } catch (error) {
    throw new Error(
      `Failed to load YAML config from ${configPath}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Generate YAML configuration template
 */
export function generateYamlConfigTemplate(): string {
  return `# mcp-abap-rfc configuration
# Command-line arguments override values from this file

# RFC env file (SAP_ASHOST, SAP_SYSNR, SAP_CLIENT, SAP_USERNAME, SAP_PASSWORD, ...)
# Example: env-path: /path/to/my-system.env
env-path:

# Handler sets to expose: readonly, high, low, compact
# Default: readonly,high
# Use comma-separated list or YAML array
exposition: readonly,high
# Alternative YAML array format:
# exposition:
#   - readonly
#   - high
`;
}

/**
 * Generate YAML config template file if it doesn't exist
 * @returns true if template was generated (file didn't exist), false if file already existed
 */
export function generateConfigTemplateIfNeeded(configPath: string): boolean {
  const resolvedPath = path.isAbsolute(configPath)
    ? configPath
    : path.resolve(process.cwd(), configPath);

  if (!fs.existsSync(resolvedPath)) {
    const template = generateYamlConfigTemplate();
    fs.writeFileSync(resolvedPath, template, 'utf-8');
    process.stderr.write(
      `[MCP-CONFIG] Generated YAML config template: ${resolvedPath}\n`,
    );
    process.stderr.write(
      `[MCP-CONFIG] Please edit the file and fill in your configuration.\n`,
    );
    return true;
  }
  return false;
}

/**
 * Apply YAML config values to process.argv (for compatibility with existing parsers)
 * Only applies values that are not already set in command-line arguments
 */
export function applyYamlConfigToArgs(config: YamlConfig): void {
  const hasArg = (name: string): boolean => {
    return process.argv.some(
      (arg) => arg === name || arg.startsWith(`${name}=`),
    );
  };

  if (config['env-path'] && !hasArg('--env-path')) {
    process.argv.push(`--env-path=${config['env-path']}`);
  }

  if (config.exposition && !hasArg('--exposition')) {
    const exposition = Array.isArray(config.exposition)
      ? config.exposition.join(',')
      : config.exposition;
    process.argv.push(`--exposition=${exposition}`);
  }
}
