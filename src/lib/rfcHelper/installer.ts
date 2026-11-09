/**
 * Install (or update) an RFC helper: a Z function group whose RFC-enabled
 * modules wrap SAP function modules that are not RFC-enabled. Shared by every
 * Setup*Helper tool; the helper itself is described by an RfcHelperSpec.
 *
 * It writes Z code into the SAP system, so the setup tools tell the agent to
 * ask the user first. Idempotent: an installed helper of the right version is
 * left alone unless `force` is set; a newer one is never downgraded unless
 * `force`; a module of the same name in ANOTHER function group is someone
 * else's object and is refused, never overwritten. The result is verified, not
 * assumed: TFDIR must show every module RFC-enabled in the group, the ACTIVE
 * source read back through ADT must carry the version, and over RFC every
 * module must answer with it on a fresh ABAP session.
 *
 * History (measured 2026-11-05, S4D): a hard-coded TFDIR IN-list missed a module
 * added later and called a successful install "not RFC-enabled"; a rewrite flag
 * set only after verification made the next error say "run setup again" instead
 * of "restart". Both are why the module list comes from the spec and the flag is
 * set right after the first source write.
 */

import { handleCreateFunctionGroup } from '../../handlers/function/high/handleCreateFunctionGroup';
import { handleCreateFunctionModule } from '../../handlers/function/high/handleCreateFunctionModule';
import { handleUpdateFunctionModule } from '../../handlers/function/high/handleUpdateFunctionModule';
import { handleGetFunctionModule } from '../../handlers/function_module/high/handleGetFunctionModule';
import { parseSqlQueryXml } from '../../handlers/system/readonly/handleGetSqlQuery';
import { createAdtClient } from '../clients';
import { getRfcFunctionCaller } from '../connectionFactory';
import type { HandlerContext } from '../handlers/interfaces';
import { return_error } from '../utils';
import {
  callRfcHelper,
  isNewerVersion,
  markRewritten,
  type RfcHelperSpec,
  RfcHelperUnavailable,
  wasRewritten,
} from './rfcHelper';

export interface InstallRfcHelperArgs {
  package_name?: string;
  transport_request?: string;
  force?: boolean;
}

/** The setup tools' shared input schema. */
export const INSTALL_INPUT_SCHEMA = {
  type: 'object',
  properties: {
    package_name: {
      type: 'string',
      description: 'Package for a NEW function group. Default $TMP.',
    },
    transport_request: {
      type: 'string',
      description: 'Transport request, required for a non-$TMP package.',
    },
    force: {
      type: 'boolean',
      description:
        'Rewrite the source even when the installed helper is up to date. Default false.',
    },
  },
  required: [],
} as const;

function resultText(result: any, max = 1500): string {
  // The inner handler's return_error already appended the build banner; the
  // outer one appends it again, so drop the inner copy.
  return String(result?.content?.[0]?.text ?? '')
    .replace(/\n?\[mcp-abap-rfc [^\]]*\]\s*$/, '')
    .slice(0, max);
}

/** Rows of one Data Preview SELECT (throws when the preview does not answer). */
export async function selectRows(
  context: HandlerContext,
  sql: string,
): Promise<Array<Record<string, string>>> {
  const client = createAdtClient(context.connection, context.logger);
  const response = await client
    .getUtils()
    .getSqlQuery({ sql_query: sql, row_number: 10 });
  if (response?.status !== 200 || !response?.data) {
    throw new Error(`Data Preview did not answer for: ${sql}`);
  }
  return parseSqlQueryXml(String(response.data), sql, 10, context.logger)
    .rows as Array<Record<string, string>>;
}

/** The TFDIR read that decides what exists and what is RFC-enabled. */
export function helperTfdirSql(spec: RfcHelperSpec): string {
  return `SELECT funcname, pname, fmode FROM tfdir WHERE funcname IN (${spec.modules.map((m) => `'${m.name}'`).join(',')})`;
}

async function readTfdir(context: HandlerContext, spec: RfcHelperSpec) {
  const rows = await selectRows(context, helperTfdirSql(spec));
  const byName = new Map<string, { pname: string; fmode: string }>();
  for (const row of rows) {
    byName.set(String(row.FUNCNAME ?? '').trim(), {
      pname: String(row.PNAME ?? '').trim(),
      fmode: String(row.FMODE ?? '').trim(),
    });
  }
  return byName;
}

/** Version each module reports over RFC; undefined = could not tell. */
async function installedVersions(
  context: HandlerContext,
  spec: RfcHelperSpec,
): Promise<Record<string, string> | undefined> {
  const call = getRfcFunctionCaller(context.connection);
  if (!call) return undefined;
  const versions: Record<string, string> = {};
  for (const m of spec.modules) {
    try {
      const r = await call(m.name, m.probeParams);
      versions[m.name] = String(r?.EV_VERSION ?? '').trim() || '(none)';
    } catch {
      versions[m.name] = '(not callable)';
    }
  }
  return versions;
}

