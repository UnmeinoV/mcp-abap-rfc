import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { return_error } from '../../../lib/utils';
import { handleGetSqlQuery } from '../../system/readonly/handleGetSqlQuery';
import { handleGetTableContents } from '../../table/readonly/handleGetTableContents';
import { compactQuerySchema } from './compactSchemas';

export const TOOL_DEFINITION = {
  name: 'HandlerQuery',
  available_in: ['onprem'] as const,
  description:
    "Read data. operation='sql' (needs sql_query) or 'table' (needs table_name). Optional: max_rows. Response: JSON rows.",
  inputSchema: compactQuerySchema,
} as const;

type HandlerQueryArgs = {
  operation?: string;
  sql_query?: string;
  table_name?: string;
  max_rows?: number;
};

export async function handleHandlerQuery(
  context: HandlerContext,
  args: HandlerQueryArgs,
) {
  switch (args?.operation) {
    case 'sql':
      if (!args.sql_query) {
        return return_error(new Error("operation='sql' requires sql_query."));
      }
      return handleGetSqlQuery(context, {
        sql_query: args.sql_query,
        row_number: args.max_rows,
      } as never);
    case 'table':
      if (!args.table_name) {
        return return_error(
          new Error("operation='table' requires table_name."),
        );
      }
      return handleGetTableContents(context, {
        table_name: args.table_name,
        max_rows: args.max_rows,
      });
    default:
      return return_error(
        new Error(
          `Unknown operation "${args?.operation}". Use 'sql' or 'table'.`,
        ),
      );
  }
}
