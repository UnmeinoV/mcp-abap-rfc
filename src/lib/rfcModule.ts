/**
 * Startup guard for the native RFC module.
 *
 * Every SAP request of this server goes through `@mcp-abap-adt/sap-rfc-lite`,
 * a native addon built against the SAP NW RFC SDK in `runtime/`. It is an
 * OPTIONAL dependency, so `npm ci` silently drops it when its build fails
 * (no SAPNWRFC_HOME) — and without this guard the server would start, list
 * its tools, and fail every call later with a module error naming nothing
 * the user can act on. So startup refuses, saying what to run.
 */
import * as path from 'node:path';

const RFC_MODULE = '@mcp-abap-adt/sap-rfc-lite';

/** Repo root: this file is src/lib/rfcModule.ts or dist/lib/rfcModule.js. */
const REPO_ROOT = path.join(__dirname, '..', '..');

function loadRfcModule(): unknown {
  return require(RFC_MODULE);
}

/**
 * Windows finds the SAP NW RFC SDK DLLs (sapnwrfc.dll, icu*.dll) through PATH,
 * so the SDK shipped in runtime/ must be first on PATH before the module is
 * loaded. Returns the PATH entry to set (the key may be `Path` on Windows), or
 * undefined when nothing changes: not Windows, or the SDK is already first.
 * Linux needs nothing (rpath); on macOS npm run setup:rfc copies the SDK dylibs
 * next to the module, where their @loader_path install names point.
 */
export function windowsSdkPathUpdate(
  env: NodeJS.ProcessEnv,
  platform: NodeJS.Platform,
  repoRoot: string,
): { key: string; value: string } | undefined {
  if (platform !== 'win32') return undefined;
  const sdkLib = path.win32.join(
    repoRoot,
    'runtime',
    'windows',
    'nwrfcsdk',
    'lib',
  );
  const key =
    Object.keys(env).find((name) => name.toUpperCase() === 'PATH') ?? 'PATH';
  const rest = env[key];
  if (!rest) return { key, value: sdkLib };
  if (rest.split(path.win32.delimiter)[0] === sdkLib) return undefined;
  return { key, value: `${sdkLib}${path.win32.delimiter}${rest}` };
}

export function assertRfcModuleLoadable(
  load: () => unknown = loadRfcModule,
  platform: NodeJS.Platform = process.platform,
  env: NodeJS.ProcessEnv = process.env,
): void {
  const update = windowsSdkPathUpdate(env, platform, REPO_ROOT);
  if (update) env[update.key] = update.value;
  try {
    load();
  } catch (error) {
    const cause = error instanceof Error ? error.message : String(error);
    throw new Error(
      `The RFC module ${RFC_MODULE} is not built for this machine — run: npm run setup:rfc (cause: ${cause})`,
      { cause: error },
    );
  }
}
