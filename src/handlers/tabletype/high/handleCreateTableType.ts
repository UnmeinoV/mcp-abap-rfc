/**
 * CreateTableType Handler — create an ABAP table type (TTYP).
 *
 * Table types had NO create tool at all: the Create* family covered
 * DOMA/DTEL/TABL/STRU/VIEW and friends, the compact `HandlerCreate` object_type
 * enum omitted TTYP, and `/sap/bc/adt/ddic/tabletypes` was only ever read (by
 * GetTypeInfo / GetWhereUsed). Consequence: any interface structure carrying
 * line items — a header with a nested item table — could not be built at all.
 *
 * The full flow here is: bare POST → lock → write the row type → unlock →
 * activate (verified). Two deliberate deviations from the dep:
 *
 *  - the row type is written by `writeTableTypeContent`, not the dep's
 *    `update()`: that one regex-patches tags which must already exist, and a
 *    freshly created table type has no rowType/accessType/primaryKey nodes, so
 *    the row type was silently dropped (identical to the domain create bug);
 *  - activation goes through `activateAndEvaluate`, so `activated` reflects
 *    SAP's verdict instead of echoing the request flag.
 */

import { removePartialCreation } from '../../../lib/adtDeletion';
import {
  activationWarningLines,
  formatAdtMessages,
} from '../../../lib/adtMessages';
import {
  activateAndEvaluate,
  lockAdt,
  runExclusive,
  setSessionMode,
  unlockAdt,
} from '../../../lib/adtObjectOps';
import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  buildTableTypeCreateXml,
  CT_TABLE_TYPE,
  TABLE_TYPE_ACCESS_TYPES,
  TABLE_TYPE_KEY_DEFINITIONS,
  TABLE_TYPE_KEY_KINDS,
  TABLE_TYPE_ROW_KINDS,
  type TableTypeAccess,
  type TableTypeKeyDefinition,
  type TableTypeKeyKind,
  type TableTypeRowKind,
  tableTypeUri,
  writeTableTypeContent,
} from '../../../lib/tableTypeXml';
import {
  describeTransportRecovery,
  extractConflictingRequest,
  runUnderResolvedTransport,
} from '../../../lib/transportConflict';
import {
  assertNameLength,
  ErrorCode,
  getSystemContext,
  McpError,
  makeAdtRequestWithTimeout,
  return_error,
  return_response,
  withExplicitStatelessHeader,
} from '../../../lib/utils';
import { validateTransportRequest } from '../../../utils/transportValidation.js';

