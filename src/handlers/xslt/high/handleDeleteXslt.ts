/**
 * DeleteXslt Handler - Delete an ABAP transformation. Workflow: lock -> DELETE.
 */

import { describeFailedDeletion } from '../../../lib/adtDeletion';
import { deleteAdt, runLocked } from '../../../lib/adtObjectOps';
import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  encodeSapObjectName,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'DeleteXslt',
  available_in: ['onprem', 'legacy'] as const,
  description:
    'Operation: Delete. Subject: Transformation (XSLT). Delete an ABAP transformation from the SAP system.',
  inputSchema: {
    type: 'object',
    properties: {
      xslt_name: { type: 'string', description: 'Transformation name.' },
      transport_request: {
        type: 'string',
        description:
          'Transport request. Required for transportable objects; optional for $TMP.',
      },
    },
    required: ['xslt_name'],
  },
} as const;

interface DeleteXsltArgs {
  xslt_name: string;
  transport_request?: string;
}

export async function handleDeleteXslt(
  context: HandlerContext,
  args: DeleteXsltArgs,
) {
  const { connection, logger } = context;
  try {
    if (!args?.xslt_name)
      return return_error(new Error('xslt_name is required'));
    createAdtClient(connection, logger); // wrap connection (sap-language pinning)
    const name = args.xslt_name.toUpperCase();
    const base = `/sap/bc/adt/xslt/transformations/${encodeSapObjectName(name).toLowerCase()}`;

    await runLocked(connection, base, async (lockHandle) => {
      await deleteAdt(connection, base, lockHandle, args.transport_request);
    });

    // GROUND TRUTH: verify the object is really gone rather than trusting
    // that the DELETE returned without throwing. Same reason the other
    // Delete* handlers verify — a deletion SAP declined must not be
    // reported as success, or the next run fails with a misleading
    // "already exists".
    const deletionFailure = await describeFailedDeletion(
      connection,
      base,
      `Transformation ${name}`,
    );
    if (deletionFailure) {
      throw new Error(deletionFailure);
    }
    logger?.info(`Transformation deleted: ${name}`);

    return return_response({
      data: JSON.stringify(
        {
          success: true,
          xslt_name: name,
          message: `Transformation ${name} deleted successfully.`,
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
    const msg = `Error deleting transformation ${args?.xslt_name}: ${error instanceof Error ? error.message : String(error)}${bodyText ? ` | ADT: ${bodyText.slice(0, 1000)}` : ''}`;
    logger?.error(msg);
    return return_error(new Error(msg));
  }
}
