/**
 * DCL (access control) create-payload construction.
 *
 * The dep's `core/accessControl/create.js` interpolates the description into the
 * XML with NO escaping — the same defect that made CreateFunctionGroup answer a
 * blanket "Bad request: Data is invalid and could not be converted" for any
 * description containing an XML metacharacter. These tests pin the escaping and
 * the payload shape confirmed live against /sap/bc/adt/discovery on S/4 7.56.
 */

import {
  ACCESS_CONTROL_TYPE,
  accessControlUri,
  buildAccessControlCreateXml,
  CT_ACCESS_CONTROL,
} from '../../lib/accessControlXml';

describe('buildAccessControlCreateXml', () => {
  it('builds a bare create body: root element plus packageRef only', () => {
    const xml = buildAccessControlCreateXml({
      name: 'z_my_view',
      packageName: '$tmp',
      description: 'Authorization for Z_MY_VIEW',
      masterLanguage: 'en',
    });
    expect(xml).toContain('<dcl:dclSource');
    expect(xml).toContain('adtcore:name="Z_MY_VIEW"');
    expect(xml).toContain('adtcore:name="$TMP"');
    expect(xml).toContain(`adtcore:type="${ACCESS_CONTROL_TYPE}"`);
    expect(xml).toContain('adtcore:masterLanguage="EN"');
    expect(xml).toContain('adtcore:language="EN"');
    // The source is written by a separate PUT to <uri>/source/main.
    expect(xml).not.toContain('define role');
  });

  it('escapes XML metacharacters in the description', () => {
    // This is the CreateFunctionGroup #20 failure mode, reproduced live on DM2:
    // an unescaped & or < yields a malformed document and SAP answers 400.
    const xml = buildAccessControlCreateXml({
      name: 'Z_X',
      packageName: '$TMP',
      description: 'Auth: A & B "quoted" <tag>',
    });
    expect(xml).toContain('&amp;');
    expect(xml).toContain('&quot;');
    expect(xml).toContain('&lt;tag&gt;');
    // No raw metacharacter survives inside the attribute value.
    const attr = /adtcore:description="([^"]*)"/.exec(xml)?.[1] ?? '';
    expect(attr).not.toMatch(/[<>&](?!(amp|quot|lt|gt|apos);)/);
  });

  it('caps the description at 60 characters', () => {
    const xml = buildAccessControlCreateXml({
      name: 'Z_X',
      packageName: '$TMP',
      description: 'y'.repeat(90),
    });
    expect(/adtcore:description="(y+)"/.exec(xml)?.[1]).toHaveLength(60);
  });

  it('defaults the description to the object name', () => {
    const xml = buildAccessControlCreateXml({
      name: 'Z_ROLE',
      packageName: '$TMP',
    });
    expect(xml).toContain('adtcore:description="Z_ROLE"');
  });

  it('omits masterSystem/responsible when unknown and includes them when known', () => {
    expect(
      buildAccessControlCreateXml({ name: 'Z_X', packageName: '$TMP' }),
    ).not.toContain('adtcore:responsible');
    const withCtx = buildAccessControlCreateXml({
      name: 'Z_X',
      packageName: '$TMP',
      masterSystem: 'DM2',
      responsible: 'SOME.USER',
    });
    expect(withCtx).toContain('adtcore:masterSystem="DM2"');
    expect(withCtx).toContain('adtcore:responsible="SOME.USER"');
  });

  it('emits exactly one XML declaration', () => {
    const xml = buildAccessControlCreateXml({
      name: 'Z_X',
      packageName: '$TMP',
    });
    expect(xml.match(/<\?xml/g)).toHaveLength(1);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
  });
});

describe('accessControlUri', () => {
  it('builds the collection URI confirmed by discovery', () => {
    expect(accessControlUri('Z_MY_VIEW')).toBe(
      '/sap/bc/adt/acm/dcl/sources/z_my_view',
    );
  });

  it('lower-cases the name, as the ADT source URIs do', () => {
    expect(accessControlUri('C_AccountingDocument')).toBe(
      '/sap/bc/adt/acm/dcl/sources/c_accountingdocument',
    );
  });
});

describe('media type', () => {
  it('is the SINGULAR dclSource type the collection advertises', () => {
    // Discovery on DM2 lists exactly one <app:accept> for
    // /sap/bc/adt/acm/dcl/sources. The TTYP round showed what happens when the
    // media type is wrong: 415 on write, 406 on read.
    expect(CT_ACCESS_CONTROL).toBe('application/vnd.sap.adt.dclSource+xml');
  });
});
