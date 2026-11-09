import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { return_error } from '../../../lib/utils';
import { handleGetAtcCustomizing } from '../../system/readonly/handleGetAtcCustomizing';
import { handleGetAtcWorklist } from '../../system/readonly/handleGetAtcWorklist';
import { handleRunAtc } from '../../system/readonly/handleRunAtc';
import { compactAtcSchema } from './compactSchemas';

export const TOOL_DEFINITION = {
  name: 'HandlerAtc',
  available_in: ['onprem'] as const,
  description:
    "ATC. operation='run' (needs object_name + object_type) | 'worklist' (needs worklist_id) | 'customizing'. Optional: check_variant, max_priority, summary. Response: JSON findings.",
  inputSchema: compactAtcSchema,
} as const;

type HandlerAtcArgs = {
  operation?: string;
  object_name?: string;
  object_type?: string;
  check_variant?: string;
  max_priority?: number;
  summary?: boolean;
  worklist_id?: string;
};

export async function handleHandlerAtc(
  context: HandlerContext,
  args: HandlerAtcArgs,
) {
  switch (args?.operation) {
    case 'run':
      if (!args.object_name || !args.object_type) {
        return return_error(
          new Error("operation='run' requires object_name and object_type."),
        );
      }
      return handleRunAtc(context, {
        object_name: args.object_name,
        object_type: args.object_type,
        check_variant: args.check_variant,
        max_priority: args.max_priority,
        summary: args.summary,
      } as never);
    case 'worklist':
      if (!args.worklist_id) {
        return return_error(
          new Error("operation='worklist' requires worklist_id."),
        );
      }
      return handleGetAtcWorklist(context, {
        worklist_id: args.worklist_id,
      } as never);
    case 'customizing':
      return handleGetAtcCustomizing(context, {} as never);
    default:
      return return_error(
        new Error(
          `Unknown operation "${args?.operation}". Use 'run', 'worklist' or 'customizing'.`,
        ),
      );
  }
}
