/**
 * ActivateXslt Handler - Activate an ABAP transformation (XSLT/ST).
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
  name: 'ActivateXslt',
  available_in: ['onprem', 'legacy'] as const,
  description:
    'Activate an ABAP transformation (XSLT). Use after CreateXslt or UpdateXslt if it remains inactive.',
  inputSchema: {
    type: 'object',
    properties: {
      xslt_name: { type: 'string', description: 'Transformation name.' },
    },
    required: ['xslt_name'],
  },
} as const;

interface ActivateXsltArgs {
  xslt_name: string;
}

export async function handleActivateXslt(
  context: HandlerContext,
  args: ActivateXsltArgs,
) {
  const { connection, logger } = context;
  try {
    if (!args?.xslt_name)
      return return_error(new Error('xslt_name is required'));
    createAdtClient(connection, logger); // wrap connection (sap-language pinning)
    const name = args.xslt_name.toUpperCase();
    const base = `/sap/bc/adt/xslt/transformations/${encodeSapObjectName(name).toLowerCase()}`;
    // Success comes from SAP's MESSAGES, not from the run flags: ADT reports
    // activationExecuted="true" even for an object it REFUSED, so the old
    // `activated && checked` test read a rejected activation as success.
    const outcome = evaluateActivation(
      await activateAdt(connection, name, base),
    );
    logger?.info(
      `Transformation activation ${name}: ${outcome.success ? 'ok' : 'FAILED'}`,
    );
    return return_response({
      data: JSON.stringify(
        {
          success: outcome.success,
          xslt_name: name,
          activated: outcome.activated,
          checked: outcome.checked,
          messages: outcome.messages,
          message: describeActivation(outcome, `Transformation ${name}`),
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
