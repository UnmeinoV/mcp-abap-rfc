# SAP NW RFC SDK

The SAP NetWeaver RFC SDK is SAP software and is not distributed with this repository. Download SDK 7.50 for your platform from the SAP Support Portal (an S-user is required). Then unpack it so that each platform's directory contains `include/` and `lib/`:

| Platform | Directory |
|---|---|
| Linux x86_64 | `runtime/linux/x86/nwrfcsdk` |
| Linux arm64 (aarch64) | `runtime/linux/arm/nwrfcsdk` |
| macOS x64 | `runtime/macos/nwrfcsdk` |
| Windows x64 | `runtime/windows/nwrfcsdk` |

Then run `npm run setup:rfc`. Everything in this directory except this file is git-ignored.

---

SAP NW RFC SDK 属于 SAP 软件，本仓库不附带。请用 S-user 从 SAP Support Portal 下载对应平台的 SDK 7.50，解压到上表的目录，保证目录下有 `include/` 和 `lib/`，然后运行 `npm run setup:rfc`。本目录下除这个文件外都被 git 忽略。
