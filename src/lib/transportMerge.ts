/**
 * MergeTransport — the payload and the verdict, kept free of I/O so both can be
 * unit-tested.
 *
 * Protocol (read from the system source, S/4HANA SAP_BASIS, 2026-11-03):
 *   POST /sap/bc/adt/cts/transportrequests/{SOURCE}/merge
 *   body <tm:root tm:number="{TARGET}" .../>
 * `CL_CTS_ADT_TM_REST_RES_CONT->post` routes `{traction}` = `merge` to
 * `merge_requests`, which takes the SOURCE from the URL path and the TARGET
 * from the body attribute `tm:number` (ST_CTS_ADT_TM_MAIN → user_action-number).
 * The server upper-cases only the path segment — the body is used as sent.
 * Underneath it is TR_MERGE_REQUESTS: the source request's tasks and objects
 * move to the target, and the source request is DELETED.
 *
 * Why a verdict and not just "the POST returned 200": a merge has a
 * self-describing end state — every task of the source is now a task of the
 * target, and the source no longer exists. A success sentence that has not
 * looked at that state is exactly the "cannot tell success from vacuum" defect
 * class (CLAUDE.md), so the sentence is derived from what was observed.
 */

export const TRANSPORT_NUMBER_PATTERN = /^[A-Z0-9]{3}K[0-9]{6}$/;

export const MERGE_CONTENT_TYPE =
  'application/vnd.sap.adt.transportorganizer.v1+xml';

export function normaliseTransportNumber(value: unknown): string {
  return typeof value === 'string' ? value.trim().toUpperCase() : '';
}

export function buildMergeTransportXml(target: string): string {
  // tm:useraction is not read by the server (the action comes from the URL);
  // it is sent to match the other tm:root user-action bodies.
  return `<?xml version="1.0" encoding="ASCII"?><tm:root xmlns:tm="http://www.sap.com/cts/adt/tm" tm:number="${target}" tm:useraction="merge"/>`;
}

export type SourceStateAfter = 'gone' | 'present' | 'unknown';

export type MergeVerdict = 'merged' | 'not_merged' | 'unverified';

export interface MergeObservation {
  /** Task numbers the source request had BEFORE the merge. */
  sourceTasksBefore: string[];
  /** Task numbers the target has AFTER the merge; null = the read failed. */
  targetTasksAfter: string[] | null;
  /** Whether the source request still exists after the merge. */
  sourceAfter: SourceStateAfter;
}

export interface MergeJudgement {
  verdict: MergeVerdict;
  moved_tasks: string[];
  missing_tasks: string[];
  reason: string;
}

export function judgeMerge(obs: MergeObservation): MergeJudgement {
  const before = obs.sourceTasksBefore.map(normaliseTransportNumber);

  if (obs.sourceAfter === 'present') {
    return {
      verdict: 'not_merged',
      moved_tasks: [],
      missing_tasks: before,
      reason:
        'The source request still exists after the merge call — TR_MERGE_REQUESTS deletes the source on success.',
    };
  }

  if (obs.targetTasksAfter === null) {
    return {
      verdict: 'unverified',
      moved_tasks: [],
      missing_tasks: [],
      reason:
        'The merge call returned without error, but the target could not be read back to confirm it.',
    };
  }

  const after = new Set(obs.targetTasksAfter.map(normaliseTransportNumber));
  const moved = before.filter((t) => after.has(t));
  const missing = before.filter((t) => !after.has(t));

  if (missing.length > 0) {
    return {
      verdict: 'not_merged',
      moved_tasks: moved,
      missing_tasks: missing,
      reason: `Task(s) ${missing.join(', ')} of the source are not under the target after the merge.`,
    };
  }

  if (obs.sourceAfter === 'gone') {
    return {
      verdict: 'merged',
      moved_tasks: moved,
      missing_tasks: [],
      reason:
        before.length > 0
          ? 'Every task of the source is now under the target, and the source request no longer exists.'
          : 'The source had no tasks; the source request no longer exists.',
    };
  }

  // sourceAfter === 'unknown'
  if (before.length > 0) {
    return {
      verdict: 'merged',
      moved_tasks: moved,
      missing_tasks: [],
      reason:
        'Every task of the source is now under the target (whether the source request was deleted could not be read).',
    };
  }
  return {
    verdict: 'unverified',
    moved_tasks: [],
    missing_tasks: [],
    reason:
      'The source had no tasks to trace and its existence after the merge could not be read.',
  };
}

export function mergeSentence(
  source: string,
  target: string,
  judgement: MergeJudgement,
): string {
  switch (judgement.verdict) {
    case 'merged':
      return `Transport ${source} merged into ${target}. ${judgement.reason}`;
    case 'not_merged':
      return `Transport ${source} was NOT merged into ${target}. ${judgement.reason}`;
    default:
      return `Merge of ${source} into ${target} is UNVERIFIED. ${judgement.reason} Check with GetTransport ${target}.`;
  }
}