/**
 * Helper version written in each module's ACTIVE source, read through ADT — an
 * oracle that does not depend on the NW RFC SDK's per-process signature cache.
 */
async function activeSourceVersions(
  context: HandlerContext,
  spec: RfcHelperSpec,
): Promise<Record<string, string>> {
  const versions: Record<string, string> = {};
  for (const m of spec.modules) {
    const read = await handleGetFunctionModule(context, {
      function_module_name: m.name,
      function_group_name: spec.group,
      version: 'active',
    } as any);
    let source = '';
    try {
      source = String(
        JSON.parse(resultText(read, 1e7)).function_module_data ?? '',
      );
    } catch {
      source = '';
    }
    versions[m.name] =
      source.match(/ev_version\s*=\s*'([^']*)'/i)?.[1] ?? '(not found)';
  }
  return versions;
}

function restartNote(spec: RfcHelperSpec): string {
  return (
    'This server process had already called the helper, and the SAP NW RFC SDK caches ' +
    'function signatures per process: RESTART THE MCP SERVER (e.g. /mcp reconnect) before ' +
    `using the ${spec.usedBy.toLowerCase()}. Do not run ${spec.setupTool} again.`
  );
}

function json(payload: unknown) {
  return {
    isError: false,
    content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
  };
}

export async function installRfcHelper(
  context: HandlerContext,
  spec: RfcHelperSpec,
  args: InstallRfcHelperArgs,
) {
  const { connection, logger } = context;
  const actions: string[] = [];
  const groupProgram = `SAPL${spec.group}`;
  try {
    const packageName = (args?.package_name || '$TMP').trim().toUpperCase();
    const transport = args?.transport_request?.trim() || undefined;
    if (!packageName.startsWith('$') && !transport) {
      throw new Error(
        `package_name ${packageName} is transportable: pass transport_request, or use $TMP`,
      );
    }

    if (wasRewritten(spec) && !args?.force) {
      const active = await activeSourceVersions(context, spec);
      if (spec.modules.every((m) => active[m.name] === spec.version)) {
        return json({
          success: true,
          changed: false,
          restart_required: true,
          function_group: spec.group,
          helper_version: spec.version,
          active_source_versions: active,
          message: `The helper source on the system is already version ${spec.version}. ${restartNote(spec)}`,
        });
      }
    }

    const before = await installedVersions(context, spec);
    const newer = spec.modules.filter(
      (m) => before !== undefined && isNewerVersion(spec, before[m.name]),
    );
    if (newer.length > 0 && !args?.force) {
      throw new Error(
        `The helper on this system is NEWER than this server build ships (${newer
          .map((m) => `${m.name} version ${before?.[m.name]}`)
          .join(
            ', ',
          )}; this build: ${spec.version}). Refusing to downgrade it — ` +
          'update or restart this server instead (force:true overrides).',
      );
    }
    const upToDate =
      before !== undefined &&
      spec.modules.every((m) => before[m.name] === spec.version);
    if (upToDate && !args?.force) {
      return json({
        success: true,
        changed: false,
        function_group: spec.group,
        helper_version: spec.version,
        message: `The ${spec.label} is installed and up to date (version ${spec.version}); nothing was changed.`,
      });
    }

    // Existing objects decide what to create — and what must NOT be touched.
    const groupRows = await selectRows(
      context,
      `SELECT obj_name, devclass FROM tadir WHERE pgmid = 'R3TR' AND object = 'FUGR' AND obj_name = '${spec.group}'`,
    );
    const groupPackage = groupRows[0]
      ? String(groupRows[0].DEVCLASS ?? '').trim()
      : undefined;
    const tfdirBefore = await readTfdir(context, spec);
    for (const m of spec.modules) {
      const existing = tfdirBefore.get(m.name);
      if (existing && existing.pname !== groupProgram) {
        throw new Error(
          `Function module ${m.name} already exists in ${existing.pname}, not in ${groupProgram}. ` +
            'It is not this helper and was not touched; resolve the name clash on the system first.',
        );
      }
    }

    if (!groupPackage) {
      const created = await handleCreateFunctionGroup(context, {
        function_group_name: spec.group,
        description: spec.groupDescription,
        package_name: packageName,
        transport_request: transport,
        activate: true,
      });
      if (created?.isError) {
        throw new Error(
          `Creating function group ${spec.group} failed: ${resultText(created)}`,
        );
      }
      actions.push(`created function group ${spec.group} in ${packageName}`);
    }
    const effectivePackage = groupPackage ?? packageName;
    const effectiveTransport = effectivePackage.startsWith('$')
      ? undefined
      : transport;

    for (const m of spec.modules) {
      if (!tfdirBefore.has(m.name)) {
        const created = await handleCreateFunctionModule(context, {
          function_group_name: spec.group,
          function_module_name: m.name,
          description: m.description,
          processing_type: 'remote',
          transport_request: effectiveTransport,
        });
        if (created?.isError) {
          throw new Error(
            `Creating function module ${m.name} failed: ${resultText(created)}`,
          );
        }
        actions.push(`created function module ${m.name} (Remote-Enabled)`);
      }
      const updated = await handleUpdateFunctionModule(context, {
        function_group_name: spec.group,
        function_module_name: m.name,
        source_code: m.source,
        transport_request: effectiveTransport,
        activate: true,
      });
      if (updated?.isError) {
        throw new Error(
          `Writing the source of ${m.name} failed: ${resultText(updated)}`,
        );
      }
      actions.push(`wrote and activated the source of ${m.name}`);
      // From here on this process may hold a stale signature or load of the
      // helper — even if a later step fails.
      markRewritten(spec);
    }

    // Verify the end state, not the handlers' word for it.
    const tfdirAfter = await readTfdir(context, spec);
    const notRemote = spec.modules
      .filter((m) => {
        const row = tfdirAfter.get(m.name);
        return !row || row.pname !== groupProgram || row.fmode !== 'R';
      })
      .map((m) => m.name);
    if (notRemote.length > 0) {
      throw new Error(
        `After installing, TFDIR does not list ${notRemote.join(', ')} as RFC-enabled (FMODE R) in ${groupProgram}.`,
      );
    }

    // The active source is what SAP will run; read it back through ADT.
    const active = await activeSourceVersions(context, spec);
    const wrongSource = spec.modules.filter(
      (m) => active[m.name] !== spec.version,
    );
    if (wrongSource.length > 0) {
      throw new Error(
        `After installing, the active source of ${wrongSource
          .map((m) => `${m.name} (version ${active[m.name]})`)
          .join(', ')} is not helper version ${spec.version}.`,
      );
    }

    // Over RFC, call every module on a fresh ABAP session. If this process had
    // already called them, the NW RFC SDK still holds their OLD signature and
    // the call cannot prove anything — that is reported, not failed.
    let rfcVerified: boolean | null = null;
    let restartRequired = false;
    let verifyNote: string;
    if (getRfcFunctionCaller(connection)) {
      const cachedBefore = spec.modules.some(
        (m) => before !== undefined && before[m.name] !== '(not callable)',
      );
      const reset = (connection as { invalidateSession?: () => unknown })
        ?.invalidateSession;
      if (typeof reset === 'function') await reset.call(connection);
      try {
        for (const m of spec.modules) {
          await callRfcHelper(spec, connection, m.name, m.probeParams);
        }
        rfcVerified = true;
        verifyNote = `active source and TFDIR verified, and all helper modules answer over RFC with helper version ${spec.version}`;
      } catch (error) {
        if (!(cachedBefore && error instanceof RfcHelperUnavailable)) {
          throw error;
        }
        rfcVerified = false;
        restartRequired = true;
        verifyNote = `active source (version ${spec.version}) and TFDIR (RFC-enabled) verified. ${restartNote(spec)}`;
      }
    } else {
      verifyNote = `active source and TFDIR verified; the RFC call itself could not be tested because this connection is HTTP — the ${spec.usedBy.toLowerCase()} need an RFC connection anyway`;
    }

    return json({
      success: true,
      changed: true,
      function_group: spec.group,
      package: effectivePackage,
      ...(groupPackage && groupPackage !== packageName
        ? {
            package_note: `the function group already existed in ${groupPackage}; package_name ${packageName} was not applied`,
          }
        : {}),
      helper_version: spec.version,
      version_before: before ?? null,
      actions,
      tfdir_rfc_enabled: true,
      active_source_versions: active,
      rfc_verified: rfcVerified,
      restart_required: restartRequired,
      message: `${spec.label} installed: ${verifyNote.replace(/\.$/, '')}.`,
    });
  } catch (error) {
    if (!(error instanceof RfcHelperUnavailable)) {
      logger?.error(`${spec.setupTool} failed`, error as any);
    }
    // A rewritten helper must not keep running from the session's old load.
    if (wasRewritten(spec)) {
      const reset = (connection as { invalidateSession?: () => unknown })
        ?.invalidateSession;
      if (typeof reset === 'function') {
        await Promise.resolve(reset.call(connection)).catch(() => undefined);
      }
    }
    const done =
      actions.length > 0
        ? ` Already done before the failure: ${actions.join('; ')}.`
        : '';
    return return_error(
      new Error(
        `${error instanceof Error ? error.message : String(error)}${done}`,
      ),
    );
  }
}
