/**
 * Robust read-modify-write helpers for ABAP Table Type (TTYP) XML.
 *
 * Background / why this exists
 * ----------------------------
 * A table type is created with a *bare* POST (root element + packageRef only),
 * so the fresh object has no `<ttyp:rowType>` / `<ttyp:accessType>` /
 * `<ttyp:primaryKey>` nodes yet. The row type — the whole point of a table type
 * — has to be written with a follow-up PUT.
 *
 * `@mcp-abap-adt/adt-clients` writes it with a regex patch
 * (`patchTableTypeXml` → `patchXmlElement`), which is `xml.replace(...)` against
 * a tag that must ALREADY EXIST. On a freshly created table type the tags are
 * absent, so every replace silently no-ops and the row type is dropped — the
 * exact same failure mode that was fixed for domains (see ./domainXml.ts).
 *
 * These helpers parse the XML, INSERT the required nodes when missing, set the
 * requested values, and serialize the document back, preserving everything the
 * server returned that we do not touch.
 *
 * Structure confirmed against a live system (SAP_BASIS 7.56, read of
 * STRING_TABLE via /sap/bc/adt/ddic/tabletypes/string_table):
 *
 *   <ttyp:tableType adtcore:description="..." adtcore:name="..." adtcore:type="TTYP/DA">
 *     <adtcore:packageRef adtcore:name="..."/>
 *     <ttyp:rowType>
 *       <ttyp:typeKind>predefinedAbapType</ttyp:typeKind>
 *       <ttyp:typeName/>
 *       <ttyp:builtInType>
 *         <ttyp:dataType>STRING</ttyp:dataType>
 *         <ttyp:length>0</ttyp:length>
 *         <ttyp:decimals>0</ttyp:decimals>
 *       </ttyp:builtInType>
 *       <ttyp:rangeType/>
 *     </ttyp:rowType>
 *     <ttyp:initialRowCount>0</ttyp:initialRowCount>
 *     <ttyp:accessType>standard</ttyp:accessType>
 *     <ttyp:primaryKey>
 *       <ttyp:definition>standard</ttyp:definition>
 *       <ttyp:kind>nonUnique</ttyp:kind>
 *     </ttyp:primaryKey>
 *   </ttyp:tableType>
 */

import type { IAbapConnection } from '@mcp-abap-adt/interfaces';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { encodeSapObjectName, makeAdtRequestWithTimeout } from './utils';

/**
 * Accept for reading/writing a table type.
 *
 * The SINGULAR `...adt.tabletype.v1+xml` first, because that is what the live
 * discovery advertises for /sap/bc/adt/ddic/tabletypes and the only type this
 * resource can actually produce. The dep's constant lists ONLY the plural
 * `...adt.tabletypes.v2/v1+xml` (plus blues.v1) — probed live, every plural
 * media type answers 415 Unsupported Media Type on a write and makes a read
 * answer 406 Not Acceptable, so a plural-only Accept broke the whole flow. The
 * plural forms are kept AFTER the singular one for releases that do serve them:
 * the server picks whichever it can produce.
 */
export const ACCEPT_TABLE_TYPE =
  'application/vnd.sap.adt.tabletype.v1+xml, application/vnd.sap.adt.tabletypes.v2+xml, application/vnd.sap.adt.tabletypes.v1+xml';
export const CT_TABLE_TYPE = 'application/vnd.sap.adt.tabletype.v1+xml';

/**
 * How the row type is specified. Values are SAP's own value-help keys, read
 * from `ttyp:valueHelps/ttyp:typeKindValues` on a live system.
 */
export type TableTypeRowKind =
  | 'dictionaryType'
  | 'predefinedAbapType'
  | 'refToPredefinedAbapType'
  | 'refToDictionaryType'
  | 'refToClassOrInterfaceType'
  | 'rangeTypeOnPredefinedType'
  | 'rangeTypeOnDataelement';

export type TableTypeAccess =
  | 'standard'
  | 'sorted'
  | 'hashed'
  | 'index'
  | 'notSpecified';

export type TableTypeKeyDefinition =
  | 'standard'
  | 'rowType'
  | 'keyComponents'
  | 'notSpecified';

export type TableTypeKeyKind = 'unique' | 'nonUnique' | 'notSpecified';

