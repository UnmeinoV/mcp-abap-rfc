import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { handleGetInactiveObjects } from '../../system/readonly/handleGetInactiveObjects';
import { compactInactiveSchema } from './compactSchemas';

/**
 * Kept as its own operation rather than folded into a routed handler: this is
 * the sweep. It is the one call in the reporting project's process that does not
 * take another tool's word for anything, and it is why the compact facade could
 * not be their default (field report round 7, F-9).
 */
export const TOOL_DEFINITION = {
  name: 'HandlerInactiveObjects',
  available_in: ['onprem'] as const,
  description:
    'List objects left INACTIVE in the system — the sweep that catches what a failed write left behind. Optional: name_prefix, object_type. Response: JSON list with uri.',
  inputSchema: compactInactiveSchema,
} as const;

type HandlerInactiveObjectsArgs = {
  name_prefix?: string;
  object_type?: string;
};

export async function handleHandlerInactiveObjects(
  context: HandlerContext,
  args: HandlerInactiveObjectsArgs,
) {
  return handleGetInactiveObjects(context, {
    name_prefix: args?.name_prefix,
    object_type: args?.object_type,
  } as never);
}
