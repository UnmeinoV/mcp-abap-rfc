/**
 * MoveTransportObjects — move object-list entries from one request/task to
 * another, verified by reading both object lists (E071) back.
 *
 * Route (see src/lib/transportMove.ts): between different requests SAP's own
 * move (ADT moveobjects -> TR_MOVE_OBJECTS); inside one request (the request
 * itself <-> its own tasks, task <-> task) the RFC helper Z_MCP_LXE_MOVE,
 * because SAP's move refuses a request -> own-task move (TR 712, measured).
 *
 * Mutating.
 */

import { parseDataPreviewXml } from '../../../lib/dataPreviewParser';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  callLxeHelper,
  LxeHelperUnavailable,
} from '../../../lib/translation/lxeHelper';
import { LXE_HELPER_MOVE } from '../../../lib/translation/lxeHelperAbap';
import {
  normaliseTransportNumber,
  TRANSPORT_NUMBER_PATTERN,
} from '../../../lib/transportMerge';
import {
  buildMoveObjectsXml,
  chooseRoute,
  describeEntry,
  type E071Row,
  type EntrySpec,
  judgeMove,
  MOVE_CONTENT_TYPE,
  moveSentence,
  resolveEntries,
  type SelectSpec,
  type TrHeader,
  toE071Row,
  toHeader,
} from '../../../lib/transportMove';
import {
  type AxiosResponse,
  makeAdtRequestWithTimeout,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'MoveTransportObjects',
  available_in: ['onprem', 'legacy'] as const,
  description:
    'Move object-list entries (E071) between transport requests/tasks, e.g. entries on a request into a task of it. Verified by reading both lists back.',
  notes: `Two routes, chosen from the two headers (E070):
- different requests (task -> task of another request, request -> request): SAP's own move, the one
  SE09 uses (ADT moveobjects -> TR_MOVE_OBJECTS -> TRINT_MOVE_OBJECTS). It moves the object locks
  too. SAP refuses: different types (a request and a task), different target system, a source or
  target not changeable by the logon user, entries locked elsewhere.
- inside one request (the request itself <-> one of its tasks, task <-> task): SAP's move refuses
  this (TR 712, "only to a request of the same type"), so it goes through the RFC helper module
  Z_MCP_LXE_MOVE (function group ZMCP_LXE, installed by SetupTranslationHelper; needs an RFC
  connection). It deletes the entries from the source and appends them to the target with their
  table keys, as TRINT_MOVE_OBJECTS does, after TRINT_CHECK_REQUEST_CHANGEABLE on both sides.
  Entries with an object lock (LOCKFLAG X) are refused there: their lock would have to move too.

Name the entries with objects ([{pgmid?, object_type, object_name, lang?}]) or pick them with
select ({"pgmid":"LANG"} = every LANG entry of the source). CORR entries never move. An entry that
is not in the source, or matches several entries, is refused before anything is written.

verdict: "moved" = every entry is in the target and gone from the source (independent E071 read);
"partial" / "not_moved" list the entries in not_moved; "unverified" = the call returned but an
object list could not be read. dry_run reads and checks, writes nothing.`,
  inputSchema: {
    type: 'object',
    properties: {
      source_transport: {
        type: 'string',
        description: 'Request or task the entries are on now, e.g. ABCK900001.',
      },
      target_transport: {
        type: 'string',
        description: 'Request or task to move them to, e.g. ABCK900002.',
      },
      objects: {
        type: 'array',
        description: 'e.g. [{"object_type":"CLAS","object_name":"ZCL_X"}]',
        items: {
          type: 'object',
          properties: {
            pgmid: { type: 'string' },
            object_type: { type: 'string' },
            object_name: { type: 'string' },
            lang: { type: 'string' },
          },
          required: ['object_type', 'object_name'],
        },
      },
      select: {
        type: 'object',
        description:
          'Instead of objects: all matching entries, e.g. {"pgmid":"LANG"}.',
        properties: {
          pgmid: { type: 'string' },
          object_type: { type: 'string' },
        },
      },
      dry_run: {
        type: 'boolean',
        description: 'Read and check only, write nothing.',
      },
    },
    required: ['source_transport', 'target_transport'],
  },
} as const;