export const TABLE_TYPE_ROW_KINDS: readonly TableTypeRowKind[] = [
  'dictionaryType',
  'predefinedAbapType',
  'refToPredefinedAbapType',
  'refToDictionaryType',
  'refToClassOrInterfaceType',
  'rangeTypeOnPredefinedType',
  'rangeTypeOnDataelement',
];
export const TABLE_TYPE_ACCESS_TYPES: readonly TableTypeAccess[] = [
  'standard',
  'sorted',
  'hashed',
  'index',
  'notSpecified',
];
export const TABLE_TYPE_KEY_DEFINITIONS: readonly TableTypeKeyDefinition[] = [
  'standard',
  'rowType',
  'keyComponents',
  'notSpecified',
];
export const TABLE_TYPE_KEY_KINDS: readonly TableTypeKeyKind[] = [
  'unique',
  'nonUnique',
  'notSpecified',
];

export interface TableTypeContentPatch {
  description?: string;
  /** Row type name — a structure/table/data element, or an ABAP builtin. */
  row_type_name?: string;
  row_type_kind?: TableTypeRowKind;
  /** Only for predefinedAbapType / refToPredefinedAbapType row kinds. */
  built_in_type?: { data_type: string; length?: number; decimals?: number };
  access_type?: TableTypeAccess;
  primary_key_definition?: TableTypeKeyDefinition;
  primary_key_kind?: TableTypeKeyKind;
  /**
   * Component names for `primary_key_definition: 'keyComponents'`.
   *
   * Without these the enum value can never succeed: SAP accepts the create and
   * then refuses to activate with `[E] Key components are not defined`, leaving
   * an inactive shell behind. The element shape is SAP's own, read from
   * FSBP_TP02_STY (a sorted type keyed on one component):
   *
   *   <ttyp:components ttyp:isVisible="true">
   *     <ttyp:component ttyp:name="TITLE_LET"/>
   *   </ttyp:components>
   */
  key_components?: string[];
  initial_row_count?: number;
}

const PARSER_OPTIONS = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  // Drop the prolog on parse; we prepend exactly one ourselves (a duplicated
  // declaration is rejected by SAP).
  ignoreDeclaration: true,
  // Keep values as strings — never let numeric coercion rewrite e.g. "000010".
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: true,
} as const;

const BUILDER_OPTIONS = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  suppressEmptyNode: true,
  // MUST stay false. fast-xml-parser defaults suppressBooleanAttributes to
  // TRUE, which rewrites any attribute whose value is the string "true" into a
  // VALUELESS attribute: `ttyp:isVisible="true"` becomes `ttyp:isVisible`.
  // SAP's XML parser then rejects the document — observed live as
  // `400 ExceptionInvalidData: System expected end of element ... tableType`
  // pointing at the element carrying such an attribute. HTML tolerates
  // valueless attributes; XML does not.
  suppressBooleanAttributes: false,
  format: false,
} as const;

/** SAP DDIC descriptions are capped at 60 characters. */
function limitDescription(description: string): string {
  return (description ?? '').slice(0, 60);
}

/** Coerce a parsed node into a mutable object, replacing scalar/empty nodes. */
function asObject(
  parent: Record<string, any>,
  key: string,
): Record<string, any> {
  const current = parent[key];
  if (current && typeof current === 'object' && !Array.isArray(current)) {
    return current;
  }
  const obj: Record<string, any> = {};
  parent[key] = obj;
  return obj;
}

/**
 * Apply the requested changes to a table type XML document, INSERTING the
 * rowType / accessType / primaryKey nodes when they are missing (which is the
 * case for every freshly created table type). Only explicitly provided fields
 * are touched.
 */
