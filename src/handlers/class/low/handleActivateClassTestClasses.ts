/**
 * ActivateClassTestClasses Handler - Activate ABAP Unit test include for a class
 *
 * Uses AdtClient.activateTestClasses from @mcp-abap-adt/adt-clients.
 * Low-level handler: single method call.
 */

import { activationFlags, describeActivation } from '../../../lib/adtMessages';
import { evaluateActivationResponse } from '../../../lib/adtObjectOps';
import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  type AxiosResponse,
  restoreSessionInConnection,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'ActivateClassTestClassesLow',
  available_in: ['onprem', 'legacy'] as const,
  description:
    '[low-level] Activate ABAP Unit test classes include for an existing class. Should be executed after updating and unlocking test classes.',
  inputSchema: {
    type: 'object',
    properties: {
      class_name: {
        type: 'string',
        description: 'Class name (e.g., ZCL_MY_CLASS).',
      },
      test_class_name: {
        type: 'string',
        description:
          'Optional ABAP Unit test class name (e.g., LTCL_MY_CLASS). Defaults to auto-detected value.',
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
    required: ['class_name'],
  },
} as const;

interface ActivateClassTestClassesArgs {
  class_name: string;
  test_class_name?: string;
  session_id?: string;
  session_state?: {
    cookies?: string;
    csrf_token?: string;
    cookie_store?: Record<string, string>;
  };
}

export async function handleActivateClassTestClasses(
  context: HandlerContext,
  args: ActivateClassTestClassesArgs,
) {
  const { connection, logger } = context;
  try {
    const { class_name, test_class_name, session_id, session_state } =
      args as ActivateClassTestClassesArgs;

    if (!class_name) {
      return return_error(new Error('class_name is required'));
    }

    const client = createAdtClient(connection, logger);

    if (session_id && session_state) {
      await restoreSessionInConnection(connection, session_id, session_state);
    } else {
    }

    const className = class_name.toUpperCase();
    const testClassName = test_class_name
      ? test_class_name.toUpperCase()
      : undefined;

    logger?.info(`Starting test classes activation for: ${className}`);

    try {
      const classClient = client.getClass();
      // Activate the parent class — this activates all its local includes (test classes, definitions, etc.)
      const activationResult = await classClient.activate({ className });

      // SAP answers HTTP 200 while REFUSING an activation; the refusal lives
      // only in the response messages. This used to report `success: true` with
      // the HTTP status in a field named `status`, so a rejected test include
      // read as "activated successfully".
      const outcome = evaluateActivationResponse(activationResult);

      logger?.info(
        `ActivateClassTestClasses ${className}: ${describeActivation(outcome, `Test classes for ${className}`)}`,
      );

      return return_response({
        data: JSON.stringify(
          {
            success: outcome.success,
            class_name: className,
            session_id: session_id || null,
            activation: activationFlags(outcome, outcome),
            http_status: activationResult?.activateResult?.status,
            session_state: null, // Session state is not persisted by this server,
            ...(outcome.errors.length ? { errors: outcome.errors } : {}),
            ...(outcome.warnings.length ? { warnings: outcome.warnings } : {}),
            message: describeActivation(
              outcome,
              `Test classes for ${className}`,
            ),
          },
          null,
          2,
        ),
      } as AxiosResponse);
    } catch (error: any) {
      logger?.error(
        `Error activating test classes for ${className}: ${error?.message || error}`,
      );
      const reason =
        error?.response?.status === 404
          ? `Class ${className} not found or test classes are missing.`
          : error?.message || String(error);
      return return_error(new Error(reason));
    }
  } catch (error: any) {
    return return_error(error);
  }
}
