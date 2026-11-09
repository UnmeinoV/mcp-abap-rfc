import { AsyncLocalStorage } from 'node:async_hooks';
import * as crypto from 'node:crypto';
import { randomUUID } from 'node:crypto';
import {
  getTimeout,
  getTimeoutConfig,
  type SapConfig,
  sapConfigSignature,
} from '@mcp-abap-adt/connection';
import type { IAbapConnection, IAdtResponse } from '@mcp-abap-adt/interfaces';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { AxiosError, type AxiosResponse } from 'axios';
import {
  notifyConnectionResetListeners,
  registerConnectionResetHook,
} from './connectionEvents';
import { createAbapConnection } from './connectionFactory.js';
import { connectionManagerLogger, logger } from './logger';
import { loggerAdapter } from './loggerAdapter';
import { describeServerBuild } from './serverVersion';

// Initialize connection variables before exports to avoid circular dependency issues
// Variables are initialized immediately to avoid TDZ (Temporal Dead Zone) issues
let overrideConfig: SapConfig | undefined;
let overrideConnection: IAbapConnection | undefined;
let cachedConnection: IAbapConnection | undefined;
let cachedConfigSignature: string | undefined;

// Connection cache per session + config hash
interface ConnectionCacheEntry {
  connection: IAbapConnection;
  configSignature: string;
  sessionId: string;
  lastUsed: Date;
}

const connectionCache = new Map<string, ConnectionCacheEntry>();

// AsyncLocalStorage for storing session context
export const sessionContext = new AsyncLocalStorage<{
  sessionId?: string;
  sapConfig?: SapConfig;
  destination?: string;
}>();

// Fixed session ID for server connection (allows session persistence across requests)
const _SERVER_SESSION_ID = 'mcp-abap-rfc-session';

export type { AxiosResponse };
export { ErrorCode, getTimeout, getTimeoutConfig, logger, McpError };

/**
 * Encodes SAP object names for use in URLs.
 * Mirrors @mcp-abap-adt/adt-clients internal util but avoids unstable exports.
 */
export function encodeSapObjectName(objectName: string): string {
  return encodeURIComponent(objectName);
}

export function return_response(response: IAdtResponse | AxiosResponse) {
  return {
    isError: false,
    content: [
      {
        type: 'text',
        text: response.data,
      },
    ],
  };
}
/**
 * Safely serializes an error object, avoiding circular references
 */
function _safeStringifyError(error: any): string {
  if (error instanceof AxiosError) {
    // For Axios errors, extract safe information
    const safeError: any = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
    };

    // Safely extract response data
    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        safeError.responseData = error.response.data.substring(0, 1000); // Limit length
      } else {
        try {
          // Try to stringify, but catch circular reference errors
          safeError.responseData = JSON.stringify(error.response.data, null, 2);
        } catch (_e) {
          safeError.responseData = String(error.response.data).substring(
            0,
            1000,
          );
        }
      }
    }

    try {
      return JSON.stringify(safeError, null, 2);
    } catch (_e) {
      return `AxiosError: ${error.message} (Status: ${error.response?.status})`;
    }
  } else if (error instanceof Error) {
    return error.message;
  } else {
    try {
      return JSON.stringify(error, null, 2);
    } catch (_e) {
      return String(error);
    }
  }
}

/**
 * Safely logs an error without circular reference issues
 */
export function logErrorSafely(
  logger: any,
  operationName: string,
  error: any,
): void {
  if (!logger?.error) {
    return;
  }

  let errorMessage = `[ERROR] ${operationName} failed`;
  const errorDetails: any = {};

  if (error instanceof AxiosError && error.response) {
    errorMessage += ` - Status: ${error.response.status}`;
    if (error.response.statusText) {
      errorMessage += ` - StatusText: ${error.response.statusText}`;
    }
    errorDetails.status = error.response.status;
    errorDetails.statusText = error.response.statusText;
    errorDetails.responseHeaders = error.response.headers;

    // Safely extract response data
    if (error.response.data) {
      if (typeof error.response.data === 'string') {
        errorDetails.responseData = error.response.data.substring(0, 500);
      } else {
        try {
          errorDetails.responseData = JSON.stringify(
            error.response.data,
          ).substring(0, 500);
        } catch (_e) {
          errorDetails.responseData = String(error.response.data).substring(
            0,
            500,
          );
        }
      }
    }
  } else if (error instanceof Error) {
    errorMessage += `: ${error.message}`;
    errorDetails.message = error.message;
    errorDetails.stack = error.stack;
  } else {
    errorMessage += `: ${String(error)}`;
    errorDetails.rawError = String(error);
  }

  logger?.error(errorMessage, errorDetails);
}

/**
 * Extracts a user-facing ADT/SAP error message from Axios/ADT errors.
 * Prioritizes XML exception payloads (<exc:exception>) for detailed messages.
 */
export function extractAdtErrorMessage(
  error: any,
  fallback = 'Operation failed',
): string {
  if (!error) {
    return fallback;
  }

  const response = error?.response;
  const responseData = response?.data;

  if (typeof responseData === 'string') {
    const raw = responseData.trim();

    // Try to parse ADT XML exception payloads first.
    if (raw.includes('<exc:exception') || raw.includes('<message')) {
      try {
        const { XMLParser } = require('fast-xml-parser');
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: '@_',
        });
        const parsed = parser.parse(raw);
        const xmlMessage =
          parsed?.['exc:exception']?.message?.['#text'] ||
          parsed?.['exc:exception']?.localizedMessage?.['#text'] ||
          parsed?.['exc:exception']?.message ||
          parsed?.['exc:exception']?.localizedMessage;

        if (xmlMessage && String(xmlMessage).trim().length > 0) {
          return `SAP Error: ${String(xmlMessage).trim()}`;
        }
      } catch {
        // Fall through to plain text.
      }
    }

    if (raw.length > 0) {
      return raw.slice(0, 2000);
    }
  } else if (responseData && typeof responseData === 'object') {
    const dataMessage =
      (responseData as any).message ||
      (responseData as any).error?.message ||
      (responseData as any).error_description;
    if (typeof dataMessage === 'string' && dataMessage.trim().length > 0) {
      return dataMessage.trim();
    }
  }

  if (typeof error?.message === 'string' && error.message.trim().length > 0) {
    return error.message.trim();
  }

  if (response?.status) {
    return `HTTP ${response.status}: ${response.statusText || 'Error'}`;
  }

  return fallback;
}

