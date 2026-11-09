/**
 * ActivateLockObject Handler - Activate an ABAP lock object (ENQU).
 * Activation generates the ENQUEUE_/DEQUEUE_ function modules.
 */

import {
  describeActivation,
  evaluateActivation,
} from '../../../lib/adtMessages';
import { activateAdt } from '../../../lib/adtObjectOps';
import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  encodeSapObjectName,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'ActivateLockObject',
  available_in: ['onprem', 'legacy'] as const,
  description:
    'Activate an ABAP lock object (ENQU). Use after CreateLockObject or UpdateLockObject; activation generates the ENQUEUE/DEQUEUE function modules.',
  inputSchema: {
    type: 'object',
    properties: {
      lock_object_name: { type: 'string', description: 'Lock object name.' },
    },
    required: ['lock_object_name'],
  },
} as const;

interface ActivateLockObjectArgs {
  lock_object_name: string;
}

export async function handleActivateLockObject(
  context: HandlerContext,
  args: ActivateLockObjectArgs,
) {
  const { connection, logger } = context;
  try {
    if (!args?.lock_object_name)
      return return_error(new Error('lock_object_name is required'));
    createAdtClient(connection, logger); // wrap connection (sap-language pinning)
    const name = args.lock_object_name.toUpperCase();
    const url = `/sap/bc/adt/ddic/lockobjects/sources/${encodeSapObjectName(name).toLowerCase()}`;
    // Success comes from SAP's MESSAGES, not from the run flags: ADT reports
    // activationExecuted="true" even for an object it REFUSED, so the old
    // `activated && checked` test read a rejected activation as success.
    const outcome = evaluateActivation(
      await activateAdt(connection, name, url),
    );
    logger?.info(
      `Lock object activation {name}: ${outcome.success ? 'ok' : 'FAILED'}`.replace(
        '{name}',
        name,
      ),
    );
    return return_response({
      data: JSON.stringify(
        {
          success: outcome.success,
          lock_object_name: name,
          activated: outcome.activated,
          checked: outcome.checked,
          messages: outcome.messages,
          message: describeActivation(outcome, `Lock object ${name}`),
        },
        null,
        2,
      ),
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });
  } catch (error: any) {
    return return_error(error);
  }
}
