# mcp-abap-rfc

[English](README.md)

面向 SAP ABAP 开发的 MCP 服务：连 SAP **只走 RFC**（可经 SAProuter），连客户端**只用 stdio**。读写 ABAP 开发对象：类、CDS、表、程序、传输请求、ATC、单元测试、运行时诊断等。不支持 HTTP、BTP、JWT、service key。

## 平台

仓库不附带 SAP NW RFC SDK：请从 SAP 下载，按 [runtime/README.md](runtime/README.md) 解压到 `runtime/`。

| 平台 | 状态 |
|---|---|
| Linux x86_64 | 已实测 |
| Linux arm64 | 未实测 |
| macOS x64（Intel） | 未实测 |
| macOS arm64（Apple 芯片） | 不支持：SDK 只有 x86_64。可用 x64 版 Node 经 Rosetta 运行（未实测）。 |
| Windows x64 | 未实测 |

需要 Node >= 22。

## 安装

```bash
npm ci && npm run setup:rfc && npm run build
```

`npm run setup:rfc` 按平台选 SDK，用它构建原生 RFC 模块，并检查能否加载。模块加载不了时，服务拒绝启动并提示运行 `setup:rfc`。

**移动或复制仓库后要重新运行 `setup:rfc`。** Linux 上 SDK 路径会写进构建产物，macOS 上 SDK 库会复制到模块旁边。详见 [docs/installation/RFC_SETUP.md](docs/installation/RFC_SETUP.md)，经 SAProuter 连接见 [docs/installation/SAPROUTER_ZH.md](docs/installation/SAPROUTER_ZH.md)。

## 配置

复制 `.env.example` 填写，执行 `chmod 600`，放在仓库外面。

| 键 | |
|---|---|
| `SAP_ASHOST` | 必填：应用服务器主机名或 IP（不是 URL） |
| `SAP_SYSNR` | 必填：两位实例号 |
| `SAP_CLIENT` | 必填：默认集团 |
| `SAP_USERNAME` / `SAP_PASSWORD` | 必填 |
| `SAP_LANGUAGE` | 登录语言，默认 `EN`。**新建对象的原始语言就是它。** |
| `SAP_SAPROUTER` | 可选：router 串，如 `/H/1.2.3.4/H/` |
| `SAP_CLIENTS` | 可选：多集团，见下文 |
| `SAP_SYSTEM_TYPE` | `onprem`（默认）或 `legacy` |
| `SAP_DENY_TOOLS` / `SAP_ALLOWED_PACKAGES` / `SAP_AUDIT_LOG_FILE` | 可选：安全护栏，见 `.env.example` |

env 文件里定义了的键优先于 shell 环境变量，值为空也算。不支持的设置（`SAP_URL`、HTTP 连接方式、JWT 认证、cloud 系统类型）会阻止启动，报错时指出是哪个键。

## 启动

```json
{
  "mcpServers": {
    "abap-rfc": {
      "command": "node",
      "args": [
        "<path>/bin/mcp-abap-rfc.js",
        "--env-path=<env 文件绝对路径>",
        "--exposition=readonly,high"
      ]
    }
  }
}
```

`--exposition` 可组合 `readonly`、`high`、`low`；`compact` 只能单独使用。见 [HANDLERS_MANAGEMENT.md](docs/user-guide/HANDLERS_MANAGEMENT.md) 和[工具列表](docs/user-guide/AVAILABLE_TOOLS.md)。

只读的实机检查：

```bash
node tools/smoke-rfc.mjs --env-path=<env 文件> [--second-client=<n>]
```

## 多集团

```
SAP_CLIENT=100
SAP_CLIENTS=100,800
# 可选，某个集团用单独的账号：
# SAP_CLIENT_800_USERNAME=...
# SAP_CLIENT_800_PASSWORD=...
```

每个工具多一个可选参数 `sap_client`，每个结果末尾有一行 `sap_client: <n>`。

## SAP 端助手

两组工具需要 SAP 上一个支持 RFC 的 Z 函数组，各自有一个安装工具：

| 工具 | 助手 | 安装工具 |
|---|---|---|
| `GetTranslation` / `UpdateTranslation` / `AddTranslationToTransport` | `ZMCP_LXE` | `SetupTranslationHelper` |
| `CreateTransaction` / `DeleteTransaction` | `ZMCP_TRAN` | `SetupTransactionHelper` |

安装助手会往系统写 Z 代码，需先征得系统负责人同意。同一系统上的其他工具可能依赖助手的版本号，不要随意改助手源码或版本。

## 开发

```bash
npx jest --testPathIgnorePatterns='integration' --testPathIgnorePatterns='__tests__/admin/'
npm run test:scripts
npm run docs:tools
```

## 许可

MIT，见 [LICENSE](LICENSE)。`runtime/` 中的 SAP NW RFC SDK 属于 SAP 软件，适用 SAP 自己的许可条款。
