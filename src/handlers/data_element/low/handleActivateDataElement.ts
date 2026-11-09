/**
 * ActivateDataElement Handler - Activate ABAP Data Element
 *
 * Uses AdtClient.activateDataElement from @mcp-abap-adt/adt-clients.
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
  name: 'ActivateDataElementLow',
  available_in: ['onprem'] as const,
  description:
    'Operation: Activate, Create, Update. Subject: DataElement. Will be useful for activating, creating, or updating data element. [low-level] Activate an ABAP data element. Returns activation status and any warnings/errors. Can use session_id and session_state from GetSession to maintain the same session.',
  inputSchema: {
    type: 'object',
    properties: {
      data_element_name: {
        type: 'string',
        description: 'Data element name (e.g., ZDT_MY_ELEMENT).',
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
    required: ['data_element_name'],
  },
} as const;

interface ActivateDataElementArgs {
  data_element_name: string;
  session_id?: string;
  session_state?: {
    cookies?: string;
    csrf_token?: string;
    cookie_store?: Record<string, string>;
  };
}

/**
 * Main handler for ActivateDataElement MCP tool
 *
 * Uses AdtClient.activateDataElement - low-level single method call
 */
export async function handleActivateDataElement(
  context: HandlerContext,
  args: ActivateDataElementArgs,
) {
  const { connection, logger } = context;
  try {
    const { data_element_name, session_id, session_state } =
      args as ActivateDataElementArgs;

    // Validation
    if (!data_element_name) {
      return return_error(new Error('data_element_name is required'));
    }

    const client = createAdtClient(connection, logger);

    // Restore session state if provided
    if (session_id && session_state) {
      await restoreSessionInConnection(connection, session_id, session_state);
    } else {
      // Ensure connection is established
    }

    const dataElementName = data_element_name.toUpperCase();

    logger?.info(`Starting data element activation: ${dataElementName}`);

    try {
      // Activate data element
      const activateState = await client
        .getDataElement()
        .activate({ dataElementName: dataElementName });
      const response = activateState.activateResult;

      if (!response) {
        logger?.error(
          `Activation did not return a response for data element ${dataElementName}`,
        );
        throw new Error(
          `Activation did not return a response for data element ${dataElementName}`,
        );
      }

      // Parse activation response
      const activationResult = parseActivationResponse(response.data);
      // Success comes from SAP's MESSAGES, not from activated/checked: those
      // flags say the activation RUN and CHECK executed, not that the object
      // survived them (a rejected object still reports activated:true).
      const outcome = evaluateActivation(activationResult);
      const success = outcome.success;

      // Get updated session state after activation

      logger?.info(`✅ ActivateDataElement completed: ${dataElementName}`);

      return return_response({
        data: JSON.stringify(
          {
            success,
            data_element_name: dataElementName,
            activation: activationFlags(activationResult, outcome),
            messages: outcome.messages,
            warnings: outcome.warnings,
            errors: outcome.errors,
            session_id: session_id || null,
            session_state: null, // Session state is not persisted by this server,
            message: describeActivation(
              outcome,
              `Data element ${dataElementName}`,
            ),
          },
          null,
          2,
        ),
      } as AxiosResponse);
    } catch (error: any) {
      logger?.error(
        `Error activating data element ${dataElementName}: ${error?.message || error}`,
      );

      // Parse error message
      let errorMessage = `Failed to activate data element: ${error.message || String(error)}`;

      if (error.response?.status === 404) {
        errorMessage = `Data element ${dataElementName} not found.`;
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
