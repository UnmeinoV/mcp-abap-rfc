/**
 * SetupDdicHelper — install (or update) the DDIC deploy helper that DeployDdic
 * calls over RFC (function group ZMCP_DDIC). Installer shared with the other
 * helpers: lib/rfcHelper/installer.ts.
 */

import { DDIC_HELPER_SPEC } from '../../../lib/ddic/ddicHelperSpec';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  INSTALL_INPUT_SCHEMA,
  type InstallRfcHelperArgs,
  installRfcHelper,
} from '../../../lib/rfcHelper/installer';

export const TOOL_DEFINITION = {
  name: 'SetupDdicHelper',
  available_in: ['onprem', 'legacy'] as const,
  description:
    'One-time install of the DDIC deploy helper that DeployDdic needs: function group ZMCP_DDIC with one RFC-enabled module (Z_MCP_DDIC_DEPLOY), source shipped with this server. WRITES Z CODE INTO THE SAP SYSTEM — ask the user before calling it. Default package $TMP (no transport). Safe to re-run.',
  notes: `Only needed for DeployDdic (deeply nested structures / many DDIC objects in one call).
CreateStructure, CreateTableType and UpdateStructure work without it. Same installer as
SetupTransactionHelper: an up-to-date helper is left alone unless force:true, a newer one is never
downgraded, a same-named module in another function group is refused; verified by TFDIR
(RFC-enabled), the ACTIVE source read back through ADT, and an RFC call on a fresh ABAP session.
package_name other than $TMP needs transport_request.`,
  inputSchema: INSTALL_INPUT_SCHEMA,
} as const;

export function handleSetupDdicHelper(
  context: HandlerContext,
  args: InstallRfcHelperArgs,
) {
  return installRfcHelper(context, DDIC_HELPER_SPEC, args);
}
