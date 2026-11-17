# Changelog

## Unreleased

- New tools: `MoveTransportObjects`; `DeployDdic` + `SetupDdicHelper` (helper `ZMCP_DDIC`, nested DDIC trees from one spec); `GetGuiStatus`, `AddGuiStatusButton`, `RemoveGuiStatusButton`, `CopyGuiStatus`, `DeleteGuiStatus` + `SetupGuiStatusHelper` (SE41 GUI statuses, helper `ZMCP_CUA`).
- Translation helper `ZMCP_LXE` is now version 4: `AddTranslationToTransport` records into the caller's task, and the helper gained the module `MoveTransportObjects` uses within one request. Run `SetupTranslationHelper` to update an installed version 3.
- `UpdateTextElements` sends a task's parent request as `corrNr` (the text-elements resource refuses a task).
- The six `Lock*Low` tools return SAP's `CORRNR`; the matching `Update*Low` tools take `transport_request` and fall back to the lock's `CORRNR`.
- `UpdateFunctionModule` no longer fails on a warnings-only check; warnings come back as `check_warnings`.
- A refused RFC logon is not retried in the same process.
- A helper rewritten after this process called it is refused until the server restarts, instead of answering with a signature the SDK cached before the rewrite. A first install never requires a restart, even when an earlier call in the process failed. Texts that ask for a restart carry `[MCP_RESTART_REQUIRED]`.

## 0.1.0

First release.

- Connects to SAP only through the SAP NW RFC SDK, optionally via SAProuter; the system is addressed by `SAP_ASHOST` / `SAP_SYSNR`. MCP over stdio only.
- Multi-client support (`SAP_CLIENTS` + per-call `sap_client`), RFC helpers `ZMCP_LXE` (translation) and `ZMCP_TRAN` (transaction codes), and guardrails (`SAP_DENY_TOOLS`, `SAP_ALLOWED_PACKAGES`, `SAP_AUDIT_LOG_FILE`).
- `npm run setup:rfc` builds the native RFC module against the SDK in `runtime/` (download it from SAP). Only linux-x64 has been tested.
- `SAP_LANGUAGE` is the RFC logon language (default EN).
- Unsupported options and env keys (HTTP, BTP, JWT, cloud, `SAP_URL`) are refused at startup, naming them.
