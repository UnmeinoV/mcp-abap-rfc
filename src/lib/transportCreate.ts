/**
 * Creating a CTS request, without the two defects in the dependency's builder.
 *
 * WHY THIS FILE EXISTS — `@mcp-abap-adt/adt-clients` builds the create payload
 * in `dist/core/transport/create.js`, `buildCreateTransportXml`, and that
 * function does two things wrong.
 *
 * 1. IT WRAPS THE TARGET IN SLASHES.
 *
 *      const target = args.target_system?.trim() ? `/${args.target_system}/` : 'LOCAL';
 *
 *    So `target_system: 'VVV'` is sent as `tm:target="/VVV/"` and CTS answers
 *    `Target '/VVV/' does not exist` — for a target that does exist. The READ
 *    side of the same package parses `tm:target` unwrapped (`GetTransport` on an
 *    existing request returns `VVV`), so nothing downstream wants the slashes.
 *    Reported live on DM2/310 with a target valid in that landscape, and the
 *    failure is expensive in a way the message hides: the caller's fallback is
 *    to omit the target, which succeeds and produces a LOCAL request. That
 *    request is wrong for a package requiring the real target, and the mismatch
 *    only surfaces one round-trip later, on the first write against the package
 *    (`Request ... does not have transport target VVV`).
 *
 * 2. IT INTERPOLATES EVERY VALUE UNESCAPED, into double-quoted XML attributes.
 *    A description containing `&`, `<` or `"` — `Fix "&" handling` is an
 *    ordinary description — produces a malformed document and a 400 that blames
 *    the request rather than the quoting. This is the same root cause as the
 *    CreateFunctionGroup #20 defect, in a different builder.
 *
 * We cannot fix the dependency (we ship no patch to `node_modules`, and a
 * reinstall would drop it), so the payload is built and POSTed here — the same
 * in-repo bypass used for activation, check runs, package deletion and the
 * function-group create.
 */

import type { IAbapConnection } from '@mcp-abap-adt/interfaces';
import { XMLParser } from 'fast-xml-parser';
import { makeAdtRequestWithTimeout } from './utils';

const ACCEPT_TRANSPORT = 'application/vnd.sap.adt.transportorganizer.v1+xml';
const TRANSPORT_URL = '/sap/bc/adt/cts/transportrequests';

/** XML attribute escaping. The dependency's builder has none. */
function escapeXmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * The value that belongs in `tm:target`.
 *
 * A target the caller named is sent AS THEY NAMED IT, upper-cased — no slashes.
 * An absent or blank target means a local request, which CTS spells `LOCAL`.
 */
export function normaliseTransportTarget(targetSystem?: string): string {
  const trimmed = targetSystem?.trim();
  return trimmed ? trimmed.toUpperCase() : 'LOCAL';
}

export interface CreateTransportXmlArgs {
  description: string;
  transportType?: string;
  targetSystem?: string;
  owner: string;
}

export function buildCreateTransportXml(args: CreateTransportXmlArgs): string {
  const type = args.transportType === 'customizing' ? 'T' : 'K';
  const desc = escapeXmlAttribute(args.description);
  const target = escapeXmlAttribute(
    normaliseTransportTarget(args.targetSystem),
  );
  const owner = escapeXmlAttribute(args.owner);
  return `<?xml version="1.0" encoding="UTF-8"?>
<tm:root xmlns:tm="http://www.sap.com/cts/adt/tm" tm:useraction="newrequest">
  <tm:request tm:desc="${desc}" tm:type="${type}" tm:target="${target}" tm:cts_project="">
    <tm:task tm:owner="${owner}"/>
  </tm:request>
</tm:root>`;
}

export interface CreatedTransport {
  transport_number?: string;
  description?: string;
  type?: string;
  target_system?: string;
  target_desc?: string;
  cts_project?: string;
  uri?: string;
  owner?: string;
  /** The raw body, so a caller can recover a number the parse missed. */
  raw: string;
}

export function parseCreateTransportResponse(
  xmlData: string,
): CreatedTransport {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    // Keep everything a string: a request number is not a number, and a target
    // like '100' must not become 100.
    parseAttributeValue: false,
    parseTagValue: false,
  });
  const parsed = parser.parse(xmlData ?? '');
  const root = parsed?.['tm:root'] ?? parsed?.root ?? {};
  const request = root['tm:request'] ?? {};
  const task = request['tm:task'] ?? {};
  const str = (v: unknown) =>
    v === undefined || v === null ? undefined : String(v);
  return {
    transport_number: str(request['tm:number']),
    description: str(request['tm:desc'] ?? request['tm:description']),
    type: str(request['tm:type']),
    target_system: str(request['tm:target']),
    target_desc: str(request['tm:target_desc']),
    cts_project: str(request['tm:cts_project']),
    uri: str(request['tm:uri']),
    owner: str(task['tm:owner'] ?? request['tm:owner']),
    raw: xmlData ?? '',
  };
}

/**
 * POST the create request and return what SAP said, unedited.
 *
 * Failures propagate with SAP's own body attached, so the caller's existing
 * "request is locked" recovery still sees the message it matches on.
 */
export async function createTransportRequest(
  connection: IAbapConnection,
  args: CreateTransportXmlArgs,
): Promise<{ parsed: CreatedTransport; status: number; statusText: string }> {
  const body = buildCreateTransportXml(args);
  const response = await makeAdtRequestWithTimeout(
    connection,
    TRANSPORT_URL,
    'POST',
    'default',
    body,
    undefined,
    { Accept: ACCEPT_TRANSPORT, 'Content-Type': 'text/plain' },
  );
  const data =
    typeof response?.data === 'string'
      ? response.data
      : JSON.stringify(response?.data ?? '');
  return {
    parsed: parseCreateTransportResponse(data),
    status: response?.status ?? 200,
    statusText: response?.statusText ?? 'OK',
  };
}
