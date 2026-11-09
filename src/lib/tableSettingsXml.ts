/**
 * Table technical settings (SE13, DDIC object type TABL/DTT) — buffering, size
 * category, data class, logging.
 *
 * WHY IN-REPO: the dep has no wrapper, and the collection is not advertised
 * under any name resembling "buffering" — it is
 * `/sap/bc/adt/ddic/db/settings` with the title "Technical Table Settings",
 * media type `application/vnd.sap.adt.table.settings.v2+xml`. Found by scanning
 * every advertised collection TITLE in the live discovery document, and
 * confirmed by the `Technical Settings` atom:link that every table object
 * carries.
 *
 * Like a missing index, missing buffering never raises an error — a config table
 * read on every call just goes to the database every time.
 *
 * THE VALUE MAPPING WAS GROUND-TRUTHED AGAINST DD09L, not assumed. Read the ADT
 * settings and DD09L for the same tables on DM2/310:
 *
 *   ts:buffering/allowed  ts:buffering/type  DD09L-PUFFERUNG  SE13
 *   --------------------  -----------------  ---------------  ----------------------------
 *   N                     (empty)            ''               Buffering not allowed
 *   X                     (empty)            ''               Allowed but switched off
 *   X                     X                  'X'              Fully buffered      (TOBJ)
 *   X                     P                  'P'              Single-record       (T100)
 *   X                     G                  'G'              Generic             (many)
 *
 *   ts:loggingEnabled true  <-> DD09L-PROTOKOLL 'X'   (TOBJ true/X, T100 false/'')
 *   ts:dataClassCategory    <-> DD09L-TABART          (exact match on every table read)
 *   ts:sizeCategory         <-> the SE13 size category
 *
 * NOTE the two-field encoding: "buffering switched on" needs BOTH `allowed=X`
 * and a non-empty `type`. Setting only one of them is the mistake that leaves a
 * table looking configured while it is not buffered — so this module never lets
 * a caller express that state by accident.
 *
 * The write is a read-modify-write on the settings object: GET, patch only the
 * requested elements, then lock + PUT. An omitted field therefore means KEEP,
 * never "reset to default" — a table quietly losing its data class or size
 * category is exactly the sort of change nobody notices for months.
 */

import { escXml } from './adtObjectOps';
import { encodeSapObjectName } from './utils';

export const CT_TABLE_SETTINGS =
  'application/vnd.sap.adt.table.settings.v2+xml';
export const TABLE_SETTINGS_TYPE = 'TABL/DTT';

/** ADT URI of a table's technical settings. */
export function tableSettingsUri(tableName: string): string {
  return `/sap/bc/adt/ddic/db/settings/${encodeSapObjectName(
    tableName.toUpperCase(),
  ).toLowerCase()}`;
}

/** The buffering states a caller can ask for, in SE13's own terms. */
export type BufferingMode =
  | 'not_allowed'
  | 'allowed_but_switched_off'
  | 'fully_buffered'
  | 'single_record'
  | 'generic';

/** Caller-facing mode -> the two ADT elements, ground-truthed against DD09L. */
const BUFFERING_MODES: Record<
  BufferingMode,
  { allowed: string; type: string; pufferung: string }
> = {
  not_allowed: { allowed: 'N', type: '', pufferung: '' },
  allowed_but_switched_off: { allowed: 'X', type: '', pufferung: '' },
  fully_buffered: { allowed: 'X', type: 'X', pufferung: 'X' },
  single_record: { allowed: 'X', type: 'P', pufferung: 'P' },
  generic: { allowed: 'X', type: 'G', pufferung: 'G' },
};

export interface TableSettings {
  table_name: string;
  description: string;
  version: string;
  data_class: string;
  size_category: string;
  /** The caller-facing mode, derived from the allowed/type pair. */
  buffering: BufferingMode | 'unknown';
  buffering_allowed: string;
  buffering_type: string;
  /** Number of generic key fields; only meaningful for `generic`. */
  generic_key_fields: string;
  storage_type: string;
  logging_enabled: boolean;
  /** DD09L-PUFFERUNG this state corresponds to, for an independent check. */
  expected_dd09l_pufferung: string;
}

function tag(xml: string, name: string): string {
  // Matches both <ts:x>v</ts:x> and the self-closing <ts:x/> (which means empty).
  const paired = new RegExp(`<ts:${name}>([\\s\\S]*?)</ts:${name}>`).exec(xml);
  if (paired) return paired[1].trim();
  return new RegExp(`<ts:${name}\\s*/>`).test(xml) ? '' : '';
}

/** Classify the allowed/type pair back into a caller-facing mode. */
export function classifyBuffering(
  allowed: string,
  type: string,
): BufferingMode | 'unknown' {
  for (const [mode, v] of Object.entries(BUFFERING_MODES)) {
    if (v.allowed === allowed && v.type === type) return mode as BufferingMode;
  }
  return 'unknown';
}

