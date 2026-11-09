# 架构文档

- [STATEFUL_SESSION_GUIDE.md](STATEFUL_SESSION_GUIDE.md) - lock/update/unlock 的有状态请求流程
- [TOOLS_ARCHITECTURE.md](TOOLS_ARCHITECTURE.md) - 工具与 handler 的组织方式、`TOOL_DEFINITION`、`available_in`

本服务只有 stdio 一种对外传输，连接 SAP 只走 RFC；没有 HTTP/SSE 服务器类。
