/**
 * Feature-toggle (FTGL) parsing — pinned against a REAL response captured live on DM2/310 for
 * `SREUSE_START_SECURE`, an SAP-shipped toggle found via `SELECT obj_name FROM tadir WHERE
 * object = 'FTGL'` (see CLAUDE.md for the full round). The metadata document is `<blue:blueSource>`
 * XML; the `/source/main` body is JSON, not XML — this file has to handle both correctly.
 */

import {
  parseFeatureToggleContent,
  parseFeatureToggleMetadata,
} from '../../lib/featureToggleXml';

/** Captured verbatim, 2026-09-22, DM2/310. */
const FT_METADATA_XML = `<?xml version="1.0" encoding="utf-8"?><blue:blueSource abapsource:fixPointArithmetic="false" abapsource:activeUnicodeCheck="false" adtcore:responsible="SAP" adtcore:masterLanguage="EN" adtcore:masterSystem="SAP" adtcore:name="SREUSE_START_SECURE" adtcore:type="FTG2/FT" adtcore:changedAt="2023-05-18T00:50:34Z" adtcore:version="active" adtcore:createdAt="2023-04-27T06:35:34Z" adtcore:changedBy="SAP" adtcore:createdBy="SAP" adtcore:description="Secure API Implementation." adtcore:descriptionTextLimit="60" adtcore:language="ZH" xmlns:blue="http://www.sap.com/wbobj/blue" xmlns:abapsource="http://www.sap.com/adt/abapsource" xmlns:adtcore="http://www.sap.com/adt/core"><atom:link href="./sreuse_start_secure/source/main/versions" rel="http://www.sap.com/adt/relations/versions" title="Historic versions" xmlns:atom="http://www.w3.org/2005/Atom"/><adtcore:packageRef adtcore:uri="/sap/bc/adt/packages/frm_s4c_api" adtcore:type="DEVC/K" adtcore:name="FRM_S4C_API" adtcore:description="S4C Package for Application Logic"/></blue:blueSource>`;

/** Captured verbatim from GET .../source/main with Accept: application/json. */
const FT_CONTENT_JSON = {
  header: {
    description: '安全 API 实施。',
    originalLanguage: 'en',
    abapLanguageVersion: 'standard',
  },
  rollout: {
    lifecycleStatus: 'rolloutCompleted',
    strategy: 'immediate',
    finalDate: '',
    event: '',
    reversible: false,
  },
  longtext: 'Migrated from Legacy Feature Toggle SREUSE_START_SECURE',
  toggledPackages: [],
  relatedToggles: [],
  attributes: [
    { key: 'DUA_ON_PROFILING_VALUE', value: 'S4HC_SREUSE_START_SECURE' },
    { key: 'DUA_PRODUCT_AREA_CODE', value: 'S4HC' },
    { key: 'FTGL_CREATED_DATE', value: '2018-05-09 06:29:40+00' },
    { key: 'FTGL_ID', value: 'SREUSE_START_SECURE' },
    { key: 'FTGL_MODIFIED_DATE', value: '2018-05-23 11:06:33+00' },
    { key: 'JIRA_ISSUE', value: 'STARTDEVELOPMENT-5646' },
    { key: 'PLANNED_DELIVERY', value: 'S4CE_1808_Q3/2018' },
  ],
};

describe('parseFeatureToggleMetadata — against a real captured <blue:blueSource>', () => {
  it('extracts every adtcore field', () => {
    const meta = parseFeatureToggleMetadata(FT_METADATA_XML);
    expect(meta).toEqual({
      name: 'SREUSE_START_SECURE',
      description: 'Secure API Implementation.',
      type: 'FTG2/FT',
      master_language: 'EN',
      language: 'ZH',
      responsible: 'SAP',
      created_at: '2023-04-27T06:35:34Z',
      changed_at: '2023-05-18T00:50:34Z',
    });
  });
});

describe('parseFeatureToggleContent — the /source/main body is JSON, not XML', () => {
  it('extracts rollout status/strategy, longtext, and flattens the attribute list', () => {
    const content = parseFeatureToggleContent(FT_CONTENT_JSON);
    expect(content.lifecycle_status).toBe('rolloutCompleted');
    expect(content.rollout_strategy).toBe('immediate');
    expect(content.longtext).toBe(
      'Migrated from Legacy Feature Toggle SREUSE_START_SECURE',
    );
    expect(content.attributes).toEqual({
      DUA_ON_PROFILING_VALUE: 'S4HC_SREUSE_START_SECURE',
      DUA_PRODUCT_AREA_CODE: 'S4HC',
      FTGL_CREATED_DATE: '2018-05-09 06:29:40+00',
      FTGL_ID: 'SREUSE_START_SECURE',
      FTGL_MODIFIED_DATE: '2018-05-23 11:06:33+00',
      JIRA_ISSUE: 'STARTDEVELOPMENT-5646',
      PLANNED_DELIVERY: 'S4CE_1808_Q3/2018',
    });
  });

  it('omits toggled_packages/related_toggles/attributes when empty rather than reporting empty arrays as findings', () => {
    const content = parseFeatureToggleContent({
      header: {},
      rollout: {},
      attributes: [],
    });
    expect(content.toggled_packages).toBeUndefined();
    expect(content.related_toggles).toBeUndefined();
    expect(content.attributes).toBeUndefined();
  });

  it('does not throw on a missing/empty body', () => {
    expect(() => parseFeatureToggleContent(undefined)).not.toThrow();
    expect(() => parseFeatureToggleContent({})).not.toThrow();
  });
});
