import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { return_error } from '../../../lib/utils';
import { handleRuntimeRunClass } from '../../system/readonly/handleRuntimeRunClass';
import { handleRuntimeRunProgram } from '../../system/readonly/handleRuntimeRunProgram';
import { compactRuntimeSchema } from './compactSchemas';

export const TOOL_DEFINITION = {
  name: 'HandlerRuntime',
  available_in: ['onprem'] as const,
  description:
    "Execute. object_type='program' (onprem only) or 'class' (needs IF_OO_ADT_CLASSRUN). Required: object_name. Optional: profile, description. Response: JSON output.",
  inputSchema: compactRuntimeSchema,
} as const;

type HandlerRuntimeArgs = {
  object_type?: string;
  object_name?: string;
  profile?: boolean;
  description?: string;
};

export async function handleHandlerRuntime(
  context: HandlerContext,
  args: HandlerRuntimeArgs,
) {
  if (!args?.object_name) {
    return return_error(new Error('object_name is required.'));
  }
  switch (args?.object_type) {
    case 'program':
      return handleRuntimeRunProgram(context, {
        program_name: args.object_name,
        profile: args.profile,
        description: args.description,
      } as never);
    case 'class':
      return handleRuntimeRunClass(context, {
        class_name: args.object_name,
        profile: args.profile,
        description: args.description,
      } as never);
    default:
      return return_error(
        new Error(
          `Unknown object_type "${args?.object_type}". Use 'program' or 'class'.`,
        ),
      );
  }
}
