/**
 * DeleteTransport Handler - delete an (unreleased) transport request.
 *
 * Mirrors abap-adt-api's transportDelete:
 *   DELETE /sap/bc/adt/cts/transportrequests/{tr}
 *
 * Mutating: only works on modifiable (not yet released) requests.
 */

import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  type AxiosResponse,
  makeAdtRequestWithTimeout,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'DeleteTransport',
  available_in: ['onprem'] as const,
  description:
    'Delete a modifiable (not yet released) transport request. Fails if the request has already been released.',
  inputSchema: {
    type: 'object',
    properties: {
      transport_number: {
        type: 'string',
        description: 'Transport request number to delete, e.g. ABCK900001.',
      },
    },
    required: ['transport_number'],
  },
} as const;

interface DeleteTransportArgs {
  transport_number: string;
}

export async function handleDeleteTransport(
  context: HandlerContext,
  args: DeleteTransportArgs,
) {
  const { connection, logger } = context;
  try {
    const transport_number = args?.transport_number;
    if (!transport_number) {
      return return_error(new Error('transport_number is required'));
    }
    const tr = transport_number.toUpperCase();

    logger?.info(`DeleteTransport: ${tr}`);

    await makeAdtRequestWithTimeout(
      connection,
      `/sap/bc/adt/cts/transportrequests/${tr}`,
      'DELETE',
      'default',
      undefined,
      undefined,
      { Accept: 'application/*' },
    );

    return return_response({
      data: JSON.stringify({
        success: true,
        transport_number: tr,
        message: `Transport ${tr} deleted`,
      }),
    } as AxiosResponse);
  } catch (error: any) {
    logger?.error(`DeleteTransport failed: ${error?.message || error}`);
    return return_error(error);
  }
}
