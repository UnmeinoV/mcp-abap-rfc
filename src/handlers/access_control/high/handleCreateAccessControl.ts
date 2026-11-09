/**
 * CreateAccessControl Handler - Create a CDS access control (DCL / DCLS).
 *
 * Chain: validate (existence gate) -> POST bare object -> [lock -> PUT source
 * -> unlock -> activate].
 *
 * Issued in-repo rather than through `client.getAccessControl()`; see
 * src/lib/accessControlXml.ts for the three dep defects that motivates.
 */

import {
  ACCESS_CONTROL_TYPE,
  accessControlUri,
  buildAccessControlCreateXml,
  CT_ACCESS_CONTROL,
} from '../../../lib/accessControlXml';
import {
  type ActivationOutcome,
  formatAdtMessages,
} from '../../../lib/adtMessages';
import {
  activateAndEvaluate,
  putAdtSource,
  runLocked,
  setSessionMode,
} from '../../../lib/adtObjectOps';
import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  assertNameLength,
  assertObjectDoesNotExist,
  getSystemContext,
  makeAdtRequestWithTimeout,
  return_error,
  return_response,
  withExplicitStatelessHeader,
} from '../../../lib/utils';
import { validateTransportRequest } from '../../../utils/transportValidation.js';

export const TOOL_DEFINITION = {
  name: 'CreateAccessControl',
  available_in: ['onprem'] as const,
  description:
    'Operation: Create. Subject: Access Control (DCL / DCLS) — the CDS authorization layer. ' +
    'Creates a DCL source that restricts who may read a CDS entity. Supply source_code to write ' +
    'the role in the same call (recommended — a DCL with no source cannot activate); omit it to ' +
    'create an empty shell and set the source later with UpdateAccessControl. ' +
    "DCL source shape: \"@EndUserText.label: '…'  @MappingRole: true  define role <NAME> { " +
    'grant select on <CDS_ENTITY> where …; }". The role name normally matches the DCL object name, ' +
    'and the granted entity must be an ACTIVE CDS view.',
  inputSchema: {
    type: 'object',
    properties: {
      access_control_name: {
        type: 'string',
        description:
          'DCL name (e.g., Z_MY_VIEW). Start with Z or Y, max 30 chars. By convention it matches the CDS entity it protects.',
      },
      package_name: {
        type: 'string',
        description: 'Package name (e.g., $TMP, ZMY_PKG).',
      },
      description: {
        type: 'string',
        description:
          'Description (defaults to the object name). Max 60 chars; XML metacharacters are escaped for you.',
      },
      source_code: {
        type: 'string',
        description:
          'Complete DCL source. Strongly recommended: without it the object is created empty and activation is skipped, because an empty DCL cannot activate.',
      },
      transport_request: {
        type: 'string',
        description:
          'Transport request. Required for transportable packages, omit for $TMP.',
      },
      activate: {
        type: 'boolean',
        description:
          'Activate after writing the source. DEFAULT: TRUE, but only applies when source_code is supplied (an empty DCL cannot activate). The activated field in the response is SAP’s own verdict, not a copy of this parameter.',
      },
    },
    required: ['access_control_name', 'package_name'],
  },
} as const;

interface CreateAccessControlArgs {
  access_control_name: string;
  package_name: string;
  description?: string;
  source_code?: string;
  transport_request?: string;
  activate?: boolean;
}