export function patchTableTypeContent(
  currentXml: string,
  patch: TableTypeContentPatch,
): string {
  const parser = new XMLParser(PARSER_OPTIONS);
  const parsed = parser.parse(currentXml);

  const root: Record<string, any> | undefined = parsed['ttyp:tableType'];
  if (!root || typeof root !== 'object') {
    throw new Error(
      'Unexpected table type XML: <ttyp:tableType> root element not found',
    );
  }

  if (patch.description !== undefined) {
    root['@_adtcore:description'] = limitDescription(patch.description);
  }

  if (
    patch.row_type_name !== undefined ||
    patch.row_type_kind !== undefined ||
    patch.built_in_type !== undefined
  ) {
    const rowType = asObject(root, 'ttyp:rowType');
    if (patch.row_type_kind !== undefined) {
      rowType['ttyp:typeKind'] = patch.row_type_kind;
    }
    if (patch.row_type_name !== undefined) {
      rowType['ttyp:typeName'] = patch.row_type_name.toUpperCase();
    }
    if (patch.built_in_type !== undefined) {
      const builtIn = asObject(rowType, 'ttyp:builtInType');
      builtIn['ttyp:dataType'] = patch.built_in_type.data_type.toUpperCase();
      builtIn['ttyp:length'] = String(patch.built_in_type.length ?? 0);
      builtIn['ttyp:decimals'] = String(patch.built_in_type.decimals ?? 0);
    }
  }

  if (patch.initial_row_count !== undefined) {
    root['ttyp:initialRowCount'] = String(patch.initial_row_count);
  }

  if (patch.access_type !== undefined) {
    root['ttyp:accessType'] = patch.access_type;
  }

  if (
    patch.primary_key_definition !== undefined ||
    patch.primary_key_kind !== undefined ||
    patch.key_components !== undefined
  ) {
    const primaryKey = asObject(root, 'ttyp:primaryKey');
    if (patch.primary_key_definition !== undefined) {
      primaryKey['ttyp:definition'] = patch.primary_key_definition;
    }
    if (patch.primary_key_kind !== undefined) {
      primaryKey['ttyp:kind'] = patch.primary_key_kind;
    }
    if (patch.key_components !== undefined) {
      // De-duplicated, order preserved: key component order is significant and
      // a repeated component is rejected at activation.
      const seen = new Set<string>();
      const components: Array<Record<string, string>> = [];
      for (const raw of patch.key_components) {
        const name = String(raw ?? '')
          .trim()
          .toUpperCase();
        if (!name || seen.has(name)) continue;
        seen.add(name);
        components.push({ '@_ttyp:name': name });
      }
      primaryKey['ttyp:components'] = {
        '@_ttyp:isVisible': 'true',
        'ttyp:component': components,
      };
    }
  }

  const builder = new XMLBuilder(BUILDER_OPTIONS);
  return `<?xml version="1.0" encoding="UTF-8"?>\n${builder.build(parsed)}`;
}

/** ADT URI of a table type. */
export function tableTypeUri(tableTypeName: string): string {
  return `/sap/bc/adt/ddic/tabletypes/${encodeSapObjectName(tableTypeName.toLowerCase())}`;
}

/**
 * Write table type content via read-modify-write against the ADT table type
 * endpoint. The object must already be locked (pass the lock handle).
 */
export async function writeTableTypeContent(
  connection: IAbapConnection,
  tableTypeName: string,
  patch: TableTypeContentPatch,
  lockHandle: string,
  transportRequest?: string,
) {
  const url = tableTypeUri(tableTypeName);

  const getResp = await makeAdtRequestWithTimeout(
    connection,
    url,
    'GET',
    'default',
    undefined,
    undefined,
    { Accept: ACCEPT_TABLE_TYPE },
  );
  const currentXml =
    typeof getResp.data === 'string' ? getResp.data : String(getResp.data);

  const updatedXml = patchTableTypeContent(currentXml, patch);

  const params: Record<string, string> = { lockHandle };
  if (transportRequest) params.corrNr = transportRequest;

  return makeAdtRequestWithTimeout(
    connection,
    url,
    'PUT',
    'default',
    updatedXml,
    params,
    { Accept: ACCEPT_TABLE_TYPE, 'Content-Type': CT_TABLE_TYPE },
  );
}

/**
 * Build the bare create body for a new table type (root + packageRef only).
 * The row type is written afterwards by {@link writeTableTypeContent}.
 */
export function buildTableTypeCreateXml(params: {
  name: string;
  packageName: string;
  description?: string;
  masterLanguage?: string;
  masterSystem?: string;
  responsible?: string;
}): string {
  const lang = (params.masterLanguage || 'EN').toUpperCase();
  const description = limitDescription(params.description || params.name);
  const attrs = [
    `adtcore:description="${escapeAttr(description)}"`,
    `adtcore:language="${lang}"`,
    `adtcore:name="${params.name.toUpperCase()}"`,
    'adtcore:type="TTYP/DA"',
    `adtcore:masterLanguage="${lang}"`,
  ];
  if (params.masterSystem) {
    attrs.push(`adtcore:masterSystem="${escapeAttr(params.masterSystem)}"`);
  }
  if (params.responsible) {
    attrs.push(`adtcore:responsible="${escapeAttr(params.responsible)}"`);
  }
  return (
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<ttyp:tableType xmlns:ttyp="http://www.sap.com/dictionary/tabletype" xmlns:adtcore="http://www.sap.com/adt/core" ${attrs.join(' ')}>` +
    `<adtcore:packageRef adtcore:name="${params.packageName.toUpperCase()}"/>` +
    `</ttyp:tableType>`
  );
}

function escapeAttr(value: string): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
