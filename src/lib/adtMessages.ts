/**
 * ADT response-message classification and real-outcome evaluation.
 *
 * WHY THIS EXISTS — the "silent false success" family of bugs:
 * ADT frequently REFUSES an operation while still answering HTTP 200; the
 * refusal lives only in the response messages. Handlers that reported success
 * from the HTTP status (or, worse, by echoing the caller's own `activate: true`
 * request flag) therefore announced success for operations SAP had rejected.
 * The failure then resurfaced much later as an unrelated-looking dependency
 * error on the object that was never really created/activated/deleted.
 *
 * Every Create/Update/Delete/Activate handler funnels its raw ADT result
 * through this module so the reported outcome is SAP's, never the request's.
 *
 * Concretely observed on a live system (SAP_BASIS 7.56):
 *   - group activation returned `activationExecuted="true"` (= the activation
 *     RUN completed) together with `<msg type="E">… was not activated</msg>`
 *     for the individual objects, so `activated && checked` was a true-ish
 *     value for a failed activation;
 *   - `UpdateStructure(activate:true)` reported success for 9 of 9 DDL variants
 *     while only 2 actually activated.
 */

/** A single ADT response message, as parsed from `<msg>` / `<del:message>`. */
export interface AdtResponseMessage {
  type?: string;
  text: string;
  line?: number | string;
  column?: number | string;
}

/**
 * SAP message-type codes that mean "the operation did not succeed".
 * `A` = abort, `X` = exit/short dump, `E` = error. The long spellings appear in
 * some ADT payloads and in our own synthesized messages.
 */
const ERROR_TYPES = new Set(['e', 'a', 'x', 'error', 'abort', 'fatal']);
const WARNING_TYPES = new Set(['w', 'warning']);

function normalizeType(type: unknown): string {
  return String(type ?? '')
    .trim()
    .toLowerCase();
}

/** True when a message means the operation failed (error/abort/dump). */
export function isErrorMessage(msg: AdtResponseMessage): boolean {
  return ERROR_TYPES.has(normalizeType(msg?.type));
}

/** True when a message is a warning (operation may still have succeeded). */
export function isWarningMessage(msg: AdtResponseMessage): boolean {
  return WARNING_TYPES.has(normalizeType(msg?.type));
}

/** Split messages by severity. Anything not error/warning counts as info. */
export function classifyAdtMessages(
  messages: readonly AdtResponseMessage[] | undefined | null,
): {
  errors: AdtResponseMessage[];
  warnings: AdtResponseMessage[];
  infos: AdtResponseMessage[];
} {
  const errors: AdtResponseMessage[] = [];
  const warnings: AdtResponseMessage[] = [];
  const infos: AdtResponseMessage[] = [];
  for (const msg of messages ?? []) {
    if (!msg) continue;
    if (isErrorMessage(msg)) errors.push(msg);
    else if (isWarningMessage(msg)) warnings.push(msg);
    else infos.push(msg);
  }
  return { errors, warnings, infos };
}

/**
 * True when a message carries something a reader can act on.
 *
 * A message whose `text` is empty renders to `[E] ` — a type marker and
 * nothing else — which is how a failure sentence ends up with nothing after
 * its colon. Counting those as content is what made an unexplained refusal
 * indistinguishable from an explained one.
 */
export function hasReadableText(msg: AdtResponseMessage): boolean {
  return String(msg?.text ?? '').trim().length > 0;
}

/** Render messages as `[E] text; [W] text` for a single-line error string. */
export function formatAdtMessages(
  messages: readonly AdtResponseMessage[],
): string {
  return messages
    .filter(hasReadableText)
    .map((m) => {
      const t = String(m?.type ?? '').trim();
      return t ? `[${t}] ${m.text}` : m.text;
    })
    .filter(Boolean)
    .join('; ');
}

