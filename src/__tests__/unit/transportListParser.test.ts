/**
 * ListTransports — the organizer-tree parser.
 *
 * The tool reported count:0 while GetTransport read the same user's request back
 * as modifiable. Two independent things could produce that zero, and both are
 * pinned here: an empty answer from SAP (real, measured) and a populated answer
 * whose nesting the old two hard-coded paths did not reach.
 */

import { parseTransportListXml } from '../../handlers/transport/readonly/handleListTransports';

/** Verbatim from DM2/310: 297 bytes, self-closing, no children at all. */
const EMPTY_ROOT = `<?xml version="1.0" encoding="utf-8"?><tm:root adtcore:name="SOME.USER" adtcore:changedAt="2026-09-01T08:08:29Z" adtcore:createdAt="2026-09-01T08:08:29Z" adtcore:changedBy="SOME.USER" adtcore:createdBy="SOME.USER" xmlns:tm="http://www.sap.com/cts/adt/tm" xmlns:adtcore="http://www.sap.com/adt/core"/>`;

/** The shape a system WITH transport search configurations returns. */
const NESTED = `<?xml version="1.0" encoding="utf-8"?><tm:root xmlns:tm="http://www.sap.com/cts/adt/tm"><tm:workbench tm:parentid=""><tm:modifiable tm:parentid="workbench"><tm:request tm:number="ZZZK900001" tm:desc="First request" tm:type="K" tm:status="D" tm:status_text="Modifiable" tm:owner="SOME.USER" tm:target="VVV"><tm:task tm:number="ZZZK900002" tm:type="S" tm:status="D" tm:owner="SOME.USER"/></tm:request><tm:request tm:number="ZZZK900003" tm:desc="Second request" tm:type="K" tm:status="D" tm:owner="SOME.USER" tm:target=""/></tm:modifiable><tm:released tm:parentid="workbench"><tm:request tm:number="ZZZK900009" tm:desc="Old one" tm:type="K" tm:status="R" tm:owner="SOME.USER"/></tm:released></tm:workbench></tm:root>`;

/** A flat shape, to prove the collector is not tied to one nesting. */
const FLAT = `<?xml version="1.0" encoding="utf-8"?><tm:root xmlns:tm="http://www.sap.com/cts/adt/tm"><tm:request tm:number="ZZZK900100" tm:desc="Flat" tm:type="W" tm:status="L" tm:owner="SOME.USER"/></tm:root>`;

describe('parseTransportListXml', () => {
  it('returns nothing for the empty root SAP actually sends', () => {
    // Measured: this is the whole answer for every parameter spelling tried on
    // DM2/310. The parser must not invent anything from it — the handler is what
    // turns this into a fallback rather than into "no request exists".
    expect(parseTransportListXml(EMPTY_ROOT)).toEqual([]);
    expect(parseTransportListXml('')).toEqual([]);
  });

  it('finds requests nested under workbench -> modifiable / released', () => {
    // THE REGRESSION. The old parser looked only at root['tm:request'] and
    // root['tm:workbench']['tm:request'], so this document — the shape a working
    // organizer tree returns — parsed to zero requests.
    const entries = parseTransportListXml(NESTED);
    expect(entries.map((entry) => entry.number)).toEqual([
      'ZZZK900001',
      'ZZZK900003',
      'ZZZK900009',
    ]);
    expect(entries[0].description).toBe('First request');
    expect(entries[0].status_text).toBe('Modifiable');
    expect(entries[0].type_text).toBe('Workbench request');
    expect(entries[0].target).toBe('VVV');
  });

  it('finds a request at the top level too', () => {
    const entries = parseTransportListXml(FLAT);
    expect(entries).toHaveLength(1);
    expect(entries[0].number).toBe('ZZZK900100');
    // status_text is filled from TRSTATUS when SAP does not send one.
    expect(entries[0].status_text).toBe('Modifiable, protected');
    expect(entries[0].type_text).toBe('Customizing request');
  });

  it('does not mistake a task for a request', () => {
    const entries = parseTransportListXml(NESTED);
    expect(entries.map((entry) => entry.number)).not.toContain('ZZZK900002');
  });
});
