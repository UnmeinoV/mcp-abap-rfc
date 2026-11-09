/**
 * Function group creation — in-repo bypass of the adt-clients dep.
 *
 * WHY: the dep builds the create payload by string interpolation with the
 * comment "Build XML payload - no escaping (same as old working code)"
 * (core/functionGroup/create.js). So a description containing an XML
 * metacharacter produces a MALFORMED document and ADT answers
 *
 *     Bad request: Data is invalid and could not be converted
 *
 * REPRODUCED LIVE on SAP_BASIS 7.56: `CreateFunctionGroup` with the description
 * `Probe B: A & B "quoted" <tag>` fails with exactly that message, while the
 * same call with a plain (or purely Chinese) description succeeds. That is the
 * same error text reported for a system where every CreateFunctionGroup call
 * failed.
 *
 * Two further robustness measures, because the dep pins ONE content-type
 * version (`application/vnd.sap.adt.functions.groups.v3+xml`) while sending a
 * v1/v2-shaped body — a combination a different release may refuse:
 *
 *  - on a 4xx the POST is retried with the v2 and v1 media types before giving
 *    up (same idea as advertising both SRVB versions in Accept);
 *  - the ADT response body is always surfaced, so the next failure reports
 *    SAP's own words instead of a bare "Bad request".
 */

import type { IAbapConnection } from '@mcp-abap-adt/interfaces';
import { escXml } from './adtObjectOps';
import { type AxiosResponse, makeAdtRequestWithTimeout } from './utils';

/**
 * Content types to try, in order. The dep only ever sends v3; older releases
 * expose v2/v1 for this collection.
 */
const FUNCTION_GROUP_CONTENT_TYPES = [
  'application/vnd.sap.adt.functions.groups.v3+xml',
  'application/vnd.sap.adt.functions.groups.v2+xml',
  'application/vnd.sap.adt.functions.groups.v1+xml',
] as const;

export interface FunctionGroupCreateParams {
  functionGroupName: string;
  packageName: string;
  description?: string;
  masterLanguage?: string;
  masterSystem?: string;
  responsible?: string;
  transportRequest?: string;
}

/** SAP DDIC/ADT descriptions are capped at 60 characters. */
function limitDescription(description: string): string {
  return (description ?? '').slice(0, 60);
}

/**
 * Build the function group create body with every interpolated value ESCAPED.
 * Exported for unit testing — the escaping is the whole point.
 */
export function buildFunctionGroupCreateXml(
  params: FunctionGroupCreateParams,
): string {
  const lang = (params.masterLanguage || 'EN').toUpperCase();
  const name = params.functionGroupName.toUpperCase();
  const description = limitDescription(params.description || name);
  const masterSystemAttr = params.masterSystem
    ? ` adtcore:masterSystem="${escXml(params.masterSystem)}"`
    : '';
  // An empty responsible is omitted rather than sent blank: a blank value has
  // been observed to trigger a spurious "Kerberos library not loaded" error.
  const responsible = params.responsible?.trim();
  const responsibleAttr = responsible
    ? ` adtcore:responsible="${escXml(responsible)}"`
    : '';
  return (
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<group:abapFunctionGroup xmlns:group="http://www.sap.com/adt/functions/groups" ` +
    `xmlns:adtcore="http://www.sap.com/adt/core" ` +
    `adtcore:description="${escXml(description)}" ` +
    `adtcore:language="${escXml(lang)}" ` +
    `adtcore:name="${escXml(name)}" ` +
    `adtcore:type="FUGR/F" ` +
    `adtcore:masterLanguage="${escXml(lang)}"${masterSystemAttr}${responsibleAttr}>` +
    `<adtcore:packageRef adtcore:name="${escXml(params.packageName.toUpperCase())}"/>` +
    `</group:abapFunctionGroup>`
  );
}

/** Extract a readable body from an axios error for the message. */
function bodyText(error: any): string {
  const body = error?.response?.data;
  if (!body) return '';
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  return text.slice(0, 1200);
}

/**
 * POST a new function group, escaping the payload and falling back through the
 * known content-type versions on a 4xx.
 *
 * Returns the successful response. Throws an Error whose message carries the
 * HTTP status, the media types tried and SAP's own response body.
 */
export async function createFunctionGroupDirect(
  connection: IAbapConnection,
  params: FunctionGroupCreateParams,
): Promise<AxiosResponse> {
  const body = buildFunctionGroupCreateXml(params);
  const queryParams: Record<string, string> = {};
  if (params.transportRequest?.trim()) {
    queryParams.corrNr = params.transportRequest.trim();
  }

  let lastError: any;
  const tried: string[] = [];
  for (const contentType of FUNCTION_GROUP_CONTENT_TYPES) {
    tried.push(contentType);
    try {
      return (await makeAdtRequestWithTimeout(
        connection,
        '/sap/bc/adt/functions/groups',
        'POST',
        'default',
        body,
        Object.keys(queryParams).length ? queryParams : undefined,
        { 'Content-Type': contentType },
      )) as AxiosResponse;
    } catch (error: any) {
      lastError = error;
      const status = error?.response?.status;
      const text = bodyText(error);
      // SAP sometimes answers 400 "Kerberos library not loaded" while still
      // creating the object; that is handled by the caller, not by retrying.
      if (text.includes('Kerberos library not loaded')) throw error;
      // Only a media-type/payload rejection is worth retrying with another
      // version. Anything else (already exists, no authorization, bad package)
      // would fail identically.
      const retryable =
        status === 400 || status === 406 || status === 415 || status === 409;
      if (!retryable) throw error;
    }
  }

  const status = lastError?.response?.status;
  throw new Error(
    `Failed to create function group ${params.functionGroupName.toUpperCase()}` +
      (status ? ` (HTTP ${status})` : '') +
      `. Tried media types: ${tried.join(', ')}.` +
      (bodyText(lastError) ? ` ADT response: ${bodyText(lastError)}` : '') +
      ` If the description contains XML metacharacters they are escaped by this` +
      ` client, so a persistent "Data is invalid and could not be converted"` +
      ` points at the payload SHAPE expected by this release — capture the` +
      ` request SE80 sends on this system and compare.`,
  );
}
