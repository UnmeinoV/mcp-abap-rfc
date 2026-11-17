/**
 * SetupGuiStatusHelper — install (or update) the SE41 helper that
 * AddGuiStatusButton calls over RFC (function group ZMCP_CUA). Installer
 * shared with the other helpers: lib/rfcHelper/installer.ts.
 */

import { CUA_HELPER_SPEC } from '../../../lib/guiStatus/cuaHelperSpec';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  INSTALL_INPUT_SCHEMA,
  type InstallRfcHelperArgs,
  installRfcHelper,
} from '../../../lib/rfcHelper/installer';

export const TOOL_DEFINITION = {
  name: 'SetupGuiStatusHelper',
  available_in: ['onprem', 'legacy'] as const,
  description:
    'One-time install of the SE41 helper that AddGuiStatusButton, CopyGuiStatus, RemoveGuiStatusButton and DeleteGuiStatus need: function group ZMCP_CUA with four RFC-enabled modules (Z_MCP_CUA_*), source shipped with this server. WRITES Z CODE INTO THE SAP SYSTEM — ask the user before calling it. Default package $TMP (no transport). Safe to re-run. GetGuiStatus does NOT need it.',
  notes: `Why a Z helper: ADT has no GUI-status resource, and SE41's writer RS_CUA_INTERNAL_WRITE is not
RFC-enabled (nor is SE41's copy RS_CUA_COPY_STA). Same installer as SetupTransactionHelper: an up-to-date helper is left alone unless
force:true, a newer one is never downgraded, a same-named module in another function group is
refused; verified by TFDIR (RFC-enabled), the ACTIVE source read back through ADT, and an RFC call
on a fresh ABAP session. package_name other than $TMP needs transport_request.`,
  inputSchema: INSTALL_INPUT_SCHEMA,
} as const;

export function handleSetupGuiStatusHelper(
  context: HandlerContext,
  args: InstallRfcHelperArgs,
) {
  return installRfcHelper(context, CUA_HELPER_SPEC, args);
}
