/**
 * F-13: a failure sentence must never end at the colon.
 *
 * `ActivateServiceDefinition` returned `"Activation FAILED for Service
 * definition X: "` with nothing after it, twice on DM2/310 (2026-09-11), both
 * times resolved by an immediate retry of byte-identical source. The failure
 * branch was taken — so SAP did send error-level messages — but those messages
 * carried no text, and the formatter rendered them to nothing.
 *
 * The caller's next move differs completely between the two readings: a real
 * rejection means fix the source, an unexplained one means retry. The old
 * sentence was identical for both, which is the vacuum class this repository
 * tracks, reached from a direction none of the earlier instances took: not a
 * missing verdict, but a verdict whose EXPLANATION was empty.
 */

import {
  type AdtResponseMessage,
  describeActivation,
  evaluateActivation,
  formatAdtMessages,
  hasReadableText,
} from '../../lib/adtMessages';

const outcomeFrom = (messages: AdtResponseMessage[]) =>
  evaluateActivation({
    activated: false,
    checked: true,
    generated: false,
    messages,
  });

describe('formatAdtMessages', () => {
  it('renders nothing for a message that carries no text', () => {
    expect(formatAdtMessages([{ type: 'E', text: '' }])).toBe('');
    expect(formatAdtMessages([{ type: 'E', text: '   ' }])).toBe('');
  });

  it('still renders the messages that do carry text, beside ones that do not', () => {
    expect(
      formatAdtMessages([
        { type: 'E', text: '' },
        { type: 'E', text: 'Row type is not active' },
      ]),
    ).toBe('[E] Row type is not active');
  });

  it('hasReadableText is what decides it', () => {
    expect(hasReadableText({ type: 'E', text: '' })).toBe(false);
    expect(hasReadableText({ type: 'E', text: 'x' })).toBe(true);
  });
});

describe('describeActivation — a failure with no reason says so', () => {
  const empty = outcomeFrom([{ type: 'E', text: '' }]);

  it('is still a failure', () => {
    expect(empty.success).toBe(false);
  });

  it('never ends at the colon', () => {
    const sentence = describeActivation(empty, 'Service definition ZMY_SRVD');
    expect(sentence).not.toMatch(/:\s*$/);
  });

  it('says SAP gave no reason, and that a retry is the right next move', () => {
    const sentence = describeActivation(empty, 'Service definition ZMY_SRVD');
    expect(sentence).toContain('GAVE NO REASON');
    expect(sentence.toLowerCase()).toContain('retry');
  });

  it('surfaces warnings when they are the only content SAP sent', () => {
    const withWarning = outcomeFrom([
      { type: 'E', text: '' },
      { type: 'W', text: 'Deprecated annotation' },
    ]);
    expect(describeActivation(withWarning, 'View ZMY_VIEW')).toContain(
      'Deprecated annotation',
    );
  });

  it('an explained rejection is unchanged and does NOT claim a retry will help', () => {
    const explained = outcomeFrom([
      { type: 'E', text: 'Field IO_OUT is unknown' },
    ]);
    const sentence = describeActivation(explained, 'Class ZMY_CLASS');
    expect(sentence).toContain('Field IO_OUT is unknown');
    expect(sentence).not.toContain('GAVE NO REASON');
  });

  it('a success is unaffected', () => {
    const ok = outcomeFrom([]);
    expect(describeActivation(ok, 'Table ZMY_TABLE')).toContain(
      'already active',
    );
  });
});

describe('every Activate* handler routes its sentence through the shared verdict', () => {
  // The round-7 lesson, restated: a per-tool fix here comes back. 17 handlers
  // carried their own copy of the sentence; none may carry one again.
  const fs = require('node:fs') as typeof import('node:fs');
  const path = require('node:path') as typeof import('node:path');
  const root = path.resolve(__dirname, '../../handlers');

  const walk = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const full = path.join(dir, e.name);
      return e.isDirectory() ? walk(full) : full.endsWith('.ts') ? [full] : [];
    });

  const handlers = walk(root);

  it('scans a real corpus', () => {
    expect(handlers.length).toBeGreaterThan(100);
  });

  it('no handler builds its own "Activation FAILED" sentence', () => {
    const offenders = handlers.filter((f) =>
      fs.readFileSync(f, 'utf-8').includes('Activation FAILED for'),
    );
    expect(offenders).toEqual([]);
  });
});

/**
 * A multi-part `<msg>` must arrive as one sentence, not as fragments welded by
 * a comma.
 *
 * Measured on DM2/310 (2026-09-11): a CDS activation failure returned
 * `<shortText>` with two `<txt>` children, fast-xml-parser handed back an array
 * while the field is typed `string`, and every consumer stringified it
 * implicitly — producing `Activation was cancelled.,"The data source ..."`.
 * The reporter quoted it back in exactly that mangled form, which is how it was
 * found.
 */
describe('parseActivationResponse — multi-part message text', () => {
  const { parseActivationResponse } = require('../../lib/utils');

  const xml = (shortText: string) =>
    `<?xml version="1.0"?><chkl:messages xmlns:chkl="http://www.sap.com/abapxml/checklist">` +
    `<chkl:properties activationExecuted="true" checkExecuted="true"/>` +
    `<msg type="E" line="0">${shortText}</msg>` +
    `</chkl:messages>`;

  it('joins the parts into one sentence', () => {
    const res = parseActivationResponse(
      xml(
        '<shortText><txt>Activation was cancelled.</txt><txt>The data source does not exist or is not active</txt></shortText>',
      ),
    );
    expect(typeof res.messages[0].text).toBe('string');
    expect(res.messages[0].text).toBe(
      'Activation was cancelled. The data source does not exist or is not active',
    );
    // The exact regression: no comma welding the fragments together.
    expect(res.messages[0].text).not.toContain('.,');
  });

  it('leaves a single-part message exactly as it was', () => {
    const res = parseActivationResponse(
      xml('<shortText><txt>Unexpected word "0..*"</txt></shortText>'),
    );
    expect(res.messages[0].text).toBe('Unexpected word "0..*"');
  });

  it('reports an empty message as empty rather than inventing words for it', () => {
    const res = parseActivationResponse(
      xml('<shortText><txt></txt></shortText>'),
    );
    expect(res.messages[0].text).toBe('');
    // …which is what lets describeActivation say SAP gave no reason.
    const {
      evaluateActivation,
      describeActivation,
    } = require('../../lib/adtMessages');
    const outcome = evaluateActivation(res);
    expect(outcome.success).toBe(false);
    expect(describeActivation(outcome, 'View ZMY_VIEW')).toContain(
      'GAVE NO REASON',
    );
  });
});