export function return_error(error: any) {
  // Safely extract error message to avoid circular reference issues
  // Always extract only safe properties, never serialize the entire error object
  let errorText: string;

  try {
    if (error instanceof AxiosError) {
      // Check for DNS/network errors first
      const errorCode = (error as any).code;
      const errorMessage = error.message || '';

      // Handle DNS resolution errors (common on Windows)
      if (
        errorCode === 'ENOTFOUND' ||
        errorMessage.includes('getaddrinfo ENOTFOUND')
      ) {
        const hostnameMatch =
          errorMessage.match(/ENOTFOUND\s+([^\s]+)/) ||
          errorMessage.match(/getaddrinfo ENOTFOUND\s+([^\s]+)/);
        const hostname = hostnameMatch ? hostnameMatch[1] : 'unknown host';

        errorText =
          `DNS resolution failed: Cannot resolve hostname "${hostname}". ` +
          `Please check:\n` +
          `1. Your network connection\n` +
          `2. DNS settings (try: nslookup ${hostname})\n` +
          `3. VPN connection (if required)\n` +
          `4. Firewall settings\n` +
          `5. SAP_ASHOST / SAP_SYSNR (and SAP_SAPROUTER, if any) in the env file are correct\n` +
          `\nOriginal error: ${errorMessage}`;
      } else if (
        errorCode === 'ECONNREFUSED' ||
        errorMessage.includes('ECONNREFUSED')
      ) {
        errorText =
          `Connection refused: The server is not accepting connections. ` +
          `Please check if the SAP system is accessible and the URL is correct.\n` +
          `\nOriginal error: ${errorMessage}`;
      } else if (
        errorCode === 'ETIMEDOUT' ||
        errorMessage.includes('ETIMEDOUT')
      ) {
        errorText =
          `Connection timeout: The request took too long to complete. ` +
          `Please check your network connection and try again.\n` +
          `\nOriginal error: ${errorMessage}`;
      } else if (error.response?.data) {
        // For Axios errors with response data, safely extract response data
        if (typeof error.response.data === 'string') {
          errorText = error.response.data.substring(0, 2000); // Limit length
        } else {
          try {
            // Use a replacer function to avoid circular references
            const seen = new WeakSet();
            errorText = JSON.stringify(error.response.data, (key, value) => {
              if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                  return '[Circular]';
                }
                seen.add(value);
              }
              // Remove problematic HTTP objects
              if (
                key === 'socket' ||
                key === '_httpMessage' ||
                key === 'res' ||
                key === 'req'
              ) {
                return '[HTTP Object]';
              }
              return value;
            }).substring(0, 2000);
          } catch (_e) {
            errorText = `HTTP ${error.response.status}: ${error.response.statusText || 'Error'}`;
          }
        }
      } else {
        errorText =
          errorMessage || `HTTP ${error.response?.status || 'Unknown error'}`;
      }
    } else if (error instanceof Error) {
      // Check for DNS errors in regular Error objects too
      const errorMessage = error.message || '';
      if (
        errorMessage.includes('getaddrinfo ENOTFOUND') ||
        errorMessage.includes('ENOTFOUND')
      ) {
        const hostnameMatch =
          errorMessage.match(/ENOTFOUND\s+([^\s]+)/) ||
          errorMessage.match(/getaddrinfo ENOTFOUND\s+([^\s]+)/);
        const hostname = hostnameMatch ? hostnameMatch[1] : 'unknown host';

        errorText =
          `DNS resolution failed: Cannot resolve hostname "${hostname}". ` +
          `Please check:\n` +
          `1. Your network connection\n` +
          `2. DNS settings (try: nslookup ${hostname})\n` +
          `3. VPN connection (if required)\n` +
          `4. Firewall settings\n` +
          `5. SAP_ASHOST / SAP_SYSNR (and SAP_SAPROUTER, if any) in the env file are correct\n` +
          `\nOriginal error: ${errorMessage}`;
      } else {
        errorText = errorMessage;
      }
    } else if (typeof error === 'string') {
      errorText = error;
    } else {
      // For other types, try safe stringify
      try {
        const seen = new WeakSet();
        errorText = JSON.stringify(error, (key, value) => {
          if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
              return '[Circular]';
            }
            seen.add(value);
          }
          if (
            key === 'socket' ||
            key === '_httpMessage' ||
            key === 'res' ||
            key === 'req'
          ) {
            return '[HTTP Object]';
          }
          return value;
        }).substring(0, 2000);
      } catch (_e) {
        errorText = String(error).substring(0, 2000);
      }
    }
  } catch (_e) {
    // Fallback if all else fails
    errorText = 'An error occurred (failed to serialize error details)';
  }

  // field report round 7, F-11: name the build in every failure. Two rounds of this
  // engagement were spent arguing about defects measured against a build
  // neither side could identify; a failure is where that question gets asked.
  return {
    isError: true,
    content: [
      {
        type: 'text',
        text: `Error: ${errorText}
[${describeServerBuild()}]`,
      },
    ],
  };
}

