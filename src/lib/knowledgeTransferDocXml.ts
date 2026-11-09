/**
 * Parser for a Knowledge Transfer Document (SKTD, discovery collection
 * `/sap/bc/adt/documentation/ktd/documents`, category `sktdtyp`) — free-form design-time
 * documentation SAP attaches to a CDS entity/element (e.g. explaining an RAP business event).
 *
 * Ground-truthed live on DM2/310 against real SAP-shipped documents (found via
 * `SELECT obj_name FROM tadir WHERE object = 'SKTD'`), e.g. `D_CUSTSETTLMTCHANGED_SOD2`.
 * TWO TRAPS MEASURED LIVE:
 *  - the GET answers HTTP 500 (a generic ICF error page, not a clean ADT exception) unless the
 *    request explicitly sends `Accept: application/vnd.sap.adt.sktdv2+xml` — the media type
 *    discovery advertises. Without it, this looks like a server bug; it is a missing header.
 *  - `<sktd:text>` (the documentation body) is BASE64-encoded, not plain text — reading it
 *    without decoding returns gibberish that still "looks like" a string, exactly the kind of
 *    silently-wrong value this project's defect-class table exists to name.
 * A bogus name answers a clean `404 ExceptionResourceNotFound`, so existence is unambiguous.
 */

import { XMLParser } from 'fast-xml-parser';

export interface SktdElement {
  id?: string;
  /** Decoded from the wire's base64 — never the raw base64 string. */
  text?: string;
  short_text?: string;
  short_text_obligation?: string;
  can_have_documentation?: boolean;
  ref_object_name?: string;
  ref_object_type?: string;
  ref_object_uri?: string;
}

export interface KnowledgeTransferDoc {
  name: string;
  description?: string;
  type?: string;
  master_language?: string;
  language?: string;
  responsible?: string;
  created_at?: string;
  changed_at?: string;
  package_name?: string;
  ref_object_name?: string;
  ref_object_type?: string;
  ref_object_uri?: string;
  elements: SktdElement[];
}

function decodeBase64Text(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.length === 0) return undefined;
  try {
    return Buffer.from(value, 'base64').toString('utf-8');
  } catch {
    // If it does not decode as base64, surface the raw value rather than silently returning
    // nothing — a decode failure is worth seeing, not hiding.
    return value;
  }
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

export function parseKnowledgeTransferDoc(xml: string): KnowledgeTransferDoc {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    isArray: (name) => name === 'sktd:element',
  });
  const parsed = parser.parse(xml ?? '');
  const root = parsed?.['sktd:docu'] ?? {};
  const packageRef = root['adtcore:packageRef'];
  const refObject = root['sktd:refObject'];

  const elements = asArray<any>(root['sktd:element']).map((el) => {
    const elRefObject = el?.['adtcore:objectReference'];
    return {
      id: el?.['sktd:id'] !== undefined ? String(el['sktd:id']) : undefined,
      text: decodeBase64Text(el?.['sktd:text']),
      short_text: el?.['sktd:shortText']?.['@_sktd:text']
        ? String(el['sktd:shortText']['@_sktd:text'])
        : undefined,
      short_text_obligation: el?.['sktd:shortText']?.['@_sktd:obligation']
        ? String(el['sktd:shortText']['@_sktd:obligation'])
        : undefined,
      can_have_documentation:
        el?.['@_sktd:canHaveDocumentation'] !== undefined
          ? el['@_sktd:canHaveDocumentation'] === 'true'
          : undefined,
      ref_object_name: elRefObject?.['@_adtcore:name']
        ? String(elRefObject['@_adtcore:name'])
        : undefined,
      ref_object_type: elRefObject?.['@_adtcore:type']
        ? String(elRefObject['@_adtcore:type'])
        : undefined,
      ref_object_uri: elRefObject?.['@_adtcore:uri']
        ? String(elRefObject['@_adtcore:uri'])
        : undefined,
    };
  });

  return {
    name: String(root['@_adtcore:name'] ?? ''),
    description: root['@_adtcore:description']
      ? String(root['@_adtcore:description'])
      : undefined,
    type: root['@_adtcore:type'] ? String(root['@_adtcore:type']) : undefined,
    master_language: root['@_adtcore:masterLanguage']
      ? String(root['@_adtcore:masterLanguage'])
      : undefined,
    language: root['@_adtcore:language']
      ? String(root['@_adtcore:language'])
      : undefined,
    responsible: root['@_adtcore:responsible']
      ? String(root['@_adtcore:responsible'])
      : undefined,
    created_at: root['@_adtcore:createdAt']
      ? String(root['@_adtcore:createdAt'])
      : undefined,
    changed_at: root['@_adtcore:changedAt']
      ? String(root['@_adtcore:changedAt'])
      : undefined,
    package_name: packageRef?.['@_adtcore:name']
      ? String(packageRef['@_adtcore:name'])
      : undefined,
    ref_object_name: refObject?.['@_adtcore:name']
      ? String(refObject['@_adtcore:name'])
      : undefined,
    ref_object_type: refObject?.['@_adtcore:type']
      ? String(refObject['@_adtcore:type'])
      : undefined,
    ref_object_uri: refObject?.['@_adtcore:uri']
      ? String(refObject['@_adtcore:uri'])
      : undefined,
    elements,
  };
}
