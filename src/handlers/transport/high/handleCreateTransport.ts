/**
 * CreateTransport Handler - Create new ABAP transport request via ADT API
 *
 * Uses TransportBuilder from @mcp-abap-adt/adt-clients for all operations.
 * Session and lock management handled internally by builder.
 *
 * Workflow: create
 */

import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { getSystemContext } from '../../../lib/systemContext';
import {
  createTransportRequest,
  normaliseTransportTarget,
} from '../../../lib/transportCreate';
import {
  ErrorCode,
  McpError,
  makeAdtRequestWithTimeout,
  return_error,
  return_response,
} from '../../../lib/utils';

/**
 * Confirm a transport request exists (GET the CTS read endpoint returns 200).
 * Used to recover from the CreateTransport post-create "locked" quirk.
 */
async function transportExists(
  connection: HandlerContext['connection'],
  transportNumber: string,
): Promise<boolean> {
  try {
    const res = await makeAdtRequestWithTimeout(
      connection,
      `/sap/bc/adt/cts/transportrequests/${transportNumber}`,
      'GET',
      'default',
      undefined,
      undefined,
      { Accept: 'application/vnd.sap.adt.transportorganizer.v1+xml' },
    );
    return (res?.status ?? 0) >= 200 && (res?.status ?? 0) < 300;
  } catch {
    return false;
  }
}

/**
 * The user a new request is owned by.
 *
 * The dependency read this from the system context and threw a bare
 * "owner is required" when it was absent; the message now names what to set.
 */
function resolveOwner(): string {
  // getSystemContext() is only populated once resolveSystemContext() has run,
  // which is a startup step this handler must not depend on being ordered
  // before it — so fall back to the same env vars that function reads.
  const owner = (
    getSystemContext().responsible ||
    process.env.SAP_RESPONSIBLE ||
    process.env.SAP_USERNAME ||
    ''
  ).trim();
  if (!owner) {
    throw new McpError(
      ErrorCode.InvalidParams,
      'Cannot create a transport request: no owner. Pass owner explicitly, or set ' +
        'SAP_RESPONSIBLE / SAP_USERNAME so the current user can be resolved.',
    );
  }
  return owner.toUpperCase();
}

export const TOOL_DEFINITION = {
  name: 'CreateTransport',
  available_in: ['onprem'] as const,
  description:
    'Create a new ABAP transport request in SAP system for development objects.',
  inputSchema: {
    type: 'object',
    properties: {
      transport_type: {
        type: 'string',
        description:
          "Transport type: 'workbench' (cross-client) or 'customizing' (client-specific)",
        enum: ['workbench', 'customizing'],
        default: 'workbench',
      },
      description: {
        type: 'string',
        description: 'Transport request description (mandatory)',
      },
      target_system: {
        type: 'string',
        description:
          "Target system for transport (optional, e.g., 'PRD', 'QAS'). If not provided or empty, uses 'LOCAL'",
      },
      owner: {
        type: 'string',
        description: 'Transport owner (optional, defaults to current user)',
      },
    },
    required: ['description'],
  },
} as const;

interface CreateTransportArgs {
  transport_type?: string;
  description: string;
  target_system?: string;
  owner?: string;
}

/**
 * Main handler for CreateTransport MCP tool
 *
 * Uses TransportBuilder from @mcp-abap-adt/adt-clients for all operations
 * Session and lock management handled internally by builder
 */