/**
 * Generate cache key for connection based on sessionId, config signature, and destination
 * This ensures each client session with different SAP config or destination gets its own connection
 *
 * Example scenarios:
 * - 4 clients, each with 2 destinations = up to 8 different connections
 * - Each combination of (sessionId, config, destination) gets its own isolated connection
 */
function generateConnectionCacheKey(
  sessionId: string,
  configSignature: string,
  destination?: string,
): string {
  const hash = crypto.createHash('sha256');
  hash.update(sessionId);
  hash.update(configSignature);
  // Include destination in cache key to ensure different destinations get different connections
  // This is critical for multi-tenant scenarios where same sessionId might use different destinations
  hash.update(destination || '');
  return hash.digest('hex');
}

/**
 * Clean up old connections from cache (older than 1 hour)
 */
function cleanupConnectionCache() {
  const now = new Date();
  const maxAge = 60 * 60 * 1000; // 1 hour

  for (const [key, entry] of connectionCache.entries()) {
    const age = now.getTime() - entry.lastUsed.getTime();
    if (age > maxAge) {
      connectionManagerLogger?.debug(
        `[DEBUG] Cleaning up old connection cache entry: ${key.substring(0, 16)}...`,
      );
      connectionCache.delete(key);
    }
  }
}

/**
 * Get or create connection for a specific session and config
 */
function getConnectionForSession(
  sessionId: string,
  config: SapConfig,
  destination?: string,
): IAbapConnection {
  const configSignature = sapConfigSignature(config);
  const cacheKey = generateConnectionCacheKey(
    sessionId,
    configSignature,
    destination,
  );

  // Clean up old entries periodically
  if (connectionCache.size > 100) {
    cleanupConnectionCache();
  }

  let entry = connectionCache.get(cacheKey);

  if (!entry || entry.configSignature !== configSignature) {
    connectionManagerLogger?.debug(
      `[DEBUG] getManagedConnection - Creating new connection for session ${sessionId.substring(0, 8)}... (cache key: ${cacheKey.substring(0, 16)}...)`,
    );

    // Dispose old connection if exists
    if (entry) {
      /* cleanup */
    }

    // Create new connection with unique session ID per client session
    const connectionSessionId = `mcp-abap-rfc-session-${sessionId}`;

    const connection = createAbapConnection(
      config,
      loggerAdapter,
      connectionSessionId,
    );

    // Don't call enableStatefulSession during module import - it may trigger connection attempts
    // Session ID is already set via createAbapConnection() constructor
    // enableStatefulSession() will be called lazily when first request is made (if needed)

    // Don't call connect() here - it will be called lazily on first request
    // This prevents unnecessary connection attempts during module import (e.g., in Jest tests)
    // The retry logic in makeAdtRequest will handle connection establishment automatically

    entry = {
      connection,
      configSignature,
      sessionId,
      lastUsed: new Date(),
    };

    connectionCache.set(cacheKey, entry);
  } else {
    entry.lastUsed = new Date();
    connectionManagerLogger?.debug(
      `[DEBUG] getManagedConnection - Reusing cached connection for session ${sessionId.substring(0, 8)}...`,
    );
  }

  return entry.connection;
}

export function getManagedConnection(): IAbapConnection {
  // If override connection is set, use it (for backward compatibility)
  if (overrideConnection) {
    return overrideConnection;
  }

  // Try to get session context from AsyncLocalStorage
  const context = sessionContext.getStore();

  if (context?.sessionId && context?.sapConfig) {
    return getConnectionForSession(
      context.sessionId,
      context.sapConfig,
      context.destination,
    );
  }

  // Config must be provided via overrideConfig (from connection provider/broker)
  // No fallback to getConfig() - incompatible with broker-based architecture
  if (!overrideConfig) {
    throw new Error(
      'Connection config must be provided via overrideConfig or session context. In v2 architecture, config comes from connection provider (broker), not from environment variables.',
    );
  }
  const config = overrideConfig;

  // Helper function for Windows-compatible logging
  // Only logs when DEBUG_CONNECTORS, DEBUG_TESTS, or DEBUG_ADT_TESTS is enabled
  const debugLog = (message: string): void => {
    const debugEnabled =
      process.env.DEBUG_CONNECTORS === 'true' ||
      process.env.DEBUG_TESTS === 'true' ||
      process.env.DEBUG_ADT_TESTS === 'true';

    if (!debugEnabled) {
      return; // Suppress debug logs when not in debug mode
    }

    // Try stderr first
    try {
      process.stderr.write(message);
    } catch (_e) {
      // Fallback to console.error for Windows
      console.error(message.trim());
    }
    // Also try to write to a debug file on Windows
    if (process.platform === 'win32') {
      try {
        const fs = require('node:fs');
        const path = require('node:path');
        const debugFile = path.join(process.cwd(), 'mcp-debug.log');
        fs.appendFileSync(
          debugFile,
          `${new Date().toISOString()} ${message}`,
          'utf8',
        );
      } catch (_e) {
        // Ignore file write errors
      }
    }
  };

  // Debug logging - verify URL is clean before creating connection (only in debug mode)
  // NOTE: This debug logging should NOT trigger connection attempts
  // Only log if explicitly enabled via DEBUG_CONNECTORS, DEBUG_TESTS, or DEBUG_ADT_TESTS
  if (config.url) {
    const _urlHex = Buffer.from(config.url, 'utf8').toString('hex');
    debugLog(
      `[MCP-UTILS] Creating connection with URL: "${config.url}" (length: ${config.url.length})\n`,
    );
  } else {
    debugLog(`[MCP-UTILS] ✗ ERROR: config.url is missing!\n`);
  }

  const signature = sapConfigSignature(config);

  if (!cachedConnection || cachedConfigSignature !== signature) {
    connectionManagerLogger?.debug(
      `[DEBUG] getManagedConnection - Creating new connection (cached: ${!!cachedConnection}, signature changed: ${cachedConfigSignature !== signature})`,
    );
    if (cachedConnection) {
      connectionManagerLogger?.debug(
        `[DEBUG] getManagedConnection - Old signature: ${cachedConfigSignature?.substring(0, 100)}...`,
      );
      connectionManagerLogger?.debug(
        `[DEBUG] getManagedConnection - New signature: ${signature.substring(0, 100)}...`,
      );
    }

    /* cleanup */

    // Generate unique session ID for fallback connections to prevent session sharing
    // When sessionContext is not available, each connection should have its own isolated session
    // This prevents cookies/CSRF tokens from being shared between different connections
    const fallbackSessionId = `mcp-abap-rfc-fallback-${randomUUID()}`;
    connectionManagerLogger?.debug(
      `[DEBUG] getManagedConnection - Creating fallback connection with unique session ID: ${fallbackSessionId.substring(0, 32)}...`,
    );

    cachedConnection = createAbapConnection(
      config,
      loggerAdapter,
      fallbackSessionId,
    );

    cachedConfigSignature = signature;

    // Don't call enableStatefulSession during module import - it may trigger connection attempts
    // Session ID is already set via createAbapConnection() constructor
    // enableStatefulSession() will be called lazily when first request is made (if needed)

    // Don't call connect() here - it will be called lazily on first request
    // This prevents unnecessary connection attempts during module import (e.g., in Jest tests)
    // The retry logic in makeAdtRequest will handle connection establishment automatically
  } else {
    connectionManagerLogger?.debug(
      `[DEBUG] getManagedConnection - Reusing cached connection (signature matches)`,
    );
  }

  return cachedConnection;
}

