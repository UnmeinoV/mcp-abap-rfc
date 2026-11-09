# RFC setup

mcp-abap-rfc talks to SAP only through the SAP NW RFC SDK (function module
`SADT_REST_RFC_ENDPOINT` carries every ADT request). The RFC session is one
stateful ABAP session, so lock handles persist across calls.

## 1. SDK and native module: `npm run setup:rfc`

The SDK is SAP software and is not distributed with this repository. Download it from
SAP and unpack it into the directory for your platform (see [runtime/README.md](../../runtime/README.md)):

| platform | directory | status |
|---|---|---|
| Linux x86_64 | `runtime/linux/x86/nwrfcsdk` | measured |
| Linux arm64 | `runtime/linux/arm/nwrfcsdk` | untested (未实测) |
| macOS x64 (Intel) | `runtime/macos/nwrfcsdk` | untested (未实测) |
| macOS arm64 (Apple silicon) | none — the SDK is x86_64-only | refused by `setup:rfc`; use an x64 Node under Rosetta (未实测) |
| Windows x64 | `runtime/windows/nwrfcsdk` | untested (未实测) |

```bash
npm ci
npm run setup:rfc
npm run build
```

`setup:rfc` (`scripts/setup-rfc.mjs`) picks the SDK by platform/arch, sets
`SAPNWRFC_HOME`, (re)builds the optional dependency `@mcp-abap-adt/sap-rfc-lite`
(pinned 0.1.2) and loads it once in a fresh process. A platform with no SDK
directory is refused, naming the missing directory. On an arm64 Mac it refuses
before building: every dylib in `runtime/macos/nwrfcsdk/lib` is
`Mach-O 64-bit x86_64`, so install an x64 (Intel) Node, run it under Rosetta
(`arch -x86_64 …`) and run `setup:rfc` with that Node.

npm is started with the running Node and npm's own CLI (`npm_execpath`), without
a shell; `RFC_TRACE_DIR` points into the temp directory during the build and the
load check, so `dev_rfc.log` / `rfc*.trc` never land in the repository.

Why a separate step: the module's install script compiles against the SDK, and
`npm ci` silently drops an optional dependency whose native build fails. If the
module is missing the server refuses to start with "run: npm run setup:rfc".
`setup:rfc` may run `npm install --no-save`, which can touch `node_modules`
beyond this one package.

How the library is found at run time:

- Linux: the SDK `lib` directory is baked into the binary as RUNPATH
  (absolute). **After moving or copying the repository, run `setup:rfc` again.**
  No `LD_LIBRARY_PATH` is needed.
- macOS (x64, untested — 未实测): the RUNPATH is NOT what finds the SDK. Read
  from the Mach-O load commands, `libsapnwrfc.dylib` and `libsapucum.dylib` have
  the install names `@loader_path/libsapnwrfc.dylib` / `@loader_path/libsapucum.dylib`,
  so the built module looks for them in its own directory; the ICU libraries
  (`libicu*57.dylib`) are loaded by the SDK at run time. `setup:rfc` therefore
  copies every `runtime/macos/nwrfcsdk/lib/*.dylib` next to
  `node_modules/@mcp-abap-adt/sap-rfc-lite/build/Release/sapnwrfc.node` after the
  build. Those are copies: **after moving or copying the repository, or after
  anything rebuilds the module, run `setup:rfc` again.**
- Windows: before loading the module the server (`src/lib/rfcModule.ts`,
  `assertRfcModuleLoadable`) prepends `runtime/windows/nwrfcsdk/lib` to `PATH`,
  whichever entry point started it (`bin/`, `dist/server/launcher.js`, `dist/index.js`).

## 2. SAP authorization

The user needs `S_RFC` for function module `SADT_REST_RFC_ENDPOINT` (SAP Note
3569684), plus the usual ADT authorizations.

## 3. env file

