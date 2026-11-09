import type { AbapConnection, SapConfig } from '@mcp-abap-adt/connection';
import type { Logger } from '@mcp-abap-adt/logger';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import type { HandlerContext } from '../handlers/interfaces.js';
import { toolResultMeta } from '../lib/config/maxResultChars.js';
import { createAbapConnection } from '../lib/connectionFactory.js';
import type {
  IHandlersRegistry,
  SapEnvironment,
} from '../lib/handlers/interfaces.js';
import { CompositeHandlersRegistry } from '../lib/handlers/registry/CompositeHandlersRegistry.js';
import { jsonSchemaToZod } from '../lib/handlers/utils/schemaUtils.js';
import {
  exportRfcSettingsToProcessEnv,
  type RfcSettings,
} from '../lib/rfcEnv.js';
import {
  assertConnectionIsDefaultClient,
  connectionParamsForClient,
  getSapClientConfig,
  markClientConnected,
  responsibleOverrideForClient,
  type SapClientConfig,
} from '../lib/sapClients.js';
import { buildAuditEntry, writeAuditEntry } from '../lib/security/auditLog.js';
import {
  checkPackageAllowed,
  checkToolDenied,
  loadWriteGuardConfig,
} from '../lib/security/writeGuard.js';
import {
  resetSystemContextCache,
  resolveSystemContext,
  runWithSystemContextOverride,
} from '../lib/systemContext.js';
import type { ConnectionContext } from './ConnectionContext.js';
import {
  injectSapClientParam,
  labelContent,
  labelErrorMessage,
  takeSapClient,
} from './sapClientRouting.js';

/** The one stdio session; equal to the destination so the connection is cached. */
const STDIO_SESSION = 'default';

/**
 * Base MCP Server class that extends SDK McpServer
 * Manages connection context and provides connection injection for handlers
 */
export abstract class BaseMcpServer extends McpServer {
  /**
   * Logger used for handler context
   */
  protected readonly logger: Logger;

  /**
   * Connection context (set once at startup)
   */
  protected connectionContext: ConnectionContext | null = null;

  /**
   * stdio connection cache, one entry per SAP client ('' when multi-client is
   * off). The PROMISE is cached so concurrent first calls share one logon; a
   * failed logon removes its entry so the next call retries.
   */
  private readonly cachedConnections = new Map<
    string,
    Promise<AbapConnection>
  >();

  /**
   * Per-instance SAP system type. Overrides process.env.SAP_SYSTEM_TYPE
   * for `available_in` filtering at handler registration time.
   */
  protected readonly systemType?: SapEnvironment;

  constructor(options: {
    name: string;
    version?: string;
    logger?: Logger;
    systemType?: SapEnvironment;
  }) {
    super({ name: options.name, version: options.version ?? '1.0.0' });
    this.logger = options.logger ?? getDefaultLogger();
    this.systemType = options.systemType;
  }

  /**
   * The multi-client configuration this server honours.
   */
  protected sapClientConfig(): SapClientConfig | undefined {
    return getSapClientConfig();
  }