/**
 * How many DISTINCT warnings a result lists before it summarises the rest.
 *
 * WHY (2026-10-27, live on S4D): activating the VBAP append ZZVBAP regenerated
 * every SAP CDS view on VBAP and returned 1638 W-level messages — none about
 * the added field, 249 of them one identical sentence. Dumped whole into
 * `activation_warnings` and `message` they made a 255 KB result the client
 * could not display. The count is the signal; the texts are a sample.
 */
export const WARNING_DISPLAY_LIMIT = 20;

/** Distinct readable messages in first-seen order, with how often each came. */
function groupMessages(
  messages: readonly AdtResponseMessage[],
): { type: string; text: string; count: number }[] {
  const groups = new Map<
    string,
    { type: string; text: string; count: number }
  >();
  for (const m of messages) {
    if (!hasReadableText(m)) continue;
    const type = String(m?.type ?? '').trim();
    const key = `${type}\u0000${m.text}`;
    const group = groups.get(key);
    if (group) group.count++;
    else groups.set(key, { type, text: m.text, count: 1 });
  }
  return [...groups.values()];
}

function withCount(text: string, count: number): string {
  return count > 1 ? `${text} (x${count})` : text;
}

/**
 * `activation_warnings` lines (`W: text`): identical warnings folded into one
 * line with a count, at most `limit` distinct lines, then one line saying how
 * many distinct warnings were left out and how many came in total.
 */
export function activationWarningLines(
  warnings: readonly AdtResponseMessage[],
  limit: number = WARNING_DISPLAY_LIMIT,
): string[] {
  const groups = groupMessages(warnings);
  const lines = groups
    .slice(0, limit)
    .map((g) => withCount(g.type ? `${g.type}: ${g.text}` : g.text, g.count));
  if (groups.length > limit) {
    lines.push(
      `… ${groups.length - limit} more distinct warning(s) not shown (${warnings.length} in total)`,
    );
  }
  return lines;
}

/**
 * `formatAdtMessages` for lists that can be huge: duplicates folded with a
 * count, at most `limit` distinct entries, then the size of the remainder.
 */
export function formatAdtMessagesCapped(
  messages: readonly AdtResponseMessage[],
  limit: number,
): string {
  const groups = groupMessages(messages);
  const parts = groups
    .slice(0, limit)
    .map((g) => withCount(g.type ? `[${g.type}] ${g.text}` : g.text, g.count));
  if (groups.length > limit) {
    parts.push(
      `… ${groups.length - limit} more distinct (${messages.length} in total)`,
    );
  }
  return parts.join('; ');
}

/** Distinct warnings quoted inside a one-line `message`. */
const MESSAGE_WARNING_LIMIT = 3;

/** Raw shape returned by `parseActivationResponse` / `activateAdtObjects`. */
export interface RawActivationResult {
  activated: boolean;
  checked: boolean;
  generated: boolean;
  messages: AdtResponseMessage[];
}

/** SAP's activation outcome, with `success` derived from the messages. */
export interface ActivationOutcome extends RawActivationResult {
  /**
   * TRUE only when SAP raised no error-level message. Note this is deliberately
   * NOT `activated && checked`: those flags describe whether the activation RUN
   * and CHECK were executed, not whether each object survived them — a rejected
   * object still comes back with `activationExecuted="true"`.
   */
  success: boolean;
  errors: AdtResponseMessage[];
  warnings: AdtResponseMessage[];
}

/**
 * Evaluate a raw activation result: any error-level message ⇒ not successful.
 *
 * The raw `activated` / `checked` / `generated` flags are passed through
 * unchanged so callers still see exactly what SAP reported (a no-op activation
 * of an already-active object legitimately answers `activated: false` with no
 * messages, and must not be mistaken for a failure).
 */
export function evaluateActivation(
  raw: RawActivationResult,
): ActivationOutcome {
  const { errors, warnings } = classifyAdtMessages(raw?.messages);
  return {
    activated: !!raw?.activated,
    checked: !!raw?.checked,
    generated: !!raw?.generated,
    messages: raw?.messages ?? [],
    errors,
    warnings,
    success: errors.length === 0,
  };
}

