/**
 * DeleteTransaction — delete a CUSTOMER transaction code through the RFC helper
 * Z_MCP_TRAN_DELETE (RPY_TRANSACTION_DELETE). Verified by reading TSTC/TSTCT
 * and TADIR back; SAP-namespace codes are refused before anything is touched.
 */

import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { selectRows } from '../../../lib/rfcHelper/installer';
import {
  callRfcHelper,
  RfcHelperUnavailable,
} from '../../../lib/rfcHelper/rfcHelper';
import { TRAN_HELPER_DELETE } from '../../../lib/transaction/tranHelperAbap';
import { TRAN_HELPER_SPEC } from '../../../lib/transaction/tranHelperSpec';
import { return_error } from '../../../lib/utils';
import { TCODE_PATTERN } from './handleCreateTransaction';

export const TOOL_DEFINITION = {
  name: 'DeleteTransaction',
  available_in: ['onprem', 'legacy'] as const,
  description:
    'Delete a customer transaction code (Z*, Y*, /ns/), verified by reading TSTC/TSTCT/TADIR back. NEEDS an RFC connection and the helper ZMCP_TRAN — if missing, the error says to run SetupTransactionHelper (ask the user first).',
  notes: `Through RPY_TRANSACTION_DELETE (SE93's own delete: TSTC, TSTCT, TSTCP, TSTCA, TSTCC, the
authorization defaults USOBT/USOBX, the transport entry). A transaction in a transportable package
needs transport_request (the deletion is recorded there). SAP-namespace codes are refused.`,
  inputSchema: {
    type: 'object',
    properties: {
      transaction_code: { type: 'string' },
      transport_request: { type: 'string' },
    },
    required: ['transaction_code'],
  },
} as const;

interface DeleteTransactionArgs {
  transaction_code: string;
  transport_request?: string;
}

export async function handleDeleteTransaction(
  context: HandlerContext,
  args: DeleteTransactionArgs,
) {
  const { connection, logger } = context;
  let called = false;
  try {
    const tcode = String(args?.transaction_code ?? '')
      .trim()
      .toUpperCase();
    if (tcode.length > 20 || !TCODE_PATTERN.test(tcode)) {
      throw new Error(
        `transaction_code "${args?.transaction_code ?? ''}" is not a customer transaction code (Z*, Y*, /namespace/...) — refused`,
      );
    }
    const request =
      String(args?.transport_request ?? '')
        .trim()
        .toUpperCase() || '';
    called = true;
    const result = await callRfcHelper(
      TRAN_HELPER_SPEC,
      connection,
      TRAN_HELPER_DELETE,
      { IV_TCODE: tcode, IV_REQUEST: request },
    );
    const message = String(result.EV_MESSAGE ?? '').trim();
    if (String(result.EV_STATUS ?? '').trim() !== 'S') {
      throw new Error(`DeleteTransaction ${tcode}: ${message}`);
    }
    const t = `'${tcode.replace(/'/g, "''")}'`;
    const tstc = await selectRows(
      context,
      `SELECT tcode FROM tstc WHERE tcode = ${t}`,
    );
    const tstct = await selectRows(
      context,
      `SELECT ttext FROM tstct WHERE tcode = ${t}`,
    );
    if (tstc.length > 0 || tstct.length > 0) {
      throw new Error(
        `DeleteTransaction ${tcode}: reported deleted, but ${tstc.length ? 'TSTC' : 'TSTCT'} still holds it.`,
      );
    }
    const tadir = await selectRows(
      context,
      `SELECT devclass, delflag FROM tadir WHERE pgmid = 'R3TR' AND object = 'TRAN' AND obj_name = ${t}`,
    );
    const tadirState =
      tadir.length === 0
        ? 'removed'
        : `kept (package ${String(tadir[0].DEVCLASS ?? '').trim()}, deletion flag ${String(tadir[0].DELFLAG ?? '').trim() || 'not set'})`;
    return {
      isError: false,
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              transaction_code: tcode,
              transport_request: request || null,
              tstc_tstct: 'gone',
              tadir_entry: tadirState,
              message: `${message}; TSTC and TSTCT read back empty.`,
            },
            null,
            2,
          ),
        },
      ],
    };
  } catch (error) {
    if (!(error instanceof RfcHelperUnavailable)) {
      logger?.error('DeleteTransaction failed', error as any);
    }
    const text = error instanceof Error ? error.message : String(error);
    return return_error(
      new Error(!called ? `${text} Nothing was deleted.` : text),
    );
  }
}