export const TOOL_DEFINITION = {
  name: 'CreateTableType',
  available_in: ['onprem'] as const,
  description:
    'Operation: Create. Subject: Table type (TTYP). Create a new ABAP table type — an internal-table type over a row type — and activate it. Use this for nested line-item fields: create the item table type, then reference it from a structure field via table_ref (CreateStructure). The row type is normally a structure or data element (row_type_kind=dictionaryType, the default); pass built_in_data_type instead for a table of a predefined ABAP type.',
  inputSchema: {
    type: 'object',
    properties: {
      table_type_name: {
        type: 'string',
        description:
          'Table type name (e.g., ZTT_ORDER_ITEM). Start with Z or Y, max 30 chars.',
      },
      package_name: {
        type: 'string',
        description: 'Package name (e.g., $TMP, ZMY_PKG).',
      },
      row_type_name: {
        type: 'string',
        description:
          'Row type: the DDIC object each table line has — a structure, table or data element (e.g., ZS_ORDER_ITEM). Required unless built_in_data_type is given.',
      },
      row_type_kind: {
        type: 'string',
        enum: [...TABLE_TYPE_ROW_KINDS],
        description:
          "How the row type is specified. Default 'dictionaryType' (a structure/table/data element). Use 'predefinedAbapType' together with built_in_data_type for a table of a built-in type (e.g., a table of STRING).",
      },
      built_in_data_type: {
        type: 'string',
        description:
          "Built-in ABAP type for the row (e.g., STRING, CHAR, INT4) when row_type_kind is 'predefinedAbapType' / 'refToPredefinedAbapType'. Mutually exclusive with row_type_name.",
      },
      built_in_length: {
        type: 'number',
        description: 'Length for built_in_data_type (default 0).',
      },
      built_in_decimals: {
        type: 'number',
        description: 'Decimals for built_in_data_type (default 0).',
      },
      access_type: {
        type: 'string',
        enum: [...TABLE_TYPE_ACCESS_TYPES],
        description:
          "Table kind: 'standard' (default), 'sorted', 'hashed', 'index' or 'notSpecified'.",
      },
      primary_key_definition: {
        type: 'string',
        enum: [...TABLE_TYPE_KEY_DEFINITIONS],
        description:
          "Primary key definition: 'standard' (default), 'rowType', 'keyComponents' or " +
          "'notSpecified'. Choosing 'keyComponents' REQUIRES key_components — without it SAP " +
          'accepts the create and then refuses to activate with "Key components are not ' +
          'defined", so this tool rejects the combination up front instead of leaving an ' +
          'inactive shell behind.',
      },
      key_components: {
        type: 'array',
        items: { type: 'string' },
        description:
          'Component (field) names forming the primary key, IN ORDER. Required when ' +
          "primary_key_definition is 'keyComponents', and only meaningful then. The names must " +
          'be components of the row type.',
      },
      primary_key_kind: {
        type: 'string',
        enum: [...TABLE_TYPE_KEY_KINDS],
        description:
          "Primary key kind: 'nonUnique' (default), 'unique' or 'notSpecified'. A hashed table requires 'unique'.",
      },
      description: {
        type: 'string',
        description: 'Description (defaults to table_type_name). Max 60 chars.',
      },
      transport_request: {
        type: 'string',
        description:
          'Transport request. Required for transportable packages; leave empty for $TMP.',
      },
      activate: {
        type: 'boolean',
        description:
          "Activate after creation. Default: true. The reported activated flag is SAP's own verdict, not a copy of this parameter.",
      },
    },
    required: ['table_type_name', 'package_name'],
  },
} as const;

interface CreateTableTypeArgs {
  table_type_name: string;
  package_name: string;
  row_type_name?: string;
  row_type_kind?: TableTypeRowKind;
  built_in_data_type?: string;
  built_in_length?: number;
  built_in_decimals?: number;
  access_type?: TableTypeAccess;
  primary_key_definition?: TableTypeKeyDefinition;
  primary_key_kind?: TableTypeKeyKind;
  key_components?: string[];
  description?: string;
  transport_request?: string;
  activate?: boolean;
}

