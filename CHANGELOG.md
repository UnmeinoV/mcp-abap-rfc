# Changelog

## 0.1.0

First release.

- Connects to SAP only through the SAP NW RFC SDK, optionally via SAProuter; the system is addressed by `SAP_ASHOST` / `SAP_SYSNR`. MCP over stdio only.
- Multi-client support (`SAP_CLIENTS` + per-call `sap_client`), RFC helpers `ZMCP_LXE` (translation) and `ZMCP_TRAN` (transaction codes), and guardrails (`SAP_DENY_TOOLS`, `SAP_ALLOWED_PACKAGES`, `SAP_AUDIT_LOG_FILE`).
- `npm run setup:rfc` builds the native RFC module against the SDK in `runtime/` (download it from SAP). Only linux-x64 has been tested.
- `SAP_LANGUAGE` is the RFC logon language (default EN).
- Unsupported options and env keys (HTTP, BTP, JWT, cloud, `SAP_URL`) are refused at startup, naming them.
