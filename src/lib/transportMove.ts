/**
 * Moving object-list entries (E071 rows) from one request/task to another.
 *
 * Two routes, because SAP's own move does not cover every case (read from
 * S4D's source and measured, 2026-11-12):
 *
 * - BETWEEN REQUESTS (task -> task of another request, request -> request):
 *   SAP's move. ADT exposes it as
 *     POST /sap/bc/adt/cts/transportrequests/{source}/moveobjects
 *     <tm:root tm:number="{target}" tm:useraction="moveobjects">
 *       <tm:request><tm:abap_object tm:pgmid=… tm:type=… tm:name=…/></tm:request>
 *     </tm:root>
 *   (CL_CTS_ADT_TM_REST_RES_CONT->move_objects, NW 2111+) -> TR_MOVE_OBJECTS
 *   -> TRINT_MOVE_OBJECTS, the module SE09 uses: it moves E071/E071K and the
 *   object locks (TLOCK).
 * - INSIDE ONE REQUEST (the request itself <-> its own tasks): TRINT_MOVE_OBJECTS
 *   refuses this — a request (K) and its task (S) have different types
 *   (TR 712; measured: 46 LANG entries of a request -> its own task answered
 *   "只能将对象移动到具有相同类型的请求" [SCTS_ADT_MSG/009], E071 unchanged).
 *   That route goes through the RFC helper module Z_MCP_LXE_MOVE.
 *
 * The verdict never comes from a call returning: both object lists are read
 * back and an entry counts as moved only when it is in the target AND no longer
 * in the source.
 */

import { normaliseTransportNumber } from './transportMerge';

export const MOVE_CONTENT_TYPE =
  'application/vnd.sap.adt.transportorganizer.v1+xml';

export interface TrHeader {
  trkorr: string;
  trfunction: string;
  trstatus: string;
  strkorr: string;
  as4user: string;
}

export interface E071Row {
  trkorr: string;
  as4pos: string;
  pgmid: string;
  object: string;
  obj_name: string;
  lockflag: string;
  lang: string;
}

export interface EntrySpec {
  pgmid?: string;
  object_type: string;
  object_name: string;
  lang?: string;
}

export interface SelectSpec {
  pgmid?: string;
  object_type?: string;
}

export type MoveRoute = 'sap_move' | 'same_request_helper';

/** The request a request/task belongs to (itself for a request). */
export function topRequest(header: TrHeader): string {
  return header.strkorr || header.trkorr;
}

export function chooseRoute(from: TrHeader, to: TrHeader): MoveRoute {
  return topRequest(from) === topRequest(to)
    ? 'same_request_helper'
    : 'sap_move';
}

const str = (v: unknown) => String(v ?? '').trim();

export function toHeader(row: Record<string, unknown>): TrHeader {
  return {
    trkorr: str(row.TRKORR),
    trfunction: str(row.TRFUNCTION),
    trstatus: str(row.TRSTATUS),
    strkorr: str(row.STRKORR),
    as4user: str(row.AS4USER),
  };
}

export function toE071Row(row: Record<string, unknown>): E071Row {
  return {
    trkorr: str(row.TRKORR),
    as4pos: str(row.AS4POS),
    pgmid: str(row.PGMID),
    object: str(row.OBJECT),
    obj_name: str(row.OBJ_NAME),
    lockflag: str(row.LOCKFLAG),
    lang: str(row.LANG),
  };
}

export function describeEntry(e: {
  pgmid: string;
  object: string;
  obj_name: string;
  lang?: string;
}): string {
  return `${e.pgmid} ${e.object} ${e.obj_name}${e.lang ? ` (${e.lang})` : ''}`;
}

/**
 * The source rows the caller means. Exactly one of `objects` / `select`.
 * Anything unclear — an entry not in the source, one that matches several rows,
 * an organisational CORR entry — throws before anything is sent to SAP.
 */
