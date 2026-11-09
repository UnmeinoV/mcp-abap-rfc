/**
 * UpdateClassMethod Handler - replace ONE method's body, without resending the whole class
 * source (F-5 / K-8: "UpdateClassMethod / anchored patch").
 *
 * WHY THIS EXISTS
 * ----------------
 * A reporting project measured 325 `Update*` calls carrying 3.00 MB of source in one session,
 * with its largest classes re-sent whole for four-line method-body changes (CLAUDE.md, F-5 / K-8).
 * This is the upload half of the fix (the `summary` parameters elsewhere already fixed the
 * download half).
 *
 * SCOPE
 * -----
 * Replaces only the BODY of one `METHOD x. ... ENDMETHOD.` block — never the DEFINITION section
 * (signature, visibility, add/remove a method). See src/lib/classMethodSurgery.ts for why that
 * split is deliberate. Everything else in the class — every other method, the whole DEFINITION
 * section, comments outside the target method — survives byte-for-byte.
 *
 * WORKFLOW: lock -> read current source -> splice -> check the SPLICED FULL source (never the
 * raw body fragment: a bare METHOD body alone fails ABAP's syntax check with "Expected
 * CLASSIMPLEMENTATION", so the check must run against the reconstructed whole class, exactly as
 * UpdateClass does for a full-source update) -> update (full spliced source, same PUT UpdateClass
 * uses) -> unlock -> (activate).
 */

import { XMLParser } from 'fast-xml-parser';
import { formatAdtMessages } from '../../../lib/adtMessages';
import {
  buildActivationUri,
  checkSourceOrThrow,
  evaluateActivationResponse,
} from '../../../lib/adtObjectOps';
import {
  extractMethodBody,
  findMethod,
  listAllMethodNames,
  spliceMethodBody,
} from '../../../lib/classMethodSurgery';
import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  type AxiosResponse,
  return_error,
  return_response,
  safeCheckOperation,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'UpdateClassMethod',
  available_in: ['onprem', 'legacy'] as const,
  description:
    "Operation: Update. Subject: Class method. Replace ONE method's implementation body without resending the whole class source. Use GetClassMethods to find method_name first. Only the body between METHOD/ENDMETHOD changes.",
  notes: `Cannot change a signature, visibility, or add/remove/move a method — those touch the
DEFINITION section, which this tool never rewrites. Use UpdateClass with the full source for
those. Everything outside the target method (every other method, the whole DEFINITION section,
comments) survives byte-for-byte.`,
  inputSchema: {
    type: 'object',
    properties: {
      class_name: {
        type: 'string',
        description: 'Class name (e.g., ZCL_MY_CLASS).',
      },
      method_name: {
        type: 'string',
        description:
          'Method name, case-insensitive. Interface methods: "if_x~method_name".',
      },
      new_body: {
        type: 'string',
        description:
          'Statements between METHOD and ENDMETHOD (not including those lines). Empty string clears the body.',
      },
      base_version: {
        type: 'string',
        enum: ['active', 'inactive'],
        description: 'Base to splice into. DEFAULT: "active".',
        default: 'active',
      },
      transport_request: {
        type: 'string',
        description: 'Transport request (e.g., ABCK900001).',
      },
      activate: {
        type: 'boolean',
        description: 'Activate after the update. DEFAULT: FALSE.',
      },
    },
    required: ['class_name', 'method_name', 'new_body'],
  },
} as const;

interface UpdateClassMethodArgs {
  class_name: string;
  method_name: string;
  new_body: string;
  base_version?: 'active' | 'inactive';
  transport_request?: string;
  activate?: boolean;
}

