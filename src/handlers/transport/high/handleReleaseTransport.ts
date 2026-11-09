/**
 * ReleaseTransport Handler - release a transport request (and its tasks).
 *
 * Mirrors abap-adt-api's transportRelease:
 *   POST /sap/bc/adt/cts/transportrequests/{tr}/{action}
 *     action = newreleasejobs (default)
 *            | relwithignlock  (ignore_locks)
 *            | relObjigchkatc  (ignore_atc)
 *   -> tm:root/tm:releasereports/chkrun:checkReport[] with status + messages
 *
 * Mutating: releasing is irreversible; the request can no longer be changed.
 */

import { asArray } from '../../../lib/atcParser';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  type AxiosResponse,
  makeAdtRequestWithTimeout,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'ReleaseTransport',
  available_in: ['onprem'] as const,
  description:
    'Release a transport request (irreversible — the request can no longer be changed afterwards). Optionally ignore locks or ATC objections. Returns the release report(s) with status and messages.',
  inputSchema: {
    type: 'object',
    properties: {
      transport_number: {
        type: 'string',
        description: 'Transport request number, e.g. ABCK900001.',
      },
      ignore_locks: {
        type: 'boolean',
        description: 'Release even if objects are locked. Default: false.',
      },
      ignore_atc: {
        type: 'boolean',
        description: 'Release ignoring ATC objections. Default: false.',
      },
    },
    required: ['transport_number'],
  },
} as const;

interface ReleaseTransportArgs {
  transport_number: string;
  ignore_locks?: boolean;
  ignore_atc?: boolean;
}

export async function handleReleaseTransport(
  context: HandlerContext,
  args: ReleaseTransportArgs,
) {
  const { connection, logger } = context;
  try {
    const { transport_number, ignore_locks, ignore_atc } = args ?? ({} as any);
    if (!transport_number) {
      return return_error(new Error('transport_number is required'));
    }
    const tr = transport_number.toUpperCase();
    const action = ignore_atc
      ? 'relObjigchkatc'
      : ignore_locks
        ? 'relwithignlock'
        : 'newreleasejobs';

    logger?.info(`ReleaseTransport: ${tr} (action=${action})`);

    const resp = await makeAdtRequestWithTimeout(
      connection,
      `/sap/bc/adt/cts/transportrequests/${tr}/${action}`,
      'POST',
      'long',
      undefined,
      undefined,
      { Accept: 'application/*' },
    );

    const { XMLParser } = require('fast-xml-parser');
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      removeNSPrefix: true,
    });
    const parsed = parser.parse(String(resp.data));
    const reports = asArray<any>(parsed?.root?.releasereports?.checkReport).map(
      (r: any) => ({
        status: r['@_status'] ?? null,
        status_text: r['@_statusText'] ?? null,
        messages: asArray<any>(r?.checkMessageList?.checkMessage).map(
          (m: any) => ({
            type: m['@_type'] ?? null,
            text: m['@_shortText'] ?? null,
            uri: m['@_uri'] ?? null,
          }),
        ),
      }),
    );

    const released = reports.some((r) => r.status === 'released');
    const success = reports.length === 0 ? true : released;

    return return_response({
      data: JSON.stringify({
        success,
        transport_number: tr,
        action,
        released,
        reports,
        message: `Release ${tr}: ${released ? 'released' : reports.length ? 'not released — see reports' : 'submitted'}`,
      }),
    } as AxiosResponse);
  } catch (error: any) {
    logger?.error(`ReleaseTransport failed: ${error?.message || error}`);
    return return_error(error);
  }
}
