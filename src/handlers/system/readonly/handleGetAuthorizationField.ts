/**
 * GetAuthorizationField Handler - read one SU20 authorization field (AUTH).
 *
 * Ground-truthed live on DM2/310 against `ACTVT`. A direct GET on
 * `/sap/bc/adt/aps/iam/auth/{name}` works — see src/lib/authIamXml.ts for why an earlier round
 * concluded otherwise (an absent templateLink is not evidence the plain GET doesn't work). A
 * bogus name answers a clean 404 `ExceptionResourceNotFound`, so existence is unambiguous.
 */

import {
  AUTH_IAM_NOT_FOUND_TEXT,
  parseAuthorizationField,
} from '../../../lib/authIamXml';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  type AxiosResponse,
  makeAdtRequestWithTimeout,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'GetAuthorizationField',
  available_in: ['onprem'] as const,
  description:
    '[read-only] Read one SU20 authorization field: data element, check table, domain, search help.',
  notes: `GET on /sap/bc/adt/aps/iam/auth/{field_name} (<auth:auth> XML). A bogus name answers a
clean 404, so existence is unambiguous. See GetAuthorizationObject for which fields an SU21
object actually uses.`,
  inputSchema: {
    type: 'object',
    properties: {
      field_name: {
        type: 'string',
        description: 'Authorization field name, e.g. ACTVT.',
      },
    },
    required: ['field_name'],
  },
} as const;

export async function handleGetAuthorizationField(
  context: HandlerContext,
  args: { field_name: string },
) {
  const { connection } = context;
  try {
    if (!args?.field_name) {
      return return_error(new Error('field_name is required'));
    }
    const name = args.field_name.toUpperCase();

    let xml: string;
    try {
      const res = await makeAdtRequestWithTimeout(
        connection,
        `/sap/bc/adt/aps/iam/auth/${encodeURIComponent(name)}`,
        'GET',
      );
      xml = typeof res.data === 'string' ? res.data : '';
    } catch (e: any) {
      const body = typeof e?.response?.data === 'string' ? e.response.data : '';
      if (
        e?.response?.status === 404 ||
        body.includes(AUTH_IAM_NOT_FOUND_TEXT)
      ) {
        return return_error(
          new Error(`Authorization field "${name}" does not exist.`),
        );
      }
      throw e;
    }

    const field = parseAuthorizationField(xml);

    return return_response({
      data: JSON.stringify(
        {
          success: true,
          field_name: field.name || name,
          description: field.description,
          package_name: field.package_name,
          data_element: field.data_element,
          check_table: field.check_table,
          domain: field.domain,
          output_length: field.output_length,
          has_search_help: field.has_search_help,
          search_help_name: field.search_help_name,
          search_help_description: field.search_help_description,
          has_exit_module: field.has_exit_module,
          org_level_info: field.org_level_info,
        },
        null,
        2,
      ),
    } as AxiosResponse);
  } catch (error: any) {
    return return_error(error);
  }
}
