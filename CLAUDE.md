# mcp-abap-rfc - 开发约定

只走 RFC、只用 stdio 的 SAP ABAP MCP 服务。只写仍然成立的结论，不写历史。

## 必须保留的 RFC 行为（删/改前先看）

- `src/lib/connectionFactory.ts`：`saprouter` / `lang` 注入（依赖不再暴露 `rfcParams` 时抛错，不许无路由连接）；`no_compression: '1'`（`SAP_RFC_COMPRESSION=on` 关闭）；默认 `Accept` 头（RFC 不发则 ADT 回 400）；`RFC_TRACE_DIR` 默认到 tmp；首次使用时 open；`GENERATE_SUBPOOL_DIR_FULL` 时重置会话，只读请求重发一次、写请求不重发；`invalidateSession` = close+reopen；`endRfcSession()`；`callFunction`；重置前等在途请求。
- `src/lib/sapExceptionMessage.ts`：把 SAP 异常 XML 附到错误文本。
- `src/lib/rfcAddress.ts`：ASHOST 必须是主机、SYSNR 两位且不默认 00；SAP_URL 只是内部派生值（`http://<ashost>:80<sysnr>`，依赖需要），不是用户配置。
- 多 client 路由三条安全约束（`multiClientRouting.test.ts` 钉住）：handler 读共享可变 context，所以 `setContext` 与 `handler(args)` 之间不能有 `await`；连接缓存存 Promise（并发首次调用共用一次登录，失败要摘掉）；numbered 的 `SAP_CLIENT_<n>_*` 密码不进 `process.env`。
- SDK 按进程缓存函数签名：助手在进程内升级后，同一进程仍用旧签名。报错应说**重启服务**，不要说"再跑 setup"（会循环）。比已安装助手版本旧的服务不得降级它。

## 语言

- RFC 下 URL 上的 `sap-language` 无效，会话语言就是 RFC 登录语言（`lang`）。
- `SAP_LANGUAGE` 作为登录语言生效，缺省 EN。**新建对象的原始语言（TADIR-MASTERLANG）就是它**。要 EN 原始语言就写 `SAP_LANGUAGE=EN`。
- 一个连接不能改变它写入的语言；`sessionLanguage.ts` 对换语言的写拒绝而不是修复。

## 配置规则

- env 文件里定义了的键以文件为准（即使值为空），shell 只补文件没提的键；`--system-type` 优先于文件。
- `SAP_SYSTEM_TYPE`：`onprem`（默认）/ `legacy`；`cloud` 拒绝。
- 启动即拒绝并指名该键：`SAP_URL`、`SAP_CONNECTION_TYPE=http`、`SAP_AUTH_TYPE` 非 basic、HTTP/SSE/BTP 选项（清单见 `src/lib/rfcEnv.ts`、`src/lib/config/removedOptions.ts`）。`--transport=stdio`、`--connection-type=rfc` 是无害选项。shell 里残留的 `SAP_URL` 等同样拒绝，让用户 unset。`SAP_CONNECTION_TYPE=rfc`、`SAP_AUTH_TYPE=basic`、`SAP_SYSTEM_TYPE=onprem` 作为无害键接受。
- 这些键下游直接读 `process.env`：`SAP_DENY_TOOLS`、`SAP_ALLOWED_PACKAGES`、`SAP_AUDIT_LOG_FILE`、`SAP_TIMEOUT_*`、`MCP_MAX_RESULT_CHARS`、`RFC_TRACE_DIR`。启动器在加载 RFC 模块**之前**从 env 文件桥接它们（`rfcEnv.ts` 的 `applyEnvFileBridge`，同样文件优先、空值也算），所以写进 env 文件生效；`--max-result-chars` 优先于文件，`MCP_MAX_RESULT_CHARS` 不合法拒绝启动并指名键和文件。`launcherTraceDirOrder.test.ts` 钉住 桥接 → `defaultRfcTraceDir()` → `assertRfcModuleLoadable()` 的顺序。SAP_DENY_TOOLS 从文件经真实 write guard 拒绝工具，`envFileBridge.test.ts` 钉住。
- 被拒绝的键说明来源：文件里定义的说 `(in <文件>)`，只在 shell 里的说 `(in the shell environment — unset it)`。
- `--exposition` 里不认识的名字（如 `hihg`）拒绝启动，列出可选值。
- `SAP_ALLOWED_PACKAGES` 只管 `Create*` 的 `package_name`，不管对已有对象的 Update/Delete/Activate。

