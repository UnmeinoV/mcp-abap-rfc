/**
 * The pure parts of multi-client routing (see src/lib/sapClients.ts).
 * BaseMcpServer.registerHandlers is the only caller.
 */
import * as z from 'zod';
import type { SapClientConfig } from '../lib/sapClients.js';

export const SAP_CLIENT_PARAM = 'sap_client';

type TextItem = { type: 'text'; text: string };

/**
 * Adds `sap_client` to a tool's zod shape. Enum only, no description: it is
 * repeated on every tool, and measured on readonly,high (218 tools) a
 * one-sentence description doubles the cost — ~24k chars instead of ~12k.
 */
export function injectSapClientParam(
  shape: unknown,
  cfg: SapClientConfig,
  toolName: string,
): Record<string, unknown> {
  const isZodShape =
    !!shape &&
    typeof shape === 'object' &&
    typeof (shape as { type?: unknown }).type !== 'string';
  const base = isZodShape ? (shape as Record<string, unknown>) : {};
  if (SAP_CLIENT_PARAM in base) {
    throw new Error(
      `Tool ${toolName} already declares a "${SAP_CLIENT_PARAM}" parameter; it cannot also take the server-wide one.`,
    );
  }
  return {
    ...base,
    [SAP_CLIENT_PARAM]: z.enum(cfg.clients as [string, ...string[]]).optional(),
  };
}

/** Splits `sap_client` off the arguments; the handler never sees it. */
export function takeSapClient(args: unknown): {
  sapClient?: string;
  args: unknown;
} {
  if (!args || typeof args !== 'object' || !(SAP_CLIENT_PARAM in args)) {
    return { args };
  }
  const { [SAP_CLIENT_PARAM]: sapClient, ...rest } = args as Record<
    string,
    unknown
  >;
  return {
    sapClient: typeof sapClient === 'string' ? sapClient : undefined,
    args: rest,
  };
}

/**
 * Appended, never merged into content[0]: the same query against 100 and 800
 * returns byte-identical shapes, and this line is the only thing that says
 * which client answered. Callers parsing content[0] are unaffected.
 */
export function labelContent(content: TextItem[], client: string): TextItem[] {
  return [...content, { type: 'text', text: `sap_client: ${client}` }];
}

/** Idempotent: an isError result is relabelled on its way through catch. */
export function labelErrorMessage(message: string, client: string): string {
  return message.includes('[sap_client ')
    ? message
    : `[sap_client ${client}] ${message}`;
}
