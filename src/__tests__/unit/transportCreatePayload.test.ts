/**
 * F-12: the transport target must reach CTS as the caller spelled it.
 *
 * `adt-clients@5.6.0` wrapped it — `target_system: 'VVV'` went out as
 * `tm:target="/VVV/"` and CTS answered `Target '/VVV/' does not exist` for a
 * target that does exist. The read side of the same package parses the
 * attribute unwrapped, which is what proves the slashes are wrong rather than a
 * convention we were missing.
 */

import {
  buildCreateTransportXml,
  normaliseTransportTarget,
  parseCreateTransportResponse,
} from '../../lib/transportCreate';

const OWNER = 'SOME.USER';

describe('buildCreateTransportXml — the target', () => {
  it('sends a supplied target unwrapped', () => {
    const xml = buildCreateTransportXml({
      description: 'probe',
      targetSystem: 'VVV',
      owner: OWNER,
    });
    expect(xml).toContain('tm:target="VVV"');
    // The exact regression: no slashes, in any position.
    expect(xml).not.toContain('/VVV/');
  });

  it('sends LOCAL when no target is given, and when it is blank', () => {
    for (const targetSystem of [undefined, '', '   ']) {
      const xml = buildCreateTransportXml({
        description: 'probe',
        targetSystem,
        owner: OWNER,
      });
      expect(xml).toContain('tm:target="LOCAL"');
    }
  });

  it('round-trips: what is written is what the read side parses back', () => {
    const xml = buildCreateTransportXml({
      description: 'probe',
      targetSystem: 'vvv',
      owner: OWNER,
    });
    // Feed the request element back through the response parser — the same
    // attribute, the same spelling. A wrapped value would fail here.
    const parsed = parseCreateTransportResponse(
      xml.replace('tm:useraction="newrequest"', ''),
    );
    expect(parsed.target_system).toBe('VVV');
  });

  it('normalises case but nothing else', () => {
    expect(normaliseTransportTarget(' vvv ')).toBe('VVV');
    expect(normaliseTransportTarget(undefined)).toBe('LOCAL');
  });
});

describe('buildCreateTransportXml — escaping', () => {
  it('escapes a description that would otherwise break the document', () => {
    const xml = buildCreateTransportXml({
      description: 'Fix "&" handling <urgent>',
      owner: OWNER,
    });
    expect(xml).toContain(
      'tm:desc="Fix &quot;&amp;&quot; handling &lt;urgent&gt;"',
    );
    // The attribute must still be well-formed: parsing it back returns the
    // original text, which an unescaped build could not do.
    const parsed = parseCreateTransportResponse(
      xml.replace('tm:useraction="newrequest"', ''),
    );
    expect(parsed.description).toBe('Fix "&" handling <urgent>');
  });

  it('escapes the owner too', () => {
    const xml = buildCreateTransportXml({
      description: 'probe',
      owner: 'A&B',
    });
    expect(xml).toContain('tm:owner="A&amp;B"');
  });
});

describe('parseCreateTransportResponse', () => {
  it('keeps a numeric-looking target a string', () => {
    const parsed = parseCreateTransportResponse(
      '<tm:root xmlns:tm="http://www.sap.com/cts/adt/tm"><tm:request tm:number="ABCK900001" tm:target="100"/></tm:root>',
    );
    expect(parsed.target_system).toBe('100');
    expect(parsed.transport_number).toBe('ABCK900001');
  });
});