## 其它已测结论

- 消息类建出来会被自己的 ABAP 会话锁住：RFC 下整条连接就是一个 ABAP 会话，`withExplicitStatelessHeader` 无效；`CreateMessageClass` 后用 `endRfcSession()`（连接是 stateful 时跳过并告警）。`GetSession force_new` 不结束任何 SAP 会话。
- NW RFC SDK 即使 trace 级别 0 也往**当前目录**写 `rfc*.trc`。启动器在加载 RFC 模块**之前**把 `RFC_TRACE_DIR` 默认设为 `<tmpdir>/mcp-abap-rfc-rfc-trace`（`launcher.ts` 里 `defaultRfcTraceDir()` 先于 `assertRfcModuleLoadable()`，`launcherTraceDirOrder.test.ts` 钉住顺序）。
- Linux 上 `sap-rfc-lite` 的 RUNPATH 是构建时 SDK lib 的绝对路径：**移动或复制仓库后重跑 `npm run setup:rfc`**。macOS 不走 RUNPATH：从 Mach-O 读到 SDK 的 `libsapnwrfc`/`libsapucum` 安装名是 `@loader_path/…`（ICU 由 SDK 自己 dlopen），所以 `setup:rfc` 在 darwin-x64 构建后把 `lib/*.dylib` 复制到 `build/Release/sapnwrfc.node` 旁边（未实测；移动仓库同样要重跑）；SDK 只有 x86_64，darwin-arm64 在构建前拒绝，提示用 x64 Node 经 Rosetta。Windows 的 SDK `PATH` 前置在 `rfcModule.ts` 的 `assertRfcModuleLoadable` 里做（所有入口都经过它）。`setup:rfc` 构建与加载验证时设 `RFC_TRACE_DIR` 到临时目录，npm 经 `npm_execpath` 用当前 Node 无 shell 调用。`npm ci` 会悄悄丢掉构建失败的可选依赖，所以有 setup 脚本，且模块加载不了时服务拒绝启动。
- 不提供 `CallIcfService`，依据实机测量：RFC 下每个请求都经 ADT 的 `SADT_REST_RFC_ENDPOINT`，只能到 ADT REST 处理器，到不了任意 ICF。`GET /sap/opu/odata/iwfnd/catalogservice;v=2/` 答 `404 text/plain "No application class found for URI: …"`，是 ADT REST 分发器的话，不是 OData 服务的。ICF 调用需要 HTTP 连接，本服务不支持。
- 平台：只有 linux-x64 实测；linux-arm64、macOS x64、Windows 未实测，不许写成已验证；macOS arm64 拒绝（SDK 只有 x86_64）。

## RFC 助手（SAP 上的 `ZMCP_LXE`、`ZMCP_TRAN`）

ABAP 源码、函数组/函数名、`LXE_HELPER_VERSION`、TRAN 助手版本都是定死的，源码里注释的旧工具名也不改：源码任何变化都要升版本，而同一系统上别的安装会比对版本号，判为过期或拒绝降级。真要改助手，先决定是改名成新的函数组（如 `ZMCP_RFC_*`），还是协调所有使用方一起升版本。

## 测试与验证

- 单元测试：`npx jest --testPathIgnorePatterns='integration' --testPathIgnorePatterns='__tests__/admin/'`；脚本测试：`npm run test:scripts`。当前：80 suites / 867 tests 全过；脚本测试 11 项全过；`npm run test:check`（测试代码的 tsc）0 错误，pre-commit 也跑它。
- 集成测试套件没有带过来。实机验证用 `node tools/smoke-rfc.mjs --env-path=<file> [--second-client=<n>]`（5 项只读：GetSession 版本比对 package.json、T000 非空且含默认集团、第二个 client（只在给了 `--second-client` 时跑，否则 SKIP）、GetClass、GetTranslation（需已装 `ZMCP_LXE`））。旧版脚本经 SAProuter 实机 5/5 通过；当前脚本未实机跑过。
- `npm run docs:tools` 重新生成 `docs/user-guide/AVAILABLE_TOOLS*.md`（当前 377 个工具）。工具 schema 的字符预算见 `toolSchemaBudget.test.ts`：说明文字放进 `notes`（必须是模板字符串），预算超标名单只许缩短。
- 仓库里不得出现真实系统的标识（`shippedIdentifierHygiene.test.ts` 按 `<SID>K<6位数字>` 形状扫描）、env 文件、密码、`rfc*.trc`、日志。
