/**
 * Operations shared by the table-index handlers.
 *
 * The awkward part of an index is not the payload, it is the ACTIVATION ORDER.
 * An index and its table are mutually dependent:
 *
 *   - activating the index alone fails: `Table ... is not active in ABAP Dictionary`
 *   - activating the table while the index has no fields fails:
 *     `[E] Index <TAB>-<ID> does not contain fields` — so a half-created index
 *     does not merely sit there, it BREAKS the table's activation
 *
 * Passing both object references in ONE activation call succeeds. Every write
 * here therefore activates the pair together, and a create that cannot be
 * completed removes the shell it made rather than leaving the table unactivatable.
 */

import type { IAbapConnection } from '@mcp-abap-adt/interfaces';
import { adtObjectExists, deleteAdtObjectWithMessages } from './adtDeletion';
import { evaluateActivation, formatAdtMessages } from './adtMessages';
import { activateAdtObjects, runLocked } from './adtObjectOps';
import {
  CT_TABLE_INDEX_SOURCE,
  TABLE_INDEX_TYPE,
  tableIndexName,
  tableIndexUri,
  tableUri,
} from './tableIndexXml';
import { makeAdtRequestWithTimeout } from './utils';

/** Write an index's JSON source (the field list) under a lock. */
export async function writeTableIndexSource(
  connection: IAbapConnection,
  tableName: string,
  indexId: string,
  source: string,
  transportRequest?: string,
): Promise<void> {
  const uri = tableIndexUri(tableName, indexId);
  await runLocked(connection, uri, async (lockHandle) => {
    const params: Record<string, string> = { lockHandle };
    if (transportRequest) params.corrNr = transportRequest;
    await makeAdtRequestWithTimeout(
      connection,
      `${uri}/source/main`,
      'PUT',
      'default',
      source,
      params,
      { 'Content-Type': CT_TABLE_INDEX_SOURCE },
    );
  });
}

export interface IndexActivationOutcome {
  success: boolean;
  activated: boolean;
  checked: boolean;
  messages: unknown[];
  errors: unknown[];
  description: string;
}

/**
 * Activate an index together with its table — the only order that works.
 *
 * Success is decided from the MESSAGES, not from the activated/checked flags:
 * SAP sets `activationExecuted="true"` even for objects it rejected, and this
 * endpoint was observed reporting `activated:true, checked:true` alongside
 * E-level messages saying the activation was cancelled.
 */
export async function activateIndexWithTable(
  connection: IAbapConnection,
  tableName: string,
  indexId: string,
): Promise<IndexActivationOutcome> {
  const raw = await activateAdtObjects(connection, [
    {
      uri: tableUri(tableName),
      name: tableName.toUpperCase(),
      type: 'TABL/DT',
    },
    {
      uri: tableIndexUri(tableName, indexId),
      name: tableIndexName(tableName, indexId),
      type: TABLE_INDEX_TYPE,
    },
  ]);
  const outcome = evaluateActivation(raw);
  return {
    success: outcome.success,
    activated: outcome.activated,
    checked: outcome.checked,
    messages: outcome.messages,
    errors: outcome.errors,
    description: outcome.success
      ? `Index ${tableIndexName(tableName, indexId)} and table ${tableName.toUpperCase()} activated`
      : `Activation FAILED: ${formatAdtMessages(outcome.errors)}`,
  };
}

/**
 * Best-effort removal of an index shell.
 *
 * Used when a create cannot be finished. This is not tidiness: an index with no
 * fields makes its own table refuse to activate, so leaving the shell behind
 * would hand back a broken table.
 */
export async function removeIndexShell(
  connection: IAbapConnection,
  tableName: string,
  indexId: string,
  transportRequest?: string,
): Promise<string | null> {
  const uri = tableIndexUri(tableName, indexId);
  try {
    const result = await deleteAdtObjectWithMessages(
      connection,
      uri,
      transportRequest,
    );
    // Existence decides, not SAP's flag: the index deletion endpoint answers
    // isDeleted="false" with a database-error message for deletes that in fact
    // succeeded. Believing the flag here left the shell "un-removable" and so
    // reported a broken table that was actually fine.
    const stillThere = await adtObjectExists(connection, uri).catch(
      () => undefined,
    );
    if (stillThere === false) return null;
    if (stillThere === undefined && result.isDeleted) return null;
    throw new Error(
      formatAdtMessages(result.messages) || 'the object is still present',
    );
  } catch (error: any) {
    return (
      `The incomplete index ${tableIndexName(
        tableName,
        indexId,
      )} could NOT be removed (${error?.message || error}). It has no fields, which ` +
      `will make table ${tableName.toUpperCase()} fail to activate — delete it with ` +
      'DeleteTableIndex or in SE11.'
    );
  }
}
