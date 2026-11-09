/**
 * MergeTransport: the body carries the TARGET as sent (the server does not
 * upper-case it), and the success sentence is derived from the observed end
 * state — never claimed in a state that contradicts or cannot show a merge.
 */

import {
  buildMergeTransportXml,
  judgeMerge,
  mergeSentence,
  normaliseTransportNumber,
  TRANSPORT_NUMBER_PATTERN,
} from '../../lib/transportMerge';

describe('buildMergeTransportXml', () => {
  it('puts the target in tm:number on tm:root', () => {
    const xml = buildMergeTransportXml('ABCK900002');
    expect(xml).toContain('<tm:root xmlns:tm="http://www.sap.com/cts/adt/tm"');
    expect(xml).toContain('tm:number="ABCK900002"');
    expect(xml).toContain('tm:useraction="merge"');
  });
});

describe('normaliseTransportNumber / pattern', () => {
  it('trims and upper-cases, so the body is never sent lower-case', () => {
    expect(normaliseTransportNumber(' abck900001 ')).toBe('ABCK900001');
    expect(normaliseTransportNumber(undefined)).toBe('');
  });
  it('accepts request numbers and rejects other strings', () => {
    expect(TRANSPORT_NUMBER_PATTERN.test('ABCK947349')).toBe(true);
    expect(TRANSPORT_NUMBER_PATTERN.test('ABCK94734')).toBe(false);
    expect(TRANSPORT_NUMBER_PATTERN.test('NOTATRANSPORT')).toBe(false);
  });
});

describe('judgeMerge', () => {
  it('merged: every source task is under the target and the source is gone', () => {
    const j = judgeMerge({
      sourceTasksBefore: ['ABCK900002'],
      targetTasksAfter: ['ABCK900010', 'abck900002'],
      sourceAfter: 'gone',
    });
    expect(j.verdict).toBe('merged');
    expect(j.moved_tasks).toEqual(['ABCK900002']);
  });

  it('not_merged when the source still exists, whatever the target shows', () => {
    const j = judgeMerge({
      sourceTasksBefore: ['ABCK900002'],
      targetTasksAfter: ['ABCK900002'],
      sourceAfter: 'present',
    });
    expect(j.verdict).toBe('not_merged');
  });

  it('not_merged when a source task is missing under the target', () => {
    const j = judgeMerge({
      sourceTasksBefore: ['ABCK900002', 'ABCK900003'],
      targetTasksAfter: ['ABCK900002'],
      sourceAfter: 'gone',
    });
    expect(j.verdict).toBe('not_merged');
    expect(j.missing_tasks).toEqual(['ABCK900003']);
  });

  it('unverified when the target cannot be read back', () => {
    const j = judgeMerge({
      sourceTasksBefore: ['ABCK900002'],
      targetTasksAfter: null,
      sourceAfter: 'gone',
    });
    expect(j.verdict).toBe('unverified');
  });

  it('a task-less source counts as merged only when it is seen to be gone', () => {
    expect(
      judgeMerge({
        sourceTasksBefore: [],
        targetTasksAfter: [],
        sourceAfter: 'gone',
      }).verdict,
    ).toBe('merged');
    expect(
      judgeMerge({
        sourceTasksBefore: [],
        targetTasksAfter: [],
        sourceAfter: 'unknown',
      }).verdict,
    ).toBe('unverified');
  });

  it('moved tasks are enough evidence when the source state is unknown', () => {
    expect(
      judgeMerge({
        sourceTasksBefore: ['ABCK900002'],
        targetTasksAfter: ['ABCK900002'],
        sourceAfter: 'unknown',
      }).verdict,
    ).toBe('merged');
  });
});

describe('mergeSentence never claims a merge it did not observe', () => {
  const states = [
    { sourceAfter: 'present' as const, targetTasksAfter: ['ABCK900002'] },
    { sourceAfter: 'gone' as const, targetTasksAfter: null },
    { sourceAfter: 'unknown' as const, targetTasksAfter: [] },
    { sourceAfter: 'gone' as const, targetTasksAfter: [] },
  ];
  it.each(states)('%o', (s) => {
    const j = judgeMerge({ sourceTasksBefore: ['ABCK900002'], ...s });
    expect(j.verdict).not.toBe('merged');
    const sentence = mergeSentence('ABCK900001', 'ABCK900009', j);
    expect(sentence).not.toMatch(/^Transport ABCK900001 merged into/);
  });
});