/**
 * Remove connection from cache for a specific session
 * Called when session is closed
 *
 * If destination is provided, removes only the connection for that specific destination.
 * If destination is not provided, removes all connections for the session (all destinations).
 */
export function removeConnectionForSession(
  sessionId: string,
  config?: SapConfig,
  destination?: string,
) {
  if (config) {
    const configSignature = sapConfigSignature(config);
    const cacheKey = generateConnectionCacheKey(
      sessionId,
      configSignature,
      destination,
    );
    const entry = connectionCache.get(cacheKey);
    if (entry) {
      connectionManagerLogger?.debug(
        `[DEBUG] Removing connection cache entry for session ${sessionId.substring(0, 8)}... (destination: ${destination || 'none'})`,
      );
      /* cleanup */
      connectionCache.delete(cacheKey);
    }
  } else {
    // Remove all entries for this sessionId (all destinations and configs)
    for (const [key, entry] of connectionCache.entries()) {
      if (entry.sessionId === sessionId) {
        connectionManagerLogger?.debug(
          `[DEBUG] Removing connection cache entry for session ${sessionId.substring(0, 8)}...`,
        );
        /* cleanup */
        connectionCache.delete(key);
      }
    }
  }
}

/**
 * Restore session state in connection
 * Note: Session state management (getSessionState/setSessionState) was removed in connection 0.2.0
 * Session state is not persisted by this server
 * This function now only sets session type to stateful and session ID
 */
