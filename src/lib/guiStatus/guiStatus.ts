/**
 * Reading a program's GUI interface (SE41: statuses, function codes, function
 * keys, application toolbar, titles) over RFC.
 *
 * MEASURED 2026-11-13 (S4D/100): RS_CUA_INTERNAL_FETCH — the module SE41
 * itself reads with — is RFC-enabled (TFDIR-FMODE R), so reading needs no Z
 * helper; ADT has no GUI-status resource at all. The tables it answers, and how
 * a toolbar button is spread over them (from a real customer status):
 *   STA  status: CODE, MODAL (D dialog / P popup / C context menu), PFKCODE
 *        (its function key set), BUTCODE (its application toolbar), INT_NOTE
 *   PFK  key set CODE + PFNO (key 01..48, higher = SAP standard keys) -> FUNCODE, FUNNO
 *   BUT  PFK_CODE + CODE (toolbar) + NO (slot 01..35) -> PFNO ('S' = separator)
 *   FUN  CODE + TEXTNO -> FUN_TEXT, ICON_ID, TEXT_NAME (icon name), INFO_TEXT
 *   SET  STATUS + FUNCTION = the function is active in that status
 *   TIT  title CODE -> TEXT
 * FUN rows with TEXTNO 001/002 are alternative texts of ONE function in the
 * requested language (RSMPTEXTS SUB_CODE), not two languages.
 */

import { getRfcFunctionCaller } from '../connectionFactory';
import { describeRfcError } from '../rfcHelper/rfcHelper';

export const CUA_FETCH = 'RS_CUA_INTERNAL_FETCH';
/** SAP's own limit (RSMPECON con_max_pbut_entries). */
export const MAX_TOOLBAR_SLOTS = 35;

type Row = Record<string, any>;

export interface CuaRaw {
  ADM?: Row;
  LANGU?: string;
  AUTHOR?: string;
  DATE?: string;
  CAUTHOR?: string;
  CDATE?: string;
  STA?: Row[];
  FUN?: Row[];
  PFK?: Row[];
  BUT?: Row[];
  SET?: Row[];
  TIT?: Row[];
  /** The language the texts are in (set by fetchCua). */
  LANGUAGE_USED?: string;
  [key: string]: unknown;
}

export class GuiInterfaceNotFound extends Error {
  constructor(program: string) {
    super(
      `${program} has no GUI interface (no GUI status or title) — or the program does not exist.`,
    );
    this.name = 'GuiInterfaceNotFound';
  }
}

const s = (v: unknown) => String(v ?? '').trim();

/** Human name of a function key number: 13 -> Shift-F1, 25 -> Ctrl-F1. */
export function functionKeyName(pfno: string): string {
  const n = Number.parseInt(pfno, 10);
  if (!Number.isFinite(n) || n < 1 || n > 48) return pfno;
  const f = ((n - 1) % 12) + 1;
  const prefix = ['', 'Shift-', 'Ctrl-', 'Ctrl-Shift-'][
    Math.floor((n - 1) / 12)
  ];
  return `${prefix}F${f}`;
}

/**
 * Read the ACTIVE interface over RFC, texts in ONE language.
 *
 * MEASURED 2026-11-13: called WITHOUT a language, RS_CUA_INTERNAL_FETCH answers
 * the texts of SEVERAL languages at once (one program: "Details" AND "详细信息" for
 * one function), so it is never called that way: without a requested language
 * the interface's own language (export LANGU = EUDB-LANGU, the language SE41
 * saves in) is read first with WITHOUT_TEXTS, then the texts in it. The
 * language used is returned as LANGUAGE_USED.
 */
