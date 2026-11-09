/**
 * SetTransportOwner Handler - change the owner of a transport request.
 *
 * Mirrors abap-adt-api's transportSetOwner:
 *   PUT /sap/bc/adt/cts/transportrequests/{tr}?targetuser={user}
 *   body: <tm:root ... tm:number tm:targetuser tm:useraction="changeowner"/>
 *
 * Mutating.
 */

import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  type AxiosResponse,
  makeAdtRequestWithTimeout,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'SetTransportOwner',
  available_in: ['onprem'] as const,
  description: 'Change the owner of a transport request to another user.',
  inputSchema: {
    type: 'object',
    properties: {
      transport_number: {
        type: 'string',
        description: 'Transport request number, e.g. ABCK900001.',
      },
      owner: {
        type: 'string',
        description: 'New owner (SAP user name).',
      },
    },
    required: ['transport_number', 'owner'],
  },
} as const;

interface SetTransportOwnerArgs {
  transport_number: string;
  owner: string;
}

export async function handleSetTransportOwner(
  context: HandlerContext,
  args: SetTransportOwnerArgs,
) {
  const { connection, logger } = context;
  try {
    const { transport_number, owner } = args ?? ({} as any);
    if (!transport_number || !owner) {
      return return_error(new Error('transport_number and owner are required'));
    }
    const tr = transport_number.toUpperCase();
    const targetuser = owner.toUpperCase();
    const body = `<?xml version="1.0" encoding="ASCII"?><tm:root xmlns:tm="http://www.sap.com/cts/adt/tm" tm:number="${tr}" tm:targetuser="${targetuser}" tm:useraction="changeowner"/>`;

    logger?.info(`SetTransportOwner: ${tr} -> ${targetuser}`);

    await makeAdtRequestWithTimeout(
      connection,
      `/sap/bc/adt/cts/transportrequests/${tr}`,
      'PUT',
      'default',
      body,
      { targetuser },
      { Accept: 'application/*', 'Content-Type': 'text/plain' },
    );

    return return_response({
      data: JSON.stringify({
        success: true,
        transport_number: tr,
        owner: targetuser,
        message: `Transport ${tr} owner changed to ${targetuser}`,
      }),
    } as AxiosResponse);
  } catch (error: any) {
    logger?.error(`SetTransportOwner failed: ${error?.message || error}`);
    return return_error(error);
  }
}
