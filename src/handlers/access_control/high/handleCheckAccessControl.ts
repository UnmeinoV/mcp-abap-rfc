/**
 * CheckAccessControl Handler - Syntax-check a DCL source.
 *
 * With `source_code` the check runs against the SUBMITTED text (inline base64
 * artifact), so a caller can validate a draft before writing it. Without it,
 * the stored version named by `version` is checked.
 */

import { accessControlUri } from '../../../lib/accessControlXml';
import {
  checkObjectAndReport,
  runObjectCheckRun,
} from '../../../lib/adtObjectOps';
import { parseCheckRunResponse } from '../../../lib/checkRunParser';
import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { return_error, return_response } from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'CheckAccessControl',
  available_in: ['onprem'] as const,
  description:
    'Operation: Check. Subject: Access Control (DCL / DCLS). Syntax-check a DCL. Pass source_code ' +
    'to check a DRAFT before writing it (the check then runs on the text you submit, not on the ' +
    'stored version); omit it to check the stored active or inactive version.',
  inputSchema: {
    type: 'object',
    properties: {
      access_control_name: {
        type: 'string',
        description: 'DCL name (must exist in the system).',
      },
      source_code: {
        type: 'string',
        description:
          'Optional draft source to check INSTEAD of the stored version. Use this to validate before an update.',
      },
      version: {
        type: 'string',
        description:
          'Which stored version to check when source_code is omitted: "active" (default) or "inactive".',
        enum: ['active', 'inactive'],
      },
    },
    required: ['access_control_name'],
  },
} as const;

interface CheckAccessControlArgs {
  access_control_name: string;
  source_code?: string;
  version?: 'active' | 'inactive';
}

export async function handleCheckAccessControl(
  context: HandlerContext,
  args: CheckAccessControlArgs,
) {
  const { connection, logger } = context;
  try {
    if (!args?.access_control_name) {
      return return_error(new Error('access_control_name is required'));
    }
    createAdtClient(connection, logger); // wrap connection (sap-language pinning)
    const name = args.access_control_name.toUpperCase();
    // A draft is by definition not the active version, so check it as inactive.
    const version = args.source_code ? 'inactive' : (args.version ?? 'active');

    const report = await checkObjectAndReport(connection, {
      objectUri: accessControlUri(name),
      subject: `access control ${name}`,
      version,
      sourceCode: args.source_code,
    });
    const parsed = report.check_result;

    logger?.info(
      `Access control check ${name}: ${parsed.has_errors ? 'ERRORS' : 'clean'} (${parsed.total_messages} message(s))`,
    );

    return return_response({
      data: JSON.stringify(
        {
          ...parsed,
          // Authoritative: a check with error-level messages is not a success,
          // whatever the parser's own default said.
          success: report.success,
          message: report.message,
          findings: report.findings,
          access_control_name: name,
          checked_version: args.source_code ? 'submitted source' : version,
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
    const msg = `Error checking access control ${args?.access_control_name}: ${
      error instanceof Error ? error.message : String(error)
    }${bodyText ? ` | ADT: ${bodyText.slice(0, 1000)}` : ''}`;
    logger?.error(msg);
    return return_error(new Error(msg));
  }
}