export async function fetchCua(
  connection: unknown,
  program: string,
  language?: string,
): Promise<CuaRaw> {
  const call = getRfcFunctionCaller(connection);
  if (!call) {
    throw new Error(
      'Reading a GUI status needs an RFC connection (SAP_CONNECTION_TYPE=rfc): it calls ' +
        `${CUA_FETCH}, and ADT over HTTP has no GUI-status resource and cannot call a function module.`,
    );
  }
  const fetch = async (params: Record<string, unknown>) => {
    try {
      return (await call(CUA_FETCH, {
        PROGRAM: program,
        STATE: 'A',
        ...params,
      })) as CuaRaw;
    } catch (error) {
      const key = s((error as Row)?.key);
      if (key === 'NOT_FOUND' || /NOT_FOUND/.test(describeRfcError(error))) {
        throw new GuiInterfaceNotFound(program);
      }
      throw new Error(
        `${CUA_FETCH} ${program} failed: ${describeRfcError(error)}`,
      );
    }
  };
  let lang = s(language);
  if (!lang) {
    lang = s((await fetch({ WITHOUT_TEXTS: 'X' })).LANGU);
    if (!lang) {
      throw new Error(
        `${CUA_FETCH} ${program} reports no interface language; pass language explicitly.`,
      );
    }
  }
  const raw = await fetch({ LANGUAGE: lang });
  return { ...raw, LANGUAGE_USED: lang };
}

export interface ToolbarEntry {
  slot: string;
  separator?: true;
  function_key?: string;
  key_name?: string;
  function?: string;
  text?: string;
  icon?: string;
  active?: boolean;
}

export interface StatusView {
  status: string;
  type: string;
  text: string;
  function_key_set: string;
  toolbar_code: string;
  shared_key_set_with: string[];
  toolbar: ToolbarEntry[];
  function_keys: Array<{
    function_key: string;
    key_name: string;
    function: string;
    text: string;
    active: boolean;
  }>;
  active_function_count: number;
  toolbar_slots_used: number;
  next_toolbar_slot: string | null;
}

const STATUS_TYPES: Record<string, string> = {
  D: 'dialog status',
  P: 'dialog box',
  C: 'context menu',
};

function funText(fun: Row[], code: string, textno: string): Row | undefined {
  return (
    fun.find((f) => s(f.CODE) === code && s(f.TEXTNO) === textno) ??
    fun.find((f) => s(f.CODE) === code)
  );
}

export function describeStatus(raw: CuaRaw, sta: Row): StatusView {
  const all = raw.STA ?? [];
  const fun = raw.FUN ?? [];
  const pfkSet = s(sta.PFKCODE);
  const butCode = s(sta.BUTCODE);
  const status = s(sta.CODE);
  const active = new Set(
    (raw.SET ?? [])
      .filter((r) => s(r.STATUS) === status)
      .map((r) => s(r.FUNCTION)),
  );
  const keys = (raw.PFK ?? []).filter((p) => s(p.CODE) === pfkSet);
  const byKey = new Map(keys.map((k) => [s(k.PFNO), k]));
  const buttons = (raw.BUT ?? [])
    .filter((b) => s(b.PFK_CODE) === pfkSet && s(b.CODE) === butCode)
    .sort((a, b) => Number(s(a.NO)) - Number(s(b.NO)));

  const toolbar: ToolbarEntry[] = buttons.map((b) => {
    const pfno = s(b.PFNO);
    if (pfno === 'S') return { slot: s(b.NO), separator: true };
    const k = byKey.get(pfno);
    const code = s(k?.FUNCODE);
    const f = code ? funText(fun, code, s(k?.FUNNO)) : undefined;
    return {
      slot: s(b.NO),
      function_key: pfno,
      key_name: functionKeyName(pfno),
      function: code,
      text: s(f?.FUN_TEXT),
      ...(s(f?.TEXT_NAME) && s(f?.ICON_ID) ? { icon: s(f?.TEXT_NAME) } : {}),
      active: active.has(code),
    };
  });
  const maxSlot = buttons.reduce(
    (m, b) => Math.max(m, Number.parseInt(s(b.NO), 10) || 0),
    0,
  );
  return {
    status,
    type: STATUS_TYPES[s(sta.MODAL)] ?? s(sta.MODAL),
    text: s(sta.INT_NOTE),
    function_key_set: pfkSet,
    toolbar_code: butCode,
    shared_key_set_with: all
      .filter((o) => s(o.CODE) !== status && pfkSet && s(o.PFKCODE) === pfkSet)
      .map((o) => s(o.CODE)),
    toolbar,
    function_keys: keys
      .slice()
      .sort((a, b) => Number(s(a.PFNO)) - Number(s(b.PFNO)))
      .map((k) => ({
        function_key: s(k.PFNO),
        key_name: functionKeyName(s(k.PFNO)),
        function: s(k.FUNCODE),
        text: s(funText(fun, s(k.FUNCODE), s(k.FUNNO))?.FUN_TEXT),
        active: active.has(s(k.FUNCODE)),
      })),
    active_function_count: active.size,
    toolbar_slots_used: buttons.length,
    next_toolbar_slot:
      maxSlot + 1 <= MAX_TOOLBAR_SLOTS
        ? String(maxSlot + 1).padStart(2, '0')
        : null,
  };
}

