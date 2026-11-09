/**
 * SetupTransactionHelper — install (or update) the SE93 helper that
 * CreateTransaction / DeleteTransaction call over RFC (function group
 * ZMCP_TRAN). Installer shared with the other helpers: lib/rfcHelper/installer.ts.
 */

import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  INSTALL_INPUT_SCHEMA,
  type InstallRfcHelperArgs,
  installRfcHelper,
} from '../../../lib/rfcHelper/installer';
import { TRAN_HELPER_SPEC } from '../../../lib/transaction/tranHelperSpec';

export const TOOL_DEFINITION = {
  name: 'SetupTransactionHelper',
  available_in: ['onprem', 'legacy'] as const,
  description:
    'One-time install of the SE93 helper that CreateTransaction / DeleteTransaction need: function group ZMCP_TRAN with two RFC-enabled modules (Z_MCP_TRAN_CREATE / _DELETE), source shipped with this server. WRITES Z CODE INTO THE SAP SYSTEM — ask the user before calling it. Default package $TMP (no transport). Safe to re-run.',
  notes: `Why a Z helper: ADT has no transaction resource, and SE93's own RPY_TRANSACTION_INSERT /
RPY_TRANSACTION_DELETE are not RFC-enabled. Same installer as SetupTranslationHelper: an up-to-date
helper is left alone unless force:true, a newer one is never downgraded, a same-named module in
another function group is refused; verified by TFDIR (RFC-enabled), the ACTIVE source read back
through ADT, and an RFC call on a fresh ABAP session. package_name other than $TMP needs
transport_request.`,
  inputSchema: INSTALL_INPUT_SCHEMA,
} as const;

export function handleSetupTransactionHelper(
  context: HandlerContext,
  args: InstallRfcHelperArgs,
) {
  return installRfcHelper(context, TRAN_HELPER_SPEC, args);
}
