/**
 * Parser for authorization FIELD (`AUTH`, discovery category `auth`) and authorization OBJECT
 * (`SUSO`, discovery category `suso`) — SU20/SU21 metadata, reachable via ADT.
 *
 * CORRECTS THIS PROJECT'S OWN EARLIER VERDICT. A prior round found `/sap/bc/adt/aps/iam/auth` and
 * `/sap/bc/adt/aps/iam/suso` in discovery, saw only VALUE-HELP sub-resources in their
 * `templateLinks` (`$authobjects`, `objectclass/values`, …), and concluded these were reachable
 * only as search/lookup endpoints, not as a plain single-object GET — recorded in CLAUDE.md as
 * "shaped too differently... left for a dedicated round". That conclusion was drawn from the
 * ABSENCE of a `{object_name}` templateLink, never from an actual request. **A direct GET on the
 * collection's own href + `/{name}` works for both**, ground-truthed live on DM2/310 against
 * `ACTVT` (a real SU20 field) and `S_TABU_DIS` (a real SU21 object) — both collections advertise
 * `application/vnd.sap.adt.blues.v1+xml`, the same media-type family as every other simple
 * workbench-object read in this project. The lesson, stated so it is not repeated: an absent
 * templateLink is evidence the endpoint isn't ADVERTISED for that shape, not evidence it doesn't
 * WORK — test the plain `{collection}/{name}` GET before concluding otherwise.
 *
 * EXISTENCE IS SIGNALLED DIFFERENTLY BY THE TWO ENDPOINTS, MEASURED, NOT ASSUMED:
 *  - a bogus AUTH field name answers a clean `404 ExceptionResourceNotFound`;
 *  - a bogus SUSO object name answers `500` with `<type id="Authorization Object">` — the SAME
 *    "Object directory entry was not found" message text, but NOT the same exception type or
 *    status a caller could safely treat as "not found" on its own. So SUSO's existence check
 *    matches on that message text specifically; a genuine 500 with different text still
 *    propagates as an error rather than being silently read as "does not exist".
 */

import { XMLParser } from 'fast-xml-parser';

function bool(value: unknown): boolean | undefined {
  if (value === undefined || value === null) return undefined;
  const s = String(value).trim().toLowerCase();
  if (s === 'true') return true;
  if (s === 'false') return false;
  return undefined;
}

function str(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  const s = String(value).trim();
  return s.length > 0 ? s : undefined;
}

export interface AuthorizationFieldMetadata {
  name: string;
  description?: string;
  type?: string;
  master_language?: string;
  language?: string;
  responsible?: string;
  package_name?: string;
}

export interface AuthorizationFieldContent {
  data_element?: string;
  check_table?: string;
  domain?: string;
  output_length?: string;
  has_search_help?: boolean;
  search_help_name?: string;
  search_help_description?: string;
  has_exit_module?: boolean;
  org_level_info?: string;
}

export interface AuthorizationField
  extends AuthorizationFieldMetadata,
    AuthorizationFieldContent {}

export function parseAuthorizationField(xml: string): AuthorizationField {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    // Keep every value a string: outputlen is '000002' and would lose its leading zeros to
    // numeric coercion, the same class of silent corruption src/lib/dataPreviewParser.ts exists
    // to remove.
    parseTagValue: false,
  });
  const root = parser.parse(xml ?? '')?.['auth:auth'] ?? {};
  const content = root['auth:content'] ?? {};
  const packageRef = root['adtcore:packageRef'];

  return {
    name: str(root['@_adtcore:name']) ?? '',
    description: str(root['@_adtcore:description']),
    type: str(root['@_adtcore:type']),
    master_language: str(root['@_adtcore:masterLanguage']),
    language: str(root['@_adtcore:language']),
    responsible: str(root['@_adtcore:responsible']),
    package_name: str(packageRef?.['@_adtcore:name']),
    data_element: str(content['auth:rollName']),
    check_table: str(content['auth:checkTable']),
    domain: str(content['auth:domname']),
    output_length: str(content['auth:outputlen']),
    has_search_help: bool(content['auth:col_searchhelp']),
    search_help_name: str(content['auth:col_searchhelp_name']),
    search_help_description: str(content['auth:col_searchhelp_descr']),
    has_exit_module: bool(content['auth:objexit']),
    org_level_info: str(content['auth:orglvlinfo']),
  };
}

export interface AuthorizationObjectField {
  name: string;
  description?: string;
  is_activity_field?: boolean;
  search_help?: string;
  disabled?: boolean;
}

export interface AuthorizationActivity {
  code: string;
  text?: string;
  access_category?: string;
}

export interface AuthorizationObject {
  name: string;
  description?: string;
  type?: string;
  master_language?: string;
  language?: string;
  responsible?: string;
  package_name?: string;
  object_class?: string;
  object_class_description?: string;
  criticality?: string;
  privileged?: string;
  fields: AuthorizationObjectField[];
  activities: AuthorizationActivity[];
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

export function parseAuthorizationObject(xml: string): AuthorizationObject {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    isArray: (name) => name === 'suso:authField' || name === 'suso:activity',
    // Activity codes are '02'/'03' — numeric coercion would strip the leading zero.
    parseTagValue: false,
  });
  const root = parser.parse(xml ?? '')?.['suso:suso'] ?? {};
  const content = root['suso:content'] ?? {};
  const packageRef = root['adtcore:packageRef'];

  const fields = asArray<any>(
    content['suso:authFields']?.['suso:authField'],
  ).map((f) => ({
    name: str(f?.['suso:name']) ?? '',
    description: str(f?.['suso:description']),
    is_activity_field: bool(f?.['suso:activityField']),
    search_help: str(f?.['suso:searchHelp']),
    disabled: bool(f?.['suso:disable']),
  }));

  const activities = asArray<any>(
    content['suso:activities']?.['suso:activity'],
  ).map((a) => ({
    code: str(a?.['suso:code']) ?? '',
    text: str(a?.['suso:text']),
    access_category: str(a?.['suso:accessCategory']),
  }));

  return {
    name: str(root['@_adtcore:name']) ?? '',
    description: str(root['@_adtcore:description']),
    type: str(root['@_adtcore:type']),
    master_language: str(root['@_adtcore:masterLanguage']),
    language: str(root['@_adtcore:language']),
    responsible: str(root['@_adtcore:responsible']),
    package_name: str(packageRef?.['@_adtcore:name']),
    object_class: str(content['suso:objectClassName']),
    object_class_description: str(content['suso:objectClassDescription']),
    criticality: str(content['suso:criticality']),
    privileged: str(content['suso:privileged']),
    fields,
    activities,
  };
}

/** The exact wording SAP uses for "no such AUTH field / SUSO object" — measured live. */
export const AUTH_IAM_NOT_FOUND_TEXT = 'Object directory entry was not found';
