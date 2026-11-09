/**
 * TRDIR is the ground truth for "does this program exist, and as what type".
 *
 * ADT keeps executables and includes under different resources
 * (`/programs/programs` vs `/programs/includes`). A GET of an include through
 * the programs resource answers NOT FOUND, so any existence check made through
 * the wrong resource reads "gone" for an include that is still there — which is
 * how DeleteProgram reported an include as deleted while TRDIR still held it
 * (measured 2026-11-03, S4D/100). TRDIR answers for both.
 */

import { parseSqlQueryXml } from '../handlers/system/readonly/handleGetSqlQuery';
import { encodeSapObjectName } from './utils';

export interface TrdirRow {
  subc: string;
  appl: string;
}

/** The TRDIR row, `'missing'` when there is none, or null when the read failed. */
export async function readTrdirRow(
  client: any,
  programName: string,
  logger?: any,
): Promise<TrdirRow | 'missing' | null> {
  const sql = `SELECT name, subc, appl FROM trdir WHERE name = '${programName.replace(/'/g, "''")}'`;
  try {
    const response = await client
      .getUtils()
      .getSqlQuery({ sql_query: sql, row_number: 1 });
    if (response?.status !== 200 || !response?.data) return null;
    const rows = parseSqlQueryXml(String(response.data), sql, 1, logger).rows;
    if (!rows.length) return 'missing';
    return {
      subc: String(rows[0].SUBC ?? rows[0].subc ?? '').trim(),
      appl: String(rows[0].APPL ?? rows[0].appl ?? '').trim(),
    };
  } catch (error: any) {
    logger?.warn?.(`TRDIR read failed: ${error?.message ?? error}`);
    return null;
  }
}

/** The ADT resource a program of this TRDIR-SUBC lives under. */
export function programObjectUri(programName: string, subc: string): string {
  const resource = subc.toUpperCase() === 'I' ? 'includes' : 'programs';
  return `/sap/bc/adt/programs/${resource}/${encodeSapObjectName(programName).toLowerCase()}`;
}