export async function restoreSessionInConnection(
  connection: IAbapConnection,
  sessionId: string,
  _sessionState: {
    cookies?: string | null;
    csrf_token?: string | null;
    cookie_store?: Record<string, string>;
  },
): Promise<void> {
  // Cast to access internal methods (not in interface but available in implementation)
  const connectionWithStateful = connection as any;

  try {
    // Set session ID first (if not already set via constructor)
    if (connectionWithStateful.setSessionId) {
      connectionWithStateful.setSessionId(sessionId);
    }
    // Enable stateful session mode (adds x-sap-adt-sessiontype: stateful header)
    connection.setSessionType('stateful');
  } catch (error: any) {
    logger?.warn('Failed to restore session in connection', {
      sessionId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export function setConfigOverride(override?: SapConfig) {
  connectionManagerLogger?.debug(
    `[DEBUG] setConfigOverride - Setting config override`,
    {
      hasOverride: !!override,
      overrideHasUrl: !!override?.url,
    },
  );
  overrideConfig = override;
  /* cleanup */
  overrideConnection = override
    ? createAbapConnection(override, loggerAdapter, undefined)
    : undefined;

  // Reset shared connection so that it will be re-created lazily with fresh config
  /* cleanup */
  cachedConnection = undefined;
  cachedConfigSignature = undefined;
  notifyConnectionResetListeners();
}

export function setConnectionOverride(connection?: IAbapConnection) {
  connectionManagerLogger?.debug(
    `[DEBUG] setConnectionOverride - Setting connection override`,
    {
      hasOverride: !!connection,
      hadPreviousOverride: !!overrideConnection,
    },
  );
  // Use a local variable to avoid TDZ issues
  const currentOverride = overrideConnection;
  if (currentOverride) {
    /* cleanup */
  }
  // Assign after reading to avoid TDZ
  overrideConnection = connection;
  overrideConfig = undefined;

  const _currentCached = cachedConnection;
  /* cleanup */
  cachedConnection = undefined;
  cachedConfigSignature = undefined;
  notifyConnectionResetListeners();
}

export function cleanup() {
  connectionManagerLogger?.debug(
    `[DEBUG] cleanup - Cleaning up all connections`,
    {
      hadOverrideConnection: !!overrideConnection,
      hadCachedConnection: !!cachedConnection,
    },
  );
  /* cleanup */
  /* cleanup */
  overrideConnection = undefined;
  overrideConfig = undefined;
  cachedConnection = undefined;
  cachedConfigSignature = undefined;
  notifyConnectionResetListeners();
}

/**
 * Invalidate cached connection to force recreation with updated config
 * This is useful when config is updated directly (e.g., token refresh in JwtAbapConnection)
 * The connection will be recreated on next getManagedConnection() call with updated signature
 */
export function invalidateConnectionCache() {
  connectionManagerLogger?.debug(
    `[DEBUG] invalidateConnectionCache - Invalidating connection cache`,
    {
      hadCachedConnection: !!cachedConnection,
      hadOverrideConnection: !!overrideConnection,
    },
  );
  /* cleanup */
  cachedConnection = undefined;
  cachedConfigSignature = undefined;
  // Also invalidate override connection if it exists
  if (overrideConnection) {
    /* cleanup */
    overrideConnection = undefined;
  }
  notifyConnectionResetListeners();
}

// Register hook to invalidate connection cache when connection is reset
// This ensures that when token is refreshed in JwtAbapConnection, the cache is invalidated
registerConnectionResetHook(() => {
  // When connection is reset (e.g., after token refresh), invalidate cache
  // so that next getManagedConnection() will recreate connection with updated config
  connectionManagerLogger?.debug(
    `[DEBUG] Connection reset hook - Invalidating cache due to connection reset`,
  );
  cachedConnection = undefined;
  cachedConfigSignature = undefined;
});

export async function getBaseUrl() {
  return getManagedConnection().getBaseUrl();
}

/**
 * Makes an ADT request with specified timeout
 * @param url Request URL
 * @param method HTTP method
 * @param timeoutType Timeout type ('default', 'csrf', 'long') or custom number in ms
 * @param data Optional request data
 * @param params Optional request parameters
 * @param headers Optional custom headers
 * @returns Promise with the response
 */
export async function makeAdtRequestWithTimeout(
  connection: IAbapConnection,
  url: string,
  method: string,
  timeoutType: 'default' | 'csrf' | 'long' | number = 'default',
  data?: any,
  params?: any,
  headers?: Record<string, string>,
): Promise<AxiosResponse> {
  const timeout = getTimeout(timeoutType);
  return makeAdtRequest(
    connection,
    url,
    method,
    timeout,
    data,
    params,
    headers,
  );
}

/**
 * Force an EXPLICIT `x-sap-adt-sessiontype: stateless` header on every request
 * of this connection until the returned restore() is called.
 *
 * The `/repository/nodestructure` endpoint bleeds a node's DESCRIPTION from a
 * previously-fetched node when a STATEFUL server-side session is alive — which
 * create/lock handlers leave open on the shared, cached connection. Setting
 * `setSessionType('stateless')` only OMITS the session header and does NOT
 * terminate the lingering session; sending the header explicitly does (both
 * verified live on DM2). Returns a restore function that reinstates the original
 * `makeAdtRequest` — always call it in a `finally`.
 */
export function withExplicitStatelessHeader(
  connection: IAbapConnection,
): () => void {
  const conn = connection as unknown as {
    makeAdtRequest?: (request: any) => Promise<any>;
  };
  if (typeof conn.makeAdtRequest !== 'function') return () => {};
  const original = conn.makeAdtRequest.bind(conn);
  conn.makeAdtRequest = async (request: any) =>
    original({
      ...request,
      headers: {
        ...(request?.headers || {}),
        'x-sap-adt-sessiontype': 'stateless',
      },
    });
  return () => {
    conn.makeAdtRequest = original;
  };
}

/**
 * Force `sap-language` on EVERY request of this connection until restore().
 *
 * MEASURED, and the measurement is the whole point: the language a DDIC text is
 * written in comes from the SERVER SESSION, and setting it on the decisive
 * request is NOT enough. `createAdtClient` injects `sap-language = SAP_LANGUAGE`
 * on every request (P1), and a write is more requests than it looks: the CSRF
 * fetch that precedes the lock POST, the lock itself, the read, the PUT. Leaving
 * any one of them on the old language leaves the session on the old language,
 * and the text lands in the WRONG row.
 *
 * Proven on DM2/310 against a $TMP canary, with T100 rows as the verdict rather
 * than an HTTP status: with only the lock and the PUT carrying sap-language=ZH,
 * the write overwrote the EN row; with every request of the write carrying it,
 * the EN row stayed byte-identical and a new SPRSL='1' row appeared. The EN
 * request that came BEFORE the wrapper did no harm, so the wrapper only has to
 * span the write.
 *
 * Overrides rather than defaults — unlike the P1 injector, whose value is what
 * this exists to displace. Always restore in a `finally`.
 */
export function withForcedLanguage(
  connection: IAbapConnection,
  language: string,
): () => void {
  const conn = connection as unknown as {
    makeAdtRequest?: (request: any) => Promise<any>;
  };
  if (typeof conn.makeAdtRequest !== 'function') return () => {};
  const original = conn.makeAdtRequest.bind(conn);
  conn.makeAdtRequest = async (request: any) =>
    original({
      ...request,
      params: { ...(request?.params || {}), 'sap-language': language },
    });
  return () => {
    conn.makeAdtRequest = original;
  };
}

/**
 * Fetches node structure from SAP ADT repository
 * @deprecated Use getAdtClient().fetchNodeStructure() instead
 */
export async function fetchNodeStructure(
  _connection: IAbapConnection,
  _parentName: string,
  _parentTechName: string,
  _parentType: string,
  _nodeKey: string,
  _withShortDescriptions: boolean = true,
): Promise<AxiosResponse> {
  // TODO: Add fetchNodeStructure to AdtClient
  throw new Error('fetchNodeStructure not implemented in AdtClient yet');
  // const { getAdtClient } = await import('./clients.js');
  // return getAdtClient().fetchNodeStructure(parentName, parentTechName, parentType, nodeKey, withShortDescriptions);
}

export async function makeAdtRequest(
  connection: IAbapConnection,
  url: string,
  method: string,
  timeout: number,
  data?: any,
  params?: any,
  headers?: Record<string, string>,
): Promise<AxiosResponse> {
  return connection.makeAdtRequest({
    url,
    method,
    timeout,
    data,
    params,
    headers,
  }) as Promise<AxiosResponse>;
}

/**
 * Get system information from SAP ADT
 * Returns cached system context resolved during connection init
 */
export async function getSystemInformation(): Promise<{
  systemID?: string;
  userName?: string;
} | null> {
  const { getSystemContext } = await import('./systemContext.js');
  const ctx = getSystemContext();
  if (!ctx.masterSystem && !ctx.responsible) return null;
  return { systemID: ctx.masterSystem, userName: ctx.responsible };
}

/**
 * Whether the connection is to an ABAP Cloud system. Over RFC only on-premise
 * systems are reachable, so this is true only for an explicit
 * `systemType: 'cloud'` (the JWT / reentrance-ticket auth types that used to
 * mean "cloud" no longer exist).
 */
export function isCloudConnection(
  connectionOrConfig?:
    | SapConfig
    | IAbapConnection
    | { authType?: string; systemType?: string },
): boolean {
  return (
    (connectionOrConfig as { systemType?: string } | undefined)?.systemType ===
    'cloud'
  );
}

/**
 * Parse validation response from ADT
 * Checks for CHECK_RESULT=X (success) or SEVERITY=ERROR with message
 * @param response - IAdtResponse or AxiosResponse from validation endpoint
 * @returns Parsed validation result with valid, severity, message, exists fields
 */
export function parseValidationResponse(
  response: IAdtResponse | AxiosResponse,
): {
  valid: boolean;
  severity?: string;
  message?: string;
  longText?: string;
  exists?: boolean;
} {
  try {
    const { XMLParser } = require('fast-xml-parser');
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });
    const result = parser.parse(response.data);

    // Check for exception format (<exc:exception>)
    const exception = result['exc:exception'];
    if (exception) {
      // fast-xml-parser (ignoreAttributes:false, prefix '@_') turns
      //   <type id="InvalidObjName"/>          → { '@_id': 'InvalidObjName' }
      //   <message lang="EN">text</message>    → { '@_lang': 'EN', '#text': 'text' }
      // so type/message are OBJECTS, not strings. Coerce both back to text.
      const asText = (v: any): string => {
        if (v == null) return '';
        if (typeof v === 'string') return v;
        return String(v['#text'] ?? v['@_id'] ?? '');
      };
      const exceptionType = asText(exception.type); // e.g. "InvalidObjName"
      const msgText =
        asText(exception.localizedMessage) || asText(exception.message);
      const msgLower = msgText.toLowerCase();

      // Existence MUST be detected language-independently: the SAP message text
      // is localized to the logon language (e.g. ZH "已经存在"), so matching on
      // English "already exists" fails on non-EN accounts. The exception type id
      // is a stable English identifier SAP does NOT translate — key on that.
      const typeLower = exceptionType.toLowerCase();
      const exists =
        typeLower.includes('alreadyexists') || // ExceptionResourceAlreadyExists / ResourceAlreadyExists
        exceptionType === 'InvalidObjName' || // DDIC create/validate: "<obj> <name> already exists"
        exceptionType === 'InvalidClifName' || // class/interface name already taken
        // English-text fallback (systems that don't set a recognized type id)
        msgLower.includes('already exists') ||
        msgLower.includes('does already exist');

      return {
        valid: false,
        severity: 'ERROR',
        message: msgText || exceptionType,
        exists: exists ? true : undefined,
      };
    }

    // Check for standard format (<asx:abap><asx:values><DATA>)
    const data = result['asx:abap']?.['asx:values']?.DATA;
    if (!data) {
      // No data means validation passed
      return { valid: true };
    }

    // Check for CHECK_RESULT=X (success)
    if (data.CHECK_RESULT === 'X') {
      return { valid: true };
    }

    // Check for SEVERITY (error/warning)
    const severity = data.SEVERITY;
    const shortText = data.SHORT_TEXT || '';
    const longText = data.LONG_TEXT || '';

    // Check if message indicates object already exists
    const msgLower = shortText.toLowerCase();
    const exists =
      msgLower.includes('already exists') ||
      msgLower.includes('does already exist') ||
      (msgLower.includes('exist') &&
        (msgLower.includes('resource') ||
          msgLower.includes('definition') ||
          msgLower.includes('object')));

    return {
      valid: severity !== 'ERROR',
      severity: severity,
      message: shortText,
      longText: longText,
      exists: exists || undefined,
    };
  } catch (_error) {
    // If parsing fails, check HTTP status
    if (response.status === 200) {
      return { valid: true };
    }
    // If parsing fails and status is not 200, try to extract error message from response.data
    let errorMessage = `Validation failed with status ${response.status}`;

    // Try to extract error details from response data (plain text or XML)
    if (response.data) {
      const dataStr =
        typeof response.data === 'string'
          ? response.data
          : String(response.data);
      // Try to extract meaningful error from plain text or unparsed XML
      if (dataStr.length > 0 && dataStr.length < 1000) {
        // If it's short text, use it directly (might be plain error message)
        errorMessage = dataStr.trim();
      } else if (dataStr.includes('<message>')) {
        // Try simple regex extraction for <message> tag
        const match = dataStr.match(/<message[^>]*>([^<]+)<\/message>/i);
        if (match?.[1]) {
          errorMessage = match[1].trim();
        }
      }
    }

    return {
      valid: false,
      severity: 'ERROR',
      message: errorMessage,
    };
  }
}

/**
 * Existence gate for create handlers.
 *
 * The ADT object-validation endpoint already reports whether a name is taken,
 * but the adt-clients `validate()` wrappers return that response without
 * interpreting it (their `errors` array is always empty), so create handlers
 * historically only discovered a name clash *after* attempting create (or, for
 * long lock→update→activate chains, even later — leaving half-created objects).
 *
 * This runs the given `validate()` thunk and interprets its result via
 * {@link parseValidationResponse}, throwing a clean "already exists" error
 * BEFORE create when the name is taken. It handles both client behaviors: a
 * `validate()` that RETURNS the raw response (table/structure/view/domain/…)
 * and one that THROWS on HTTP 4xx (class-style). On any other validation
 * outcome it stays out of the way — the original response/error is preserved so
 * create() proceeds (or the real failure surfaces) exactly as before.
 *
 * Returns the validation state on success so callers that further inspect
 * `validationState` keep working.
 *
 * @param objectLabel Human-readable subject, e.g. `"Table ZFOO"` — used verbatim in the error.
 * @param validate    Thunk invoking the object-type `client.getX().validate({...})`.
 */
export async function assertObjectDoesNotExist(
  objectLabel: string,
  validate: () => Promise<any>,
  connection?: IAbapConnection,
): Promise<any> {
  const existsError = () =>
    new McpError(
      ErrorCode.InvalidParams,
      `${objectLabel} already exists. Delete it first or use a different name.`,
    );

  // Force an EXPLICIT `x-sap-adt-sessiontype: stateless` header on the
  // validation request when a connection is supplied. A long-running MCP
  // session that has done heavy stateful work (locks/activations) leaves the
  // shared connection with a lingering server session; the object-validation
  // endpoint (e.g. /packages/validation, DDIC/OO validate) can then return a
  // body this gate misreads as "already exists", so a create starts
  // false-rejecting EVERY new name until restart. Sending the header explicitly
  // terminates that session for the validation read (same remedy as the P4
  // GetPackageContents nodestructure-bleed fix and the #1 CreatePackage fix).
  const restoreStateless = connection
    ? withExplicitStatelessHeader(connection)
    : undefined;

  let state: any;
  try {
    state = await validate();
  } catch (error: any) {
    // validate() threw (e.g. class-style 4xx). Try to interpret a response body;
    // fall back to the message text; otherwise surface the original error.
    const resp = error?.response ?? error?.originalError?.response;
    const body = resp?.data;
    if (body != null) {
      const result = parseValidationResponse({
        data: body,
        status: resp?.status ?? error?.status ?? 400,
      } as any);
      if (result.exists) throw existsError();
    }
    const text = String(error?.message || '').toLowerCase();
    if (
      text.includes('already exists') ||
      text.includes('alreadyexists') ||
      text.includes('does already exist')
    ) {
      throw existsError();
    }
    throw error;
  } finally {
    // Always restore the original makeAdtRequest (removes the forced header).
    restoreStateless?.();
  }

  const response = state?.validationResponse;
  if (response) {
    const result = parseValidationResponse(response);
    if (result.exists) throw existsError();
  }
  return state;
}

/**
 * Maximum name lengths for ABAP/DDIC object types (whole name incl. Z/Y prefix
 * and any namespace `/xxx/` part). SAP does NOT syntax-check these on the ADT
 * create endpoint — an over-long name is silently TRUNCATED, so a caller who
 * asks for a too-long table sees a confusing "already exists" error on the
 * truncated name instead of a length complaint.
 *
 * Only the limits we are confident about are listed; unlisted types are not
 * enforced (assertNameLength is a no-op for them). The classic transparent-table
 * / DB-view limit of 16 is the important one — that is the reported failure.
 */
export const ABAP_NAME_MAX_LENGTH: Record<string, number> = {
  table: 16, // transparent/pooled/cluster table (DB table name)
  view: 16, // classic DDIC database view
  cds_view: 30, // CDS view entity / DDL source (DDLS) — longer than a classic view
  domain: 30,
  data_element: 30,
  structure: 30,
  table_type: 30, // TTYP name
  access_control: 30, // DCL / DCLS name (CDS-family, like a DDL source)
  class: 30,
  interface: 30,
  function_group: 26, // SAPL<name> program must fit 30 chars → name ≤ 26
  function_module: 30,
  program: 40, // report / program name
  package: 30,
  message_class: 20, // MSAG name (ARBGB) max 20
  xslt: 30, // transformation name
  lock_object: 16, // ENQU name (like a table, DB-object constrained)
};

/**
 * Fail fast (BEFORE any SAP round-trip) when an object name exceeds the DDIC
 * length limit for its type. Prevents SAP's silent truncation, which otherwise
 * surfaces as a misleading "<truncated name> already exists" error.
 *
 * @param objectType Key into {@link ABAP_NAME_MAX_LENGTH} (e.g. `"table"`). If
 *                   unknown, the check is skipped.
 * @param name       The requested object name (case-insensitive; length only).
 * @param label      Human-readable subject for the error, default `"Object"`.
 */
export function assertNameLength(
  objectType: string,
  name: string,
  label = 'Object',
): void {
  const max = ABAP_NAME_MAX_LENGTH[objectType];
  if (max == null) return;
  const len = (name || '').length;
  if (len > max) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `${label} name "${name}" is ${len} characters, exceeding the SAP limit of ${max} for this object type. ` +
        `SAP does not reject an over-long name — it silently truncates it, which then surfaces as a misleading ` +
        `"already exists" error. Use a name of ${max} characters or fewer.`,
    );
  }
}

