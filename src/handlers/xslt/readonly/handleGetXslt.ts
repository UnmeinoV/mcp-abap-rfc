/**
 * GetXslt Handler - Read an ABAP Transformation (XSLT/ST) metadata + source.
 *
 * ADT has no adt-clients wrapper for transformations; we GET directly.
 * Object URL: /sap/bc/adt/xslt/transformations/{name}; source at .../source/main.
 */

import { getAdt } from '../../../lib/adtObjectOps';
import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  encodeSapObjectName,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'GetXslt',
  available_in: ['onprem', 'legacy'] as const,
  description:
    'Operation: Read. Subject: Transformation (XSLT/ST). Retrieve an ABAP transformation: metadata and the XSLT/Simple-Transformation source code.',
  inputSchema: {
    type: 'object',
    properties: {
      xslt_name: {
        type: 'string',
        description: 'Transformation name (e.g., ZMY_XSLT).',
      },
      version: {
        type: 'string',
        description: 'Version to read: "active" (default) or "inactive".',
        enum: ['active', 'inactive'],
      },
    },
    required: ['xslt_name'],
  },
} as const;

interface GetXsltArgs {
  xslt_name: string;
  version?: 'active' | 'inactive';
}

export async function handleGetXslt(
  context: HandlerContext,
  args: GetXsltArgs,
) {
  const { connection, logger } = context;
  try {
    if (!args?.xslt_name)
      return return_error(new Error('xslt_name is required'));
    createAdtClient(connection, logger); // wrap connection (sap-language pinning)
    const name = args.xslt_name.toUpperCase();
    const base = `/sap/bc/adt/xslt/transformations/${encodeSapObjectName(name).toLowerCase()}`;
    const params = args.version ? { version: args.version } : undefined;

    const metadata = await getAdt(connection, base, params);
    let source = '';
    try {
      source = await getAdt(connection, `${base}/source/main`, params);
    } catch (e: any) {
      logger?.warn(
        `Could not read xslt source for ${name}: ${e?.message || e}`,
      );
    }

    return return_response({
      data: JSON.stringify(
        { success: true, xslt_name: name, metadata, source },
        null,
        2,
      ),
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });
  } catch (error: any) {
    return return_error(error);
  }
}
