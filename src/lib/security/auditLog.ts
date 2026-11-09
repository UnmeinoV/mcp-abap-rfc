/**
 * Tool-call audit log — OFF by default (SAP_AUDIT_LOG_FILE unset = no file, no behaviour change).
 *
 * Appends one JSON line per tool call: who called what, with what arguments, and whether it
 * succeeded. Two things this file refuses to do silently:
 *  - log a credential. Any key that LOOKS like one (password/token/secret/authorization/cookie/
 *    jwt, case-insensitively, anywhere in the argument object) is replaced with "[REDACTED]"
 *    before the line is ever built — never written and then redacted, since a bug in the "and
 *    then" step would mean the secret already reached disk.
 *  - grow without bound. A long string value (typically `source_code`) is truncated with an
 *    explicit `…(N more chars)` marker rather than silently included in full — an audit log this
 *    project's own operator has to read is not the place to dump a 900-line class body.
 */

import { appendFileSync } from 'node:fs';

const SENSITIVE_KEY_RE =
  /password|token|secret|authorization|cookie|jwt|credential/i;
const MAX_STRING_VALUE_LENGTH = 500;
const MAX_DEPTH = 4;

function redact(value: unknown, depth: number): unknown {
  if (depth > MAX_DEPTH) return '[TRUNCATED: max depth]';
  if (typeof value === 'string') {
    return value.length > MAX_STRING_VALUE_LENGTH
      ? `${value.slice(0, MAX_STRING_VALUE_LENGTH)}…(${value.length - MAX_STRING_VALUE_LENGTH} more chars)`
      : value;
  }
  if (Array.isArray(value)) {
    return value.map((v) => redact(v, depth + 1));
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      out[key] = SENSITIVE_KEY_RE.test(key)
        ? '[REDACTED]'
        : redact(val, depth + 1);
    }
    return out;
  }
  return value;
}

export interface AuditEntry {
  timestamp: string;
  tool: string;
  args: unknown;
  success: boolean;
  error?: string;
  duration_ms: number;
}

export function buildAuditEntry(
  tool: string,
  args: unknown,
  success: boolean,
  durationMs: number,
  error?: string,
): AuditEntry {
  return {
    timestamp: new Date().toISOString(),
    tool,
    args: redact(args, 0),
    success,
    ...(error ? { error: error.slice(0, MAX_STRING_VALUE_LENGTH) } : {}),
    duration_ms: durationMs,
  };
}

/**
 * Appends one line. Read the path fresh from the env on EVERY call rather than caching it once —
 * this is not on any performance-sensitive path (it is an fs append, already the slow part), and
 * reading it live means a test can flip the env var without needing to reset a module-level cache.
 */
export function writeAuditEntry(
  entry: AuditEntry,
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
  logger?: { warn?: (msg: string) => void },
): void {
  const path = env.SAP_AUDIT_LOG_FILE;
  if (!path) return;
  try {
    appendFileSync(path, `${JSON.stringify(entry)}\n`, { encoding: 'utf-8' });
  } catch (e: any) {
    // Never let a broken audit path (permissions, missing directory) take down a tool call —
    // that would make observability tooling a new way to break the server.
    logger?.warn?.(
      `Failed to write audit log entry to ${path}: ${e?.message ?? e}`,
    );
  }
}
