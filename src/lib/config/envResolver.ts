import * as path from 'node:path';

/** `--env-path` / MCP_ENV_PATH: an explicit file path, relative to the cwd. */
export function resolveEnvFilePath(envPath?: string): string | undefined {
  const trimmed = envPath?.trim();
  if (!trimmed) return undefined;
  return path.isAbsolute(trimmed)
    ? trimmed
    : path.resolve(process.cwd(), trimmed);
}
