/**
 * GetAtcWorklist Handler - Re-read the findings of an existing ATC worklist
 * (created by a previous RunAtc) without re-running the checks.
 * Mirrors abap-adt-api's atcWorklists.
 */

import { findingsByPriority, parseAtcWorklist } from '../../../lib/atcParser';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  makeAdtRequestWithTimeout,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'GetAtcWorklist',
  available_in: ['onprem'] as const,
  description:
    '[read-only] Re-read the findings of an existing ATC worklist by worklist_id (returned by RunAtc) without re-running the checks. Useful to re-inspect results or include exempted findings.',
  inputSchema: {
    type: 'object',
    properties: {
      worklist_id: {
        type: 'string',
        description: 'Worklist ID returned by a previous RunAtc call.',
      },
      timestamp: {
        type: 'string',
        description:
          'Optional worklist timestamp (from RunAtc worklist_timestamp) to pin the result set.',
      },
      used_object_set: {
        type: 'string',
        description:
          'Optional object-set id to filter by (e.g. the PACKAGE set id from the worklist).',
      },
      include_exempted: {
        type: 'boolean',
        description: 'Include exempted findings. Default: false.',
      },
    },
    required: ['worklist_id'],
  },
} as const;

interface GetAtcWorklistArgs {
  worklist_id: string;
  timestamp?: string;
  used_object_set?: string;
  include_exempted?: boolean;
}

export async function handleGetAtcWorklist(
  context: HandlerContext,
  args: GetAtcWorklistArgs,
) {
  const { connection, logger } = context;
  try {
    const {
      worklist_id,
      timestamp,
      used_object_set,
      include_exempted = false,
    } = args ?? {};

    if (!worklist_id) {
      return return_error(new Error('worklist_id is required'));
    }

    const resp = await makeAdtRequestWithTimeout(
      connection,
      `/sap/bc/adt/atc/worklists/${encodeURIComponent(worklist_id)}`,
      'GET',
      'long',
      undefined,
      {
        ...(timestamp ? { timestamp } : {}),
        ...(used_object_set ? { usedObjectSet: used_object_set } : {}),
        includeExemptedFindings: include_exempted ? 'true' : 'false',
      },
      { Accept: 'application/atc.worklist.v1+xml, application/xml' },
    );
    const worklist = parseAtcWorklist(String(resp.data));

    logger?.info(
      `GetAtcWorklist: ${worklist.findings.length} finding(s) across ${worklist.objects.length} object(s)`,
    );

    return return_response({
      data: JSON.stringify(
        {
          success: true,
          worklist_id,
          worklist_timestamp: worklist.worklist_timestamp,
          object_set_is_complete: worklist.object_set_is_complete,
          objects_checked: worklist.objects.length,
          objects: worklist.objects,
          finding_count: worklist.findings.length,
          findings_by_priority: findingsByPriority(worklist.findings),
          findings: worklist.findings,
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
    logger?.error(`GetAtcWorklist failed: ${error?.message || error}`);
    return return_error(error);
  }
}