  /**
   * Sets the connection context from the RFC settings. Called once at startup.
   *
   * The settings are also published to process.env first: the connection
   * factory reads SAP_SAPROUTER / SAP_LANGUAGE / SAP_RFC_COMPRESSION from
   * there, and without them the connection would go out route-less.
   */
  protected async setConnectionContext(settings: RfcSettings): Promise<void> {
    resetSystemContextCache();
    exportRfcSettingsToProcessEnv(settings);

    const connectionParams: SapConfig = {
      url: settings.serviceUrl,
      authType: 'basic',
      username: settings.username,
      password: settings.password,
      client: settings.client,
      connectionType: 'rfc',
    };

    // Resolve masterSystem/responsible early so handlers get proper context
    // Create a temporary connection to call getSystemInformation
    let masterSystem: string | undefined;
    let responsible: string | undefined;
    try {
      const tempConn = createAbapConnection({ ...connectionParams });
      let systemCtx: Awaited<ReturnType<typeof resolveSystemContext>>;
      try {
        systemCtx = await resolveSystemContext(tempConn);
      } finally {
        // An RFC connection holds an SAP session open until closed.
        await (tempConn as { close?: () => Promise<void> })
          .close?.()
          .catch(() => {});
      }
      masterSystem = systemCtx.masterSystem;
      responsible = systemCtx.responsible;
      this.logger.debug(
        `[BaseMcpServer] Resolved systemContext: masterSystem=${masterSystem}, responsible=${responsible}, client=${systemCtx.client || '(none)'}`,
      );
    } catch (error) {
      // To stderr unconditionally, not through the logger (silent unless
      // DEBUG_AUTH_LOG): without this context every Create* lacks a
      // responsible user and fails later with PAK/049, far from the cause.
      process.stderr.write(
        `[MCP] WARNING: could not resolve the system context (masterSystem/responsible); Create* tools may fail with PAK/049 until SAP_RESPONSIBLE/SAP_MASTER_SYSTEM are set in the env file: ${error instanceof Error ? error.message : String(error)}\n`,
      );
    }

    // sessionId === metadata.destination is what makes getConnection cache
    // the connection (one RFC logon per client for the whole process).
    this.connectionContext = {
      sessionId: STDIO_SESSION,
      connectionParams,
      metadata: {
        destination: STDIO_SESSION,
        masterSystem,
        responsible,
      },
    };
  }

  /**
   * Gets current connection context
   */
  protected getConnectionContext(): ConnectionContext | null {
    return this.connectionContext;
  }

  /**
   * Gets ABAP connection from connection context
   * Creates connection using connectionParams from context
   * For stdio mode: caches connection and reuses it for all requests
   */
  protected async getConnection(sapClient?: string): Promise<AbapConnection> {
    if (!this.connectionContext?.connectionParams) {
      throw new Error(
        'Connection context not set. Call setConnectionContext() first.',
      );
    }

    const destination = this.connectionContext.metadata?.destination as
      | string
      | undefined;
    const sessionId = this.connectionContext.sessionId;
    const clientConfig = this.sapClientConfig();
    if (clientConfig) {
      assertConnectionIsDefaultClient(
        this.connectionContext.connectionParams.client,
        clientConfig,
      );
    }
    const client = clientConfig
      ? (sapClient ?? clientConfig.defaultClient)
      : undefined;
    const params =
      clientConfig && client
        ? connectionParamsForClient(
            this.connectionContext.connectionParams,
            client,
            clientConfig,
          )
        : this.connectionContext.connectionParams;

    // stdio (sessionId === destination): one connection per client, reused.
    // SSE/HTTP: a new connection per request, as before.
    const isStdio = !!destination && sessionId === destination;
    const cacheKey = client ?? '';
    if (isStdio) {
      const cached = this.cachedConnections.get(cacheKey);
      if (cached) return cached;
    }

    const opening = this.openConnection(params);
    if (isStdio) {
      this.cachedConnections.set(cacheKey, opening);
      opening.catch(() => {
        if (this.cachedConnections.get(cacheKey) === opening) {
          this.cachedConnections.delete(cacheKey);
        }
      });
    }
    const connection = await opening;
    if (client) markClientConnected(client);
    return connection;
  }

  private async openConnection(params: SapConfig): Promise<AbapConnection> {
    const connection = createAbapConnection(params);

    // Establish the RFC session before the first request.
    await connection.connect();
    return connection;
  }

  /** Optional request scope; existing authentication paths retain their behavior. */
  protected runInContext<T>(work: () => Promise<T>): Promise<T> {
    return work();
  }

