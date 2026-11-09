/**
 * UpdateClass Handler - Update existing ABAP class source code (optional activation)
 *
 * Workflow: lock -> check (new code) -> update (if check OK) -> unlock -> check (inactive) -> (activate)
 */

import { XMLParser } from 'fast-xml-parser';
import { formatAdtMessages } from '../../../lib/adtMessages';
import {
  buildActivationUri,
  checkSourceOrThrow,
  evaluateActivationResponse,
} from '../../../lib/adtObjectOps';
import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  type AxiosResponse,
  return_error,
  return_response,
  safeCheckOperation,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'UpdateClass',
  available_in: ['onprem', 'legacy'] as const,
  description:
    'Operation: Update, Create. Subject: Class. Will be useful for updating or creating class. Update source code of an existing ABAP class. Locks, updates, unlocks, and optionally activates.',
  inputSchema: {
    type: 'object',
    properties: {
      class_name: {
        type: 'string',
        description: 'Class name (e.g., ZCL_TEST_CLASS_001).',
      },
      source_code: {
        type: 'string',
        description: 'Complete ABAP class source code.',
      },
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
    required: ['class_name', 'source_code'],
  },
} as const;

interface UpdateClassArgs {
  class_name: string;
  source_code: string;
  transport_request?: string;
  activate?: boolean;
}

export async function handleUpdateClass(
  context: HandlerContext,
  params: UpdateClassArgs,
) {
  const args: UpdateClassArgs = params;
  const { connection, logger } = context;

  if (!args.class_name || !args.source_code) {
    return return_error(
      new Error('Missing required parameters: class_name and source_code'),
    );
  }

  const className = args.class_name.toUpperCase();
  logger?.info(
    `Starting UpdateClass for ${className} (activate=${args.activate === true})`,
  );

  try {
    const client = createAdtClient(connection, logger);
    const shouldActivate = args.activate === true;
    let lockHandle: string | undefined;

    try {
      // Lock
      logger?.debug(`Locking class: ${className}`);
      lockHandle = await client.getClass().lock({ className: className });
      logger?.debug(
        `Class locked: ${className} (handle=${lockHandle ? `${lockHandle.substring(0, 8)}...` : 'none'})`,
      );

      // Check new code before update (only when activating)
      if (shouldActivate) {
        logger?.debug(`Checking new code before update: ${className}`);
        try {
          // Checks the SUBMITTED source and keeps SAP's line numbers — see
          // src/lib/checkMessages.ts for why the dep's own check() could not.
          await checkSourceOrThrow(
            connection,
            buildActivationUri(className, 'CLAS'),
            args.source_code,
            `class ${className}`,
          );
          logger?.debug(`New code check passed: ${className}`);
        } catch (checkError: any) {
          if ((checkError as any).isAlreadyChecked) {
            logger?.debug(
              `Class ${className} was already checked - continuing`,
            );
          } else {
            const detail =
              checkError instanceof Error
                ? checkError.message
                : String(checkError);
            logger?.error(`New code check failed: ${className} - ${detail}`);
            throw new Error(detail);
          }
        }
      } else {
        logger?.debug(`Skipping syntax check (activate=false): ${className}`);
      }

      // Update
      logger?.debug(`Updating class source code: ${className}`);
      await client.getClass().update(
        {
          className: className,
          sourceCode: args.source_code,
          transportRequest: args.transport_request,
        },
        { lockHandle },
      );
      logger?.info(`Class source code updated: ${className}`);
    } finally {
      if (lockHandle) {
        try {
          logger?.debug(`Unlocking class: ${className}`);
          await client.getClass().unlock({ className: className }, lockHandle);
          logger?.info(`Class unlocked: ${className}`);
        } catch (unlockError: any) {
          logger?.warn(
            `Failed to unlock class ${className}: ${unlockError?.message || unlockError}`,
          );
        }
      }
    }

    // Check inactive after unlock (only when activating)
    if (shouldActivate) {
      logger?.debug(`Checking inactive version: ${className}`);
      try {
        await safeCheckOperation(
          () => client.getClass().check({ className: className }, 'inactive'),
          className,
          { debug: (message: string) => logger?.debug(message) },
        );
        logger?.debug(`Inactive version check completed: ${className}`);
      } catch (checkError: any) {
        if ((checkError as any).isAlreadyChecked) {
          logger?.debug(`Class ${className} was already checked - continuing`);
        } else {
          logger?.warn(
            `Inactive version check had issues: ${className} - ${checkError instanceof Error ? checkError.message : String(checkError)}`,
          );
        }
      }
    }

    let activation: ReturnType<typeof evaluateActivationResponse> | undefined;
    // Activate if requested — and check what SAP actually did. The response
    // used to be discarded and the result reported `activated: shouldActivate`,
    // i.e. the caller's own request flag, so a refused activation looked
    // successful.
    if (shouldActivate) {
      logger?.debug(`Activating class: ${className}`);
      activation = evaluateActivationResponse(
        await client.getClass().activate({ className: className }),
      );
      logger?.info(`Class activated: ${className}`);
    } else {
      logger?.debug(`Skipping activation for: ${className}`);
    }
    if (activation && !activation.success) {
      throw new Error(
        `Class ${className} was written but ACTIVATION FAILED: ` +
          `${formatAdtMessages(activation.errors)}. The object is left inactive.`,
      );
    }

    logger?.info(`UpdateClass completed successfully: ${className}`);

    return return_response({
      data: JSON.stringify(
        {
          success: true,
          class_name: className,
          // SAP's verdict, not the request flag.
          activated: activation ? activation.activated : false,
          message: `Class ${className} updated${shouldActivate ? ' and activated' : ''} successfully`,
        },
        null,
        2,
      ),
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

    logger?.error(
      `Unexpected error in UpdateClass handler: ${className} - ${errorMessage}`,
    );
    return return_error(new Error(errorMessage));
  }
}
