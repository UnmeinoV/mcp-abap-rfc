/**
 * ActivateServiceBinding Handler - Activate ABAP Service Binding
 *
 * Uses AdtClient.getServiceBinding().activate() from @mcp-abap-adt/adt-clients.
 * Low-level handler: single method call.
 */

import {
  activationFlags,
  describeActivation,
  evaluateActivation,
} from '../../../lib/adtMessages';
import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  type AxiosResponse,
  parseActivationResponse,
  restoreSessionInConnection,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'ActivateServiceBindingLow',
  available_in: ['onprem'] as const,
  description:
    'Operation: Activate, Create, Update. Subject: ServiceBinding. Will be useful for activating, creating, or updating service binding. [low-level] Activate an ABAP service binding. Returns activation status and any warnings/errors. Can use session_id and session_state from GetSession to maintain the same session.',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Service binding name (e.g., ZSB_MY_SERVICE).',
      },
      session_id: {
        type: 'string',
        description:
          'Session ID from GetSession. If not provided, a new session will be created.',
      },
      session_state: {
        type: 'object',
        description:
          'Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.',
        properties: {
          cookies: { type: 'string' },
          csrf_token: { type: 'string' },
          cookie_store: { type: 'object' },
        },
      },
    },
    required: ['name'],
  },
} as const;

interface ActivateServiceBindingArgs {
  name: string;
  session_id?: string;
  session_state?: {
    cookies?: string;
    csrf_token?: string;
    cookie_store?: Record<string, string>;
  };
}

/**
 * Main handler for ActivateServiceBinding MCP tool
 *
 * Uses AdtClient.getServiceBinding().activate() - low-level single method call
 */
export async function handleActivateServiceBinding(
  context: HandlerContext,
  args: ActivateServiceBindingArgs,
) {
  const { connection, logger } = context;
  try {
    const { name, session_id, session_state } =
      args as ActivateServiceBindingArgs;

    // Validation
    if (!name) {
      return return_error(new Error('name is required'));
    }

    const client = createAdtClient(connection, logger);

    // Restore session state if provided
    if (session_id && session_state) {
      await restoreSessionInConnection(connection, session_id, session_state);
    }

    const serviceBindingName = name.toUpperCase();

    logger?.info(`Starting service binding activation: ${serviceBindingName}`);

    try {
      // Activate service binding
      const activateState = await client
        .getServiceBinding()
        .activate({ bindingName: serviceBindingName });
      const response = activateState.activateResult;

      if (!response) {
        throw new Error(
          `Activation did not return a response for service binding ${serviceBindingName}`,
        );
      }

      // Parse activation response
      const activationResult = parseActivationResponse(response.data);
      // Success comes from SAP's MESSAGES, not from activated/checked: those
      // flags say the activation RUN and CHECK executed, not that the object
      // survived them (a rejected object still reports activated:true).
      const outcome = evaluateActivation(activationResult);
      const success = outcome.success;

      logger?.info(`ActivateServiceBinding completed: ${serviceBindingName}`);
      logger?.debug(
        `Activated: ${activationResult.activated}, Checked: ${activationResult.checked}, Messages: ${activationResult.messages.length}`,
      );

      return return_response({
        data: JSON.stringify(
          {
            success,
            name: serviceBindingName,
            activation: activationFlags(activationResult, outcome),
            messages: outcome.messages,
            warnings: outcome.warnings,
            errors: outcome.errors,
            session_id: session_id || null,
            session_state: null,
            message: describeActivation(
              outcome,
              `Service binding ${serviceBindingName}`,
            ),
          },
          null,
          2,
        ),
      } as AxiosResponse);
    } catch (error: any) {
      logger?.error(
        `Error activating service binding ${serviceBindingName}: ${error?.message || error}`,
      );

      let errorMessage = `Failed to activate service binding: ${error.message || String(error)}`;

      if (error.response?.status === 404) {
        errorMessage = `Service binding ${serviceBindingName} not found.`;
      } else if (
        error.response?.data &&
        typeof error.response.data === 'string'
      ) {
        try {
          const { XMLParser } = require('fast-xml-parser');
          const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
          });
          const errorData = parser.parse(error.response.data);
          const errorMsg =
            errorData['exc:exception']?.message?.['#text'] ||
            errorData['exc:exception']?.message;
          if (errorMsg) {
            errorMessage = `SAP Error: ${errorMsg}`;
          }
        } catch (_parseError) {
          // Ignore parse errors
        }
      }

      return return_error(new Error(errorMessage));
    }
  } catch (error: any) {
    return return_error(error);
  }
}