/**
 * Check if error message indicates object was already checked
 * Used to handle "has been checked" / "was checked" messages as non-critical
 * @param error - Error object or error message string
 * @returns true if error indicates object was already checked
 */
export function isAlreadyCheckedError(error: any): boolean {
  const errorMessage = error?.message || error?.text || String(error || '');
  const msgLower = errorMessage.toLowerCase();
  return (
    msgLower.includes('has been checked') ||
    msgLower.includes('was checked') ||
    msgLower.includes('already checked')
  );
}

/**
 * Check if error message indicates object already exists
 * Used to handle validation errors for existing objects
 * @param error - Error object or error message string
 * @returns true if error indicates object already exists
 */
export function isAlreadyExistsError(error: any): boolean {
  const errorMessage = error?.message || error?.text || String(error || '');
  const responseData =
    typeof error?.response?.data === 'string'
      ? error.response.data
      : error?.response?.data
        ? JSON.stringify(error.response.data)
        : '';
  const msgLower = `${errorMessage} ${responseData}`.toLowerCase();
  return (
    msgLower.includes('already exists') ||
    msgLower.includes('does already exist') ||
    msgLower.includes('resource already exists') ||
    msgLower.includes('object already exists')
  );
}

/**
 * Safely handle check operation - ignores "already checked" errors
 * Wraps check operation and handles "has been checked" as non-critical
 * @param checkOperation - Promise that performs check operation
 * @param objectName - Name of object being checked (for logging)
 * @param logger - Optional logger function for debug messages
 * @returns Result of check operation or throws if real error
 */
