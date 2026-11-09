/**
 * AddTransportUser Handler - add a user (own task) to a transport request.
 *
 * Mirrors abap-adt-api's transportAddUser:
 *   POST /sap/bc/adt/cts/transportrequests/{tr}/tasks
 *   body: <tm:root ... tm:targetuser tm:useraction="newtask"/>
 *
 * Mutating: creates a new task owned by the given user under the request.
 */

import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  type AxiosResponse,
  makeAdtRequestWithTimeout,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'AddTransportUser',
  available_in: ['onprem'] as const,
  description:
    'Add a user to a transport request (creates a new task owned by that user under the request).',
  inputSchema: {
    type: 'object',
    properties: {
      transport_number: {
        type: 'string',
        description: 'Transport request number, e.g. ABCK900001.',
      },
      user: {
        type: 'string',
        description: 'SAP user name to add as a task owner.',
      },
    },
    required: ['transport_number', 'user'],
  },
} as const;

interface AddTransportUserArgs {
  transport_number: string;
  user: string;
}

export async function handleAddTransportUser(
  context: HandlerContext,
  args: AddTransportUserArgs,
) {
  const { connection, logger } = context;
  try {
    const { transport_number, user } = args ?? ({} as any);
    if (!transport_number || !user) {
      return return_error(new Error('transport_number and user are required'));
    }
    const tr = transport_number.toUpperCase();
    const targetuser = user.toUpperCase();
    const body = `<?xml version="1.0" encoding="ASCII"?>
  <tm:root xmlns:tm="http://www.sap.com/cts/adt/tm" tm:number="${tr}"
  tm:targetuser="${targetuser}" tm:useraction="newtask"/>`;

    logger?.info(`AddTransportUser: ${tr} += ${targetuser}`);

    await makeAdtRequestWithTimeout(
      connection,
      `/sap/bc/adt/cts/transportrequests/${tr}/tasks`,
      'POST',
      'default',
      body,
      undefined,
      { Accept: 'application/*', 'Content-Type': 'text/plain' },
    );

    return return_response({
      data: JSON.stringify({
        success: true,
        transport_number: tr,
        user: targetuser,
        message: `User ${targetuser} added to transport ${tr}`,
      }),
    } as AxiosResponse);
  } catch (error: any) {
    logger?.error(`AddTransportUser failed: ${error?.message || error}`);
    return return_error(error);
  }
}
