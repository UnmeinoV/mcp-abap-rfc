/**
 * Knowledge Transfer Document (SKTD) parsing — pinned against a REAL response captured live on
 * DM2/310 for `D_CUSTSETTLMTCHANGED_SOD2` (an SAP-shipped document, found via `SELECT obj_name
 * FROM tadir WHERE object = 'SKTD'`). Two things measured live and pinned here: the GET only
 * answers cleanly with an explicit `Accept: application/vnd.sap.adt.sktdv2+xml` (documented in
 * the handler, not re-tested here since it is a request-header concern, not a parsing one), and
 * `<sktd:text>` is base64 — decoding it is the entire point of this parser existing.
 */

import { parseKnowledgeTransferDoc } from '../../lib/knowledgeTransferDocXml';

/** Captured verbatim, 2026-09-22, DM2/310 — including the base64 body's embedded line break. */
const SKTD_XML = `<?xml version="1.0" encoding="utf-8"?><sktd:docu adtcore:responsible="SAP" adtcore:masterLanguage="EN" adtcore:masterSystem="SAP" adtcore:abapLanguageVersion="standard" adtcore:name="D_CUSTSETTLMTCHANGED_SOD2" adtcore:type="SKTD/TYP" adtcore:changedAt="2022-10-14T12:02:31Z" adtcore:version="active" adtcore:createdAt="2022-10-06T14:21:22Z" adtcore:changedBy="SAP" adtcore:createdBy="SAP" adtcore:description="Documentation for D_CUSTSETTLMTCHANGED" adtcore:language="ZH" xmlns:sktd="http://www.sap.com/wbobj/texts/sktd" xmlns:adtcore="http://www.sap.com/adt/core"><atom:link href="versions" rel="http://www.sap.com/adt/relations/versions" title="Historic versions" xmlns:atom="http://www.w3.org/2005/Atom"/><adtcore:packageRef adtcore:uri="/sap/bc/adt/packages/wzre" adtcore:type="DEVC/K" adtcore:name="WZRE" adtcore:description="Settlement Management (Main Package)"/><sktd:refObject adtcore:uri="/sap/bc/adt/ddic/ddl/sources/d_custsettlmtchanged" adtcore:type="DDLS/DF" adtcore:name="D_CUSTSETTLMTCHANGED" adtcore:description="Customer Settlement Changed"/><sktd:element sktd:canHaveDocumentation="true" sktd:notAssigned="false" sktd:longTextObligation="optional" sktd:displayName="" sktd:collapseNode="false"><sktd:id>D_CUSTSETTLMTCHANGED</sktd:id><sktd:text>VGhpcyBldmVudCBpcyByYWlzZWQgd2hlbiBhIGN1c3RvbWVyIHNldHRsZW1lbnQgaW5zdGFuY2Ug
aGFzIGJlZW4gY2hhbmdlZC4=</sktd:text><adtcore:objectReference adtcore:uri="/sap/bc/adt/ddic/ddl/sources/d_custsettlmtchanged" adtcore:type="DDLS/DF" adtcore:name="D_CUSTSETTLMTCHANGED" adtcore:description="Customer Settlement Changed"/><sktd:parent/><sktd:shortText sktd:text="" sktd:obligation="forbidden"/><atom:link href="/sap/bc/adt/repository/informationsystem/elementinfo?path=d_custsettlmtchanged&amp;type=ddls/df" rel="http://www.sap.com/adt/relations/elementinfo" type="application/vnd.sap.adt.elementinfo+xml" title="Show Element Information" xmlns:atom="http://www.w3.org/2005/Atom"/></sktd:element></sktd:docu>`;

describe('parseKnowledgeTransferDoc — against a real captured <sktd:docu>', () => {
  it('extracts document-level metadata', () => {
    const doc = parseKnowledgeTransferDoc(SKTD_XML);
    expect(doc.name).toBe('D_CUSTSETTLMTCHANGED_SOD2');
    expect(doc.description).toBe('Documentation for D_CUSTSETTLMTCHANGED');
    expect(doc.type).toBe('SKTD/TYP');
    expect(doc.master_language).toBe('EN');
    expect(doc.language).toBe('ZH');
    expect(doc.package_name).toBe('WZRE');
    expect(doc.ref_object_name).toBe('D_CUSTSETTLMTCHANGED');
    expect(doc.ref_object_type).toBe('DDLS/DF');
  });

  it('decodes the base64 element text into the real documentation string, embedded newline and all', () => {
    const doc = parseKnowledgeTransferDoc(SKTD_XML);
    expect(doc.elements).toHaveLength(1);
    expect(doc.elements[0].id).toBe('D_CUSTSETTLMTCHANGED');
    expect(doc.elements[0].text).toBe(
      'This event is raised when a customer settlement instance has been changed.',
    );
    expect(doc.elements[0].can_have_documentation).toBe(true);
    expect(doc.elements[0].ref_object_name).toBe('D_CUSTSETTLMTCHANGED');
  });

  it('reports a single element as an array of one, never an unwrapped object', () => {
    const doc = parseKnowledgeTransferDoc(SKTD_XML);
    expect(Array.isArray(doc.elements)).toBe(true);
  });

  it('handles a document with no elements at all without throwing', () => {
    const noElements = SKTD_XML.replace(
      /<sktd:element[\s\S]*?<\/sktd:element>/,
      '',
    );
    const doc = parseKnowledgeTransferDoc(noElements);
    expect(doc.elements).toEqual([]);
  });
});