export async function handleCreateTransport(
  context: HandlerContext,
  args: CreateTransportArgs,
) {
  const { connection, logger } = context;
  try {
    // Validate required parameters
    if (!args?.description) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Transport description is required',
      );
    }

    const typedArgs = args as CreateTransportArgs;
    // Get connection from session context (set by ProtocolHandler)
    // Connection is managed and cached per session, with proper token refresh via AuthBroker
    logger?.info(`Starting transport creation: ${typedArgs.description}`);

    try {
      // The dependency's builder wraps a supplied target in slashes and escapes
      // nothing, so the payload is built and POSTed in lib/transportCreate —
      // see that file for both measurements.
      const requestedTarget = normaliseTransportTarget(typedArgs.target_system);
      const { parsed, status, statusText } = await createTransportRequest(
        connection,
        {
          description: typedArgs.description,
          transportType:
            typedArgs.transport_type === 'customizing'
              ? 'customizing'
              : 'workbench',
          targetSystem: typedArgs.target_system,
          // The dependency resolved this from the system context; do the
          // same, and refuse rather than send an empty tm:owner.
          owner: typedArgs.owner || resolveOwner(),
        },
      );

      logger?.info('✅ CreateTransport completed successfully');

      // The parsed body often omits the number, but it is always in the create
      // URI's last segment (e.g. …/object_name/ABCK900078) — and, failing that,
      // somewhere in the raw response. Fall back to those so the success message
      // shows the real number instead of "unknown".
      const numFromUri = (() => {
        const u = parsed.uri;
        if (!u) return undefined;
        const seg = decodeURIComponent(u.split('/').pop() || '').trim();
        return /^[A-Z][A-Z0-9]{2}K\d{6}$/.test(seg) ? seg : undefined;
      })();
      const numFromData = parsed.raw.match(/\b([A-Z][A-Z0-9]{2}K\d{6})\b/)?.[1];
      const resolvedNumber =
        parsed.transport_number || numFromUri || numFromData;

      // TARGET: report what SAP recorded, not what was asked for. Echoing the
      // caller's own input while CTS stored something else is how a LOCAL
      // request passes for a targeted one until the first write against the
      // package fails, one round-trip away from the cause.
      const targetFromSap = parsed.target_system?.trim();
      const targetMismatch =
        targetFromSap !== undefined &&
        targetFromSap !== '' &&
        targetFromSap.toUpperCase() !== requestedTarget;

      return return_response({
        data: JSON.stringify(
          {
            success: true,
            transport_request: resolvedNumber,
            description: parsed.description || typedArgs.description,
            type:
              parsed.type ||
              (typedArgs.transport_type === 'customizing' ? 'T' : 'K'),
            // SAP's value when it gave one; otherwise the target we sent, which
            // is what CTS accepted for this request.
            target_system: targetFromSap || requestedTarget,
            target_system_requested: requestedTarget,
            target_desc: parsed.target_desc,
            cts_project: parsed.cts_project,
            owner: parsed.owner || typedArgs.owner,
            uri: parsed.uri,
            ...(targetMismatch
              ? {
                  warning:
                    `Created with transport target ${targetFromSap}, not the requested ` +
                    `${requestedTarget}. Use ${targetFromSap} when judging whether this ` +
                    "request suits a package, and check the package's required target.",
                }
              : {}),
            message: `Transport request ${resolvedNumber || 'unknown'} created successfully`,
          },
          null,
          2,
        ),
        status,
        statusText,
        headers: {} as any,
        config: {} as any,
      });
    } catch (error: any) {
      // A caller-input problem (no owner, bad argument) is not a create
      // failure and must not be relabelled as one — wrapping it hides which
      // side has to act.
      if (error instanceof McpError) throw error;
      logger?.error(`Error creating transport:`, error);

      const errorMessage = error.response?.data
        ? typeof error.response.data === 'string'
          ? error.response.data
          : JSON.stringify(error.response.data)
        : error.message || String(error);

      // QUIRK RECOVERY — CreateTransport's post-create finalize/read races a
      // transient CTS enqueue on the freshly-allocated request number, throwing
      // "Internal error: Request <NUMBER> is locked; action canceled"
      // (ADT_TM_COMMON_EXCEPTION / SCTS_ADT_MSG 009) even though the request WAS
      // created. Extract the number from the message and confirm via GET; if it
      // now exists, treat the create as successful instead of leaving an orphan
      // and surfacing a misleading failure.
      const lockedMatch = errorMessage.match(
        /Request\s+([A-Z][A-Z0-9]{2}K\d{6}|[A-Z0-9]{8,})\s+is locked/i,
      );
      if (lockedMatch?.[1]) {
        const lockedNumber = lockedMatch[1].toUpperCase();
        logger?.warn(
          `CreateTransport reported "${lockedNumber} is locked"; verifying whether it was actually created…`,
        );
        if (await transportExists(connection, lockedNumber)) {
          logger?.info(
            `✅ CreateTransport recovered: ${lockedNumber} exists (post-create lock quirk).`,
          );
          return return_response({
            data: JSON.stringify(
              {
                success: true,
                transport_request: lockedNumber,
                description: typedArgs.description,
                type: typedArgs.transport_type === 'customizing' ? 'T' : 'K',
                target_system: typedArgs.target_system || 'LOCAL',
                owner: typedArgs.owner,
                uri: `/sap/bc/adt/cts/transportrequests/${lockedNumber}`,
                warning:
                  'CreateTransport returned a transient "request is locked" error, but the request was created (confirmed by read). Recovered.',
                message: `Transport request ${lockedNumber} created successfully (recovered from post-create lock quirk).`,
              },
              null,
              2,
            ),
          } as any);
        }
        logger?.warn(
          `CreateTransport "${lockedNumber} is locked" but the request is not readable; surfacing the original error.`,
        );
      }

      throw new McpError(
        ErrorCode.InternalError,
        `Failed to create transport: ${errorMessage}`,
      );
    }
  } catch (error: any) {
    if (error instanceof McpError) {
      throw error;
    }
    return return_error(error);
  }
}
