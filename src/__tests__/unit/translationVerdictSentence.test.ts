/**
 * The success sentence may claim only what the guard actually ran (round 4, R4-D1).
 *
 * `UpdateMessage language` verifies itself against T100 and refuses to report
 * success if the master-language row moved. That guard is the entire value of
 * the parameter — but the SUMMARY sentence used to be a constant, so on the
 * calls where the guard could not run it still said "the EN-language text was
 * verified unchanged" while `warnings` in the same response said the
 * verification had failed.
 *
 * Measured by a reporting project across 109 consecutive translation writes: 5
 * of them (4.6%) came back with that contradiction. The writes were all correct;
 * the reporting was not. Anyone reading `message` — a log line, a summary, an
 * agent grepping for the sentence — got an assurance that was never earned.
 *
 * These tests pin the rule: "verified unchanged" appears if and only if the
 * master row was actually compared, and a response carrying warnings always
 * points at them from the sentence itself.
 */

import {
  describeTranslation,
  type MasterCheck,
} from '../../handlers/messageclass/high/editMessageCore';

const CLAIM = /verified unchanged/i;

describe('describeTranslation', () => {
  it('claims verification only when the guard compared before and after', () => {
    const sentence = describeTranslation(
      'ZMY_MSGCLASS',
      '059',
      'ZH',
      'EN',
      'verified_unchanged',
      0,
    );
    expect(sentence).toMatch(CLAIM);
    expect(sentence).toContain('EN-language text');
    expect(sentence).toContain('ZH');
  });

  it('shape A — the T100 read failed: says so, and never claims verification', () => {
    const sentence = describeTranslation(
      'ZMY_MSGCLASS',
      '059',
      'ZH',
      'EN',
      'not_verified',
      1,
    );
    expect(sentence).not.toMatch(CLAIM);
    expect(sentence).toMatch(/could NOT be verified/);
    expect(sentence).toMatch(/GetSqlQuery/);
  });

  it('shape B — only the before-read failed: reports, does not prove', () => {
    const sentence = describeTranslation(
      'ZMY_MSGCLASS',
      '078',
      'ZH',
      'EN',
      'not_proven',
      1,
    );
    expect(sentence).not.toMatch(CLAIM);
    expect(sentence).toMatch(/as it stands now, not proven unchanged/);
  });

  it('NO degraded state may ever produce the claim — the whole rule, exhaustively', () => {
    const degraded: MasterCheck[] = ['not_verified', 'not_proven'];
    for (const check of degraded) {
      for (const warningCount of [0, 1, 5]) {
        expect(
          describeTranslation(
            'ZMY_MSGCLASS',
            '001',
            'ZH',
            'EN',
            check,
            warningCount,
          ),
        ).not.toMatch(CLAIM);
      }
    }
  });

  it('a response with warnings points at them from the sentence', () => {
    // The reporter's proposed rule was "no warning present" as a precondition
    // for the claim. That is too strong: an unrelated warning (SAP truncated the
    // text at 73 characters) does not invalidate a master-row comparison that
    // really happened. The honest version keeps the claim accurate AND stops the
    // sentence from being read alone.
    const withWarning = describeTranslation(
      'ZMY_MSGCLASS',
      '001',
      'ZH',
      'EN',
      'verified_unchanged',
      1,
    );
    expect(withWarning).toMatch(CLAIM);
    expect(withWarning).toMatch(/See warnings\./);

    const clean = describeTranslation(
      'ZMY_MSGCLASS',
      '001',
      'ZH',
      'EN',
      'verified_unchanged',
      0,
    );
    expect(clean).not.toMatch(/See warnings/);
  });

  it('falls back to "master" when the master language is unknown', () => {
    expect(
      describeTranslation(
        'ZMY_MSGCLASS',
        '001',
        'ZH',
        undefined,
        'not_verified',
        1,
      ),
    ).toContain('master-language text');
  });
});
