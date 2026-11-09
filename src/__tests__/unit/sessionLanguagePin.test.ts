/**
 * A connection cannot change the language it writes in (round 5).
 *
 * MEASURED on S/4HANA 2023 FPS02, through the compiled handlers, with T100 rows
 * as the verdict rather than an HTTP status: the FIRST message-class write on a
 * connection fixes the language for every later write on that connection, ACROSS
 * OBJECTS, and `sap-language` on the later requests does not change it.
 *
 *   step 1  write(ZH)                   -> SPRSL '1'   correct
 *   step 2  write(no language, i.e. EN) -> SPRSL '1'   WRONG
 *
 * Both directions corrupt, and the second is worse: an ordinary edit silently
 * writing a translation row, on the path every caller uses.
 *
 * Nothing we can send resets it — cookie jar cleared, `sap-adt-connection-id`
 * rotated, an explicit stateless header, and an ICF logoff with a re-establishing
 * GET were all tried and all still wrote the old row. So the write is REFUSED
 * rather than attempted: shipping a reset that does not reset would be the
 * "looks accepted, does the wrong thing" shape this project keeps removing.
 */

import {
  checkSessionLanguage,
  defaultWriteLanguage,
  forgetSessionLanguage,
} from '../../lib/sessionLanguage';

const conn = () => ({}) as any;

describe('checkSessionLanguage', () => {
  it('allows the first write and remembers its language', () => {
    const c = conn();
    const v = checkSessionLanguage(c, 'ZH');
    expect(v.ok).toBe(true);
    expect(v.pinned).toBe('ZH');
  });

  it('allows a BATCH in one language — the case that provably works', () => {
    const c = conn();
    for (let i = 0; i < 5; i++) {
      expect(checkSessionLanguage(c, 'ZH').ok).toBe(true);
    }
  });

  it('REFUSES a plain edit after a translation write — the silent-corruption direction', () => {
    const c = conn();
    checkSessionLanguage(c, 'ZH');
    const v = checkSessionLanguage(c, undefined);
    expect(v.ok).toBe(false);
    expect(v.pinned).toBe('ZH');
    // The message has to name the way out, not just the problem.
    expect(v.reason).toMatch(/restart/i);
    expect(v.reason).toContain('ZH');
  });

  it('REFUSES a translation write after a plain write', () => {
    const c = conn();
    checkSessionLanguage(c, undefined);
    expect(checkSessionLanguage(c, 'ZH').ok).toBe(false);
  });

  it('treats an omitted language as the default write language, not as "any"', () => {
    const c = conn();
    checkSessionLanguage(c, undefined);
    // Naming the default explicitly must be the SAME commitment, not a switch.
    expect(checkSessionLanguage(c, defaultWriteLanguage()).ok).toBe(true);
    expect(checkSessionLanguage(c, 'DE').ok).toBe(false);
  });

  it('is case-insensitive about the language code', () => {
    const c = conn();
    checkSessionLanguage(c, 'zh');
    expect(checkSessionLanguage(c, 'ZH').ok).toBe(true);
  });

  it('is per connection — a different connection is unaffected', () => {
    const a = conn();
    const b = conn();
    checkSessionLanguage(a, 'ZH');
    // A fresh connection is the one thing that provably works, so it must not
    // inherit another connection's commitment.
    expect(checkSessionLanguage(b, undefined).ok).toBe(true);
  });

  it('an unknown history is ALLOWED, not refused', () => {
    // Writes through the adt-clients update paths never reach this module, so
    // "we have seen no write" is not proof that none happened. Refusing here
    // would break every first translation write; the T100 guard covers the
    // residual case instead.
    const c = conn();
    forgetSessionLanguage(c);
    expect(checkSessionLanguage(c, 'ZH').ok).toBe(true);
  });
});
