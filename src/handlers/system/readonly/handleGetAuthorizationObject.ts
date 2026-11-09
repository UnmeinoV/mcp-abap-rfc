/**
 * GetAuthorizationObject Handler - read one SU21 authorization object (SUSO): its object class,
 * every assigned authorization field, and every allowed activity code.
 *
 * Ground-truthed live on DM2/310 against `S_TABU_DIS`. A direct GET on
 * `/sap/bc/adt/aps/iam/suso/{name}` works — see src/lib/authIamXml.ts for why an earlier round
 * concluded otherwise.
 *
 * EXISTENCE IS NOT A PLAIN 404 HERE, MEASURED: a bogus object name answers HTTP 500 with
 * `<type id="Authorization Object">` — an exception TYPE that does not itself say "not found".
 * What is reliable is the MESSAGE TEXT ("Object directory entry was not found"), which this
 * handler matches on specifically. A 500 with different text is NOT treated as "does not exist"
 * — it propagates as a real error, because a status code this ambiguous cannot be read as a
 * clean existence oracle on its own.
 */

import {
  AUTH_IAM_NOT_FOUND_TEXT,
  parseAuthorizationObject,
} from '../../../lib/authIamXml';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  type AxiosResponse,
  makeAdtRequestWithTimeout,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'GetAuthorizationObject',
  available_in: ['onprem'] as const,
  description:
    '[read-only] Read one SU21 authorization object: object class, criticality, every assigned field, and every allowed activity code.',
  notes: `GET on /sap/bc/adt/aps/iam/suso/{object_name} (<suso:suso> XML). A bogus name answers
HTTP 500 with the text "Object directory entry was not found" (NOT a clean 404) — matched on that
exact text, since the status/exception-type pair alone is not a reliable existence signal here; a
500 with different text still propagates as a real error.`,
  inputSchema: {
    type: 'object',
    properties: {
      object_name: {
        type: 'string',
        description: 'Authorization object name, e.g. S_TABU_DIS.',
      },
    },
    required: ['object_name'],
  },
} as const;

export async function handleGetAuthorizationObject(
  context: HandlerContext,
  args: { object_name: string },
) {
  const { connection } = context;
  try {
    if (!args?.object_name) {
      return return_error(new Error('object_name is required'));
    }
    const name = args.object_name.toUpperCase();

    let xml: string;
    try {
      const res = await makeAdtRequestWithTimeout(
        connection,
        `/sap/bc/adt/aps/iam/suso/${encodeURIComponent(name)}`,
        'GET',
      );
      xml = typeof res.data === 'string' ? res.data : '';
    } catch (e: any) {
      const body = typeof e?.response?.data === 'string' ? e.response.data : '';
      if (body.includes(AUTH_IAM_NOT_FOUND_TEXT)) {
        return return_error(
          new Error(`Authorization object "${name}" does not exist.`),
        );
      }
      throw e;
    }

    const obj = parseAuthorizationObject(xml);

    return return_response({
      data: JSON.stringify(
        {
          success: true,
          object_name: obj.name || name,
          description: obj.description,
          package_name: obj.package_name,
          object_class: obj.object_class,
          object_class_description: obj.object_class_description,
          criticality: obj.criticality,
          privileged: obj.privileged,
          field_count: obj.fields.length,
          fields: obj.fields,
          activities: obj.activities,
        },
        null,
        2,
      ),
    } as AxiosResponse);
  } catch (error: any) {
    return return_error(error);
  }
}