export function findStatusRow(raw: CuaRaw, status: string): Row | undefined {
  return (raw.STA ?? []).find((r) => s(r.CODE) === status);
}

export function statusNames(raw: CuaRaw): string[] {
  return (raw.STA ?? []).map((r) => s(r.CODE));
}

export function titles(raw: CuaRaw): Array<{ title: string; text: string }> {
  return (raw.TIT ?? []).map((t) => ({ title: s(t.CODE), text: s(t.TEXT) }));
}

/**
 * Where a function sits in one status, from an independent read: its text,
 * the key bound to it in the status's key set, its toolbar slot and whether
 * the status lists it as active. Used to verify the helper's work.
 */
export function locateFunction(
  raw: CuaRaw,
  status: string,
  functionCode: string,
): {
  status_found: boolean;
  text: string | null;
  function_key: string | null;
  slot: string | null;
  active: boolean;
} {
  const sta = findStatusRow(raw, status);
  if (!sta) {
    return {
      status_found: false,
      text: null,
      function_key: null,
      slot: null,
      active: false,
    };
  }
  const view = describeStatus(raw, sta);
  const key = view.function_keys.find((k) => k.function === functionCode);
  const button = view.toolbar.find((b) => b.function === functionCode);
  const f = (raw.FUN ?? []).find((r) => s(r.CODE) === functionCode);
  return {
    status_found: true,
    text: f ? s(f.FUN_TEXT) : null,
    function_key: key?.function_key ?? null,
    slot: button?.slot ?? null,
    active: (raw.SET ?? []).some(
      (r) => s(r.STATUS) === status && s(r.FUNCTION) === functionCode,
    ),
  };
}

/**
 * Differences between a copied status and its source, both read
 * independently. Codes differ by design (the copy has its own key set,
 * toolbar and menu bar); what must match is what a user sees: type, text,
 * every toolbar slot (key, function, text, icon), every function key, the
 * active functions and the number of menus on the menu bar. Empty = same.
 */
export function compareStatusCopy(
  source: CuaRaw,
  sourceStatus: string,
  target: CuaRaw,
  targetStatus: string,
): string[] {
  const src = findStatusRow(source, sourceStatus);
  const tgt = findStatusRow(target, targetStatus);
  if (!src) return [`source status ${sourceStatus} is not in the source read`];
  if (!tgt) return [`status ${targetStatus} is not in the target read`];
  const a = describeStatus(source, src);
  const b = describeStatus(target, tgt);
  const diffs: string[] = [];
  if (a.type !== b.type) diffs.push(`type ${b.type} (source ${a.type})`);
  if (a.text !== b.text) diffs.push(`text "${b.text}" (source "${a.text}")`);
  const slot = (t: ToolbarEntry) =>
    t.separator
      ? `${t.slot}:separator`
      : `${t.slot}:${t.function_key}:${t.function}:${t.text}:${t.icon ?? ''}`;
  const key = (k: StatusView['function_keys'][number]) =>
    `${k.function_key}:${k.function}:${k.text}`;
  diffList(diffs, 'toolbar', a.toolbar.map(slot), b.toolbar.map(slot));
  diffList(
    diffs,
    'function key',
    a.function_keys.map(key),
    b.function_keys.map(key),
  );
  const active = (raw: CuaRaw, status: string) =>
    (raw.SET ?? [])
      .filter((r) => s(r.STATUS) === status)
      .map((r) => s(r.FUNCTION))
      .sort();
  diffList(
    diffs,
    'active function',
    active(source, sourceStatus),
    active(target, targetStatus),
  );
  const menus = (raw: CuaRaw, sta: Row) =>
    s(sta.ACTCODE)
      ? ((raw.ACT as Row[] | undefined) ?? []).filter(
          (r) => s(r.CODE) === s(sta.ACTCODE),
        ).length
      : 0;
  if (menus(source, src) !== menus(target, tgt)) {
    diffs.push(
      `menu bar has ${menus(target, tgt)} menus (source ${menus(source, src)})`,
    );
  }
  return diffs;
}