interface MoveTransportObjectsArgs {
  source_transport: string;
  target_transport: string;
  objects?: EntrySpec[];
  select?: SelectSpec;
  dry_run?: boolean;
}

const E071_ROW_LIMIT = 10000;

async function freestyle(
  context: HandlerContext,
  sql: string,
  rows: number,
): Promise<Record<string, unknown>[]> {
  const response = await makeAdtRequestWithTimeout(
    context.connection,
    '/sap/bc/adt/datapreview/freestyle',
    'POST',
    'csrf',
    sql,
    { rowNumber: rows },
    {
      Accept:
        'application/xml, application/vnd.sap.adt.datapreview.table.v1+xml',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  );
  return parseDataPreviewXml(String(response.data), rows).rows as Record<
    string,
    unknown
  >[];
}

async function readHeaders(
  context: HandlerContext,
  numbers: string[],
): Promise<Map<string, TrHeader>> {
  const list = numbers.map((n) => `'${n}'`).join(', ');
  const rows = await freestyle(
    context,
    `SELECT trkorr, trfunction, trstatus, strkorr, as4user FROM e070 WHERE trkorr IN (${list})`,
    numbers.length + 1,
  );
  const map = new Map<string, TrHeader>();
  for (const row of rows) {
    const h = toHeader(row);
    map.set(h.trkorr, h);
  }
  return map;
}

export async function readObjectList(
  context: HandlerContext,
  tr: string,
): Promise<E071Row[]> {
  const rows = await freestyle(
    context,
    `SELECT trkorr, as4pos, pgmid, object, obj_name, lockflag, lang FROM e071 WHERE trkorr = '${tr}'`,
    E071_ROW_LIMIT,
  );
  if (rows.length >= E071_ROW_LIMIT) {
    throw new Error(
      `${tr} has ${E071_ROW_LIMIT} or more object-list entries; this tool reads at most ${E071_ROW_LIMIT - 1}.`,
    );
  }
  return rows.map(toE071Row);
}

async function readOrNull(
  context: HandlerContext,
  tr: string,
): Promise<E071Row[] | null> {
  try {
    return await readObjectList(context, tr);
  } catch (error: any) {
    context.logger?.warn(
      `MoveTransportObjects: read-back of ${tr} failed: ${error?.message || error}`,
    );
    return null;
  }
}

function headerLabel(h: TrHeader): string {
  return `${h.trkorr} (${h.strkorr ? `task of ${h.strkorr}` : 'request'}, type ${h.trfunction || '?'}, status ${h.trstatus || '?'}, owner ${h.as4user || '?'})`;
}

export async function handleMoveTransportObjects(
  context: HandlerContext,
  args: MoveTransportObjectsArgs,
) {
  const { connection, logger } = context;
  try {
    const source = normaliseTransportNumber(args?.source_transport);
    const target = normaliseTransportNumber(args?.target_transport);
    for (const [label, value, raw] of [
      ['source_transport', source, args?.source_transport],
      ['target_transport', target, args?.target_transport],
    ] as const) {
      if (!TRANSPORT_NUMBER_PATTERN.test(value)) {
        throw new Error(
          `${label} "${raw ?? ''}" is not a transport number (e.g. ABCK900001)`,
        );
      }
    }
    if (source === target) {
      throw new Error('source_transport and target_transport must differ');
    }
    const dryRun = args?.dry_run === true;

    const headers = await readHeaders(context, [source, target]);
    const from = headers.get(source);
    const to = headers.get(target);
    if (!from)
      throw new Error(
        `${source} does not exist (no E070 row) — nothing was moved.`,
      );
    if (!to)
      throw new Error(
        `${target} does not exist (no E070 row) — nothing was moved.`,
      );
    if (to.trstatus !== 'D' && to.trstatus !== 'L') {
      throw new Error(
        `${headerLabel(to)} is not modifiable — nothing was moved.`,
      );
    }

    const sourceBefore = await readObjectList(context, source);
    const entries = resolveEntries(
      source,
      sourceBefore,
      args?.objects,
      args?.select,
    );
    const route = chooseRoute(from, to);
    logger?.info(
      `MoveTransportObjects ${entries.length} entr(ies) ${source} -> ${target} via ${route}${dryRun ? ' (dry run)' : ''}`,
    );

    const base = {
      source_transport: source,
      target_transport: target,
      source: headerLabel(from),
      target: headerLabel(to),
      route,
      entries: entries.map((e) => describeEntry(e)),
    };

    if (route === 'sap_move') {
      if (dryRun) {
        return return_response({
          data: JSON.stringify({
            success: true,
            dry_run: true,
            written: false,
            ...base,
            message: `Dry run: ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'} of ${source} would be moved to ${target} by SAP's move. SAP's own checks (type, target system, changeability, locks) only run on the real move.`,
          }),
        } as AxiosResponse);
      }
      let callError: any;
      try {
        await makeAdtRequestWithTimeout(
          connection,
          `/sap/bc/adt/cts/transportrequests/${source}/moveobjects`,
          'POST',
          'default',
          buildMoveObjectsXml(target, entries),
          undefined,
          { Accept: MOVE_CONTENT_TYPE, 'Content-Type': MOVE_CONTENT_TYPE },
        );
      } catch (error) {
        callError = error;
      }
      const judgement = judgeMove(
        entries,
        await readOrNull(context, source),
        await readOrNull(context, target),
      );
      if (callError) {
        const residue =
          judgement.verdict === 'unverified'
            ? 'The object lists could not be read back — check with GetTransport.'
            : judgement.moved.length === 0
              ? 'Read back: nothing was moved.'
              : `Read back: ${judgement.moved.length} of ${entries.length} entries ARE in ${target} anyway.`;
        throw new Error(
          `SAP refused the move ${source} -> ${target}: ${callError?.message || callError}. ${residue}`,
        );
      }
      return return_response({
        data: JSON.stringify({
          success: judgement.verdict === 'moved',
          verdict: judgement.verdict,
          dry_run: false,
          ...base,
          moved: judgement.moved,
          not_moved: judgement.not_moved,
          message: moveSentence(source, target, entries.length, judgement),
        }),
      } as AxiosResponse);
    }

    // Inside one request: the RFC helper.
    const result = await callLxeHelper(connection, LXE_HELPER_MOVE, {
      IV_FROM: source,
      IV_TO: target,
      IT_OBJECTS: entries.map((e) => ({
        PGMID: e.pgmid,
        OBJECT: e.object,
        OBJ_NAME: e.obj_name,
        LANG: e.lang,
      })),
      IV_TEST: dryRun ? 'X' : '',
    });
    const status = String(result.EV_STATUS ?? '').trim();
    const helperMessage = String(result.EV_MESSAGE ?? '').trim();

    if (dryRun) {
      if (status !== 'S') {
        throw new Error(
          `Dry run ${source} -> ${target} refused: ${helperMessage}`,
        );
      }
      return return_response({
        data: JSON.stringify({
          success: true,
          dry_run: true,
          written: false,
          ...base,
          message: `Dry run: all checks passed, ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'} would be moved. ${helperMessage}`,
        }),
      } as AxiosResponse);
    }

    // Our own read-back decides, not the helper's status.
    const judgement = judgeMove(
      entries,
      await readOrNull(context, source),
      await readOrNull(context, target),
    );
    if (status !== 'S' && judgement.moved.length === 0) {
      const residue =
        judgement.verdict === 'unverified'
          ? 'The object lists could not be read back — check with GetTransport.'
          : 'Read back: nothing was moved.';
      throw new Error(
        `Move ${source} -> ${target} refused: ${helperMessage} ${residue}`,
      );
    }
    return return_response({
      data: JSON.stringify({
        success: judgement.verdict === 'moved',
        verdict: judgement.verdict,
        dry_run: false,
        ...base,
        moved: judgement.moved,
        not_moved: judgement.not_moved,
        helper_status: status,
        helper_message: helperMessage,
        message: moveSentence(source, target, entries.length, judgement),
      }),
    } as AxiosResponse);
  } catch (error: any) {
    if (!(error instanceof LxeHelperUnavailable)) {
      logger?.error(`MoveTransportObjects failed: ${error?.message || error}`);
    }
    return return_error(error);
  }
}