export function resolveEntries(
  source: string,
  rows: E071Row[],
  objects: EntrySpec[] | undefined,
  select: SelectSpec | undefined,
): E071Row[] {
  const hasObjects = Array.isArray(objects) && objects.length > 0;
  const hasSelect = !!select && (!!select.pgmid || !!select.object_type);
  if (hasObjects === hasSelect) {
    throw new Error(
      'Pass exactly one of objects (a list of entries) or select (e.g. {"pgmid":"LANG"}).',
    );
  }
  const picked = new Map<string, E071Row>();
  if (hasSelect) {
    const pgmid = str(select?.pgmid).toUpperCase();
    const type = str(select?.object_type).toUpperCase();
    for (const row of rows) {
      if (row.pgmid === 'CORR') continue;
      if (pgmid && row.pgmid !== pgmid) continue;
      if (type && row.object !== type) continue;
      picked.set(row.as4pos, row);
    }
    if (picked.size === 0) {
      throw new Error(
        `No entry of ${source} matches select ${JSON.stringify(select)} — nothing to move.`,
      );
    }
    return [...picked.values()];
  }
  for (const spec of objects ?? []) {
    const type = str(spec?.object_type).toUpperCase();
    const name = str(spec?.object_name).toUpperCase();
    const pgmid = str(spec?.pgmid).toUpperCase();
    const lang = str(spec?.lang);
    if (!type || !name) {
      throw new Error(
        'Every entry of objects needs object_type and object_name.',
      );
    }
    if (pgmid === 'CORR') {
      throw new Error(
        `CORR ${type} ${name} is an organisational entry and is never moved.`,
      );
    }
    const matches = rows.filter(
      (r) =>
        r.pgmid !== 'CORR' &&
        r.object === type &&
        r.obj_name === name &&
        (!pgmid || r.pgmid === pgmid) &&
        (!lang || r.lang === lang),
    );
    const label = `${pgmid ? `${pgmid} ` : ''}${type} ${name}${lang ? ` (${lang})` : ''}`;
    if (matches.length === 0) {
      throw new Error(
        `${label} is not in the object list of ${source} — nothing was moved. ` +
          'Read the list with GetTransport (entries of a task are under the task, not the request).',
      );
    }
    if (matches.length > 1) {
      throw new Error(
        `${label} matches ${matches.length} entries of ${source} (${matches
          .map((m) => describeEntry(m))
          .join(', ')}) — pass pgmid and/or lang to pick one.`,
      );
    }
    if (picked.has(matches[0].as4pos)) {
      throw new Error(`${label} is given twice.`);
    }
    picked.set(matches[0].as4pos, matches[0]);
  }
  return [...picked.values()];
}

const escapeXml = (v: string) =>
  v
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Body of the ADT moveobjects action (ST_CTS_ADT_TM_MAIN, read from S4D). */
export function buildMoveObjectsXml(
  target: string,
  entries: E071Row[],
): string {
  const objects = entries
    .map(
      (e) =>
        `<tm:abap_object tm:pgmid="${escapeXml(e.pgmid)}" tm:type="${escapeXml(e.object)}" tm:name="${escapeXml(e.obj_name)}"/>`,
    )
    .join('');
  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    `<tm:root xmlns:tm="http://www.sap.com/cts/adt/tm" tm:number="${escapeXml(normaliseTransportNumber(target))}" tm:useraction="moveobjects">` +
    `<tm:request>${objects}</tm:request></tm:root>`
  );
}

export type MoveVerdict = 'moved' | 'partial' | 'not_moved' | 'unverified';

export interface NotMovedEntry {
  entry: string;
  in_target: boolean;
  still_in_source: boolean;
}

export interface MoveJudgement {
  verdict: MoveVerdict;
  moved: string[];
  not_moved: NotMovedEntry[];
}

function sameEntry(a: E071Row, b: E071Row, compareLang: boolean): boolean {
  return (
    a.pgmid === b.pgmid &&
    a.object === b.object &&
    a.obj_name === b.obj_name &&
    (!compareLang || a.lang === b.lang)
  );
}

/**
 * From the two object lists read AFTER the call. `null` = that read failed.
 * SAP clears LANG on R3TR/LIMU rows when appending, so LANG is compared in the
 * target for LANG rows only; in the source it is compared exactly.
 */
export function judgeMove(
  entries: E071Row[],
  sourceAfter: E071Row[] | null,
  targetAfter: E071Row[] | null,
): MoveJudgement {
  if (!sourceAfter || !targetAfter) {
    return { verdict: 'unverified', moved: [], not_moved: [] };
  }
  const moved: string[] = [];
  const notMoved: NotMovedEntry[] = [];
  for (const entry of entries) {
    const inTarget = targetAfter.some((r) =>
      sameEntry(r, entry, entry.pgmid === 'LANG'),
    );
    const inSource = sourceAfter.some((r) => sameEntry(r, entry, true));
    if (inTarget && !inSource) moved.push(describeEntry(entry));
    else
      notMoved.push({
        entry: describeEntry(entry),
        in_target: inTarget,
        still_in_source: inSource,
      });
  }
  const verdict: MoveVerdict =
    notMoved.length === 0
      ? 'moved'
      : moved.length === 0
        ? 'not_moved'
        : 'partial';
  return { verdict, moved, not_moved: notMoved };
}

/** The one sentence of the result — derived from the verdict, nothing else. */
export function moveSentence(
  source: string,
  target: string,
  total: number,
  judgement: MoveJudgement,
): string {
  switch (judgement.verdict) {
    case 'moved':
      return `${total} entr${total === 1 ? 'y' : 'ies'} moved from ${source} to ${target}, confirmed by reading both object lists back.`;
    case 'partial':
      return (
        `PARTIAL: ${judgement.moved.length} of ${total} entries moved from ${source} to ${target}; ` +
        `${judgement.not_moved.length} are not confirmed (see not_moved).`
      );
    case 'not_moved':
      return `Nothing was moved: the read-back shows none of the ${total} entries in ${target} and gone from ${source}.`;
    default:
      return (
        `UNVERIFIED: the move call returned, but the object lists of ${source} / ${target} ` +
        'could not be read back — check with GetTransport before retrying.'
      );
  }
}
