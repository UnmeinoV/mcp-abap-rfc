/**
 * DeleteLockObject Handler - Delete an ABAP lock object (ENQU). Workflow: lock -> DELETE.
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
  name: 'DeleteLockObject',
  available_in: ['onprem', 'legacy'] as const,
  description:
    'Operation: Delete. Subject: LockObject (ENQU). Delete an ABAP lock object from the SAP system.',
  inputSchema: {
    type: 'object',
    properties: {
      lock_object_name: { type: 'string', description: 'Lock object name.' },
      transport_request: {
        type: 'string',
        description:
          'Transport request. Required for transportable objects; optional for $TMP.',
      },
    },
    required: ['lock_object_name'],
  },
} as const;

interface DeleteLockObjectArgs {
  lock_object_name: string;
  transport_request?: string;
}

export async function handleDeleteLockObject(
  context: HandlerContext,
  args: DeleteLockObjectArgs,
) {
  const { connection, logger } = context;
  try {
    if (!args?.lock_object_name)
      return return_error(new Error('lock_object_name is required'));
    createAdtClient(connection, logger); // wrap connection (sap-language pinning)
    const name = args.lock_object_name.toUpperCase();
    const url = `/sap/bc/adt/ddic/lockobjects/sources/${encodeSapObjectName(name).toLowerCase()}`;

    await runLocked(connection, url, async (lockHandle) => {
      await deleteAdt(connection, url, lockHandle, args.transport_request);
    });

    // GROUND TRUTH: verify the object is really gone rather than trusting
    // that the DELETE returned without throwing. Same reason the other
    // Delete* handlers verify — a deletion SAP declined must not be
    // reported as success, or the next run fails with a misleading
    // "already exists".
    const deletionFailure = await describeFailedDeletion(
      connection,
      url,
      `Lock object ${name}`,
    );
    if (deletionFailure) {
      throw new Error(deletionFailure);
    }
    logger?.info(`Lock object deleted: ${name}`);

    return return_response({
      data: JSON.stringify(
        {
          success: true,
          lock_object_name: name,
          message: `Lock object ${name} deleted successfully.`,
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
    const msg = `Error deleting lock object ${args?.lock_object_name}: ${error instanceof Error ? error.message : String(error)}${bodyText ? ` | ADT: ${bodyText.slice(0, 1000)}` : ''}`;
    logger?.error(msg);
    return return_error(new Error(msg));
  }
}
