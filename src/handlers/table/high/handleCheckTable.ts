import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { normalizeCheckResponse } from '../../../lib/normalizeCheckResponse';
import { handleCheckTable as handleCheckTableLow } from '../low/handleCheckTable';

export const TOOL_DEFINITION = {
  name: 'CheckTable',
  available_in: ['onprem'] as const,
  description:
    'Perform syntax check on an ABAP table. Checks the stored version, or DDL you supply for an existing table. Returns syntax errors, warnings, and messages.',
  inputSchema: {
    type: 'object',
    properties: {
      table_name: {
        type: 'string',
        description: 'Table name (e.g., ZMCP_MY_TABLE).',
      },
      version: {
        type: 'string',
        description:
          "Version to check: 'active', 'inactive', or 'new'. Default: active — a table with no inactive version cannot be checked as 'inactive'/'new' (SAP answers \"Error while importing object ... from the database\").",
        enum: ['active', 'inactive', 'new'],
      },
      ddl_code: {
        type: 'string',
        description:
          'Optional: DDL source code to validate instead of the saved version.',
      },
    },
    required: ['table_name'],
  },
} as const;

export async function handleCheckTable(
  context: HandlerContext,
  args: { table_name: string; version?: string; ddl_code?: string },
) {
  const result = await handleCheckTableLow(context, args);
  return normalizeCheckResponse(result, args.table_name?.toUpperCase());
}
