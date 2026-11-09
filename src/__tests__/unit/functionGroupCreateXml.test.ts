/**
 * Function group create payload escaping.
 *
 * The dep built this payload by interpolation with no escaping, so a
 * description containing an XML metacharacter produced a malformed document and
 * ADT answered "Bad request: Data is invalid and could not be converted".
 *
 * Reproduced live on SAP_BASIS 7.56: CreateFunctionGroup with the description
 * `Probe B: A & B "quoted" <tag>` failed with exactly that message, while the
 * same call with a plain description — and with a purely Chinese one — created
 * the group. These tests pin the escaping so that payload can never be emitted
 * again.
 */

import { buildFunctionGroupCreateXml } from '../../lib/functionGroupCreate';

describe('buildFunctionGroupCreateXml', () => {
  it('escapes the metacharacters that produced the live 400', () => {
    const xml = buildFunctionGroupCreateXml({
      functionGroupName: 'ZMCP_FG',
      packageName: '$TMP',
      description: 'Probe B: A & B "quoted" <tag>',
    });
    // The raw characters must not survive inside the attribute value.
    expect(xml).toContain('&amp;');
    expect(xml).toContain('&quot;');
    expect(xml).toContain('&lt;tag&gt;');
    expect(xml).not.toContain('A & B');
    expect(xml).not.toContain('"quoted"');
    // ...and the document must still be well formed: exactly the attributes we
    // expect, no stray quote terminating the attribute early.
    expect(xml.match(/adtcore:description="/g)).toHaveLength(1);
  });

  it('produces parseable XML for a metacharacter-heavy description', () => {
    const { XMLParser } = require('fast-xml-parser');
    const xml = buildFunctionGroupCreateXml({
      functionGroupName: 'ZMCP_FG',
      packageName: '$TMP',
      description: 'R&D "core" <v2> & more',
    });
    const parsed = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    }).parse(xml);
    const root = parsed['group:abapFunctionGroup'];
    expect(root).toBeDefined();
    // Round-trips back to the original text.
    expect(root['@_adtcore:description']).toBe('R&D "core" <v2> & more');
    expect(root['adtcore:packageRef']['@_adtcore:name']).toBe('$TMP');
  });

  it('upper-cases the name and package', () => {
    const xml = buildFunctionGroupCreateXml({
      functionGroupName: 'zmcp_fg',
      packageName: '$tmp',
      description: 'x',
    });
    expect(xml).toContain('adtcore:name="ZMCP_FG"');
    expect(xml).toContain('adtcore:name="$TMP"');
  });

  it('defaults the description to the group name and the language to EN', () => {
    const xml = buildFunctionGroupCreateXml({
      functionGroupName: 'ZMCP_FG',
      packageName: '$TMP',
    });
    expect(xml).toContain('adtcore:description="ZMCP_FG"');
    expect(xml).toContain('adtcore:language="EN"');
    expect(xml).toContain('adtcore:masterLanguage="EN"');
  });

  it('caps the description at 60 characters', () => {
    const xml = buildFunctionGroupCreateXml({
      functionGroupName: 'ZMCP_FG',
      packageName: '$TMP',
      description: 'y'.repeat(90),
    });
    expect(xml.match(/adtcore:description="(y+)"/)?.[1]).toHaveLength(60);
  });

  it('omits responsible when blank (a blank value triggers a bogus Kerberos error)', () => {
    expect(
      buildFunctionGroupCreateXml({
        functionGroupName: 'ZMCP_FG',
        packageName: '$TMP',
        responsible: '   ',
      }),
    ).not.toContain('adtcore:responsible');
    expect(
      buildFunctionGroupCreateXml({
        functionGroupName: 'ZMCP_FG',
        packageName: '$TMP',
        responsible: 'SOME.USER',
        masterSystem: 'DM2',
      }),
    ).toContain('adtcore:responsible="SOME.USER"');
  });

  it('carries the FUGR/F type and the group namespace', () => {
    const xml = buildFunctionGroupCreateXml({
      functionGroupName: 'ZMCP_FG',
      packageName: '$TMP',
    });
    expect(xml).toContain('adtcore:type="FUGR/F"');
    expect(xml).toContain(
      'xmlns:group="http://www.sap.com/adt/functions/groups"',
    );
  });
});