export async function handleCreateTableType(
  context: HandlerContext,
  args: CreateTableTypeArgs,
) {
  const { connection, logger } = context;
  const name = (args?.table_type_name || '').toUpperCase();
  // Set once the object really exists in SAP, so the failure path can tell
  // "nothing was written" from "a shell was left behind".
  let createdUri: string | undefined;
  // What the write ACTUALLY went into — not what the caller passed.
  let transportUsed: string | undefined;
  const warnings: string[] = [];
  try {
    if (!args?.table_type_name) {
      return return_error(new Error('table_type_name is required'));
    }
    if (!args?.package_name) {
      return return_error(new Error('package_name is required'));
    }
    if (!args.row_type_name && !args.built_in_data_type) {
      return return_error(
        new McpError(
          ErrorCode.InvalidParams,
          'Either row_type_name (a structure/table/data element) or built_in_data_type ' +
            '(for a table of a predefined ABAP type) must be given — a table type without a ' +
            'row type cannot be activated.',
        ),
      );
    }
    // SAP does not reject an over-long name, it TRUNCATES it, which then
    // surfaces as a misleading "already exists" on the truncated name.
    assertNameLength('table_type', name, 'Table type');

    // Refuse the combination that cannot work, BEFORE creating anything.
    // 'keyComponents' without a component list is accepted by the create and
    // then fails activation with "Key components are not defined", leaving an
    // inactive shell the caller has to know to clean up.
    const keyComponents = (args.key_components ?? []).filter(
      (c) => String(c ?? '').trim() !== '',
    );
    if (
      args.primary_key_definition === 'keyComponents' &&
      !keyComponents.length
    ) {
      return return_error(
        new Error(
          "primary_key_definition 'keyComponents' requires key_components: the names of the " +
            'row-type components forming the key, in order. Without them SAP accepts the ' +
            'create and then refuses to activate ("Key components are not defined"), leaving ' +
            'an inactive object behind.',
        ),
      );
    }
    if (
      keyComponents.length &&
      args.primary_key_definition !== 'keyComponents'
    ) {
      return return_error(
        new Error(
          `key_components was given but primary_key_definition is ` +
            `'${args.primary_key_definition ?? 'standard'}', which ignores it. Pass ` +
            "primary_key_definition: 'keyComponents' as well, or drop key_components — " +
            'silently ignoring it would produce a table type with a different key than asked for.',
        ),
      );
    }

    try {
      validateTransportRequest(args.package_name, args.transport_request);
    } catch (e) {
      return return_error(e as Error);
    }

    createAdtClient(connection, logger); // wrap connection (sap-language pinning)
    const { responsible, masterSystem, masterLanguage } = getSystemContext();
    const lang = (
      masterLanguage ||
      process.env.SAP_LANGUAGE ||
      'EN'
    ).toUpperCase();
    const transport = args.transport_request?.trim() || undefined;
    transportUsed = transport;
    const uri = tableTypeUri(name);

    const rowKind: TableTypeRowKind =
      args.row_type_kind ??
      (args.built_in_data_type ? 'predefinedAbapType' : 'dictionaryType');

    const createBody = buildTableTypeCreateXml({
      name,
      packageName: args.package_name,
      description: args.description,
      masterLanguage: lang,
      masterSystem,
      responsible,
    });

    const createParams: Record<string, string> = { 'sap-language': lang };
    if (transport) createParams.corrNr = transport;

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
        '/sap/bc/adt/ddic/tabletypes',
        'POST',
        'default',
        createBody,
        createParams,
        {
          // BOTH headers are required: the collection answers 406
          // ExceptionResourceNotAcceptable when Accept is absent (verified live).
          'Content-Type': CT_TABLE_TYPE,
          Accept: CT_TABLE_TYPE,
        },
      );
    } finally {
      restoreStateless();
    }
    logger?.info(`Table type created (bare): ${name}`);
    // The object now exists in SAP. Anything that fails from here until
    // activation leaves a bare shell behind, so the failure path has to clean up
    // (see removePartialCreation).
    createdUri = uri;

    // Write the row type under a lock. Serialized through runExclusive because
    // setSessionType is connection-global and the server dispatches tool calls
    // concurrently on one shared connection.
    await runExclusive(connection, async () => {
      setSessionMode(connection, 'stateful');
      let lockHandle: string | undefined;
      try {
        lockHandle = await lockAdt(connection, uri);
        // Captured so the write closure below keeps the narrowed (defined) type.
        const writeLock = lockHandle;
        // Follow SAP if the bare create landed in a different request than the
        // caller passed (a TASK resolves to its PARENT request) — otherwise this
        // PUT is refused and the table type is left without its row type.
        // See lib/transportConflict.
        const write = await runUnderResolvedTransport(
          (transportRequest) =>
            writeTableTypeContent(
              connection,
              name,
              {
                // ALWAYS send a description: SAP does not persist the one from the
                // bare create (the GET of a fresh table type carries no
                // adtcore:description at all), and the PUT then fails 400
                // "missing description". Verified live.
                description: args.description || name,
                row_type_name: args.row_type_name,
                row_type_kind: rowKind,
                built_in_type: args.built_in_data_type
                  ? {
                      data_type: args.built_in_data_type,
                      length: args.built_in_length,
                      decimals: args.built_in_decimals,
                    }
                  : undefined,
                access_type: args.access_type ?? 'standard',
                primary_key_definition:
                  args.primary_key_definition ?? 'standard',
                primary_key_kind: args.primary_key_kind ?? 'nonUnique',
                ...(keyComponents.length
                  ? { key_components: keyComponents }
                  : {}),
              },
              writeLock,
              transportRequest,
            ),
          transport,
          `Table type ${name}`,
          logger,
        );
        transportUsed = write.transport_used;
        if (write.warning) warnings.push(write.warning);
      } finally {
        if (lockHandle) {
          try {
            await unlockAdt(connection, uri, lockHandle);
          } catch (unlockError: any) {
            logger?.warn(
              `Failed to unlock table type ${name}: ${unlockError?.message || unlockError}`,
            );
          }
        }
        setSessionMode(connection, 'stateless');
      }
    });
    logger?.info(`Table type row type written: ${name}`);

    const shouldActivate = args.activate !== false;
    const activation = shouldActivate
      ? await activateAndEvaluate(connection, [{ name, type: 'TTYP/DA' }])
      : undefined;

    if (activation && !activation.success) {
      // Report the failure, but say plainly that the object DOES exist — the
      // caller has to either fix the row type or delete the table type.
      return return_error(
        new Error(
          `Table type ${name} was created but ACTIVATION FAILED: ` +
            `${formatAdtMessages(activation.errors)}. The table type exists in an inactive ` +
            `state — fix the row type (${args.row_type_name || args.built_in_data_type}) ` +
            `and re-run, or remove it with DeleteTableType.`,
        ),
      );
    }

    return return_response({
      data: JSON.stringify(
        {
          success: true,
          table_type_name: name,
          package_name: args.package_name,
          transport_request: transportUsed || null,
          ...(transportUsed !== transport
            ? { transport_request_requested: transport ?? null }
            : {}),
          ...(warnings.length ? { warnings } : {}),
          row_type_name: args.row_type_name || null,
          row_type_kind: rowKind,
          built_in_data_type: args.built_in_data_type || null,
          access_type: args.access_type ?? 'standard',
          primary_key_definition: args.primary_key_definition ?? 'standard',
          primary_key_kind: args.primary_key_kind ?? 'nonUnique',
          ...(keyComponents.length ? { key_components: keyComponents } : {}),
          type: 'TTYP/DA',
          // SAP's verdict, not the request flag.
          activated: activation ? activation.activated : false,
          activation_warnings: activation?.warnings.length
            ? activationWarningLines(activation.warnings)
            : undefined,
          uri,
          message: shouldActivate
            ? `Table type ${name} created and activated successfully`
            : `Table type ${name} created successfully (not activated)`,
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
    if (error instanceof McpError) return return_error(error);
    const status = error?.response?.status;
    const body = error?.response?.data;
    const bodyText = body
      ? typeof body === 'string'
        ? body
        : JSON.stringify(body)
      : '';
    const msg = [
      `Error creating table type ${name}`,
      status ? `HTTP ${status}` : '',
      error instanceof Error ? error.message : String(error),
      bodyText ? `ADT response: ${bodyText.slice(0, 1200)}` : '',
    ]
      .filter(Boolean)
      .join(' | ');
    // Only PRE-ACTIVATION failures reach here — an activation failure returns
    // above and deliberately keeps the object, because it holds the caller's
    // row type and is worth repairing.
    const conflicting = extractConflictingRequest(
      error,
      args.transport_request?.trim() || undefined,
    );
    const cleanup = createdUri
      ? await removePartialCreation(connection, {
          objectUri: createdUri,
          objectLabel: `table type ${name}`,
          transportRequest: args.transport_request?.trim() || undefined,
          retryHint: conflicting
            ? describeTransportRecovery('UpdateTableType', conflicting)
            : undefined,
          logger,
        })
      : '';
    logger?.error(msg);
    return return_error(new Error(`${msg}${cleanup}`));
  }
}
