/**
 * Write guardrails: a tool deny-list and a package allow-list, both OFF by default.
 *
 * WHY THIS EXISTS
 * ----------------
 * This project's architecture is ~360 individual tools (one per object type per operation), not a
 * small set of intent-routed tools with an `action` parameter. That shapes what a guardrail here
 * CAN mean: there is no single `SAPWrite.delete` action string to deny — the tool NAME already is
 * the action (`DeleteClass`, `UpdateTable`, …), so a deny-list here matches tool names/patterns
 * directly, and a package restriction only applies where a call actually carries a `package_name`
 * argument (every `Create*` tool does, by this project's own naming convention; `Update*`/
 * `Delete*`/`Activate*` on an EXISTING object generally do not — see the scope note below).
 *
 * SCOPE OF THE PACKAGE RESTRICTION, STATED PLAINLY SO IT IS NEVER MISTAKEN FOR MORE THAN IT IS
 * -----------------------------------------------------------------------------------------------
 * `assertPackageAllowed` only fires when the call's OWN arguments carry a `package_name` string —
 * which is every `Create*` tool (a new object always names its destination package), and nothing
 * else. It does NOT stop an `Update*`/`Delete*`/`Activate*` call against an object that already
 * exists in a package outside the allow-list: those tools take an object NAME, not a package, and
 * resolving "which package does this existing object currently live in" would need an extra ADT
 * read before every write this project does not currently make. Enforcing that fully is future
 * work, not silently assumed here — a guard that looks like it covers every write while only
 * covering creates would be exactly the "caller cannot tell success from vacuum" shape this
 * project's own CLAUDE.md names as its recurring defect class, turned into a security hole instead
 * of a reporting one.
 */

export interface WriteGuardConfig {
  /** Tool names/glob patterns (case-sensitive, `*` wildcard) that are always refused. Empty = off. */
  deniedTools: string[];
  /** Package name/glob patterns (`*` wildcard) writes may target. Empty/undefined = unrestricted. */
  allowedPackages?: string[];
}

/** `*` is the only wildcard; everything else in the pattern is matched literally. */
function globToRegExp(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`);
}

function matchesAny(
  value: string,
  patterns: readonly string[],
): string | undefined {
  return patterns.find((p) => globToRegExp(p).test(value));
}

function splitEnvList(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Read the guard configuration from the environment. Both knobs are OFF (empty) unless the
 * operator sets them — this project ships with no behaviour change until an operator opts in,
 * the same convention every other config flag here follows.
 */
export function loadWriteGuardConfig(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): WriteGuardConfig {
  const deniedTools = splitEnvList(env.SAP_DENY_TOOLS);
  const allowedPackagesRaw = splitEnvList(env.SAP_ALLOWED_PACKAGES);
  return {
    deniedTools,
    allowedPackages:
      allowedPackagesRaw.length > 0 ? allowedPackagesRaw : undefined,
  };
}

export interface GuardRefusal {
  reason: string;
}

/**
 * Checked BEFORE the handler runs. Returns a refusal reason, or undefined to proceed.
 * Deliberately does not distinguish "which pattern matched" in the message beyond naming it —
 * an admin reading SAP_DENY_TOOLS can see exactly why, without this needing its own error taxonomy.
 */
export function checkToolDenied(
  toolName: string,
  config: WriteGuardConfig,
): GuardRefusal | undefined {
  const matched = matchesAny(toolName, config.deniedTools);
  if (matched) {
    return {
      reason: `Tool "${toolName}" is refused by SAP_DENY_TOOLS (matched pattern "${matched}").`,
    };
  }
  return undefined;
}

/**
 * Checked BEFORE the handler runs, only when `args.package_name` is a string. See the file header
 * for exactly which tools this covers (Create*, by this project's naming convention) and which it
 * does not (Update, Delete and Activate tools acting on an already-existing object).
 */
export function checkPackageAllowed(
  args: Record<string, unknown> | undefined,
  config: WriteGuardConfig,
): GuardRefusal | undefined {
  if (!config.allowedPackages) return undefined;
  const packageName = args?.package_name;
  if (typeof packageName !== 'string' || packageName.length === 0)
    return undefined;

  const matched = matchesAny(packageName, config.allowedPackages);
  if (!matched) {
    return {
      reason:
        `Package "${packageName}" is not in SAP_ALLOWED_PACKAGES (${config.allowedPackages.join(', ')}). ` +
        'This only gates the package_name a Create* call names; it does not restrict writes to an ' +
        'object that already exists in a different package.',
    };
  }
  return undefined;
}