export async function safeCheckOperation<T>(
  checkOperation: () => Promise<T>,
  objectName: string,
  logger?: { debug?: (message: string, data?: any) => void },
): Promise<T> {
  try {
    return await checkOperation();
  } catch (checkError: any) {
    if (isAlreadyCheckedError(checkError)) {
      // Object was already checked - this is OK, continue
      if (logger?.debug) {
        logger?.debug(
          `${objectName} was already checked - this is OK, continuing`,
        );
      }
      // Return a mock success response or rethrow with handled flag
      // For now, we'll rethrow but mark it as handled
      const handledError = new Error(
        `Object ${objectName} was already checked`,
      );
      (handledError as any).isAlreadyChecked = true;
      throw handledError;
    }
    // Real check error - rethrow
    throw checkError;
  }
}
export function setAbapConnectionOverride(connection?: IAbapConnection) {
  setConnectionOverride(connection);
}

// Re-export header constants from interfaces package
export * from '@mcp-abap-adt/interfaces';
export type { IAdtSystemContext } from './systemContext.js';
// Re-export safe system context accessors for consumers (no HTTP, no connection mutation)
export { getSystemContext, setSystemContext } from './systemContext.js';

/**
 * The text of one activation `<msg>`, always as a single readable string.
 *
 * SAP splits a long message across SEVERAL `<txt>` children, which
 * fast-xml-parser hands back as an ARRAY while the field is typed `string`.
 * Everything downstream then stringified it implicitly, so a two-part message
 * arrived as
 *
 *   Activation was cancelled.,"The data source "X" does not exist or is not active"
 *
 * — the parts welded together by a bare comma, mid-sentence. Measured on
 * DM2/310 (2026-09-11) on a CDS activation failure, and the reporter quoted it
 * back to us in exactly that mangled form, which is how it was found.
 *
 * The parts are sentence fragments of one message, so they are joined with a
 * space. An empty result stays empty rather than becoming the string
 * "Unknown message": a message with no text is a fact the caller needs (see
 * `hasReadableText` in adtMessages), and inventing words for it hides it.
 */
