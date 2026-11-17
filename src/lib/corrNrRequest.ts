/**
 * The `corrNr` to send to an ADT resource that checks it against the REQUEST,
 * not the task.
 *
 * Measured 2026-11-13 on an S/4 system (UpdateTextElements, ZMY_PROG): with
 * `corrNr=ABCK900002` — a task of ABCK900001, the task TLOCK held the object
 * under — the textelements PUT answered "Object LIMU REPT ZMY_PROG is already
 * locked in request ABCK900001 … [CTS_WBO_API/020]". With `corrNr=ABCK900001`
 * it worked, and the object stayed in the task.
 *
 * Read from that system's ABAP source: CL_SEDX_ADT_RES_TEXTELEMENT records through
 * CL_ADT_CORR_INSERT_DARK -> CL_ADT_CTS_MANAGEMENT->insert_objects_in_wb_request
 * (the dark CTS API). Its lock holder is `lock_holder-req_header-trkorr`, the
 * request — the same value the LOCK answers as CORRNR — so a task number never
 * matches. The message-class resource accepted the same task the same day, so
 * this is applied only where the request is measured to be required (today:
 * UpdateTextElements).
 *
 * Passing the request is what Eclipse does (its transport dialog lists
 * requests); CTS then records into the caller's task of that request.
 */

import type { IAbapConnection } from '@mcp-abap-adt/interfaces';
import { parseDataPreviewXml } from './dataPreviewParser';
import { normaliseTransportNumber } from './transportMerge';
import { makeAdtRequestWithTimeout } from './utils';

export interface CorrNrChoice {
  /** What the caller passed (trimmed, upper-cased). */
  given: string;
  /** What to send as corrNr. */
  send: string;
  /** Set when `given` is a task: the request it belongs to (= `send`). */
  taskOf?: string;
  /** Set when E070 could not be read — `send` is then `given` unchanged. */
  warning?: string;
}

const TRANSPORT_NUMBER = /^[A-Z0-9]{3}K\d{6}$/;

const str = (v: unknown) => String(v ?? '').trim();

/** The corrNr for `given`, from its E070 row(s): a task becomes its request. */
export function chooseCorrNr(
  given: string,
  e070: ReadonlyArray<Record<string, unknown>>,
): CorrNrChoice {
  const row = e070.find((r) => str(r.TRKORR) === given);
  const parent = row ? str(row.STRKORR) : '';
  return parent
    ? { given, send: parent, taskOf: parent }
    : { given, send: given };
}

/**
 * Resolve `transport` through E070. A number that is not shaped like a
 * transport number is returned as given (and never put into SQL); a failed
 * read returns it as given with a warning — SAP then decides.
 */
export async function requestForCorrNr(
  connection: IAbapConnection,
  transport: string,
): Promise<CorrNrChoice> {
  const given = normaliseTransportNumber(transport);
  if (!TRANSPORT_NUMBER.test(given)) {
    return { given: transport.trim(), send: transport.trim() };
  }
  try {
    const response = await makeAdtRequestWithTimeout(
      connection,
      '/sap/bc/adt/datapreview/freestyle',
      'POST',
      'csrf',
      `SELECT trkorr, strkorr FROM e070 WHERE trkorr = '${given}'`,
      { rowNumber: 2 },
      {
        Accept:
          'application/xml, application/vnd.sap.adt.datapreview.table.v1+xml',
        'Content-Type': 'text/plain; charset=utf-8',
      },
    );
    const rows = parseDataPreviewXml(String(response?.data ?? ''), 2)
      .rows as Record<string, unknown>[];
    return chooseCorrNr(given, rows);
  } catch (error: any) {
    return {
      given,
      send: given,
      warning: `E070 could not be read to tell whether ${given} is a task (${error?.message ?? error}); it was sent as given. If SAP answers "already locked in request <X>", pass request <X>.`,
    };
  }
}