```env
SAP_ASHOST=<application server host or IP>
SAP_SYSNR=00
SAP_CLIENT=100
SAP_USERNAME=DEVELOPER
SAP_PASSWORD=...
SAP_LANGUAGE=EN
# SAP_SAPROUTER=/H/1.2.3.4/H/
```

See `.env.example` for every key. `SAP_DENY_TOOLS`, `SAP_ALLOWED_PACKAGES`,
`SAP_AUDIT_LOG_FILE`, `SAP_TIMEOUT_*`, `MCP_MAX_RESULT_CHARS` and `RFC_TRACE_DIR`
may be set in the env file too (same precedence: the file wins over the shell,
even when empty; `--max-result-chars` wins over the file). A refused key says
where its value came from: `(in <file>)`, or `(in the shell environment — unset it)`. `SAP_ASHOST` must be a host (no URL), `SAP_SYSNR`
is required (two digits, never defaulted). `SAP_URL`, `SAP_CONNECTION_TYPE=http`,
`SAP_AUTH_TYPE` other than basic and `SAP_SYSTEM_TYPE=cloud` are refused at startup,
naming the key; a leftover shell `SAP_URL` also refuses startup — unset it.
`SAP_CONNECTION_TYPE=rfc`, `SAP_AUTH_TYPE=basic` and `SAP_SYSTEM_TYPE=onprem` are
accepted as harmless. A key the file defines wins over
the shell, even when empty.

`SAP_LANGUAGE` is the RFC logon language (default EN). Objects you create get it
as original language (TADIR-MASTERLANG); `sap-language` on a URL is ignored over RFC.

RFC payload compression is off by default: a request body that compresses badly
(base64, e.g. the pre-activation check of a large program) otherwise dumps on the
server with `XML_FORMAT_ERROR`. `SAP_RFC_COMPRESSION=on` restores the SDK default.

## 4. SAProuter

See [SAPROUTER_ZH.md](SAPROUTER_ZH.md). `SAP_SAPROUTER` is passed to the SDK; if the
dependency can no longer take it the server fails instead of connecting route-less.

## 5. Trace files

The SDK writes `rfc*.trc` (and `dev_rfc.log`) into the current directory even at
trace level 0. The launcher sets `RFC_TRACE_DIR` to `<tmpdir>/mcp-abap-rfc-rfc-trace`
unless you set one (in the env file or the shell), before the RFC module is loaded.

## 6. Several clients of the same system

```
SAP_CLIENT=100
SAP_CLIENTS=100,800
# only when client 800 uses another user:
# SAP_CLIENT_800_USERNAME=...
# SAP_CLIENT_800_PASSWORD=...
```

Every tool then takes an optional `sap_client`; omitted means `SAP_CLIENT`. Each
client has its own connection, opened on first use, and every result ends with a
`sap_client: <n>` line. Repository objects are shared by all clients of a system.

## 7. Live check

```bash
node tools/smoke-rfc.mjs --env-path=<file> [--second-client=<n>]
```

Five read-only checks against the real system: GetSession (the version must be
`package.json`'s), SQL on T000 (non-empty, and it holds the env file's default
client), a second client (only with `--second-client=<n>`, a client listed in
`SAP_CLIENTS`; otherwise SKIP), GetClass, GetTranslation (needs the RFC helper
`ZMCP_LXE` installed — `SetupTranslationHelper`). It prints no env values, and a
FAIL line carries no tool-result text.

## Troubleshooting

- "run: npm run setup:rfc" at startup: the native module is missing or cannot load.
- "The specified module could not be found: sapnwrfc.node" (Windows): the SDK DLLs
  are not on `PATH`; check that `runtime/windows/nwrfcsdk/lib` exists.
- macOS "Library not loaded: @loader_path/libsapnwrfc.dylib": the dylibs are not
  next to `sapnwrfc.node` (moved repo, or a rebuild outside `setup:rfc`); run
  `npm run setup:rfc` again.
- "Failed to open RFC connection": SAP's reason is in the message. Behind a
  SAProuter, `route permission denied` is the router's `saprouttab`, not credentials.