/**
 * One-line summary of an activation outcome, suitable for a tool `message`.
 * Failures lead with "FAILED" plus the reasons, so a caller skimming the
 * response cannot mistake a rejected activation for a successful one.
 */
export function describeActivation(
  outcome: ActivationOutcome,
  subject: string,
): string {
  if (!outcome.success) {
    const reasons = formatAdtMessages(outcome.errors);
    if (reasons) {
      return `Activation FAILED for ${subject}: ${outcome.errors.length} error(s) — ${reasons}`;
    }
    // NOTHING TO SAY IS ITSELF THE FINDING. Reported live twice on
    // ActivateServiceDefinition (DM2/310, 2026-09-11): the failure branch was
    // taken and the sentence ended at the colon, because the error-level
    // messages carried no text. Both times an immediate retry of byte-identical
    // source activated clean — so the caller's next move differs completely
    // from the one an explained rejection calls for, and the old sentence gave
    // them no way to tell which they had.
    const warn = formatAdtMessagesCapped(
      outcome.warnings,
      MESSAGE_WARNING_LIMIT,
    );
    return (
      `Activation FAILED for ${subject}, and SAP GAVE NO REASON — ` +
      `${outcome.errors.length} error-level message(s) came back with no text. ` +
      'An unexplained failure is not the same as a rejection: this has been ' +
      'observed to be transient, and retrying the SAME source has activated ' +
      'cleanly. Retry once before treating the object as broken' +
      (warn ? `. SAP did attach warnings: ${warn}` : '.')
    );
  }
  if (!outcome.activated && outcome.messages.length === 0) {
    return `${subject} was already active — SAP reported nothing to activate (no-op)`;
  }
  const shown = groupMessages(outcome.warnings).length;
  const warn = outcome.warnings.length
    ? ` (${outcome.warnings.length} warning(s): ${formatAdtMessagesCapped(outcome.warnings, MESSAGE_WARNING_LIMIT)}` +
      (shown > MESSAGE_WARNING_LIMIT ? ' — see activation_warnings)' : ')')
    : '';
  return `${subject} activated successfully${warn}`;
}

/**
 * Build the `activation` block of a handler response.
 *
 * WHY THIS EXISTS: the raw SAP flags and the verdict routinely disagree, and
 * exposing them side by side without explanation trains callers to ignore both.
 * Observed live:
 *
 *   ActivateClass ZCL_MY_CLASS
 *   -> { activation: { activated: false, checked: false, generated: true },
 *        errors: [], message: "Class ZCL_MY_CLASS activated successfully" }
 *
 * The class really was active. `activated:false` with no messages means SAP had
 * NOTHING to activate — a no-op, which is a success. The flags describe whether
 * the activation RUN executed, not whether the object survived it; SAP sets
 * `activationExecuted="true"` even for objects it rejected.
 *
 * So the block keeps the raw flags (they are useful diagnostics) but leads with
 * one authoritative boolean and explains the disagreement whenever there is one.
 * A caller should read `succeeded` and nothing else.
 */
export function activationFlags(
  raw: { activated?: boolean; checked?: boolean; generated?: boolean },
  outcome: ActivationOutcome,
): Record<string, unknown> {
  const flags: Record<string, unknown> = {
    /** THE VERDICT. Derived from SAP's messages, not from the flags below. */
    succeeded: outcome.success,
    activated: raw.activated,
    checked: raw.checked,
    generated: raw.generated,
  };
  if (outcome.success && raw.activated !== true) {
    flags.note =
      'activated is not true, but SAP reported no errors: there was nothing to activate ' +
      '(the object was already active). Read `succeeded`.';
  } else if (!outcome.success && raw.activated === true) {
    flags.note =
      'activated:true only means the activation RUN executed — SAP reported errors, so the ' +
      'object was NOT activated. Read `succeeded`.';
  }
  return flags;
}
