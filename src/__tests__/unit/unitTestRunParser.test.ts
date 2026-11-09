/**
 * Unit tests for parseUnitTestRunResult — the parser for the synchronous
 * /sap/bc/adt/abapunit/testruns response (aunit:runResult). Pure function, no
 * SAP round-trip. Guards the in-repo bypass that replaced the dep's 404-ing
 * /abapunit/runs run path.
 */

import {
  buildUnitTestRunXml,
  parseUnitTestRunResult,
} from '../../lib/unitTestRun';
import type { AxiosResponse } from '../../lib/utils';

function resp(xml: string): AxiosResponse {
  return { data: xml, status: 200, headers: {} } as unknown as AxiosResponse;
}

const PASSING = `<?xml version="1.0" encoding="UTF-8"?>
<aunit:runResult xmlns:aunit="http://www.sap.com/adt/aunit" xmlns:adtcore="http://www.sap.com/adt/core">
  <program adtcore:name="ZMCP_BLD_CLSUT_L1">
    <testClasses>
      <testClass adtcore:name="LTC_ZMCP_BLD_CLSUT_L1" adtcore:uri="/sap/bc/adt/oo/classes/zmcp_bld_clsut_l1#type=CLAS%2FOCN">
        <testMethods>
          <testMethod adtcore:name="TEST_METHOD" executionTime="0">
            <alerts/>
          </testMethod>
        </testMethods>
        <alerts/>
      </testClass>
    </testClasses>
  </program>
</aunit:runResult>`;

const FAILING = `<?xml version="1.0" encoding="UTF-8"?>
<aunit:runResult xmlns:aunit="http://www.sap.com/adt/aunit" xmlns:adtcore="http://www.sap.com/adt/core">
  <program adtcore:name="ZMCP_BLD_CLSUT_L1">
    <testClasses>
      <testClass adtcore:name="LTC_ZMCP_BLD_CLSUT_L1">
        <testMethods>
          <testMethod adtcore:name="TEST_OK"><alerts/></testMethod>
          <testMethod adtcore:name="TEST_BAD">
            <alerts>
              <alert kind="failedAssertion" severity="critical">
                <title>Assertion failed</title>
                <details>
                  <detail text="Expected 1 but was 2"/>
                </details>
              </alert>
            </alerts>
          </testMethod>
        </testMethods>
      </testClass>
    </testClasses>
  </program>
</aunit:runResult>`;

describe('parseUnitTestRunResult', () => {
  it('parses a passing run', () => {
    const r = parseUnitTestRunResult(resp(PASSING));
    expect(r.success).toBe(true);
    expect(r.total_methods).toBe(1);
    expect(r.passed_methods).toBe(1);
    expect(r.failed_methods).toBe(0);
    expect(r.alerts_total).toBe(0);
    expect(r.test_classes[0].name).toBe('LTC_ZMCP_BLD_CLSUT_L1');
    expect(r.test_classes[0].test_methods[0].name).toBe('TEST_METHOD');
    expect(r.test_classes[0].test_methods[0].passed).toBe(true);
  });

  it('parses a failing run with alert details', () => {
    const r = parseUnitTestRunResult(resp(FAILING));
    expect(r.success).toBe(false);
    expect(r.total_methods).toBe(2);
    expect(r.passed_methods).toBe(1);
    expect(r.failed_methods).toBe(1);
    expect(r.alerts_total).toBe(1);
    const bad = r.test_classes[0].test_methods.find(
      (m) => m.name === 'TEST_BAD',
    );
    expect(bad?.passed).toBe(false);
    expect(bad?.alerts[0].kind).toBe('failedAssertion');
    expect(bad?.alerts[0].details).toContain('Expected 1 but was 2');
  });

  it('builds a run body with the mandatory options block', () => {
    // Regression guard: SAP returns an empty result (HTTP 200, no tests) unless
    // <testDeterminationStrategy> + <uriType> are present in <options>.
    const xml = buildUnitTestRunXml([
      { containerClass: 'ZMCP_BLD_CLSUT_L1' },
      { containerClass: 'ZMCP_BLD_CLSUT_L1' }, // dup → deduped
    ]);
    expect(xml).toContain('<testDeterminationStrategy');
    expect(xml).toContain('<uriType value="semantic"/>');
    expect(xml).toContain('<testRiskLevels harmless="true"');
    expect(xml).toContain(
      'adtcore:uri="/sap/bc/adt/oo/classes/zmcp_bld_clsut_l1"',
    );
    // Deduped: exactly one objectReference (trailing space excludes the
    // <adtcore:objectReferences> wrapper element).
    expect(xml.match(/<adtcore:objectReference /g)?.length).toBe(1);
  });

  it('handles an empty/no-test result without throwing', () => {
    const r = parseUnitTestRunResult(
      resp('<aunit:runResult xmlns:aunit="http://www.sap.com/adt/aunit"/>'),
    );
    expect(r.total_methods).toBe(0);
    expect(r.success).toBe(true);
    expect(r.test_classes).toEqual([]);
  });
});
