/**
 * DeleteTableIndex — remove a secondary index from a DDIC table.
 *
 * After the delete the table is re-activated, because the index was part of the
 * table's runtime object: leaving it out of the active definition without
 * re-activating means the database index stays behind. The deletion is then
 * VERIFIED against the system rather than trusted — the same discipline the
 * other Delete* handlers use, and here it matters twice over, since a "deleted"
 * index that is still there keeps its constraint.
 */

import {
  adtObjectExists,
  deleteAdtObjectWithMessages,
} from '../../../lib/adtDeletion';
import {
  evaluateActivation,
  formatAdtMessages,
} from '../../../lib/adtMessages';
import { activateAdtObjects } from '../../../lib/adtObjectOps';
import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  tableIndexName,
  tableIndexUri,
  tableUri,
} from '../../../lib/tableIndexXml';
import { return_error, return_response } from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'DeleteTableIndex',
  available_in: ['onprem'] as const,
  description:
    'Operation: Delete. Subject: Table secondary index (SE11, DDIC type TABL/DTI). ' +
    'Delete a secondary index and re-activate its table so the database index is really ' +
    'dropped. The deletion is verified against the system afterwards, so a refusal is reported ' +
    'as a failure and not as success.',
  inputSchema: {
    type: 'object',
    properties: {
      table_name: {
        type: 'string',
        description: 'Table the index belongs to.',
      },
      index_id: {
        type: 'string',
        description: 'Index id (max 3 characters), e.g. "VER".',
      },
      transport_request: {
        type: 'string',
        description: 'Transport request, when the package is transportable.',
      },
    },
    required: ['table_name', 'index_id'],
  },
} as const;

interface Args {
  table_name: string;
  index_id: string;
  transport_request?: string;
}

export async function handleDeleteTableIndex(
  context: HandlerContext,
  args: Args,
) {
  const { connection, logger } = context;
  try {
    if (!args?.table_name) {
      return return_error(new Error('table_name is required'));
    }
    if (!args?.index_id) {
      return return_error(new Error('index_id is required'));
    }
    const tableName = args.table_name.toUpperCase();
    const indexId = args.index_id.toUpperCase();
    const name = tableIndexName(tableName, indexId);
    const uri = tableIndexUri(tableName, indexId);

    createAdtClient(connection, logger); // wrap connection (sap-language pinning)
    logger?.info(`Deleting index ${name}`);

    // Existence is the verdict AFTER the delete (see below), which means a
    // delete of something that never existed would otherwise look like a
    // success. Check first so "not found" is reported as not found.
    const existedBefore = await adtObjectExists(connection, uri).catch(
      () => undefined,
    );
    if (existedBefore === false) {
      return return_error(
        new Error(
          `Index ${name} does not exist, so there was nothing to delete. ` +
            `List the table's indexes with GetTableIndexes { table_name: "${tableName}" }.`,
        ),
      );
    }

    const result = await deleteAdtObjectWithMessages(
      connection,
      uri,
      args.transport_request,
    );

    // GROUND TRUTH IS EXISTENCE, NOT SAP'S FLAG — and for an index the flag is
    // the unreliable half. Measured on DM2/310: deleting an index answers
    // `del:isDeleted="false"` with `[E] Error while deleting object <TAB> <ID>
    // from the database` while the object really IS gone (a following GET 404s).
    // Trusting the flag reported a failure for a successful delete; trusting it
    // the other way would report success for a refusal. So ask the system, and
    // relay SAP's messages either way.
    const stillThere = await adtObjectExists(connection, uri).catch(
      () => undefined,
    );
    if (stillThere === true) {
      return return_error(
        new Error(
          `Failed to delete index ${name} — it still exists. ${
            formatAdtMessages(result.messages) || 'SAP reported no reason.'
          }`,
        ),
      );
    }
    if (stillThere === undefined && !result.isDeleted) {
      // Could not confirm either way and SAP said no: report the failure rather
      // than guessing in the caller's favour.
      return return_error(
        new Error(
          `Could not confirm that index ${name} was deleted, and SAP reported: ${
            formatAdtMessages(result.messages) || 'no reason'
          }. Check with GetTableIndexes { table_name: "${tableName}" }.`,
        ),
      );
    }

    // Re-activate the table so the index really disappears from the runtime
    // object. Reported as a warning, not a failure: the index IS gone, and
    // hiding a successful delete behind an activation problem would be worse.
    let activationWarning: string | undefined;
    try {
      const outcome = evaluateActivation(
        await activateAdtObjects(connection, [
          { uri: tableUri(tableName), name: tableName, type: 'TABL/DT' },
        ]),
      );
      if (!outcome.success) {
        activationWarning =
          `Index ${name} was deleted, but re-activating table ${tableName} reported: ` +
          `${formatAdtMessages(outcome.errors)}. The database index may still exist until ` +
          'the table activates cleanly.';
      }
    } catch (activationError: any) {
      activationWarning =
        `Index ${name} was deleted, but table ${tableName} could not be re-activated ` +
        `(${activationError?.message || activationError}). Activate it to drop the database index.`;
    }

    return return_response({
      data: JSON.stringify(
        {
          success: true,
          table_name: tableName,
          index_id: indexId,
          index_name: name,
          verified_deleted: true,
          messages: result.messages,
          ...(result.isDeleted
            ? {}
            : {
                note:
                  'SAP reported isDeleted="false" for this index, but the object no longer ' +
                  'exists. The index deletion endpoint is known to answer with a database ' +
                  'error message for a delete that succeeded, so existence was used as the ' +
                  'verdict.',
              }),
          ...(activationWarning ? { warning: activationWarning } : {}),
          message: `Index ${name} deleted and confirmed gone.`,
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
    const body = error?.response?.data
      ? typeof error.response.data === 'string'
        ? error.response.data
        : JSON.stringify(error.response.data)
      : '';
    let message = `Failed to delete index ${args?.table_name}~${args?.index_id}: ${
      error instanceof Error ? error.message : String(error)
    }`;
    if (error?.response?.status === 404) {
      message =
        `Index ${args?.table_name?.toUpperCase()}~${args?.index_id?.toUpperCase()} not found. ` +
        `List the table's indexes with GetTableIndexes.`;
    } else if (body) {
      message += ` | ADT: ${body.slice(0, 800)}`;
    }
    logger?.error(message);
    return return_error(new Error(message));
  }
}
