/**
 * Calling the SE63 translation helper (function group ZMCP_LXE) over RFC.
 *
 * SE63 reads and writes short-text translations through
 * LXE_OBJ_TEXT_PAIR_READ / LXE_OBJ_TEXT_PAIR_WRITE (read from S4D's source,
 * 2026-11-05). Neither is RFC-enabled and ADT has no resource for them, so the
 * system needs two RFC-enabled Z modules (lxeHelperAbap.ts), installed once
 * with SetupTranslationHelper.
 *
 * An agent that has never heard of the helper must still be able to get there:
 * every way the helper can be unusable — not RFC, not installed, outdated — is
 * a LxeHelperUnavailable whose message names the one thing to do next.
 */

import {
  callRfcHelper,
  isNewerVersion,
  markRewritten,
  resetRewritten,
  wasRewritten,
} from '../rfcHelper/rfcHelper';
import { LXE_HELPER_SPEC } from './lxeHelperSpec';

// The generic machinery lives in lib/rfcHelper; these names are the SE63
// helper's view of it, kept so callers and tests read naturally.
export {
  describeRfcError,
  type RfcHelperProblem as LxeHelperProblem,
  RfcHelperUnavailable as LxeHelperUnavailable,
} from '../rfcHelper/rfcHelper';

/** LXE language of each SAP 1-character language key (LXE_T002, S4D). */
const SAP_TO_LXE: Record<string, string> = {
  '1': 'zhCN',
  M: 'zhTW',
  E: 'enUS',
  D: 'deDE',
  J: 'jaJP',
  F: 'frFR',
  S: 'esES',
  I: 'itIT',
  P: 'ptBR',
  '3': 'koKR',
  R: 'ruRU',
  N: 'nlNL',
  L: 'plPL',
  T: 'trTR',
  '2': 'thTH',
  C: 'csCZ',
  H: 'huHU',
  V: 'svSE',
  K: 'daDK',
  U: 'fiFI',
  A: 'arSA',
  B: 'heIL',
  '8': 'ukUA',
};

/** Default LXE language of each 2-letter ISO code (SAP's ZF = Chinese traditional). */
const ISO_TO_LXE: Record<string, string> = {
  ZH: 'zhCN',
  ZF: 'zhTW',
  EN: 'enUS',
  DE: 'deDE',
  JA: 'jaJP',
  FR: 'frFR',
  ES: 'esES',
  IT: 'itIT',
  PT: 'ptBR',
  KO: 'koKR',
  RU: 'ruRU',
  NL: 'nlNL',
  PL: 'plPL',
  TR: 'trTR',
  TH: 'thTH',
  CS: 'csCZ',
  HU: 'huHU',
  SV: 'svSE',
  DA: 'daDK',
  FI: 'fiFI',
  ID: 'idID',
  AR: 'arSA',
  HE: 'heIL',
  UK: 'ukUA',
};

export interface LxeLanguage {
  /** The LXE code sent to SAP, e.g. zhCN. */
  lxe: string;
  /** What the caller passed. */
  requested: string;
  /** True when a short code was expanded — the response says so. */
  expanded: boolean;
}

/**
 * Accepts an LXE code (zhCN, en++), a 2-letter ISO code (ZH, EN) or a SAP
 * 1-character key (1, E). Short codes expand to ONE country variant, which is
 * reported back; anything unknown is refused rather than guessed.
 */
export function normalizeLxeLanguage(input: string): LxeLanguage {
  const raw = String(input ?? '').trim();
  if (raw.length === 4) {
    const lang = raw.slice(0, 2).toLowerCase();
    const rest = raw.slice(2);
    return {
      lxe: lang + (rest === '++' ? rest : rest.toUpperCase()),
      requested: raw,
      expanded: false,
    };
  }
  const mapped =
    raw.length === 2
      ? ISO_TO_LXE[raw.toUpperCase()]
      : raw.length === 1
        ? SAP_TO_LXE[raw]
        : undefined;
  if (!mapped) {
    throw new Error(
      `Language "${raw}" is not recognised. Pass the 4-character LXE code ` +
        `SE63 uses (table LXE_T002), e.g. zhCN, zhTW, enUS, deDE, jaJP.`,
    );
  }
  return { lxe: mapped, requested: raw, expanded: true };
}

/** SAP 1-character key of an LXE code, when this module knows it. */
export function sapLanguageOfLxe(lxe: string): string | undefined {
  const code = String(lxe ?? '').trim();
  const direct = Object.entries(SAP_TO_LXE).find(([, v]) => v === code);
  if (direct) return direct[0];
  if (code.endsWith('++')) {
    const variant = ISO_TO_LXE[code.slice(0, 2).toUpperCase()];
    return variant ? sapLanguageOfLxe(variant) : undefined;
  }
  return undefined;
}

/** True when an installed helper reports a higher version than this build ships. */
export function isNewerHelper(installed: string): boolean {
  return isNewerVersion(LXE_HELPER_SPEC, installed);
}

/** Call one SE63 helper module (see callRfcHelper). */
export function callLxeHelper(
  connection: unknown,
  functionName: string,
  params: Record<string, unknown>,
): Promise<Record<string, any>> {
  return callRfcHelper(LXE_HELPER_SPEC, connection, functionName, params);
}

export function markHelperRewritten(): void {
  markRewritten(LXE_HELPER_SPEC);
}

export function wasHelperRewrittenInThisProcess(): boolean {
  return wasRewritten(LXE_HELPER_SPEC);
}

/** Test hook. */
export function resetHelperRewrittenFlag(): void {
  resetRewritten();
}

export interface TextPair {
  key: string;
  source: string;
  target: string;
  max_length: number;
  upper_case: boolean;
}

export function toTextPairs(rows: unknown): TextPair[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((row: any) => ({
    key: String(row?.TEXTKEY ?? '').trimEnd(),
    source: String(row?.S_TEXT ?? '').trimEnd(),
    target: String(row?.T_TEXT ?? '').trimEnd(),
    max_length: Number(row?.UNITMLT ?? 0) || 0,
    upper_case: String(row?.UPPCASE ?? '').trim() === 'X',
  }));
}

/**
 * LXE types whose object name is a repository name, which is upper case. Other
 * types (SOTR, BSP, …) may key on case-sensitive names, so theirs is sent as
 * given — a wrong case there answers "could not be read", it is not hidden.
 */
const UPPER_CASE_NAMED_TYPES = new Set([
  'DTEL',
  'DOMA',
  'TABT',
  'TABS',
  'TTYP',
  'VIEW',
  'SHLP',
  'ENQU',
  'TRAN',
  'MSAG',
  'CLAS',
  'INTF',
  'DEVC',
  'TOBJ',
  'NROB',
]);

/** The object type / name as LXE keys them. */
export function normalizeLxeObject(
  objectType: string,
  objectName: string,
): { objtype: string; objname: string } {
  const objtype = String(objectType ?? '')
    .trim()
    .toUpperCase();
  const trimmedName = String(objectName ?? '').trim();
  const objname = UPPER_CASE_NAMED_TYPES.has(objtype)
    ? trimmedName.toUpperCase()
    : trimmedName;
  if (!objtype || objtype.length > 4) {
    throw new Error(
      `object_type "${objectType}" is not an LXE object type (1-4 characters, e.g. DTEL, DOMA, TABT, TRAN, MESS)`,
    );
  }
  if (!objname || objname.length > 70) {
    throw new Error('object_name is required (at most 70 characters)');
  }
  return { objtype, objname };
}
