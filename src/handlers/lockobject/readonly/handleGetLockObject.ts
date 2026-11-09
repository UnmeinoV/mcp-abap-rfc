/**
 * GetLockObject Handler - Read an ABAP lock object (ENQU).
 * ADT: GET /sap/bc/adt/ddic/lockobjects/sources/{name}. No adt-clients wrapper.
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
  name: 'GetLockObject',
  available_in: ['onprem', 'legacy'] as const,
  description:
    'Operation: Read. Subject: LockObject (ENQU). Retrieve an ABAP lock object: primary table, lock mode, RFC flag, generated ENQUEUE/DEQUEUE modules.',
  inputSchema: {
    type: 'object',
    properties: {
      lock_object_name: {
        type: 'string',
        description: 'Lock object name (e.g., EZMY_LOCK).',
      },
      version: {
        type: 'string',
        description: 'Version to read: "active" (default) or "inactive".',
        enum: ['active', 'inactive'],
      },
    },
    required: ['lock_object_name'],
  },
} as const;

interface GetLockObjectArgs {
  lock_object_name: string;
  version?: 'active' | 'inactive';
}

export async function handleGetLockObject(
  context: HandlerContext,
  args: GetLockObjectArgs,
) {
  const { connection, logger } = context;
  try {
    if (!args?.lock_object_name)
      return return_error(new Error('lock_object_name is required'));
    createAdtClient(connection, logger); // wrap connection (sap-language pinning)
    const name = args.lock_object_name.toUpperCase();
    const url = `/sap/bc/adt/ddic/lockobjects/sources/${encodeSapObjectName(name).toLowerCase()}`;
    const xml = await getAdt(
      connection,
      url,
      args.version ? { version: args.version } : undefined,
    );

    const primaryTable = xml.match(
      /<enqu:primaryTable>\s*<enqu:tableName>([^<]*)<\/enqu:tableName>\s*<enqu:lockMode>([^<]*)<\/enqu:lockMode>/,
    );
    const parsed = {
      primary_table: primaryTable?.[1],
      lock_mode: primaryTable?.[2],
      allow_rfc: /<enqu:allowRFC>true<\/enqu:allowRFC>/.test(xml),
      lock_modules: Array.from(
        xml.matchAll(/<enqu:lockModule[^>]*adtcore:name="([^"]*)"/g),
      ).map((m) => m[1]),
    };

    return return_response({
      data: JSON.stringify(
        { success: true, lock_object_name: name, ...parsed, raw_xml: xml },
        null,
        2,
      ),
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });
  } catch (error: any) {
    logger?.error(
      `Error reading lock object ${args?.lock_object_name}: ${error?.message || error}`,
    );
    return return_error(error);
  }
}
