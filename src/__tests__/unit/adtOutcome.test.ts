/**
 * Regression tests for the "silent false success" family.
 *
 * Each case below encodes a real observed failure: ADT answered HTTP 200 while
 * REFUSING the operation, and the handler reported success because it looked at
 * the wrong signal (the activation-run flags, or the caller's own request
 * parameter, or merely that a response object existed).
 */

import { buildDeletionXml, parseDeletionResult } from '../../lib/adtDeletion';
import {
  classifyAdtMessages,
  describeActivation,
  evaluateActivation,
  formatAdtMessages,
  isErrorMessage,
  isWarningMessage,
} from '../../lib/adtMessages';
import type { AxiosResponse } from '../../lib/utils';

const resp = (data: string, status = 200): AxiosResponse =>
  ({ data, status }) as AxiosResponse;

describe('message severity classification', () => {
  it.each([
    'E',
    'e',
    'A',
    'X',
    'error',
    'ABORT',
  ])('treats type %s as an error', (type) => {
    expect(isErrorMessage({ type, text: 'x' })).toBe(true);
  });

  it.each(['W', 'w', 'warning'])('treats type %s as a warning', (type) => {
    expect(isWarningMessage({ type, text: 'x' })).toBe(true);
    expect(isErrorMessage({ type, text: 'x' })).toBe(false);
  });

  it.each([
    'I',
    'S',
    'info',
    '',
    undefined,
  ])('treats type %s as neither error nor warning', (type) => {
    expect(isErrorMessage({ type: type as any, text: 'x' })).toBe(false);
    expect(isWarningMessage({ type: type as any, text: 'x' })).toBe(false);
  });

  it('splits a mixed list', () => {
    const { errors, warnings, infos } = classifyAdtMessages([
      { type: 'E', text: 'boom' },
      { type: 'W', text: 'careful' },
      { type: 'I', text: 'fyi' },
      { type: 'E', text: 'boom2' },
    ]);
    expect(errors.map((m) => m.text)).toEqual(['boom', 'boom2']);
    expect(warnings.map((m) => m.text)).toEqual(['careful']);
    expect(infos.map((m) => m.text)).toEqual(['fyi']);
  });

  it('survives null/undefined input', () => {
    expect(classifyAdtMessages(undefined).errors).toEqual([]);
    expect(classifyAdtMessages(null).warnings).toEqual([]);
  });

  it('formats messages with their severity prefix', () => {
    expect(
      formatAdtMessages([
        { type: 'E', text: 'no TDEVC record' },
        { type: 'E', text: 'no TADIR entry' },
      ]),
    ).toBe('[E] no TDEVC record; [E] no TADIR entry');
  });
});

