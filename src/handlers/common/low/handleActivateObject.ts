/**
 * ActivateObject Handler - Universal ABAP Object Activation via ADT API
 */

import type { ObjectReference } from '@mcp-abap-adt/adt-clients';
import {
  activationFlags,
  describeActivation,
  evaluateActivation,
} from '../../../lib/adtMessages';
import { activateAdtObjects } from '../../../lib/adtObjectOps';
import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { return_error, return_response } from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'ActivateObjectLow',
  available_in: ['onprem', 'legacy'] as const,
  description:
    '[low-level] Activate one or multiple ABAP repository objects. Works with any object type; URI is auto-generated from name and type.',
  inputSchema: {
    type: 'object',
    properties: {
      objects: {
        type: 'array',
        description:
          "Array of objects to activate. Each object must have 'name' and 'type'. URI is optional.",
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Object name in uppercase' },
            type: {
              type: 'string',
              description:
                "Object type code (e.g., 'CLAS/OC', 'PROG/P', 'DDLS/DF')",
            },
            uri: { type: 'string', description: 'Optional ADT URI' },
          },
          required: ['name', 'type'],
        },
      },
      preaudit: {
        type: 'boolean',
        description: 'Request pre-audit before activation. Default: true',
      },
    },
    required: ['objects'],
  },
} as const;

interface ActivationObject extends ObjectReference {
  uri?: string;
}

interface ActivateObjectArgs {
  objects: ActivationObject[];
  preaudit?: boolean;
}

export async function handleActivateObject(
  context: HandlerContext,
  params: ActivateObjectArgs,
) {
  const { connection, logger } = context;
  try {
    const args = params;

    if (
      !args.objects ||
      !Array.isArray(args.objects) ||
      args.objects.length === 0
    ) {
      return return_error(
        new Error(
          'Missing required parameter: objects (must be non-empty array)',
        ),
      );
    }

    const preaudit = args.preaudit !== false; // default true
    // Wrap the connection for sap-language pinning (same as every other handler).
    createAdtClient(connection, logger);

    logger?.info(`Starting activation of ${args.objects.length} object(s)`);

    try {
      const activationObjects = args.objects.map((obj) => ({
        type: obj.type,
        name: obj.name.toUpperCase(),
        uri: obj.uri,
      }));

      logger?.debug(
        `Activating objects: ${activationObjects.map((o) => o.name).join(', ')}`,
      );

      // Use the SYNCHRONOUS /sap/bc/adt/activation endpoint (activateAdtObjects)
      // rather than adt-clients' activateObjectsGroup, which uses the async
      // /activation/runs endpoint and throws "Failed to extract activation run
      // ID from response headers" whenever SAP activates synchronously and
      // returns the result inline with no Location header (e.g. a single BDEF).
      const activationResult = await activateAdtObjects(
        connection,
        activationObjects,
        preaudit,
      );

      // Derive success from SAP's MESSAGES, not from the activated/checked
      // flags: those report that the activation RUN and CHECK were executed,
      // not that every object survived them. SAP answers
      // `activationExecuted="true"` even for objects it rejected, alongside an
      // error message such as "TABL <X> was not activated" — so the old
      // `activated && checked` test reported a failed activation as success.
      const outcome = evaluateActivation(activationResult);
      const success = outcome.success;
      const subject =
        args.objects.length === 1
          ? `${activationObjects[0].type} ${activationObjects[0].name}`
          : `${args.objects.length} object(s)`;

      const result = {
        success,
        objects_count: args.objects.length,
        objects: activationObjects.map((obj, idx) => ({
          name: obj.name,
          uri: args.objects[idx].uri,
          type: args.objects[idx].type,
        })),
        activation: activationFlags(activationResult, outcome),
        messages: outcome.messages,
        warnings: outcome.warnings,
        errors: outcome.errors,
        message: describeActivation(outcome, subject),
      };

      logger?.info(
        `Activation completed: ${success ? 'SUCCESS' : 'WITH ISSUES'}`,
      );

      return return_response({
        data: JSON.stringify(result, null, 2),
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });
    } catch (error: any) {
      logger?.error('Error during activation', error);

      let errorMessage: string;
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else {
          try {
            errorMessage = JSON.stringify(error.response.data);
          } catch {
            errorMessage = `HTTP ${error.response.status}: ${error.response.statusText || 'Error'}`;
          }
        }
      } else {
        errorMessage = error.message || String(error);
      }

      return return_error(
        new Error(`Failed to activate objects: ${errorMessage}`),
      );
    }
  } catch (error: any) {
    return return_error(error);
  }
}