function activationMessageText(msg: any): string {
  const raw = msg?.shortText?.txt ?? msg?.shortText ?? msg?.['#text'];
  const parts = (Array.isArray(raw) ? raw : [raw])
    .map((part) =>
      part === undefined || part === null
        ? ''
        : typeof part === 'object'
          ? String(part['#text'] ?? '')
          : String(part),
    )
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.join(' ');
}

export function parseActivationResponse(responseData: any) {
  const { XMLParser } = require('fast-xml-parser');
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseAttributeValue: true,
  });

  try {
    const data =
      typeof responseData === 'string'
        ? responseData
        : responseData?.data || JSON.stringify(responseData);
    const result = parser.parse(data);
    const properties = result['chkl:messages']?.['chkl:properties'];
    const activated =
      properties?.['@_activationExecuted'] === 'true' ||
      properties?.['@_activationExecuted'] === true;
    const checked =
      properties?.['@_checkExecuted'] === 'true' ||
      properties?.['@_checkExecuted'] === true;
    const generated =
      properties?.['@_generationExecuted'] === 'true' ||
      properties?.['@_generationExecuted'] === true;
    const messages: Array<{
      type: string;
      text: string;
      line?: number;
      column?: number;
    }> = [];
    const msgData = result['chkl:messages']?.msg;
    if (msgData) {
      const msgArray = Array.isArray(msgData) ? msgData : [msgData];
      msgArray.forEach((msg: any) => {
        messages.push({
          type: msg['@_type'] || 'info',
          text: activationMessageText(msg),
          line: msg['@_line'],
          column: msg['@_column'],
        });
      });
    }
    return {
      activated,
      checked,
      generated,
      messages,
    };
  } catch (error) {
    return {
      activated: false,
      checked: false,
      generated: false,
      messages: [
        {
          type: 'error',
          text: `Failed to parse activation response: ${error}`,
        },
      ],
    };
  }
}
