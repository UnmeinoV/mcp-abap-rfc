import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { normalizeCheckResponse } from '../../../lib/normalizeCheckResponse';
import { handleCheckStructure as handleCheckStructureLow } from '../low/handleCheckStructure';

export const TOOL_DEFINITION = {
  name: 'CheckStructure',
  available_in: ['onprem'] as const,
  description:
    'Perform syntax check on an ABAP structure. Checks the stored version, or DDL you supply for an existing structure. Returns syntax errors, warnings, and messages.',
  inputSchema: {
    type: 'object',
    properties: {
      structure_name: {
        type: 'string',
        description: 'Structure name (e.g., ZST_MY_STRUCTURE).',
      },
      version: {
        type: 'string',
        description:
          "Version to check: 'active' or 'inactive'." +
          " Default: active — a DDIC object with no inactive version cannot be checked as 'inactive'/'new' (SAP answers \"Error while importing object ... from the database\").",
        enum: ['active', 'inactive'],
      },
      ddl_code: {
        type: 'string',
        description:
          'Optional: DDL source code to validate instead of the saved version.',
      },
    },
    required: ['structure_name'],
  },
} as const;

export async function handleCheckStructure(
  context: HandlerContext,
  args: { structure_name: string; version?: string; ddl_code?: string },
) {
  const result = await handleCheckStructureLow(context, args);
  return normalizeCheckResponse(result, args.structure_name?.toUpperCase());
}