function diffList(
  out: string[],
  label: string,
  a: string[],
  b: string[],
): void {
  const missing = a.filter((x) => !b.includes(x));
  const extra = b.filter((x) => !a.includes(x));
  if (missing.length)
    out.push(
      `${label} missing in the copy: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? ` (+${missing.length - 5})` : ''}`,
    );
  if (extra.length)
    out.push(
      `${label} only in the copy: ${extra.slice(0, 5).join(', ')}${extra.length > 5 ? ` (+${extra.length - 5})` : ''}`,
    );
}

/**
 * A status as a user sees it, for a before/after comparison of the statuses an
 * edit must NOT touch. `ignoreStatus` is left out of the shared-key-set list
 * (a deleted status disappears from it by design), `ignoreFunction` out of the
 * active set (removing a function also removes its stale SET rows elsewhere).
 */
function statusFingerprint(
  raw: CuaRaw,
  sta: Row,
  ignoreStatus?: string,
  ignoreFunction?: string,
): string {
  const v = describeStatus(raw, sta);
  const status = s(sta.CODE);
  return JSON.stringify({
    type: v.type,
    text: v.text,
    key_set: v.function_key_set,
    toolbar_code: v.toolbar_code,
    menu_bar: s(sta.ACTCODE),
    shared: v.shared_key_set_with.filter((x) => x !== ignoreStatus),
    toolbar: v.toolbar.map((t) =>
      t.separator
        ? `${t.slot}:separator`
        : `${t.slot}:${t.function_key}:${t.function}:${t.text}:${t.icon ?? ''}`,
    ),
    keys: v.function_keys.map(
      (k) => `${k.function_key}:${k.function}:${k.text}`,
    ),
    active: (raw.SET ?? [])
      .filter((r) => s(r.STATUS) === status)
      .map((r) => s(r.FUNCTION))
      .filter((f) => f !== ignoreFunction)
      .sort(),
  });
}

/** Statuses other than `except` that differ between two independent reads. Empty = untouched. */
export function otherStatusesChanged(
  before: CuaRaw,
  after: CuaRaw,
  except: string,
  ignoreFunction?: string,
): string[] {
  const out: string[] = [];
  const changed: string[] = [];
  for (const sta of before.STA ?? []) {
    const code = s(sta.CODE);
    if (code === except) continue;
    const now = findStatusRow(after, code);
    if (!now) {
      out.push(`status ${code} is gone`);
      continue;
    }
    if (
      statusFingerprint(before, sta, except, ignoreFunction) !==
      statusFingerprint(after, now, except, ignoreFunction)
    ) {
      changed.push(code);
    }
  }
  if (changed.length) {
    out.push(
      `other status(es) changed: ${changed.slice(0, 5).join(', ')}${changed.length > 5 ? ` (+${changed.length - 5})` : ''}`,
    );
  }
  const added = statusNames(after).filter((c) => !findStatusRow(before, c));
  if (added.length) out.push(`new status(es) appeared: ${added.join(', ')}`);
  return out;
}

