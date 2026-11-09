/**
 * CreateProgram: an include must be created as PROG/I through the includes
 * collection, and the verdict must come from what TRDIR stored.
 */

import {
  buildIncludeCreateXml,
  judgeProgramType,
} from '../../lib/programCreate';

describe('buildIncludeCreateXml', () => {
  it('builds an include:abapInclude of type PROG/I with the package', () => {
    const xml = buildIncludeCreateXml({
      name: 'zinc_top',
      description: 'Top include',
      packageName: 'zpkg',
      masterLanguage: 'en',
    });
    expect(xml).toContain('<include:abapInclude');
    expect(xml).toContain(
      'xmlns:include="http://www.sap.com/adt/programs/includes"',
    );
    expect(xml).toContain('adtcore:type="PROG/I"');
    expect(xml).toContain('adtcore:name="ZINC_TOP"');
    expect(xml).toContain('adtcore:masterLanguage="EN"');
    expect(xml).toContain('<adtcore:packageRef adtcore:name="ZPKG"/>');
    expect(xml).not.toContain('containerRef');
    expect(xml).not.toContain('programType');
  });

  it('adds the container reference when a main program is given', () => {
    const xml = buildIncludeCreateXml({
      name: 'ZINC_TOP',
      description: 'x',
      packageName: 'ZPKG',
      mainProgram: 'zmain',
    });
    expect(xml).toContain(
      '<include:containerRef adtcore:name="ZMAIN" adtcore:type="PROG/P" adtcore:uri="/sap/bc/adt/programs/programs/zmain"/>',
    );
  });

  it('escapes the description and caps it at 60 characters', () => {
    const xml = buildIncludeCreateXml({
      name: 'ZI',
      description: `A & "B" <C>${'x'.repeat(80)}`,
      packageName: 'ZPKG',
    });
    expect(xml).toContain('A &amp; &quot;B&quot; &lt;C&gt;');
    const desc = xml.match(/adtcore:description="([^"]*)"/)?.[1] ?? '';
    expect(desc.replace(/&[a-z]+;/g, '_').length).toBeLessThanOrEqual(60);
  });
});

describe('judgeProgramType', () => {
  it('as_requested when TRDIR holds the requested SUBC', () => {
    const j = judgeProgramType('include', undefined, { subc: 'I', appl: '' });
    expect(j.verdict).toBe('as_requested');
  });

  it('wrong_type for the measured defect: include asked, executable stored', () => {
    const j = judgeProgramType('include', 'M', { subc: '1', appl: '' });
    expect(j.verdict).toBe('wrong_type');
    expect(j.stored_subc).toBe('1');
    expect(j.application_ignored).toBe(true);
  });

  it('unverified when TRDIR could not be read', () => {
    expect(judgeProgramType('executable', undefined, null).verdict).toBe(
      'unverified',
    );
  });

  it('the default application "*" is not reported as ignored', () => {
    const j = judgeProgramType('executable', '*', { subc: '1', appl: '' });
    expect(j.application_ignored).toBe(false);
  });
});

describe('include resources (TRDIR-SUBC I)', () => {
  // Imported lazily so this file keeps testing pure helpers only.
  const { programObjectUri } = require('../../lib/programTrdir');
  const { buildActivationUri } = require('../../lib/adtObjectOps');

  it('an include is addressed under /programs/includes', () => {
    expect(programObjectUri('ZINC_TOP', 'I')).toBe(
      '/sap/bc/adt/programs/includes/zinc_top',
    );
    expect(programObjectUri('ZREPORT', '1')).toBe(
      '/sap/bc/adt/programs/programs/zreport',
    );
  });

  it('PROG/I activates the include resource, not the /prog/i fallback', () => {
    expect(buildActivationUri('ZINC_TOP', 'PROG/I')).toBe(
      '/sap/bc/adt/programs/includes/zinc_top',
    );
    expect(buildActivationUri('ZREPORT', 'PROG')).toBe(
      '/sap/bc/adt/programs/programs/zreport',
    );
  });
});
