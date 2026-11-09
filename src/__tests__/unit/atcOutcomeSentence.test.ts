/**
 * "No findings" may only be said about objects that were CHECKED (round 5, R5-D1).
 *
 * A reporting project ran ATC over what they had just built — 4 data elements,
 * 3 CDS abstract entities, 1 program — and only the program came back. The other
 * seven produced objects_checked 0, an empty object list, and the sentence
 * "ATC run completed with no findings". That sentence is a claim about quality;
 * what happened is that nothing was examined. They were one careless reading
 * away from writing "the 4 new data elements pass ATC" into a handover — their
 * false statement, sourced from this tool's message string.
 *
 * Same family as R4-D1 and the round-2 false zeros: the structured field was
 * honest (objects_checked: 0) and the prose was not, and prose is what gets
 * read.
 */

import { describeAtcOutcome } from '../../handlers/system/readonly/handleRunAtc';

const CLEAN_CLAIM = /no findings/i;

describe('describeAtcOutcome', () => {
  it('THE RULE: never says "no findings" when nothing was checked', () => {
    const sentence = describeAtcOutcome(3, 0, 3, 0);
    expect(sentence).not.toMatch(CLEAN_CLAIM);
    expect(sentence).toMatch(/NOT A CLEAN RESULT/);
    expect(sentence).toContain('3 requested object(s)');
    expect(sentence).toMatch(/objects_not_checked/);
  });

  it('no requested count, no findings, nothing checked — still refuses the claim', () => {
    // Exhaustive over the shapes a zero-check run can take: none may claim clean.
    for (const requested of [1, 2, 8]) {
      for (const findings of [0, 5]) {
        expect(
          describeAtcOutcome(requested, 0, requested, findings),
        ).not.toMatch(CLEAN_CLAIM);
      }
    }
  });

  it('says "no findings" only when objects really were checked', () => {
    const sentence = describeAtcOutcome(1, 1, 0, 0);
    expect(sentence).toMatch(CLEAN_CLAIM);
    expect(sentence).toContain('1 object(s)');
  });

  it('a PARTIAL run says what the result does not cover', () => {
    const sentence = describeAtcOutcome(8, 1, 7, 37);
    expect(sentence).toContain('37 finding(s)');
    expect(sentence).toMatch(
      /7 of the 8 requested object\(s\) were NOT checked/,
    );
    expect(sentence).toMatch(/says nothing about them/);
  });

  it('a partial run with zero findings must not read as a clean bill of health', () => {
    // The dangerous shape: something was checked and was clean, while most of
    // what was asked for was never opened.
    const sentence = describeAtcOutcome(8, 1, 7, 0);
    expect(sentence).toMatch(CLEAN_CLAIM); // true of the one object that ran
    expect(sentence).toMatch(/NOT checked/); // and immediately qualified
  });

  it('reports the priority filter without letting it hide the whole-run count', () => {
    const sentence = describeAtcOutcome(1, 8, 0, 89, 20, 2);
    expect(sentence).toContain('89 finding(s)');
    expect(sentence).toContain('20 at priority <= 2');
  });

  it('a fully checked run says nothing about unchecked objects', () => {
    expect(describeAtcOutcome(1, 8, 0, 79)).not.toMatch(/NOT checked/);
  });

  it('a PACKAGE run names the types examined and refuses to speak for the package', () => {
    // A package expands into its members, so "8 object(s)" reads as though the
    // package was covered. The reporter measured 2 checked out of 74 on a real
    // package and had "priority 2 = 0" in a handover for weeks — a claim that
    // covered six DCL access controls ATC had never opened.
    const sentence = describeAtcOutcome(1, 8, 0, 79, undefined, undefined, [
      'CLAS',
    ]);
    expect(sentence).toContain('of type(s) CLAS');
    expect(sentence).toMatch(/NOT looked at/);
    expect(sentence).toMatch(/not a statement about the whole package/);
  });

  it('a package run that checked nothing still leads with the not-clean sentence', () => {
    const sentence = describeAtcOutcome(1, 0, 1, 0, undefined, undefined, []);
    expect(sentence).toMatch(/NOT A CLEAN RESULT/);
    expect(sentence).not.toMatch(/no findings/i);
  });
});