  /**
   * Registers handlers from registry
   * Wraps handlers to inject connection as first parameter
   *
   * Handler signature: (connection: AbapConnection, args: any) => Promise<any>
   * Registered as: (args: any) => handler(getConnection(), args)
   *
   * This ensures connection is injected but NOT exposed in MCP tool signature
   */
  protected registerHandlers(handlersRegistry: IHandlersRegistry): void {
    // Loaded once at registration time (env vars set at startup do not change mid-session), not
    // per call — see src/lib/security/writeGuard.ts for what these actually cover.
    const writeGuardConfig = loadWriteGuardConfig();
    const clientConfig = this.sapClientConfig();
    // Opt-in _meta["anthropic/maxResultSizeChars"] (--max-result-chars); undefined by default.
    const resultMeta = toolResultMeta();

    // Get handler groups from registry
    if (handlersRegistry instanceof CompositeHandlersRegistry) {
      const groups = handlersRegistry.getHandlerGroups();

      for (const group of groups) {
        const handlers = group.getHandlers();
        for (const entry of handlers) {
          // Wrap handler to inject connection from context
          // Original handler: (context: HandlerContext, args: any) => Promise<any>
          type HandlerFnWithContext = (
            context: HandlerContext,
            args: unknown,
          ) => Promise<unknown>;
          type HandlerFnArgsOnly = (args: unknown) => Promise<unknown>;

          const wrappedHandler = async (rawArgs: unknown) => {
            // sap_client is the server's, not the handler's: split it off
            // before anything else sees the arguments.
            const { sapClient, args } = clientConfig
              ? takeSapClient(rawArgs)
              : { sapClient: undefined, args: rawArgs };
            const effectiveClient = clientConfig
              ? (sapClient ?? clientConfig.defaultClient)
              : undefined;
            const toolName = entry.toolDefinition.name;
            const startedAt = Date.now();

            // Guardrails checked BEFORE any SAP connection is established — a refused call never
            // pays for (or triggers) a connect. Both are OFF by default; see writeGuard.ts.
            const refusal =
              checkToolDenied(toolName, writeGuardConfig) ??
              checkPackageAllowed(
                args as Record<string, unknown> | undefined,
                writeGuardConfig,
              );
            if (refusal) {
              writeAuditEntry(
                buildAuditEntry(
                  toolName,
                  rawArgs,
                  false,
                  Date.now() - startedAt,
                  refusal.reason,
                ),
                process.env,
                this.logger,
              );
              throw new McpError(ErrorCode.InvalidRequest, refusal.reason);
            }

            try {
              // Get connection from context (this.connectionContext)
              const context: HandlerContext = {
                connection: await this.getConnection(sapClient),
                logger: this.logger,
              };
              const scopeOverride =
                clientConfig && effectiveClient
                  ? responsibleOverrideForClient(effectiveClient, clientConfig)
                  : {};

              // If handler expects context+args (preferred), pass both.
              // Otherwise, update group context and call with args only for backward compatibility.
              // NOTE: Always await the handler result to ensure we get the resolved value for normalization
              const result = await runWithSystemContextOverride(
                scopeOverride,
                () => {
                  let handlerPromise: Promise<unknown>;
                  if ((entry.handler as HandlerFnWithContext).length >= 2) {
                    handlerPromise = (entry.handler as HandlerFnWithContext)(
                      context,
                      args,
                    );
                  } else {
                    try {
                      const contextAwareGroup = group as Partial<{
                        setContext: (ctx: HandlerContext) => void;
                        context: HandlerContext;
                      }>;
                      if (typeof contextAwareGroup.setContext === 'function') {
                        contextAwareGroup.setContext(context);
                      } else {
                        contextAwareGroup.context = context;
                      }
                    } catch {
                      // ignore if group doesn't expose context setter
                    }
                    handlerPromise = (entry.handler as HandlerFnArgsOnly)(args);
                  }
                  return handlerPromise;
                },
              );

              // Handle errors: if handler returns isError, throw McpError
              type ContentItem = {
                type?: string;
                json?: unknown;
                text?: unknown;
              };
              type ToolResult = {
                isError?: boolean;
                content?: ContentItem[];
              };

              if ((result as ToolResult | undefined)?.isError) {
                const errorText =
                  ((result as ToolResult | undefined)?.content || [])
                    .map((item) => {
                      if (item?.type === 'json' && item.json !== undefined) {
                        return JSON.stringify(item.json);
                      }
                      return item?.text !== undefined
                        ? String(item.text)
                        : String(item);
                    })
                    .join('\n') || 'Unknown error';
                // Audited once, uniformly, by the catch block below — not here, to avoid a
                // second entry for the same failure.
                throw new McpError(
                  ErrorCode.InternalError,
                  effectiveClient
                    ? labelErrorMessage(errorText, effectiveClient)
                    : errorText,
                );
              }

              // Normalize content: SDK expects text/image/audio/resource, convert custom json to text
              const content = (
                (result as ToolResult | undefined)?.content || []
              ).map((item) => {
                if (item?.type === 'json' && item.json !== undefined) {
                  return {
                    type: 'text' as const,
                    text: JSON.stringify(item.json),
                  };
                }
                // Ensure all items have proper text type structure
                return {
                  type: 'text' as const,
                  text:
                    item?.text !== undefined
                      ? String(item.text)
                      : String(item || ''),
                };
              });

              writeAuditEntry(
                buildAuditEntry(
                  toolName,
                  rawArgs,
                  true,
                  Date.now() - startedAt,
                ),
                process.env,
                this.logger,
              );
              return {
                content: effectiveClient
                  ? labelContent(content, effectiveClient)
                  : content,
              };
            } catch (error) {
              if (effectiveClient && error instanceof Error) {
                error.message = labelErrorMessage(
                  error.message,
                  effectiveClient,
                );
              }
              // Already audited above when it came from a handler-reported isError; anything
              // else (a thrown exception from getConnection()/the handler itself) is audited
              // here, once, then rethrown unchanged — this wrapper never swallows an error.
              const message =
                error instanceof Error ? error.message : String(error);
              writeAuditEntry(
                buildAuditEntry(
                  toolName,
                  rawArgs,
                  false,
                  Date.now() - startedAt,
                  message,
                ),
                process.env,
                this.logger,
              );
              throw error;
            }
          };

          // Convert JSON Schema to Zod if needed, otherwise pass as-is
          const zodSchema =
            entry.toolDefinition.inputSchema &&
            typeof entry.toolDefinition.inputSchema === 'object' &&
            entry.toolDefinition.inputSchema.type === 'object' &&
            entry.toolDefinition.inputSchema.properties
              ? jsonSchemaToZod(entry.toolDefinition.inputSchema)
              : entry.toolDefinition.inputSchema;

          // Skip tools not available in the current SAP environment
          const availableIn = entry.toolDefinition.available_in;
          if (availableIn && availableIn.length > 0) {
            const resolvedType =
              this.systemType ?? process.env.SAP_SYSTEM_TYPE?.toLowerCase();
            const currentEnv: SapEnvironment =
              resolvedType === 'legacy' ? 'legacy' : 'onprem';
            if (!availableIn.includes(currentEnv)) {
              this.logger.debug(
                `[BaseMcpServer] Skipping tool ${entry.toolDefinition.name}: available_in=${JSON.stringify(availableIn)}, currentEnv=${currentEnv}, source=${this.systemType ? 'option' : 'env'}, SAP_SYSTEM_TYPE=${process.env.SAP_SYSTEM_TYPE || '(not set)'}`,
              );
              continue;
            }
          }

          const inputSchema = clientConfig
            ? injectSapClientParam(
                zodSchema,
                clientConfig,
                entry.toolDefinition.name,
              )
            : zodSchema;

          // Register wrapped handler via SDK registerTool
          // Note: connection is NOT part of MCP tool signature
          this.registerTool(
            entry.toolDefinition.name,
            {
              description: entry.toolDefinition.description,
              inputSchema,
              ...(resultMeta ? { _meta: resultMeta } : {}),
            },
            (args: unknown) => this.runInContext(() => wrappedHandler(args)),
          );
        }
      }
    } else {
      // Fallback: use registerAllTools directly (handlers won't have connection injected)
      // This should not happen in normal flow
      handlersRegistry.registerAllTools(this);
    }
  }
}

function getDefaultLogger(): Logger {
  return stderrLogger;
}

/**
 * Logger that writes all levels to stderr.
 * Safe for stdio mode — never writes to stdout (reserved for JSON-RPC protocol).
 */
const stderrLogger: Logger = {
  info: (msg: string) => process.stderr.write(`[INFO] ${msg}\n`),
  debug: (msg: string) => process.stderr.write(`[DEBUG] ${msg}\n`),
  warn: (msg: string) => process.stderr.write(`[WARN] ${msg}\n`),
  error: (msg: string) => process.stderr.write(`[ERROR] ${msg}\n`),
};
