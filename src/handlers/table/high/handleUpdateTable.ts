/**
 * UpdateTable Handler - Update Existing ABAP Table DDL Source
 *
 * Uses TableBuilder from @mcp-abap-adt/adt-clients for all operations.
 * Session and lock management handled internally by builder.
 *
 * Workflow: lock -> check (new code) -> update (if check OK) -> unlock -> check (inactive version) -> (activate)
 */

import {
  activationWarningLines,
  formatAdtMessages,
} from '../../../lib/adtMessages';
import {
  evaluateActivationResponse,
  runObjectCheckRun,
} from '../../../lib/adtObjectOps';
import { parseCheckRunResponse } from '../../../lib/checkRunParser';
import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { updateStepsCompleted } from '../../../lib/updateSteps';
import {
  encodeSapObjectName,
  return_error,
  return_response,
  safeCheckOperation,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'UpdateTable',
  available_in: ['onprem'] as const,
  description:
    'Operation: Update, Create. Subject: Table. Will be useful for updating or creating table. Update DDL source code of an existing ABAP table. Locks, updates, unlocks, and optionally activates.',
  inputSchema: {
    type: 'object',
    properties: {
      table_name: {
        type: 'string',
        description:
          'Table name (e.g., ZZ_TEST_TABLE_001). Table must already exist.',
      },
      ddl_code: {
        type: 'string',
        description:
          "Complete DDL source code for table. Example: '@EndUserText.label : \\'My Table\\' @AbapCatalog.tableCategory : #TRANSPARENT define table ztst_table { key client : abap.clnt not null; key id : abap.char(10); name : abap.char(255); }'",
      },
      transport_request: {
        type: 'string',
        description:
          'Transport request number (e.g., ABCK900001). Optional if object is local or already in transport.',
      },
      activate: {
        type: 'boolean',
        description:
          "Activate after the update. DEFAULT: TRUE — omitting it activates the object. Pass false to leave it inactive (e.g. when several mutually dependent objects must be activated together afterwards with ActivateObjects). The activated field in the response is SAP's own verdict, not a copy of this parameter.",
      },
    },
    required: ['table_name', 'ddl_code'],
  },
} as const;

interface UpdateTableArgs {
  table_name: string;
  ddl_code: string;
  transport_request?: string;
  activate?: boolean;
}

/**
 * Main handler for UpdateTable MCP tool
 *
 * Uses TableBuilder from @mcp-abap-adt/adt-clients for all operations
 * Session and lock management handled internally by builder
 */