export async function handleCreateAccessControl(
  context: HandlerContext,
  args: CreateAccessControlArgs,
) {
  const { connection, logger } = context;
  try {
    if (!args?.access_control_name) {
      return return_error(new Error('access_control_name is required'));
    }
    if (!args?.package_name) {
      return return_error(new Error('package_name is required'));
    }
    try {
      validateTransportRequest(args.package_name, args.transport_request);
    } catch (e) {
      return return_error(e as Error);
    }

    createAdtClient(connection, logger); // wrap connection (sap-language pinning)
    const name = args.access_control_name.toUpperCase();
    assertNameLength('access_control', name, 'Access control');

    const ctx = getSystemContext();
    const lang = (
      ctx.masterLanguage ||
      process.env.SAP_LANGUAGE ||
      'EN'
    ).toUpperCase();
    const base = accessControlUri(name);
    const description = args.description || name;

    // Fast-fail on a name clash BEFORE creating anything, so a duplicate never
    // turns into a half-created object partway through the chain.
    await assertObjectDoesNotExist(
      `Access control ${name}`,
      () =>
        makeAdtRequestWithTimeout(
          connection,
          '/sap/bc/adt/acm/dcl/validation',
          'POST',
          'default',
          undefined,
          {
            objname: name,
            packagename: args.package_name.toUpperCase(),
            description,
          },
        ),
      connection,
    );

    const body = buildAccessControlCreateXml({
      name,
      packageName: args.package_name,
      description,
      masterLanguage: lang,
      masterSystem: ctx.masterSystem,
      responsible: ctx.responsible,
    });

    const params: Record<string, string> = { 'sap-language': lang };
    if (args.transport_request?.trim()) {
      params.corrNr = args.transport_request.trim();
    }

    // Force stateless for the POST. Both mechanisms are needed:
    //   * setSessionMode omits the stateful header, but it does NOT terminate a
    //     server session an earlier stateful op (lock/activate) left alive on
    //     this shared connection — so the create still lands in that session and
    //     the new object is born holding an implicit EDIT LOCK, which then makes
    //     every later lock fail 403 "<user> is currently editing <object>".
    //   * withExplicitStatelessHeader SENDS `x-sap-adt-sessiontype: stateless`,
    //     which does terminate it.
    // Proven by an A/B probe on DM2: with setSessionMode alone a freshly created
    // message class was already locked; with the explicit header it was not.
    // Same remedy as the P4 GetPackageContents nodestructure-bleed fix.
    setSessionMode(connection, 'stateless');
    const restoreStateless = withExplicitStatelessHeader(connection);
    try {
      await makeAdtRequestWithTimeout(
        connection,
        '/sap/bc/adt/acm/dcl/sources',
        'POST',
        'default',
        body,
        params,
        { 'Content-Type': CT_ACCESS_CONTROL, Accept: CT_ACCESS_CONTROL },
      );
    } finally {
      restoreStateless();
    }
    logger?.info(`Access control created: ${name}`);

    // Write the source (and activate) when supplied. An empty DCL has no role
    // definition, so activating it can only fail — hence both steps are gated
    // on source_code rather than on `activate` alone.
    let activation: ActivationOutcome | undefined;
    if (args.source_code) {
      await runLocked(connection, base, async (lockHandle) => {
        await putAdtSource(
          connection,
          `${base}/source/main`,
          args.source_code as string,
          lockHandle,
          args.transport_request,
        );
      });
      logger?.info(`Access control source written: ${name}`);

      if (args.activate !== false) {
        activation = await activateAndEvaluate(connection, [
          { name, type: ACCESS_CONTROL_TYPE },
        ]);
        if (!activation.success) {
          throw new Error(
            `Access control ${name} was created and its source written, but ACTIVATION FAILED: ` +
              `${formatAdtMessages(activation.errors)}. The object is left inactive. ` +
              'A DCL can only activate when the entity it grants select on is an ACTIVE CDS view ' +
              'and the role name matches what the source declares.',
          );
        }
      }
    }

    return return_response({
      data: JSON.stringify(
        {
          success: activation ? activation.success : true,
          access_control_name: name,
          package_name: args.package_name.toUpperCase(),
          transport_request: args.transport_request || null,
          type: ACCESS_CONTROL_TYPE,
          source_written: Boolean(args.source_code),
          // SAP's verdict, never an echo of the request flag.
          activated: activation ? activation.activated : false,
          activation: activation
            ? {
                activated: activation.activated,
                checked: activation.checked,
                messages: activation.messages,
              }
            : undefined,
          uri: base,
          message: args.source_code
            ? `Access control ${name} created${activation ? ' and activated' : ' (left inactive)'}.`
            : `Access control ${name} created EMPTY. Use UpdateAccessControl to set the role source — an empty DCL cannot be activated.`,
        },
        null,
        2,
      ),
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });
  } catch (error: any) {
    const bodyText = error?.response?.data
      ? typeof error.response.data === 'string'
        ? error.response.data
        : JSON.stringify(error.response.data)
      : '';
    const msg = `Error creating access control ${args?.access_control_name}: ${
      error instanceof Error ? error.message : String(error)
    }${bodyText ? ` | ADT: ${bodyText.slice(0, 1000)}` : ''}`;
    logger?.error(msg);
    return return_error(error instanceof Error ? new Error(msg) : error);
  }
}
