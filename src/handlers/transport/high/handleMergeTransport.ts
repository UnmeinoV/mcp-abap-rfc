/**
 * MergeTransport Handler - merge one transport request into another (SE10
 * "Merge Requests").
 *
 *   POST /sap/bc/adt/cts/transportrequests/{source}/merge
 *   body: <tm:root tm:number="{target}" tm:useraction="merge"/>
 *
 * The source request's tasks (with their own descriptions) and objects move
 * under the target, and the source request is deleted. The result is verified
 * by reading both requests back — see src/lib/transportMerge.ts.
 *
 * Mutating.
 */

import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  buildMergeTransportXml,
  judgeMerge,
  MERGE_CONTENT_TYPE,
  mergeSentence,
  normaliseTransportNumber,
  type SourceStateAfter,
  TRANSPORT_NUMBER_PATTERN,
} from '../../../lib/transportMerge';
import {
  type AxiosResponse,
  makeAdtRequestWithTimeout,
  return_error,
  return_response,
} from '../../../lib/utils';
import { parseTransportXml } from '../readonly/handleGetTransport';

export const TOOL_DEFINITION = {
  name: 'MergeTransport',
  available_in: ['onprem'] as const,
  description:
    "Merge a transport request into another (SE10 Merge Requests): the source request's tasks and objects move under the target and the source request is deleted. Verified by reading both requests back.",
  notes: `Preconditions enforced by SAP (TR_MERGE_REQUESTS): the source must be a modifiable request
owned by the current user; the target must be a modifiable REQUEST (not a task); both must have the
same type (workbench/customizing), the same target system and differ from each other.

The tasks keep their own descriptions, so a request created with a per-requirement description and
merged into a project-wide request still shows that description on its task.

verdict: "merged" = every task of the source is now under the target and the source is gone;
"not_merged" = the read-back contradicts the merge; "unverified" = the call returned without error
but the end state could not be read.`,
  inputSchema: {
    type: 'object',
    properties: {
      source_transport: {
        type: 'string',
        description:
          'Request to merge AWAY (it is deleted), e.g. ABCK900001. Must be owned by the current user.',
      },
      target_transport: {
        type: 'string',
        description: 'Request to merge INTO, e.g. ABCK900002.',
      },
    },
    required: ['source_transport', 'target_transport'],
  },
} as const;

interface MergeTransportArgs {
  source_transport: string;
  target_transport: string;
}

const TM_ACCEPT = { Accept: MERGE_CONTENT_TYPE };

async function readTaskNumbers(
  context: HandlerContext,
  tr: string,
): Promise<string[]> {
  const response = await makeAdtRequestWithTimeout(
    context.connection,
    `/sap/bc/adt/cts/transportrequests/${tr}?includeTasks=true`,
    'GET',
    'default',
    undefined,
    undefined,
    TM_ACCEPT,
  );
  const parsed = parseTransportXml(response.data, false, true);
  return (parsed.tasks ?? [])
    .map((t: any) => normaliseTransportNumber(String(t.number ?? '')))
    .filter(Boolean);
}

function httpStatusOf(error: any): number | undefined {
  return error?.response?.status ?? error?.status;
}

async function readSourceState(
  context: HandlerContext,
  tr: string,
): Promise<SourceStateAfter> {
  try {
    await makeAdtRequestWithTimeout(
      context.connection,
      `/sap/bc/adt/cts/transportrequests/${tr}`,
      'GET',
      'default',
      undefined,
      undefined,
      TM_ACCEPT,
    );
    return 'present';
  } catch (error: any) {
    return httpStatusOf(error) === 404 ? 'gone' : 'unknown';
  }
}

export async function handleMergeTransport(
  context: HandlerContext,
  args: MergeTransportArgs,
) {
  const { connection, logger } = context;
  try {
    const source = normaliseTransportNumber(args?.source_transport);
    const target = normaliseTransportNumber(args?.target_transport);
    if (!source || !target) {
      return return_error(
        new Error('source_transport and target_transport are required'),
      );
    }
    for (const [label, value] of [
      ['source_transport', source],
      ['target_transport', target],
    ] as const) {
      if (!TRANSPORT_NUMBER_PATTERN.test(value)) {
        return return_error(
          new Error(
            `${label} "${value}" is not a transport number (e.g. ABCK900001)`,
          ),
        );
      }
    }
    if (source === target) {
      return return_error(
        new Error('source_transport and target_transport must differ'),
      );
    }

    // Before: which tasks should end up under the target. A failure here is a
    // real error (the source cannot be read, so it cannot be merged either).
    const sourceTasksBefore = await readTaskNumbers(context, source);

    logger?.info(`MergeTransport: ${source} -> ${target}`);

    const response = await makeAdtRequestWithTimeout(
      connection,
      `/sap/bc/adt/cts/transportrequests/${source}/merge`,
      'POST',
      'default',
      buildMergeTransportXml(target),
      undefined,
      { Accept: MERGE_CONTENT_TYPE, 'Content-Type': MERGE_CONTENT_TYPE },
    );

    // After: read the end state back.
    let targetTasksAfter: string[] | null = null;
    try {
      targetTasksAfter = await readTaskNumbers(context, target);
    } catch (error: any) {
      logger?.warn(
        `MergeTransport: target ${target} read-back failed: ${error?.message || error}`,
      );
    }
    const sourceAfter = await readSourceState(context, source);

    const judgement = judgeMerge({
      sourceTasksBefore,
      targetTasksAfter,
      sourceAfter,
    });

    return return_response({
      data: JSON.stringify({
        success: judgement.verdict === 'merged',
        verdict: judgement.verdict,
        source_transport: source,
        target_transport: target,
        source_tasks_before: sourceTasksBefore,
        moved_tasks: judgement.moved_tasks,
        missing_tasks: judgement.missing_tasks,
        source_after: sourceAfter,
        target_tasks_after: targetTasksAfter,
        http_status: response?.status,
        message: mergeSentence(source, target, judgement),
      }),
    } as AxiosResponse);
  } catch (error: any) {
    logger?.error(`MergeTransport failed: ${error?.message || error}`);
    return return_error(error);
  }
}
