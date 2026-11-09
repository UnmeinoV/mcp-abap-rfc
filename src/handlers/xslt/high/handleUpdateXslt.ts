/**
 * UpdateXslt Handler - Set/replace an ABAP transformation's source, optionally activate.
 * Workflow: lock -> PUT source/main -> unlock -> (activate).
 */

import {
  type ActivationOutcome,
  evaluateActivation,
  formatAdtMessages,
} from '../../../lib/adtMessages';
import {
  activateAdt,
  putAdtSource,
  runLocked,
} from '../../../lib/adtObjectOps';
import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  encodeSapObjectName,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'UpdateXslt',
  available_in: ['onprem', 'legacy'] as const,
  description:
    'Operation: Update. Subject: Transformation (XSLT). Update the source of an existing ABAP transformation. Locks, updates, unlocks, and optionally activates.',
  inputSchema: {
    type: 'object',
    properties: {
      xslt_name: {
        type: 'string',
        description: 'Transformation name (must exist).',
      },
      source_code: {
        type: 'string',
        description: 'Complete XSLT / Simple Transformation source.',
      },
      transport_request: {
        type: 'string',
        description: 'Transport request (if transportable).',
      },
      activate: {
        type: 'boolean',
        description:
          "Activate after the update. DEFAULT: TRUE — omitting it activates the object. Pass false to leave it inactive (e.g. when several mutually dependent objects must be activated together afterwards with ActivateObjects). The activated field in the response is SAP's own verdict, not a copy of this parameter.",
      },
    },
    required: ['xslt_name', 'source_code'],
  },
} as const;

interface UpdateXsltArgs {
  xslt_name: string;
  source_code: string;
  transport_request?: string;
  activate?: boolean;
}

export async function handleUpdateXslt(
  context: HandlerContext,
  args: UpdateXsltArgs,
) {
  const { connection, logger } = context;
  try {
    if (!args?.xslt_name || !args?.source_code) {
      return return_error(new Error('xslt_name and source_code are required'));
    }
    createAdtClient(connection, logger); // wrap connection (sap-language pinning)
    const name = args.xslt_name.toUpperCase();
    const base = `/sap/bc/adt/xslt/transformations/${encodeSapObjectName(name).toLowerCase()}`;
    const shouldActivate = args.activate !== false;

    await runLocked(connection, base, async (lockHandle) => {
      await putAdtSource(
        connection,
        `${base}/source/main`,
        args.source_code,
        lockHandle,
        args.transport_request,
      );
      logger?.info(`Transformation source updated: ${name}`);
    });

    // Judge the activation by SAP's MESSAGES, not by the `activated` flag: that
    // flag reports the activation RUN executed, and a rejected object still
    // comes back with activated:true plus an error message.
    let activation: ActivationOutcome | undefined;
    if (shouldActivate) {
      activation = evaluateActivation(
        await activateAdt(connection, name, base),
      );
      if (!activation.success) {
        throw new Error(
          `Transformation ${name} source was updated but ACTIVATION FAILED: ` +
            `${formatAdtMessages(activation.errors)}. The object is left inactive.`,
        );
      }
    }

    return return_response({
      data: JSON.stringify(
        {
          success: activation ? activation.success : true,
          xslt_name: name,
          // SAP's verdict, not the request flag.
          activated: activation ? activation.activated : false,
          activation: activation
            ? {
                activated: activation.activated,
                checked: activation.checked,
                messages: activation.messages,
              }
            : undefined,
          message: `Transformation ${name} updated${shouldActivate ? ' and activated' : ''}`,
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
    const bodyText = error?.response?.data
      ? typeof error.response.data === 'string'
        ? error.response.data
        : JSON.stringify(error.response.data)
      : '';
    const msg = `Error updating transformation ${args?.xslt_name}: ${error instanceof Error ? error.message : String(error)}${bodyText ? ` | ADT: ${bodyText.slice(0, 1000)}` : ''}`;
    logger?.error(msg);
    return return_error(new Error(msg));
  }
}
