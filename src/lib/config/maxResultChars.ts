/**
 * Opt-in raise of the client-side tool-result size threshold.
 *
 * Claude Code / the Claude Agent SDK persist any MCP tool result over 50,000
 * characters to a file and hand the model only a 2 KB preview plus the path.
 * A client without file tools (e.g. a read-only chat bot) then cannot read a
 * full program source at all. A tool may declare
 * `_meta["anthropic/maxResultSizeChars"]` to raise that threshold; the client
 * caps it at 500,000.
 *
 * Off by default: an interactive client with file tools is better served by the
 * preview than by a 100 KB source pushed into its context.
 */

export const MAX_RESULT_CHARS_META_KEY = 'anthropic/maxResultSizeChars';
/** Ceiling the Claude client applies to the declared value. */
export const MAX_RESULT_CHARS_CEILING = 500_000;

/** Parses --max-result-chars / MCP_MAX_RESULT_CHARS. Throws on a bad value so startup names it. */
export function parseMaxResultChars(
  raw: string | undefined,
): number | undefined {
  if (raw === undefined || raw.trim() === '') return undefined;
  const n = Number(raw.trim());
  if (!Number.isInteger(n) || n <= 0 || n > MAX_RESULT_CHARS_CEILING) {
    throw new Error(
      `--max-result-chars / MCP_MAX_RESULT_CHARS must be an integer between 1 and ${MAX_RESULT_CHARS_CEILING}, got "${raw}"`,
    );
  }
  return n;
}

/** The `_meta` to attach to every registered tool, or undefined when not configured. */
export function toolResultMeta(
  env: Record<string, string | undefined> = process.env,
): Record<string, unknown> | undefined {
  const n = parseMaxResultChars(env.MCP_MAX_RESULT_CHARS);
  return n === undefined ? undefined : { [MAX_RESULT_CHARS_META_KEY]: n };
}
