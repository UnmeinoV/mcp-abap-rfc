/**
 * Package deletion via ADT's deletion API — in-repo bypass of the adt-clients dep.
 *
 * `@mcp-abap-adt/adt-clients` getPackage().delete() throws a generic
 * "Package deletion failed: Deletion failed": it reads `del:message.del:text`
 * assuming a SINGLE message, so when SAP returns an ARRAY of messages (the usual
 * case for a real failure — no TADIR record, locked in a transport, package not
 * empty, …) the text is lost and replaced by the fallback string.
 *
 * The request/response handling now lives in `./adtDeletion` (the same endpoint
 * serves every object type); this module keeps the package-specific URI shape
 * and its own exported names so existing callers/tests are unaffected.
 */

import type { IAbapConnection } from '@mcp-abap-adt/interfaces';
import {
  buildDeletionXml,
  deleteAdtObjectWithMessages,
  parseDeletionResult,
} from './adtDeletion';
import { type AxiosResponse, encodeSapObjectName } from './utils';

export interface PackageDeletionMessage {
  type?: string;
  text: string;
}

export interface PackageDeletionResult {
  isDeleted: boolean;
  messages: PackageDeletionMessage[];
  status: number;
}

/** ADT URI of a package. */
function packageUri(packageName: string): string {
  return `/sap/bc/adt/packages/${encodeSapObjectName(packageName).toLowerCase()}`;
}

/** Build the ADT deletionRequest body for a package. */
export function buildPackageDeletionXml(
  packageName: string,
  transportRequest?: string,
): string {
  return buildDeletionXml(packageUri(packageName), transportRequest);
}

/**
 * Parse a `del:deletionResult` response into { isDeleted, messages }. Namespace
 * prefixes are stripped, and `del:message` is coerced to an array so a single
 * message and a message array are both captured.
 */
export function parsePackageDeletionResult(
  response: AxiosResponse,
): PackageDeletionResult {
  const { isDeleted, messages, status } = parseDeletionResult(response);
  return { isDeleted, messages, status };
}

/**
 * Delete a package via `/sap/bc/adt/deletion/delete` and return SAP's own
 * result (isDeleted + every message). Throws on transport/HTTP errors (e.g. a
 * genuine 404) — the caller handles those separately.
 */
export async function deletePackageWithMessages(
  connection: IAbapConnection,
  packageName: string,
  transportRequest?: string,
): Promise<PackageDeletionResult> {
  const { isDeleted, messages, status } = await deleteAdtObjectWithMessages(
    connection,
    packageUri(packageName),
    transportRequest,
  );
  return { isDeleted, messages, status };
}
