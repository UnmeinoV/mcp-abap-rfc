/**
 * UpdateView Handler - Update existing CDS/Classic view DDL source
 *
 * Workflow: lock -> check (new code) -> update (if check OK) -> unlock -> check (inactive) -> (activate)
 */

import { XMLParser } from 'fast-xml-parser';
import {
  activationWarningLines,
  formatAdtMessages,
} from '../../../lib/adtMessages';
import {
  buildActivationUri,
  checkSourceOrThrow,
  evaluateActivationResponse,
} from '../../../lib/adtObjectOps';
import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { updateStepsCompleted } from '../../../lib/updateSteps';
import {
  type AxiosResponse,
  encodeSapObjectName,
  return_error,
  return_response,
  safeCheckOperation,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'UpdateView',
  available_in: ['onprem', 'legacy'] as const,
  description:
    'Operation: Update, Create. Subject: View. Will be useful for updating or creating view. Update DDL source code of an existing CDS View or Classic View. Locks, updates, unlocks, and optionally activates.',
  inputSchema: {
    type: 'object',
    properties: {
      view_name: {
        type: 'string',
        description: 'View name (e.g., ZOK_R_TEST_0002).',
      },
      ddl_source: { type: 'string', description: 'Complete DDL source code.' },
      transport_request: {
        type: 'string',
        description:
          'Transport request number (e.g., ABCK900001). Required for transportable packages.',
      },
      activate: {
        type: 'boolean',
        description:
          "Activate after the update. DEFAULT: FALSE — omitting it leaves the object INACTIVE, so pass true explicitly if you want it usable. (Update* tools are not consistent on this default: DDIC tools such as UpdateTable / UpdateStructure default to true.) The activated field in the response is SAP's own verdict, not a copy of this parameter.",
      },
    },
    required: ['view_name', 'ddl_source'],
  },
} as const;

interface UpdateViewArgs {
  view_name: string;
  ddl_source: string;
  transport_request?: string;
  activate?: boolean;
}

