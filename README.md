# mcp-abap-rfc

[中文](README.zh-CN.md)

An MCP server for SAP ABAP development that talks to the system **over RFC only** (optionally through a SAProuter) and to the client **over stdio only**. It reads and writes ABAP development objects: classes, CDS, tables, programs, transports, ATC, unit tests, runtime diagnostics and more. There is no HTTP, BTP, JWT or service-key support.

## Platforms

The SAP NW RFC SDK is not included: download it from SAP and unpack it into `runtime/` as described in [runtime/README.md](runtime/README.md).

| Platform | Status |
|---|---|
| Linux x86_64 | tested |
| Linux arm64 | untested |
| macOS x64 (Intel) | untested |
| macOS arm64 (Apple silicon) | not supported: the SDK is x86_64 only. Use an x64 Node under Rosetta (untested). |
| Windows x64 | untested |

Requires Node >= 22.

## Install

```bash
npm ci && npm run setup:rfc && npm run build
```

`npm run setup:rfc` picks the SDK for your platform, builds the native RFC module against it and checks that it loads. If the module cannot be loaded, the server refuses to start and tells you to run `setup:rfc`.

**Re-run `setup:rfc` after moving or copying the repository.** The SDK path is baked into the build on Linux, and the libraries are copied next to the module on macOS. See [docs/installation/RFC_SETUP.md](docs/installation/RFC_SETUP.md).

## Configuration

Copy `.env.example`, fill it in, `chmod 600` it, and keep it outside the repository.

| Key | |
|---|---|
| `SAP_ASHOST` | required: application server host or IP (not a URL) |
| `SAP_SYSNR` | required: two-digit instance number |
| `SAP_CLIENT` | required: default client |
| `SAP_USERNAME` / `SAP_PASSWORD` | required |
| `SAP_LANGUAGE` | logon language, default `EN`. **It becomes the original language of objects you create.** |
| `SAP_SAPROUTER` | optional route string, e.g. `/H/1.2.3.4/H/` |
| `SAP_CLIENTS` | optional: several clients, see below |
| `SAP_SYSTEM_TYPE` | `onprem` (default) or `legacy` |
| `SAP_DENY_TOOLS` / `SAP_ALLOWED_PACKAGES` / `SAP_AUDIT_LOG_FILE` | optional guardrails, see `.env.example` |

A key defined in the env file wins over the shell environment, even when its value is empty. Unsupported settings such as `SAP_URL`, HTTP connection types, JWT auth and cloud system type stop startup with a message that names the key.

## Run

```json
{
  "mcpServers": {
    "abap-rfc": {
      "command": "node",
      "args": [
        "<path>/bin/mcp-abap-rfc.js",
        "--env-path=<absolute path to env file>",
        "--exposition=readonly,high"
      ]
    }
  }
}
```

`--exposition` combines `readonly`, `high` and `low`; `compact` must be used alone. See [HANDLERS_MANAGEMENT.md](docs/user-guide/HANDLERS_MANAGEMENT.md) and the [tool list](docs/user-guide/AVAILABLE_TOOLS.md).

Read-only live check:

```bash
node tools/smoke-rfc.mjs --env-path=<env file> [--second-client=<n>]
```

## Several clients

```
SAP_CLIENT=100
SAP_CLIENTS=100,800
# optional per-client credentials:
# SAP_CLIENT_800_USERNAME=...
# SAP_CLIENT_800_PASSWORD=...
```

Every tool gains an optional `sap_client` argument, and every result ends with a `sap_client: <n>` line.

## SAP-side helpers

Two tool groups need a small RFC-enabled Z function group on the SAP system. Each has a setup tool that installs it:

| Tools | Helper | Installed by |
|---|---|---|
| `GetTranslation` / `UpdateTranslation` / `AddTranslationToTransport` | `ZMCP_LXE` | `SetupTranslationHelper` |
| `CreateTransaction` / `DeleteTransaction` | `ZMCP_TRAN` | `SetupTransactionHelper` |

Installing a helper writes Z code to the system, so ask the system owner first. Other tools on the same system may depend on the helper's version, so don't change the helper source or version casually.

## Development

```bash
npx jest --testPathIgnorePatterns='integration' --testPathIgnorePatterns='__tests__/admin/'
npm run test:scripts
npm run docs:tools
```

## License

MIT, see [LICENSE](LICENSE). The SAP NW RFC SDK in `runtime/` is SAP software under SAP's own license terms.
