/**
 * GetAccessControl Handler - Read a DCL source (metadata + source text).
 *
 * Object URI: /sap/bc/adt/acm/dcl/sources/{name}; source at .../source/main.
 * The collection accepts only application/vnd.sap.adt.dclSource+xml.
 */

import {
  accessControlUri,
  CT_ACCESS_CONTROL,
} from '../../../lib/accessControlXml';
import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  makeAdtRequestWithTimeout,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'GetAccessControl',
  available_in: ['onprem'] as const,
  description:
    '[read-only] Operation: Read. Subject: Access Control (DCL / DCLS). Retrieve a CDS access ' +
    'control: its metadata (package, description, responsible, version) and the DCL role source. ' +
    'Works for SAP-delivered DCLs too — useful for learning the syntax of a real role definition.',
  inputSchema: {
    type: 'object',
    properties: {
      access_control_name: {
        type: 'string',
        description: 'DCL name (e.g., Z_MY_VIEW, C_ACCOUNTINGDOCUMENT).',
      },
      version: {
        type: 'string',
        description: 'Version to read: "active" (default) or "inactive".',
        enum: ['active', 'inactive'],
      },
    },
    required: ['access_control_name'],
  },
} as const;

interface GetAccessControlArgs {
  access_control_name: string;
  version?: 'active' | 'inactive';
}

export async function handleGetAccessControl(
  context: HandlerContext,
  args: GetAccessControlArgs,
) {
  const { connection, logger } = context;
  try {
    if (!args?.access_control_name) {
      return return_error(new Error('access_control_name is required'));
    }
    createAdtClient(connection, logger); // wrap connection (sap-language pinning)
    const name = args.access_control_name.toUpperCase();
    const base = accessControlUri(name);
    const params = { version: args.version || 'active' };

    const metadata = await makeAdtRequestWithTimeout(
      connection,
      base,
      'GET',
      'default',
      undefined,
      params,
      { Accept: CT_ACCESS_CONTROL },
    );

    let source = '';
    try {
      const src = await makeAdtRequestWithTimeout(
        connection,
        `${base}/source/main`,
        'GET',
        'default',
        undefined,
        params,
      );
      source = String(src.data ?? '');
    } catch (e: any) {
      logger?.warn(
        `Could not read access control source for ${name}: ${e?.message || e}`,
      );
    }

    return return_response({
      data: JSON.stringify(
        {
          success: true,
          access_control_name: name,
          version: params.version,
          metadata: String(metadata.data ?? ''),
          source,
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
    const bodyText = error?.response?.data
      ? typeof error.response.data === 'string'
        ? error.response.data
        : JSON.stringify(error.response.data)
      : '';
    let msg = `Error reading access control ${args?.access_control_name}: ${
      error instanceof Error ? error.message : String(error)
    }`;
    if (error?.response?.status === 404) {
      msg =
        `Access control ${args?.access_control_name?.toUpperCase()} not found. ` +
        'Note that a DCL exists only if one was created for the CDS entity — many CDS views have none.';
    } else if (bodyText) {
      msg += ` | ADT: ${bodyText.slice(0, 1000)}`;
    }
    logger?.error(msg);
    return return_error(new Error(msg));
  }
}
