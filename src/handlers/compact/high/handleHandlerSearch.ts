import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { return_error } from '../../../lib/utils';
import { handleSearchObject } from '../../search/readonly/handleSearchObject';
import { handleGetWhereUsed } from '../../system/readonly/handleGetWhereUsed';
import { handleSearchSource } from '../../system/readonly/handleSearchSource';
import { compactSearchSchema } from './compactSchemas';

export const TOOL_DEFINITION = {
  name: 'HandlerSearch',
  available_in: ['onprem'] as const,
  description:
    "Find things. operation='object' (needs object_name) | 'source' (needs query + packages, onprem only) | 'where_used' (needs object_name + object_type). Response: JSON.",
  inputSchema: compactSearchSchema,
} as const;

type HandlerSearchArgs = {
  operation?: string;
  object_name?: string;
  object_type?: string;
  query?: string;
  packages?: string[];
  max_results?: number;
};

export async function handleHandlerSearch(
  context: HandlerContext,
  args: HandlerSearchArgs,
) {
  switch (args?.operation) {
    case 'object':
      if (!args.object_name) {
        return return_error(
          new Error("operation='object' requires object_name."),
        );
      }
      return handleSearchObject(context, {
        object_name: args.object_name,
        object_type: args.object_type,
        max_results: args.max_results,
      } as never);
    case 'source':
      if (!args.query || !args.packages?.length) {
        return return_error(
          new Error(
            'operation=\'source\' requires query and packages (PACKAGE names, e.g. ["$TMP"]).',
          ),
        );
      }
      return handleSearchSource(context, {
        query: args.query,
        packages: args.packages,
      } as never);
    case 'where_used':
      if (!args.object_name || !args.object_type) {
        return return_error(
          new Error(
            "operation='where_used' requires object_name and object_type.",
          ),
        );
      }
      return handleGetWhereUsed(context, {
        object_name: args.object_name,
        object_type: args.object_type,
      } as never);
    default:
      return return_error(
        new Error(
          `Unknown operation "${args?.operation}". Use 'object', 'source' or 'where_used'.`,
        ),
      );
  }
}