export async function handleUpdateView(context: HandlerContext, params: any) {
  const { connection, logger } = context;
  const args: UpdateViewArgs = params;

  if (!args.view_name || !args.ddl_source) {
    return return_error(
      new Error('Missing required parameters: view_name and ddl_source'),
    );
  }

  const viewName = args.view_name.toUpperCase();
  logger?.info(
    `Starting view source update: ${viewName} (activate=${args.activate === true})`,
  );

  // Connection setup
  try {
    // Get connection from session context (set by ProtocolHandler)
    // Connection is managed and cached per session, with proper token refresh via AuthBroker
    logger?.debug(`Created separate connection for handler call: ${viewName}`);
  } catch (connectionError: any) {
    const errorMessage =
      connectionError instanceof Error
        ? connectionError.message
        : String(connectionError);
    logger?.error(`Failed to create connection: ${errorMessage}`);
    return return_error(
      new Error(`Failed to create connection: ${errorMessage}`),
    );
  }

  try {
    const client = createAdtClient(connection, logger);
    const shouldActivate = args.activate === true;
    let lockHandle: string | undefined;

    try {
      // Lock
      logger?.debug(`Locking view: ${viewName}`);
      lockHandle = await client.getView().lock({ viewName });
      logger?.debug(
        `View locked: ${viewName} (handle=${lockHandle ? `${lockHandle.substring(0, 8)}...` : 'none'})`,
      );

      // Check new code BEFORE update (only when activating)
      if (shouldActivate) {
        logger?.debug(`Checking new DDL code before update: ${viewName}`);
        try {
          // AdtView.check() accepts ddlSource and then passes undefined for
          // it, so this used to check the STORED version instead of the DDL
          // being submitted.
          await checkSourceOrThrow(
            connection,
            buildActivationUri(viewName, 'DDLS'),
            args.ddl_source,
            `CDS view ${viewName}`,
          );
          logger?.debug(`New code check passed: ${viewName}`);
        } catch (checkError: any) {
          if ((checkError as any).isAlreadyChecked) {
            logger?.debug(`View ${viewName} was already checked - continuing`);
          } else {
            logger?.error(
              `New code check failed: ${viewName} - ${checkError instanceof Error ? checkError.message : String(checkError)}`,
            );
            throw new Error(
              `New code check failed: ${checkError instanceof Error ? checkError.message : String(checkError)}`,
            );
          }
        }
      } else {
        logger?.debug(`Skipping syntax check (activate=false): ${viewName}`);
      }

      // Update
      logger?.debug(`Updating view DDL source: ${viewName}`);
      await client.getView().update(
        {
          viewName,
          ddlSource: args.ddl_source,
          transportRequest: args.transport_request,
        },
        { lockHandle },
      );
      logger?.info(`View DDL source updated: ${viewName}`);
    } finally {
      if (lockHandle) {
        try {
          logger?.debug(`Unlocking view: ${viewName}`);
          await client.getView().unlock({ viewName }, lockHandle);
          logger?.info(`View unlocked: ${viewName}`);
        } catch (unlockError: any) {
          logger?.warn(
            `Failed to unlock view ${viewName}: ${unlockError?.message || unlockError}`,
          );
        }
      }
    }

    // Check inactive version (after unlock, only when activating)
    if (shouldActivate) {
      logger?.debug(`Checking inactive version: ${viewName}`);
      try {
        await safeCheckOperation(
          () =>
            client
              .getView()
              .check({ viewName, ddlSource: args.ddl_source }, 'inactive'),
          viewName,
          {
            debug: (message: string) => logger?.debug(message),
          },
        );
        logger?.debug(`Inactive version check completed: ${viewName}`);
      } catch (checkError: any) {
        if ((checkError as any).isAlreadyChecked) {
          logger?.debug(`View ${viewName} was already checked - continuing`);
        } else {
          logger?.warn(
            `Inactive version check had issues: ${viewName} - ${checkError instanceof Error ? checkError.message : String(checkError)}`,
          );
        }
      }
    }

    // Activate if requested
    let activateResponse: any | undefined;
    if (shouldActivate) {
      logger?.debug(`Activating view: ${viewName}`);
      try {
        const activateState = await client.getView().activate({ viewName });
        activateResponse = activateState.activateResult;
        logger?.info(`View activated: ${viewName}`);
      } catch (activationError: any) {
        logger?.error(
          `Activation failed: ${viewName} - ${activationError instanceof Error ? activationError.message : String(activationError)}`,
        );
        throw new Error(
          `Activation failed: ${activationError instanceof Error ? activationError.message : String(activationError)}`,
        );
      }
    } else {
      logger?.debug(`Skipping activation for: ${viewName}`);
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
        `View ${viewName} source was updated but ACTIVATION FAILED: ` +
          `${formatAdtMessages(activation.errors)}. The object is left inactive; ` +
          `fix the source and update again.`,
      );
    }
    const activationWarnings = activation?.warnings.length
      ? activationWarningLines(activation.warnings)
      : [];

    logger?.info(`UpdateView completed successfully: ${viewName}`);

    const result = {
      success: true,
      view_name: viewName,
      type: 'DDLS',
      // SAP's verdict, not the request flag.
      activated: activation ? activation.activated : false,
      message: `View ${viewName} updated${shouldActivate ? ' and activated' : ''} successfully`,
      uri: `/sap/bc/adt/ddic/ddl/sources/${encodeSapObjectName(viewName).toLowerCase()}`,
      steps_completed: updateStepsCompleted(shouldActivate),
      activation_warnings:
        activationWarnings.length > 0 ? activationWarnings : undefined,
    };

    return return_response({
      data: JSON.stringify(result, null, 2),
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    } as AxiosResponse);
  } catch (error: any) {
    // Parse error message
    let errorMessage = error instanceof Error ? error.message : String(error);

    // Attempt to parse ADT XML error
    try {
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
      });
      const errorData = error?.response?.data
        ? parser.parse(error.response.data)
        : null;
      const errorMsg =
        errorData?.['exc:exception']?.message?.['#text'] ||
        errorData?.['exc:exception']?.message;
      if (errorMsg) {
        errorMessage = `SAP Error: ${errorMsg}`;
      }
    } catch {
      // ignore parse errors
    }

    logger?.error(`Error updating view ${viewName}: ${errorMessage}`);
    return return_error(new Error(errorMessage));
  }
}
