/**
 * Single-message editing of a message class.
 *
 * The point of these operations is that the caller supplies ONE message while
 * the other 108 are read from SAP and written back untouched — so the tests that
 * matter are the ones proving nothing else moves, and that the two modes cannot
 * be used to overwrite the wrong message.
 */

import {
  applyMessageEdit,
  buildMessageClassDocument,
  buildMessageElement,
  messageClassUri,
  normaliseMsgno,
  parseMasterLanguage,
  parseMessageEntries,
} from '../../lib/messageClassXml';

/** Trimmed from a real ZMCP_MSGDEL2 response on DM2/310. */
const CLASS_XML = `<?xml version="1.0" encoding="utf-8"?><mc:messageClass adtcore:responsible="SOME.USER" adtcore:masterLanguage="EN" adtcore:masterSystem="DM2" adtcore:name="ZMCP_MSGDEL2" adtcore:type="MSAG/N" adtcore:version="active" adtcore:description="probe" adtcore:language="EN" xmlns:mc="http://www.sap.com/adt/MessageClass" xmlns:adtcore="http://www.sap.com/adt/core"><adtcore:packageRef adtcore:uri="/sap/bc/adt/packages/%24tmp" adtcore:type="DEVC/K" adtcore:name="$TMP"/><mc:messages mc:msgno="001" mc:msgtext="one &amp; only" mc:selfexplainatory="true" mc:documented="false" adtcore:name=""><atom:link href="/x" xmlns:atom="http://www.w3.org/2005/Atom"/></mc:messages><mc:messages mc:msgno="002" mc:msgtext="two" mc:selfexplainatory="false" mc:documented="false" adtcore:name=""/><mc:messages mc:msgno="003" mc:selfexplainatory="true" mc:documented="false" adtcore:name=""/></mc:messageClass>`;

describe('normaliseMsgno', () => {
  it('zero-pads to three digits so "7" and "007" are one message', () => {
    expect(normaliseMsgno('7')).toBe('007');
    expect(normaliseMsgno(7)).toBe('007');
    expect(normaliseMsgno('007')).toBe('007');
    expect(normaliseMsgno(' 12 ')).toBe('012');
  });
});

describe('messageClassUri', () => {
  it('lower-cases the name', () => {
    expect(messageClassUri('ZMY_MSGCLASS')).toBe(
      '/sap/bc/adt/messageclass/zmy_msgclass',
    );
  });
});

describe('parseMasterLanguage', () => {
  it('reads adtcore:masterLanguage from the root, not adtcore:language', () => {
    // Real shape measured on DM2/310: masterLanguage EN while a ZH-session
    // read stamped adtcore:language="ZH". The baseline is EN.
    const zhSessionRead = CLASS_XML.replace(
      'adtcore:language="EN"',
      'adtcore:language="ZH"',
    );
    expect(parseMasterLanguage(zhSessionRead)).toBe('EN');
  });

  it('returns undefined when the root cannot be parsed', () => {
    expect(parseMasterLanguage('<nonsense/>')).toBeUndefined();
    expect(parseMasterLanguage('')).toBeUndefined();
  });
});

describe('parseMessageEntries', () => {
  it('returns self_explanatory as a real boolean, not "true"/"false"', () => {
    // GetMessageClass used to return the string, while UpdateMessageClass
    // declared a boolean, so the documented read-modify-resend loop did not
    // round-trip cleanly.
    const entries = parseMessageEntries(CLASS_XML);
    expect(entries.map((e) => e.self_explanatory)).toEqual([true, false, true]);
    for (const e of entries) expect(typeof e.self_explanatory).toBe('boolean');
  });

  it('decodes XML entities in the text', () => {
    expect(parseMessageEntries(CLASS_XML)[0].text).toBe('one & only');
  });

  it('treats a message with no msgtext attribute as empty text', () => {
    expect(parseMessageEntries(CLASS_XML)[2]).toEqual({
      msgno: '003',
      text: '',
      self_explanatory: true,
    });
  });
});

describe('buildMessageElement', () => {
  it('escapes the text', () => {
    const xml = buildMessageElement({
      msgno: '7',
      text: 'A & B "q" <t>',
      self_explanatory: true,
    });
    expect(xml).toContain('mc:msgno="007"');
    expect(xml).toContain('&amp;');
    expect(xml).toContain('&lt;t&gt;');
  });
});

describe('buildMessageClassDocument', () => {
  it('preserves the root element and the packageRef verbatim', () => {
    // These carry the namespaces, master language and package. Rebuilding them
    // from guesses is how a write silently loses attributes.
    const out = buildMessageClassDocument(CLASS_XML, [
      { msgno: '001', text: 'one', self_explanatory: true },
    ]);
    expect(out).toContain('adtcore:masterLanguage="EN"');
    expect(out).toContain('adtcore:masterSystem="DM2"');
    expect(out).toContain('adtcore:name="$TMP"');
    expect(out).toContain('<mc:messageClass');
    expect(out.match(/<\?xml/g)).toHaveLength(1);
  });

  it('writes the messages in number order', () => {
    const out = buildMessageClassDocument(CLASS_XML, [
      { msgno: '010', text: 'ten', self_explanatory: true },
      { msgno: '002', text: 'two', self_explanatory: true },
    ]);
    expect(parseMessageEntries(out).map((m) => m.msgno)).toEqual([
      '002',
      '010',
    ]);
  });

  it('refuses to build from an unparseable document', () => {
    // Better to fail than to write a rebuilt root over the real class.
    expect(() => buildMessageClassDocument('<nonsense/>', [])).toThrow(
      /Refusing to write/,
    );
  });
});

describe('applyMessageEdit', () => {
  const before = parseMessageEntries(CLASS_XML);

  it('adds a message and leaves the others byte-identical', () => {
    const after = applyMessageEdit(before, 'add', '10', 'ten');
    expect(after).toHaveLength(before.length + 1);
    // Every original entry must survive unchanged — this is the whole point.
    for (const original of before) {
      expect(after).toContainEqual(original);
    }
  });

  it('refuses to add a number that already exists', () => {
    // An upsert here would let a typo overwrite a message that code already
    // raises.
    expect(() => applyMessageEdit(before, 'add', '002', 'clobber')).toThrow(
      /already exists/,
    );
  });

  it('refuses to update a number that does not exist', () => {
    expect(() => applyMessageEdit(before, 'update', '999', 'nope')).toThrow(
      /does not exist/,
    );
  });

  it('changes only the passed fields on update', () => {
    const afterText = applyMessageEdit(before, 'update', '002', 'edited');
    const entry = afterText.find((m) => m.msgno === '002');
    expect(entry?.text).toBe('edited');
    // self_explanatory was not passed, so it keeps its stored value (false).
    expect(entry?.self_explanatory).toBe(false);

    const afterFlag = applyMessageEdit(
      before,
      'update',
      '002',
      undefined,
      true,
    );
    const flagged = afterFlag.find((m) => m.msgno === '002');
    expect(flagged?.self_explanatory).toBe(true);
    expect(flagged?.text).toBe('two');
  });

  it('accepts an unpadded number for an existing padded message', () => {
    expect(
      applyMessageEdit(before, 'update', '2', 'edited').find(
        (m) => m.msgno === '002',
      )?.text,
    ).toBe('edited');
  });

  it('does not mutate the input list', () => {
    const snapshot = JSON.stringify(before);
    applyMessageEdit(before, 'add', '050', 'fifty');
    expect(JSON.stringify(before)).toBe(snapshot);
  });
});
