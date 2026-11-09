/**
 * GetAtcCustomizing Handler - Read ATC customizing (default check variant,
 * properties, exemption reasons). Mirrors abap-adt-api's atcCustomizing.
 */

import { parseAtcCustomizing } from '../../../lib/atcParser';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  makeAdtRequestWithTimeout,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'GetAtcCustomizing',
  available_in: ['onprem'] as const,
  description:
    '[read-only] Get ATC customizing: the system default check variant, ATC properties, and available exemption reasons.',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
} as const;

export async function handleGetAtcCustomizing(
  context: HandlerContext,
  _args: any,
) {
  const { connection, logger } = context;
  try {
    const resp = await makeAdtRequestWithTimeout(
      connection,
      '/sap/bc/adt/atc/customizing',
      'GET',
      'default',
      undefined,
      undefined,
      { Accept: 'application/vnd.sap.atc.customizing-v1+xml, application/xml' },
    );
    const customizing = parseAtcCustomizing(String(resp.data));

    logger?.info(
      `GetAtcCustomizing: system variant = ${customizing.system_check_variant ?? '(none)'}`,
    );

    return return_response({
      data: JSON.stringify(
        {
          success: true,
          system_check_variant: customizing.system_check_variant,
          properties: customizing.properties,
          exemption_reasons: customizing.exemption_reasons,
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
    logger?.error(`GetAtcCustomizing failed: ${error?.message || error}`);
    return return_error(error);
  }
}