export async function handleUpdateClassMethod(
  context: HandlerContext,
  params: UpdateClassMethodArgs,
) {
  const args = params;
  const { connection, logger } = context;

  if (!args.class_name || !args.method_name || args.new_body === undefined) {
    return return_error(
      new Error(
        'Missing required parameters: class_name, method_name and new_body',
      ),
    );
  }

  const className = args.class_name.toUpperCase();
  const baseVersion = args.base_version ?? 'active';
  logger?.info(
    `Starting UpdateClassMethod for ${className}.${args.method_name} (activate=${args.activate === true})`,
  );

  try {
    const client = createAdtClient(connection, logger);
    const shouldActivate = args.activate === true;
    let lockHandle: string | undefined;
    let foundName = args.method_name;

    // Lock -> read -> splice -> check -> update -> unlock, all inside this block. Activation
    // happens AFTER it returns (see below) — SAP's activation endpoint conflicts with the
    // caller's own still-held edit lock ("User X is currently editing"), exactly as UpdateClass
    // activates only once its own lock/update/unlock cycle has already completed.
    try {
      logger?.debug(`Locking class: ${className}`);
      lockHandle = await client.getClass().lock({ className });

      logger?.debug(`Reading ${baseVersion} source for ${className}`);
      const readResult = await client
        .getClass()
        .read({ className }, baseVersion);
      const currentSource =
        typeof readResult?.readResult?.data === 'string'
          ? readResult.readResult.data
          : null;
      if (!currentSource) {
        throw new Error(
          `Could not read ${baseVersion} source for class ${className} — nothing to patch.`,
        );
      }

      const found = findMethod(currentSource, className, args.method_name);
      if (!found) {
        const available = listAllMethodNames(currentSource);
        throw new Error(
          `Method "${args.method_name}" was not found in class ${className}. ` +
            (available.length > 0
              ? `Available methods: ${available.join(', ')}.`
              : 'No methods could be parsed from its IMPLEMENTATION section.'),
        );
      }
      foundName = found.name;

      const oldBody = extractMethodBody(currentSource, found);
      const splicedSource = spliceMethodBody(
        currentSource,
        found,
        args.new_body,
      );

      if (shouldActivate) {
        logger?.debug(`Checking spliced source before update: ${className}`);
        try {
          // Checked on the FULL spliced class, never the raw body fragment: a bare method body
          // alone fails ABAP's syntax check with "Expected CLASSIMPLEMENTATION" (the same trap
          // UpdateClass avoids by checking its own full source_code param).
          await checkSourceOrThrow(
            connection,
            buildActivationUri(className, 'CLAS'),
            splicedSource,
            `class ${className}`,
          );
        } catch (checkError: any) {
          if (!(checkError as any).isAlreadyChecked) {
            const detail =
              checkError instanceof Error
                ? checkError.message
                : String(checkError);
            throw new Error(detail);
          }
        }
      }

      logger?.debug(`Updating class source code: ${className}`);
      await client.getClass().update(
        {
          className,
          sourceCode: splicedSource,
          transportRequest: args.transport_request,
        },
        { lockHandle },
      );
      logger?.info(
        `Class method updated: ${className}.${found.name} (${oldBody?.split(/\r\n|\r|\n/).length ?? 0} -> ${args.new_body.length > 0 ? args.new_body.split(/\r\n|\r|\n/).length : 0} body lines)`,
      );
    } finally {
      if (lockHandle) {
        try {
          await client.getClass().unlock({ className }, lockHandle);
        } catch (unlockError: any) {
          logger?.warn(
            `Failed to unlock class ${className}: ${unlockError?.message || unlockError}`,
          );
        }
      }
    }

    // Inactive-version check + activate happen AFTER unlock — see the comment above.
    let activation: ReturnType<typeof evaluateActivationResponse> | undefined;
    if (shouldActivate) {
      try {
        await safeCheckOperation(
          () => client.getClass().check({ className }, 'inactive'),
          className,
          { debug: (message: string) => logger?.debug(message) },
        );
      } catch (checkError: any) {
        if (!(checkError as any).isAlreadyChecked) {
          logger?.warn(
            `Inactive version check had issues: ${className} - ${checkError instanceof Error ? checkError.message : String(checkError)}`,
          );
        }
      }

      activation = evaluateActivationResponse(
        await client.getClass().activate({ className }),
      );
    }
    if (activation && !activation.success) {
      throw new Error(
        `Class ${className} method ${foundName} was written but ACTIVATION FAILED: ` +
          `${formatAdtMessages(activation.errors)}. The object is left inactive.`,
      );
    }

    return return_response({
      data: JSON.stringify(
        {
          success: true,
          class_name: className,
          method_name: foundName,
          activated: activation ? activation.activated : false,
          message: `Method ${foundName} of class ${className} updated${shouldActivate ? ' and activated' : ''} successfully`,
        },
        null,
        2,
      ),
    } as AxiosResponse);
  } catch (error: any) {
    let errorMessage = error instanceof Error ? error.message : String(error);
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
      if (errorMsg) errorMessage = `SAP Error: ${errorMsg}`;
    } catch {
      // ignore parse errors
    }
    logger?.error(
      `Unexpected error in UpdateClassMethod handler: ${className} - ${errorMessage}`,
    );
    return return_error(new Error(errorMessage));
  }
}
