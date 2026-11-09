/**
 * Unit tests for parsePackageDeletionResult — guards the in-repo package-delete
 * bypass that relays SAP's real deletion messages (the dep collapses a message
 * ARRAY into a generic "Deletion failed"). The failing XML is the actual
 * response captured live for the orphaned ZMCP_BLD_PKG_H1 (no TDEVC/TADIR).
 */

import {
  buildPackageDeletionXml,
  parsePackageDeletionResult,
} from '../../lib/packageDelete';
import type { AxiosResponse } from '../../lib/utils';

function resp(xml: string): AxiosResponse {
  return { data: xml, status: 200, headers: {} } as unknown as AxiosResponse;
}

const FAILED_MULTI_MESSAGE = `<?xml version="1.0" encoding="utf-8"?>
<del:deletionResult xmlns:del="http://www.sap.com/adt/deletion">
  <del:object del:isDeleted="false" adtcore:uri="/sap/bc/adt/packages/zmcp_bld_pkg_h1" adtcore:type="DEVC/K" adtcore:name="ZMCP_BLD_PKG_H1" xmlns:adtcore="http://www.sap.com/adt/core">
    <del:message del:priority="0" del:type="E"><del:text>Package ZMCP_BLD_PKG_H1 has no TDEVC record.</del:text></del:message>
    <del:message del:priority="0" del:type="E"><del:text>Package ZMCP_BLD_PKG_H1 has no object directory entry (TADIR).</del:text></del:message>
    <del:message del:priority="0" del:type="E"><del:text>Resource DEVC ZMCP_BLD_PKG_H1 does not exist.</del:text><atom:link href="/x" rel="longtext" xmlns:atom="http://www.w3.org/2005/Atom"/></del:message>
  </del:object>
</del:deletionResult>`;

const DELETED_OK = `<?xml version="1.0" encoding="utf-8"?>
<del:deletionResult xmlns:del="http://www.sap.com/adt/deletion">
  <del:object del:isDeleted="true" adtcore:uri="/sap/bc/adt/packages/zfoo" adtcore:name="ZFOO" xmlns:adtcore="http://www.sap.com/adt/core"/>
</del:deletionResult>`;

describe('parsePackageDeletionResult', () => {
  it('captures EVERY message when SAP returns a failure array', () => {
    const r = parsePackageDeletionResult(resp(FAILED_MULTI_MESSAGE));
    expect(r.isDeleted).toBe(false);
    expect(r.messages).toHaveLength(3);
    expect(r.messages.every((m) => m.type === 'E')).toBe(true);
    expect(r.messages[0].text).toContain('no TDEVC record');
    expect(r.messages[1].text).toContain('TADIR');
    // Message with a trailing atom:link child still yields its text.
    expect(r.messages[2].text).toContain('does not exist');
  });

  it('reports success for an isDeleted=true result', () => {
    const r = parsePackageDeletionResult(resp(DELETED_OK));
    expect(r.isDeleted).toBe(true);
    expect(r.messages).toEqual([]);
  });

  it('builds a deletion body with the transport tag / empty tag', () => {
    const withT = buildPackageDeletionXml('ZFOO', 'ABCK900065');
    expect(withT).toContain('adtcore:uri="/sap/bc/adt/packages/zfoo"');
    expect(withT).toContain(
      '<del:transportNumber>ABCK900065</del:transportNumber>',
    );

    const noT = buildPackageDeletionXml('ZFOO');
    expect(noT).toContain('<del:transportNumber/>');
  });
});