export async function handleUpdateTable(
  context: HandlerContext,
  args: UpdateTableArgs,
) {
  const { connection, logger } = context;
  try {
    const {
      table_name,
      ddl_code,
      transport_request,
      activate = true,
    } = args as UpdateTableArgs;

    // Validation
    if (!table_name || !ddl_code) {
      return return_error(new Error('table_name and ddl_code are required'));
    }

    const tableName = table_name.toUpperCase();

    logger?.info(`Starting table source update: ${tableName}`);

    try {
      // Get configuration from environment variables
      // Create logger for connection (only logs when DEBUG_CONNECTORS is enabled)
      // Create connection directly for this handler call
      // Get connection from session context (set by ProtocolHandler)
      // Connection is managed and cached per session, with proper token refresh via AuthBroker
      logger?.debug(
        `[UpdateTable] Created separate connection for handler call: ${tableName}`,
      );
    } catch (connectionError: any) {
      const errorMessage =
        connectionError instanceof Error
          ? connectionError.message
          : String(connectionError);
      logger?.error(
        `[UpdateTable] Failed to create connection: ${errorMessage}`,
      );
      return return_error(
        new Error(`Failed to create connection: ${errorMessage}`),
      );
    }

    try {
      // Create client
      const client = createAdtClient(connection, logger);

      // Build operation chain: lock -> check (new code) -> update (if check OK) -> unlock -> check (inactive version) -> (activate)
      // Note: No validation needed for update - table must already exist
      const shouldActivate = activate !== false; // Default to true if not specified
      let activateResponse: any | undefined;
      let lockHandle: string | undefined;

      try {
        // Lock
        lockHandle = await client.getTable().lock({ tableName });

        // Step 1: Check new code BEFORE update (only when activating)
        if (shouldActivate) {
          logger?.info(
            `[UpdateTable] Checking new DDL code before update: ${tableName}`,
          );
          try {
            await safeCheckOperation(
              () =>
                client
                  .getTable()
                  .check({ tableName, ddlCode: ddl_code }, 'inactive'),
              tableName,
              {
                debug: (message: string) =>
                  logger?.debug(`[UpdateTable] ${message}`),
              },
            );
            logger?.info(`[UpdateTable] New code check passed: ${tableName}`);
          } catch (checkError: any) {
            if ((checkError as any).isAlreadyChecked) {
              logger?.info(
                `[UpdateTable] Table ${tableName} was already checked - this is OK, continuing`,
              );
            } else {
              logger?.error(
                `[UpdateTable] New code check failed: ${tableName}`,
                {
                  error:
                    checkError instanceof Error
                      ? checkError.message
                      : String(checkError),
                },
              );
              throw new Error(
                `New code check failed: ${checkError instanceof Error ? checkError.message : String(checkError)}`,
              );
            }
          }
        } else {
          logger?.info(
            `[UpdateTable] Skipping syntax check (activate=false): ${tableName}`,
          );
        }

        // Step 2: Update
        logger?.info(
          `[UpdateTable] Updating table with DDL code: ${tableName}`,
        );
        await client.getTable().update(
          {
            tableName,
            ddlCode: ddl_code,
            transportRequest: transport_request,
          },
          { lockHandle },
        );
        logger?.info(`[UpdateTable] Table source code updated: ${tableName}`);
      } finally {
        if (lockHandle) {
          try {
            await client.getTable().unlock({ tableName }, lockHandle);
            logger?.info(`[UpdateTable] Table unlocked: ${tableName}`);
          } catch (unlockError: any) {
            logger?.warn(
              `Failed to unlock table ${tableName}: ${unlockError?.message || unlockError}`,
            );
          }
        }
      }

      // Step 4: Check inactive version (after unlock, only when activating)
      if (shouldActivate) {
        logger?.info(`[UpdateTable] Checking inactive version: ${tableName}`);
        try {
          await safeCheckOperation(
            () => client.getTable().check({ tableName }, 'inactive'),
            tableName,
            {
              debug: (message: string) =>
                logger?.debug(`[UpdateTable] ${message}`),
            },
          );
          logger?.info(
            `[UpdateTable] Inactive version check completed: ${tableName}`,
          );
        } catch (checkError: any) {
          if ((checkError as any).isAlreadyChecked) {
            logger?.info(
              `[UpdateTable] Table ${tableName} was already checked - this is OK, continuing`,
            );
          } else {
            logger?.warn(
              `[UpdateTable] Inactive version check had issues: ${tableName}`,
              {
                error:
                  checkError instanceof Error
                    ? checkError.message
                    : String(checkError),
              },
            );
          }
        }
      }

      // Activate if requested
      if (shouldActivate) {
        const activateState = await client.getTable().activate({ tableName });
        activateResponse = activateState.activateResult;
      }

      // Evaluate SAP's ACTUAL activation result.
      //
      // The activation response used to be scraped for display-only "warnings"
      // while the reported `activated` field was a copy of the caller's own
      // `activate` request parameter — so an activation SAP REFUSED was still
      // announced as success (the dep's activate() wrapper never parses the
      // response body at all). Any error-level message now fails the call.
      const activation = shouldActivate
        ? evaluateActivationResponse(activateResponse)
        : undefined;
      if (activation && !activation.success) {
        throw new Error(
          `Table ${tableName} source was updated but ACTIVATION FAILED: ` +
            `${formatAdtMessages(activation.errors)}. The object is left inactive; ` +
            `fix the source and update again.`,
        );
      }
      const activationWarnings = activation?.warnings.length
        ? activationWarningLines(activation.warnings)
        : [];

      logger?.info(`✅ UpdateTable completed successfully: ${tableName}`);

      // Return success result
      const stepsCompleted = updateStepsCompleted(shouldActivate);

      const result = {
        success: true,
        table_name: tableName,
        transport_request: transport_request || 'local',
        // SAP's verdict, not the request flag.
        activated: activation ? activation.activated : false,
        message: shouldActivate
          ? `Table ${tableName} source updated and activated successfully`
          : `Table ${tableName} source updated successfully (not activated)`,
        uri: `/sap/bc/adt/ddic/tables/${encodeSapObjectName(tableName)}`,
        steps_completed: stepsCompleted,
        activation_warnings:
          activationWarnings.length > 0 ? activationWarnings : undefined,
        source_size_bytes: ddl_code.length,
      };

      return return_response({
        data: JSON.stringify(result, null, 2),
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });
    } catch (error: any) {
      logger?.error(`Error updating table source ${tableName}:`, error);

      const errorMessage = error.response?.data
        ? typeof error.response.data === 'string'
          ? error.response.data
          : JSON.stringify(error.response.data)
        : error.message || String(error);

      // SAP's save rejection is often only "Can't save due to errors in source;
      // execute check for details" — and the details were unreachable from here,
      // so the caller had to GUESS what was wrong (a `//` comment in DDL costs
      // two failed round trips before the cause is found). Run the check the
      // message tells us to run, against the SUBMITTED source, and include its
      // messages.
      let checkDetails = '';
      if (
        /execute check for details|can'?t save|cannot save/i.test(errorMessage)
      ) {
        try {
          const checkResponse = await runObjectCheckRun(
            connection,
            `/sap/bc/adt/ddic/tables/${encodeSapObjectName(tableName).toLowerCase()}`,
            'inactive',
            ddl_code,
          );
          const parsed = parseCheckRunResponse(checkResponse);
          // Errors first: they are the reason the save was refused. Warnings are
          // included too, because a DDL warning is sometimes the only clue.
          const found = [...parsed.errors, ...parsed.warnings];
          if (found.length) {
            checkDetails =
              ' | Check details: ' +
              found
                .map(
                  (m: any) =>
                    `[${m.type ?? '?'}]${
                      m.line ? ` line ${m.line}:` : ''
                    } ${m.text ?? ''}`,
                )
                .join('; ');
          }
        } catch (checkError: any) {
          checkDetails =
            ` | The check could not be run either (${
              checkError?.message || checkError
            }). Common DDL causes: a line comment (measured on DM2/310, \`define table\` ` +
            'source accepts NEITHER `//` nor `--`; both are rejected by the DDL parser, ' +
            'so put per-field text in `@EndUserText.label` instead), ' +
            'a missing mandatory annotation, or an unknown data element.';
        }
      }

      // LEAD WITH THE REASON. SAP types this rejection
      // `ExceptionResourceAlreadyExists` even though nothing already exists —
      // the DDL simply has an error — and wraps one useful sentence in ~1 KB of
      // XML. Putting the raw document first made the caller read the wrong
      // cause before reaching the right one.
      const sapSentence = /<message[^>]*>([\s\S]*?)<\/message>/
        .exec(errorMessage)?.[1]
        ?.trim();
      const lead = sapSentence
        ? `Failed to update table ${tableName}: ${sapSentence}`
        : `Failed to update table ${tableName}`;
      return return_error(
        new Error(
          `${lead}${checkDetails}` +
            (checkDetails
              ? ''
              : ` | SAP response: ${errorMessage.slice(0, 600)}`),
        ),
      );
    }
  } catch (error: any) {
    return return_error(error);
  }
}