describe('evaluateActivation', () => {
  it('FAILS when SAP rejected the object even though the run executed', () => {
    // The exact live shape: the activation RUN completed (activated/checked
    // true) while the individual objects were refused. The old test
    // `activated && checked` reported this as success.
    const outcome = evaluateActivation({
      activated: true,
      checked: true,
      generated: true,
      messages: [
        { type: 'E', text: 'Table Y10207_TA1 was not activated' },
        { type: 'E', text: 'Table type Y10207_TT1 was not activated' },
      ],
    });
    expect(outcome.success).toBe(false);
    expect(outcome.errors).toHaveLength(2);
    // Raw SAP flags are passed through untouched.
    expect(outcome.activated).toBe(true);
    expect(outcome.checked).toBe(true);
    expect(describeActivation(outcome, 'TABL Y10207_TA1')).toMatch(
      /Activation FAILED for TABL Y10207_TA1: 2 error\(s\)/,
    );
  });

  it('succeeds with warnings only', () => {
    const outcome = evaluateActivation({
      activated: true,
      checked: true,
      generated: true,
      messages: [{ type: 'W', text: 'preserveKey is deprecated' }],
    });
    expect(outcome.success).toBe(true);
    expect(outcome.warnings).toHaveLength(1);
    expect(describeActivation(outcome, 'view ZV')).toMatch(
      /activated successfully \(1 warning\(s\)/,
    );
  });

  it('treats an already-active no-op as success, not failure', () => {
    // Re-activating an active object legitimately answers activated:false with
    // zero messages; that must not be reported as a failure.
    const outcome = evaluateActivation({
      activated: false,
      checked: false,
      generated: false,
      messages: [],
    });
    expect(outcome.success).toBe(true);
    expect(describeActivation(outcome, 'class ZCL_X')).toMatch(
      /already active/,
    );
  });

  it('tolerates a malformed raw result', () => {
    const outcome = evaluateActivation({} as any);
    expect(outcome.success).toBe(true);
    expect(outcome.messages).toEqual([]);
  });
});

describe('deletion result parsing', () => {
  it('reports isDeleted=false with EVERY message (multi-message failure)', () => {
    // Real orphaned-object shape: SAP returns a message ARRAY. Reading only the
    // first message is what collapsed real failures into "Deletion failed".
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<del:deletionResult xmlns:del="http://www.sap.com/adt/deletion">
  <del:object del:isDeleted="false">
    <del:message del:type="E"><del:text>Structure Y10207_0821S1 is still used</del:text></del:message>
    <del:message del:type="E"><del:text>Field WAERS references the object itself</del:text></del:message>
  </del:object>
</del:deletionResult>`;
    const r = parseDeletionResult(resp(xml));
    expect(r.isDeleted).toBe(false);
    expect(r.messages).toHaveLength(2);
    expect(r.errors).toHaveLength(2);
    expect(formatAdtMessages(r.messages)).toContain('is still used');
    expect(formatAdtMessages(r.messages)).toContain('references the object');
  });

  it('reports a successful deletion', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<del:deletionResult xmlns:del="http://www.sap.com/adt/deletion">
  <del:object del:isDeleted="true"/>
</del:deletionResult>`;
    const r = parseDeletionResult(resp(xml));
    expect(r.isDeleted).toBe(true);
    expect(r.messages).toEqual([]);
  });

  it('captures a SINGLE message (not only arrays)', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<del:deletionResult xmlns:del="http://www.sap.com/adt/deletion">
  <del:object del:isDeleted="false">
    <del:message del:type="E"><del:text>Object is locked in request ABCK900011</del:text></del:message>
  </del:object>
</del:deletionResult>`;
    const r = parseDeletionResult(resp(xml));
    expect(r.isDeleted).toBe(false);
    expect(r.messages.map((m) => m.text)).toEqual([
      'Object is locked in request ABCK900011',
    ]);
  });

  it('parses a deletion CHECK response with the same shape', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<del:checkResult xmlns:del="http://www.sap.com/adt/deletion">
  <del:object del:isDeleted="false">
    <del:message del:type="W"><del:text>Object is used in 3 places</del:text></del:message>
  </del:object>
</del:checkResult>`;
    const r = parseDeletionResult(resp(xml));
    expect(r.messages).toHaveLength(1);
    expect(r.errors).toHaveLength(0);
  });

  it('does not crash on a non-XML body', () => {
    const r = parseDeletionResult(resp('not xml at all'));
    expect(r.isDeleted).toBe(false);
    expect(r.messages).toEqual([]);
  });

  it('builds a deletion body with and without a transport', () => {
    const withT = buildDeletionXml('/sap/bc/adt/ddic/structures/zs_x', 'DM2K1');
    expect(withT).toContain('<del:transportNumber>DM2K1</del:transportNumber>');
    expect(withT).toContain('adtcore:uri="/sap/bc/adt/ddic/structures/zs_x"');

    const withoutT = buildDeletionXml('/sap/bc/adt/ddic/structures/zs_x');
    expect(withoutT).toContain('<del:transportNumber/>');

    // Whitespace-only transport counts as "none".
    expect(
      buildDeletionXml('/sap/bc/adt/ddic/structures/zs_x', '   '),
    ).toContain('<del:transportNumber/>');
  });
});
