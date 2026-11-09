#!/usr/bin/env node
/**
 * npm run setup:rfc — build the native RFC module for THIS machine.
 *
 * `@mcp-abap-adt/sap-rfc-lite` is an optional dependency whose install script
 * compiles against the SAP NW RFC SDK. `npm ci` cannot find the SDK on its own
 * and drops the package. This script points the build at the SDK the user
 * placed in `runtime/` (SAPNWRFC_HOME; see runtime/README.md), installs the version pinned in
 * package.json if it is absent (`--no-save`: package.json and the lockfile
 * stay as they are) or rebuilds it if present, then loads it in a FRESH node
 * process with SAPNWRFC_HOME removed — the way the server will load it.
 *
 * Library lookup at run time:
 *  - linux: binding.gyp links with `-Wl,-rpath,<sdk>/lib`, so the built
 *    module finds libsapnwrfc by itself; no LD_LIBRARY_PATH.
 *  - macOS (x64 only): the SDK's dylibs carry the install name
 *    `@loader_path/<lib>.dylib` (read from the Mach-O load commands), so the
 *    module looks for them in ITS OWN directory and the rpath is never used.
 *    The dylibs are therefore copied next to build/Release/sapnwrfc.node after
 *    the build. Not measured on a Mac (未实测). darwin-arm64 is refused: the
 *    shipped SDK is x86_64-only.
 *  - windows: DLLs are found through PATH; the server prepends
 *    runtime/windows/nwrfcsdk/lib before it loads the module
 *    (src/lib/rfcModule.ts), and the verification below does the same.
 *
 * The NW RFC SDK writes dev_rfc.log / rfc*.trc into the current directory
 * unless RFC_TRACE_DIR is set — so both the build and the load probe run with
 * RFC_TRACE_DIR pointing into the temp directory.
 */
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RFC_MODULE = '@mcp-abap-adt/sap-rfc-lite';

const SDK_DIRS = {
  'linux-x64': 'runtime/linux/x86/nwrfcsdk',
  'linux-arm64': 'runtime/linux/arm/nwrfcsdk',
  'darwin-x64': 'runtime/macos/nwrfcsdk',
  'win32-x64': 'runtime/windows/nwrfcsdk',
};

/** Repo-relative SAP NW RFC SDK directory for a platform/arch. */
export function selectSdkDir(platform, arch) {
  if (platform === 'darwin' && arch === 'arm64') {
    // Measured with `file`: every dylib in runtime/macos/nwrfcsdk/lib is
    // "Mach-O 64-bit x86_64". An arm64 Node cannot load an x86_64 addon.
    throw new Error(
      'The SAP NW RFC SDK in runtime/macos/nwrfcsdk is x86_64-only, so it cannot be loaded by an arm64 Node. ' +
        'Install an x64 (Intel) build of Node and run it under Rosetta (e.g. `arch -x86_64`), then re-run `npm run setup:rfc` with that Node.',
    );
  }
  const dir = SDK_DIRS[`${platform}-${arch}`];
  if (dir) return dir;
  const supported = Object.entries(SDK_DIRS)
    .map(([key, value]) => `${key} (${value})`)
    .join(', ');
  throw new Error(
    `No SAP NW RFC SDK for ${platform}-${arch} — supported platforms and their runtime/ directories: ${supported}`,
  );
}

/**
 * The files of the SDK's lib/ directory that are copied next to the built
 * module on macOS: every `.dylib`, nothing else. Sorted, so the copy order and
 * the log are stable.
 */
export function dylibsToCopy(fileNames) {
  return fileNames.filter((name) => name.endsWith('.dylib')).sort();
}

/**
 * The npm invocation. Under `npm run`, npm_execpath names npm's own CLI script,
 * so it is run with this Node and no shell (no quoting of the arguments by a
 * shell). Without it (the script run directly) fall back to `npm` on PATH,
 * which on Windows is npm.cmd and needs a shell.
 */
export function npmInvocation(args, env, platform, execPath) {
  const npmCli = env.npm_execpath?.trim();
  if (npmCli) {
    return { command: execPath, args: [npmCli, ...args], shell: false };
  }
  return { command: 'npm', args, shell: platform === 'win32' };
}

/** Copy of `env` with RFC_TRACE_DIR set to the temp directory unless the user set one. */
export function withRfcTraceDir(env, tmpdir) {
  if (env.RFC_TRACE_DIR?.trim()) return { ...env };
  return { ...env, RFC_TRACE_DIR: path.join(tmpdir, 'mcp-abap-rfc-rfc-trace') };
}

/** Copy of `env` with `dir` first on PATH (the key may be `Path` on Windows). */
export function withDirOnPath(env, dir) {
  const key =
    Object.keys(env).find((name) => name.toUpperCase() === 'PATH') ?? 'PATH';
  const rest = env[key];
  return { ...env, [key]: rest ? `${dir}${path.delimiter}${rest}` : dir };
}

function pinnedVersion(repoRoot) {
  const pkg = JSON.parse(
    readFileSync(path.join(repoRoot, 'package.json'), 'utf8'),
  );
  const version = pkg.optionalDependencies?.[RFC_MODULE];
  if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(
      `package.json optionalDependencies["${RFC_MODULE}"] must be an exact version, found ${JSON.stringify(version)}`,
    );
  }
  return version;
}

