import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { normalizeCheckResponse } from '../../../lib/normalizeCheckResponse';
import { handleCheckView as handleCheckViewLow } from '../low/handleCheckView';

export const TOOL_DEFINITION = {
  name: 'CheckView',
  available_in: ['onprem', 'legacy'] as const,
  description:
    'Perform syntax check on an ABAP CDS view. Checks the stored version, or DDL you supply for an existing view. Returns syntax errors, warnings, and messages.',
  inputSchema: {
    type: 'object',
    properties: {
      view_name: {
        type: 'string',
        description: 'CDS view name (e.g., ZI_MY_VIEW).',
      },
      version: {
        type: 'string',
        description:
          "Version to check: 'active' or 'inactive'." +
          " Default: active — a DDIC object with no inactive version cannot be checked as 'inactive'/'new' (SAP answers \"Error while importing object ... from the database\").",
        enum: ['active', 'inactive'],
      },
      ddl_source: {
        type: 'string',
        description:
          'Optional: DDL source code to validate instead of the saved version.',
      },
    },
    required: ['view_name'],
  },
} as const;

export async function handleCheckView(
  context: HandlerContext,
  args: { view_name: string; version?: string; ddl_source?: string },
) {
  const result = await handleCheckViewLow(context, args);
  return normalizeCheckResponse(result, args.view_name?.toUpperCase());
}
