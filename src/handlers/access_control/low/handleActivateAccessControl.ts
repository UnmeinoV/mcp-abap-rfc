/**
 * ActivateAccessControl Handler - Activate a DCL source.
 *
 * Success is decided by SAP's MESSAGES, not by the activation-run flags: ADT
 * reports activationExecuted="true" even for an object it REFUSED, so the old
 * `activated && checked` test read a rejected activation as success.
 */

import {
  ACCESS_CONTROL_TYPE,
  accessControlUri,
} from '../../../lib/accessControlXml';
import { describeActivation } from '../../../lib/adtMessages';
import { activateAndEvaluate } from '../../../lib/adtObjectOps';
import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { return_error, return_response } from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'ActivateAccessControl',
  available_in: ['onprem'] as const,
  description:
    'Operation: Activate. Subject: Access Control (DCL / DCLS). Activate a DCL that is still ' +
    'inactive (e.g. after UpdateAccessControl with activate=false). Success is derived from SAP’s ' +
    'own messages, so a refused activation is reported as a failure.',
  inputSchema: {
    type: 'object',
    properties: {
      access_control_name: {
        type: 'string',
        description: 'DCL name.',
      },
    },
    required: ['access_control_name'],
  },
} as const;

interface ActivateAccessControlArgs {
  access_control_name: string;
}

export async function handleActivateAccessControl(
  context: HandlerContext,
  args: ActivateAccessControlArgs,
) {
  const { connection, logger } = context;
  try {
    if (!args?.access_control_name) {
      return return_error(new Error('access_control_name is required'));
    }
    createAdtClient(connection, logger); // wrap connection (sap-language pinning)
    const name = args.access_control_name.toUpperCase();

    const outcome = await activateAndEvaluate(connection, [
      { name, type: ACCESS_CONTROL_TYPE },
    ]);
    logger?.info(
      `Access control activation ${name}: ${outcome.success ? 'ok' : 'FAILED'}`,
    );

    return return_response({
      data: JSON.stringify(
        {
          success: outcome.success,
          access_control_name: name,
          activated: outcome.activated,
          checked: outcome.checked,
          messages: outcome.messages,
          uri: accessControlUri(name),
          message: describeActivation(outcome, `Access control ${name}`),
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