/** Problems with a status deletion, from reads before and after. Empty = verified. */
export function verifyStatusDeleted(
  before: CuaRaw,
  after: CuaRaw,
  status: string,
): string[] {
  const out: string[] = [];
  if (findStatusRow(after, status)) out.push(`status ${status} is still there`);
  if ((after.SET ?? []).some((r) => s(r.STATUS) === status)) {
    out.push(`status ${status} still has active-function rows`);
  }
  return [...out, ...otherStatusesChanged(before, after, status)];
}

export interface ButtonRemovalPlan {
  /** Toolbar slots of the function in the status, before the removal. */
  slots: string[];
  /** Keys of the function in the status's key set, before the removal. */
  function_keys: string[];
}

/** Where the function sits on the status's toolbar now; slots empty = not on it. */
export function planButtonRemoval(
  raw: CuaRaw,
  status: string,
  functionCode: string,
): ButtonRemovalPlan {
  const sta = findStatusRow(raw, status);
  if (!sta) return { slots: [], function_keys: [] };
  const v = describeStatus(raw, sta);
  return {
    slots: v.toolbar
      .filter((t) => !t.separator && t.function === functionCode)
      .map((t) => t.slot),
    function_keys: v.function_keys
      .filter((k) => k.function === functionCode)
      .map((k) => k.function_key),
  };
}

/**
 * Problems with a button removal, from reads before and after: the toolbar
 * must be the old one minus the function's entries, every later entry one slot
 * further left per removed slot (SE41 renumbers); the key gone unless kept;
 * the function gone from the interface exactly when the helper said so; every
 * other status untouched. Empty = verified.
 */
export function verifyButtonRemoved(
  before: CuaRaw,
  after: CuaRaw,
  status: string,
  functionCode: string,
  keepKey: boolean,
  functionDeleted: boolean,
): string[] {
  const out: string[] = [];
  const b = findStatusRow(before, status);
  const a = findStatusRow(after, status);
  if (!b) return [`status ${status} is not in the read before the change`];
  if (!a) return [`status ${status} is gone`];
  const vb = describeStatus(before, b);
  const va = describeStatus(after, a);
  const removed = vb.toolbar
    .filter((t) => !t.separator && t.function === functionCode)
    .map((t) => Number(t.slot));
  const entry = (t: ToolbarEntry, slot: number) =>
    `${String(slot).padStart(2, '0')}:${t.separator ? 'separator' : `${t.function_key}:${t.function}:${t.text}:${t.icon ?? ''}`}`;
  const expected = vb.toolbar
    .filter((t) => t.separator || t.function !== functionCode)
    .map((t) =>
      entry(
        t,
        Number(t.slot) - removed.filter((r) => r < Number(t.slot)).length,
      ),
    );
  const actual = va.toolbar.map((t) => entry(t, Number(t.slot)));
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    const onBar = va.toolbar.some((t) => t.function === functionCode);
    out.push(
      onBar
        ? `${functionCode} is still on the toolbar of ${status}`
        : `the toolbar of ${status} reads [${actual.join(', ')}], expected [${expected.join(', ')}]`,
    );
  }
  const key = (k: StatusView['function_keys'][number]) =>
    `${k.function_key}:${k.function}:${k.text}`;
  const keysExpected = vb.function_keys
    .filter((k) => keepKey || k.function !== functionCode)
    .map(key);
  const keysActual = va.function_keys.map(key);
  if (JSON.stringify(keysExpected) !== JSON.stringify(keysActual)) {
    out.push(
      `function keys of ${status} read [${keysActual.join(', ')}], expected [${keysExpected.join(', ')}]`,
    );
  }
  const defined = (after.FUN ?? []).some((r) => s(r.CODE) === functionCode);
  if (functionDeleted && defined) {
    out.push(`function ${functionCode} is still defined`);
  }
  if (
    functionDeleted &&
    (after.SET ?? []).some((r) => s(r.FUNCTION) === functionCode)
  ) {
    out.push(`function ${functionCode} still has active-function rows`);
  }
  if (!functionDeleted && !defined) {
    out.push(`function ${functionCode} is gone although the helper kept it`);
  }
  return [
    ...out,
    ...otherStatusesChanged(
      before,
      after,
      status,
      functionDeleted ? functionCode : undefined,
    ),
  ];
}