/** Parse a `ts:tableSettings` document. */
export function parseTableSettings(xml: string): TableSettings {
  const doc = xml ?? '';
  const bufferingBlock =
    /<ts:buffering>([\s\S]*?)<\/ts:buffering>/.exec(doc)?.[1] ?? '';
  const allowed = tag(bufferingBlock, 'allowed');
  const type = tag(bufferingBlock, 'type');
  const mode = classifyBuffering(allowed, type);

  return {
    table_name: /adtcore:name="([^"]*)"/.exec(doc)?.[1] ?? '',
    description: /adtcore:description="([^"]*)"/.exec(doc)?.[1] ?? '',
    version: /adtcore:version="([^"]*)"/.exec(doc)?.[1] ?? '',
    data_class: tag(doc, 'dataClassCategory'),
    size_category: tag(doc, 'sizeCategory'),
    buffering: mode,
    buffering_allowed: allowed,
    buffering_type: type,
    generic_key_fields: tag(bufferingBlock, 'areaKeyFields'),
    storage_type: tag(doc, 'storageType'),
    logging_enabled: tag(doc, 'loggingEnabled') === 'true',
    expected_dd09l_pufferung:
      mode === 'unknown' ? '?' : BUFFERING_MODES[mode].pufferung,
  };
}

export interface TableSettingsPatch {
  buffering?: BufferingMode;
  generic_key_fields?: number;
  size_category?: number | string;
  data_class?: string;
  log_changes?: boolean;
}

/**
 * Apply a patch to an existing `ts:tableSettings` document.
 *
 * Read-modify-write on the REAL document rather than building one from scratch:
 * the payload carries elements this module does not model (sharingType,
 * loadUnit, translation, supportsLoggingAssessment) and rebuilding it would
 * silently reset them.
 */
export function patchTableSettings(
  xml: string,
  patch: TableSettingsPatch,
): string {
  let out = xml;

  if (patch.buffering) {
    const mode = BUFFERING_MODES[patch.buffering];
    // areaKeyFields only means anything for generic buffering; forcing it to 0
    // otherwise keeps the document consistent with what SE13 would write.
    const keyFields =
      patch.buffering === 'generic'
        ? Math.max(0, Math.trunc(patch.generic_key_fields ?? 1))
        : 0;
    const block =
      '<ts:buffering>' +
      `<ts:allowed>${escXml(mode.allowed)}</ts:allowed>` +
      (mode.type ? `<ts:type>${escXml(mode.type)}</ts:type>` : '<ts:type/>') +
      `<ts:areaKeyFields>${keyFields}</ts:areaKeyFields>` +
      '</ts:buffering>';
    out = /<ts:buffering>[\s\S]*?<\/ts:buffering>/.test(out)
      ? out.replace(/<ts:buffering>[\s\S]*?<\/ts:buffering>/, block)
      : out.replace(/<ts:buffering\s*\/>/, block);
  } else if (patch.generic_key_fields !== undefined) {
    // Changing the generic key count without changing the mode.
    const keyFields = Math.max(0, Math.trunc(patch.generic_key_fields));
    out = out.replace(
      /<ts:areaKeyFields>[\s\S]*?<\/ts:areaKeyFields>/,
      `<ts:areaKeyFields>${keyFields}</ts:areaKeyFields>`,
    );
  }

  if (patch.size_category !== undefined) {
    out = replaceSimple(out, 'sizeCategory', String(patch.size_category));
  }
  if (patch.data_class !== undefined) {
    out = replaceSimple(
      out,
      'dataClassCategory',
      patch.data_class.toUpperCase(),
    );
  }
  if (patch.log_changes !== undefined) {
    out = replaceSimple(
      out,
      'loggingEnabled',
      patch.log_changes ? 'true' : 'false',
    );
  }
  return out;
}

/** Replace a simple element's text, handling the self-closing form. */
function replaceSimple(xml: string, name: string, value: string): string {
  const paired = new RegExp(`<ts:${name}>[\\s\\S]*?</ts:${name}>`);
  if (paired.test(xml)) {
    return xml.replace(paired, `<ts:${name}>${escXml(value)}</ts:${name}>`);
  }
  const selfClosing = new RegExp(`<ts:${name}\\s*/>`);
  if (selfClosing.test(xml)) {
    return xml.replace(
      selfClosing,
      `<ts:${name}>${escXml(value)}</ts:${name}>`,
    );
  }
  return xml;
}

/** Human-readable summary, so a response says what was actually configured. */
export function describeBuffering(settings: TableSettings): string {
  switch (settings.buffering) {
    case 'not_allowed':
      return 'buffering not allowed';
    case 'allowed_but_switched_off':
      return 'buffering allowed but switched OFF (the table is not buffered)';
    case 'fully_buffered':
      return 'fully buffered';
    case 'single_record':
      return 'single-record buffered';
    case 'generic':
      return `generic buffering on ${settings.generic_key_fields} key field(s)`;
    default:
      return `unrecognised buffering state (allowed="${settings.buffering_allowed}", type="${settings.buffering_type}")`;
  }
}