function installedVersion(repoRoot) {
  const file = path.join(repoRoot, 'node_modules', RFC_MODULE, 'package.json');
  if (!existsSync(file)) return undefined;
  return JSON.parse(readFileSync(file, 'utf8')).version;
}

function runNpm(args, options) {
  console.log(`> npm ${args.join(' ')}`);
  const inv = npmInvocation(
    args,
    options.env,
    process.platform,
    process.execPath,
  );
  const result = spawnSync(inv.command, inv.args, {
    stdio: 'inherit',
    shell: inv.shell,
    ...options,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`npm ${args.join(' ')} failed (exit ${result.status})`);
  }
}

/** macOS: put the SDK dylibs where their @loader_path install names point. */
function copyDylibsNextToModule(repoRoot, sdkLib) {
  const releaseDir = path.join(
    repoRoot,
    'node_modules',
    RFC_MODULE,
    'build',
    'Release',
  );
  if (!existsSync(path.join(releaseDir, 'sapnwrfc.node'))) {
    throw new Error(
      `${RFC_MODULE} built no ${path.join(releaseDir, 'sapnwrfc.node')} — see the build output above.`,
    );
  }
  const names = dylibsToCopy(readdirSync(sdkLib));
  if (names.length === 0) {
    throw new Error(`No .dylib files in ${sdkLib}`);
  }
  for (const name of names) {
    copyFileSync(path.join(sdkLib, name), path.join(releaseDir, name));
  }
  console.log(`Copied ${names.join(', ')} to ${releaseDir}`);
}

function main() {
  const repoRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
  );
  const { platform, arch } = process;
  const sdkDir = path.join(repoRoot, selectSdkDir(platform, arch));
  const header = path.join(sdkDir, 'include', 'sapnwrfc.h');
  if (!existsSync(header)) {
    throw new Error(
      `SAP NW RFC SDK for ${platform}-${arch} not found: ${header} does not exist. ` +
        'Download the SDK from SAP and unpack it there (see runtime/README.md).',
    );
  }
  const sdkLib = path.join(sdkDir, 'lib');

  const version = pinnedVersion(repoRoot);
  const present = installedVersion(repoRoot);
  // build_from_source: node-gyp-build otherwise skips the compile whenever an
  // existing build/ still LOADS — e.g. one linked against another checkout's
  // SDK — and that build's rpath would stay pointing there.
  let buildEnv = withRfcTraceDir(
    {
      ...process.env,
      SAPNWRFC_HOME: sdkDir,
      npm_config_build_from_source: 'true',
    },
    os.tmpdir(),
  );
  mkdirSync(buildEnv.RFC_TRACE_DIR, { recursive: true });
  if (platform === 'win32') buildEnv = withDirOnPath(buildEnv, sdkLib);
  console.log(`SAPNWRFC_HOME=${sdkDir}`);
  // --foreground-scripts: npm otherwise runs the install script with its
  // output hidden. Measured with a failing compiler: `npm install` of this
  // OPTIONAL dependency then still exits 0 ("up to date") and drops the
  // package; `npm rebuild <pkg>` exits 1. Either way the compiler error that
  // explains it (usually a missing C++ toolchain) must reach the terminal.
  let npmStep;
  if (present === version) {
    npmStep = 'npm rebuild';
    runNpm(['rebuild', '--foreground-scripts', RFC_MODULE], {
      cwd: repoRoot,
      env: buildEnv,
    });
  } else {
    if (present) {
      console.log(
        `${RFC_MODULE} ${present} is installed, ${version} is pinned`,
      );
    }
    npmStep = 'npm install';
    runNpm(
      [
        'install',
        '--no-save',
        '--foreground-scripts',
        `${RFC_MODULE}@${version}`,
      ],
      {
        cwd: repoRoot,
        env: buildEnv,
      },
    );
  }

  // macOS: the dylibs' install names are @loader_path/..., i.e. the module's
  // own directory — copy them there (未实测 on a Mac).
  if (platform === 'darwin') copyDylibsNextToModule(repoRoot, sdkLib);

  // Load it the way the server will: fresh process, no SAPNWRFC_HOME.
  let runEnv = withRfcTraceDir({ ...process.env }, os.tmpdir());
  delete runEnv.SAPNWRFC_HOME;
  if (platform === 'win32') runEnv = withDirOnPath(runEnv, sdkLib);
  const probe = spawnSync(
    process.execPath,
    [
      '-e',
      `require(${JSON.stringify(RFC_MODULE)}); console.log(require.resolve(${JSON.stringify(RFC_MODULE)}))`,
    ],
    { cwd: repoRoot, env: runEnv, encoding: 'utf8' },
  );
  if (probe.status !== 0) {
    throw new Error(
      `${RFC_MODULE} is not loadable after \`${npmStep}\` — npm skips a failed build of an optional dependency without failing; see the build output above.\n${probe.stderr || probe.stdout}`,
    );
  }
  const resolved = probe.stdout.trim();
  if (!path.resolve(resolved).startsWith(path.join(repoRoot, 'node_modules'))) {
    throw new Error(
      `${RFC_MODULE} loaded from ${resolved}, not from this repo's node_modules`,
    );
  }
  console.log(`RFC module OK (${platform}-${arch}, SDK ${sdkDir})`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    main();
  } catch (error) {
    console.error(
      `setup:rfc failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }
}
