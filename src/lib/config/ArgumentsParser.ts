/**
 * Command-line arguments and environment variables of the RFC stdio server.
 * Options of the original HTTP/BTP server are refused earlier, by
 * assertNoRemovedOptions (removedOptions.ts).
 */

import { resolveEnvFilePath } from './envResolver';
import { parseMaxResultChars } from './maxResultChars';

export interface ParsedArguments {
  /** RFC env file. No implicit `.env` from the cwd: absent = the shell environment. */
  env?: string;
  /** SAP system type override: onprem | legacy */
  systemType?: 'onprem' | 'legacy';
  /** Path to YAML config file */
  config?: string;
}

export class ArgumentsParser {
  static parse(): ParsedArguments {
    const result: ParsedArguments = {};

    result.env = resolveEnvFilePath(
      ArgumentsParser.getArgument('--env-path') || process.env.MCP_ENV_PATH,
    );

    // --system-type (onprem | legacy). A cloud system is not reachable over RFC.
    const sysType = ArgumentsParser.getArgument('--system-type')
      ?.trim()
      .toLowerCase();
    if (sysType !== undefined) {
      if (sysType !== 'onprem' && sysType !== 'legacy') {
        throw new Error(
          `Invalid --system-type "${sysType}": expected onprem or legacy (cloud systems are not reachable over RFC).`,
        );
      }
      result.systemType = sysType;
      // Propagate to env so systemContext.ts detectLegacy() picks it up
      process.env.SAP_SYSTEM_TYPE = sysType;
    }

    // --max-result-chars: declared on every tool as
    // _meta["anthropic/maxResultSizeChars"] (see maxResultChars.ts). Validated
    // here so a bad value stops startup; propagated to env for registration.
    // It wins over MCP_MAX_RESULT_CHARS in the env file and the shell, which
    // are validated by the launcher after the env file is bridged
    // (rfcEnv.ts applyEnvFileBridge) — the file's value wins over the shell's.
    const maxResultChars = parseMaxResultChars(
      ArgumentsParser.getArgument('--max-result-chars') || undefined,
    );
    if (maxResultChars !== undefined) {
      process.env.MCP_MAX_RESULT_CHARS = String(maxResultChars);
    }

    result.config =
      ArgumentsParser.getArgument('--conf') ||
      ArgumentsParser.getArgument('--config');

    return result;
  }

  /**
   * Get argument value by name
   */
  static getArgument(name: string): string | undefined {
    const args = process.argv;
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg.startsWith(`${name}=`)) {
        return arg.slice(`${name}=`.length);
      } else if (arg === name && i + 1 < args.length) {
        return args[i + 1];
      }
    }
    return undefined;
  }

  /**
   * Check if flag exists
   */
  static hasFlag(name: string): boolean {
    return process.argv.includes(name);
  }
}
