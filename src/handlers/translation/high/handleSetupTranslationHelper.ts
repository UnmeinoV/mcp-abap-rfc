/**
 * SetupTranslationHelper — install (or update) the SE63 helper that the
 * translation tools call over RFC (function group ZMCP_LXE). The installer is
 * shared with the other helpers: lib/rfcHelper/installer.ts.
 */

import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  INSTALL_INPUT_SCHEMA,
  type InstallRfcHelperArgs,
  installRfcHelper,
  helperTfdirSql as tfdirSqlFor,
} from '../../../lib/rfcHelper/installer';
import { LXE_HELPER_SPEC } from '../../../lib/translation/lxeHelperSpec';

export const TOOL_DEFINITION = {
  name: 'SetupTranslationHelper',
  available_in: ['onprem', 'legacy'] as const,
  description:
    'One-time install of the SE63 helper that GetTranslation / UpdateTranslation / AddTranslationToTransport need: function group ZMCP_LXE with three RFC-enabled modules (Z_MCP_LXE_READ / _WRITE / _RECORD), source shipped with this server. WRITES Z CODE INTO THE SAP SYSTEM — ask the user before calling it. Default package $TMP (no transport). Safe to re-run: an up-to-date helper is left alone, an outdated one is updated.',
  notes: `Why a Z helper: SE63 reads/writes through LXE_OBJ_TEXT_PAIR_READ / LXE_OBJ_TEXT_PAIR_WRITE, which
are not RFC-enabled, and ADT has no resource for them.

Steps: check (over RFC) whether both modules answer with this server's helper version — if so,
nothing is changed unless force:true. Otherwise create the function group if missing, create each
module (processing type Remote-Enabled) if missing, write the shipped source and activate. A module
of the same name in ANOTHER function group is refused, not overwritten.

Verified, not assumed: TFDIR must list both modules in SAPLZMCP_LXE with FMODE R, and over RFC
both must return the expected helper version after the ABAP session is reset (a session that had
already loaded the old function group would otherwise keep answering with it).

package_name other than $TMP needs transport_request. The function group's package is not changed
when it already exists.`,
  inputSchema: INSTALL_INPUT_SCHEMA,
} as const;

/** The TFDIR read that decides what exists and what is RFC-enabled. */
export function helperTfdirSql(): string {
  return tfdirSqlFor(LXE_HELPER_SPEC);
}

export function handleSetupTranslationHelper(
  context: HandlerContext,
  args: InstallRfcHelperArgs,
) {
  return installRfcHelper(context, LXE_HELPER_SPEC, args);
}
