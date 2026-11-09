/**
 * Authorization field (AUTH) / authorization object (SUSO) parsing — pinned against REAL
 * responses captured live on DM2/310 for `ACTVT` and `S_TABU_DIS`. See src/lib/authIamXml.ts for
 * why this exists: a prior round concluded these endpoints were reachable only as value-help
 * search APIs, from the ABSENCE of a templateLink rather than from an actual request — this file
 * (and the live round that produced these fixtures) is the correction.
 */

import {
  parseAuthorizationField,
  parseAuthorizationObject,
} from '../../lib/authIamXml';

/** Captured verbatim, 2026-09-22, DM2/310. */
const AUTH_XML = `<?xml version="1.0" encoding="utf-8"?><auth:auth adtcore:responsible="SAP" adtcore:masterLanguage="DE" adtcore:masterSystem="SAP" adtcore:abapLanguageVersion="standard" adtcore:name="ACTVT" adtcore:type="AUTH" adtcore:changedAt="2020-06-09T03:46:13Z" adtcore:changedBy="SAP" adtcore:createdBy="SAP" adtcore:description="作业" adtcore:descriptionTextLimit="60" adtcore:language="ZH" xmlns:auth="http://www.sap.com/iam/auth" xmlns:adtcore="http://www.sap.com/adt/core"><atom:link href="versions" rel="http://www.sap.com/adt/relations/versions" title="Historic versions" xmlns:atom="http://www.w3.org/2005/Atom"/><adtcore:packageRef adtcore:uri="/sap/bc/adt/packages/susr" adtcore:type="DEVC/K" adtcore:name="SUSR" adtcore:description="ABAP User Administration"/><auth:content><auth:fieldName>ACTVT</auth:fieldName><auth:rollName>ACTIV_AUTH</auth:rollName><auth:checkTable>TACT</auth:checkTable><auth:exitFB/><auth:abap_language_version/><auth:search>false</auth:search><auth:objexit>true</auth:objexit><auth:domname>ACTIV_AUTH</auth:domname><auth:outputlen>000002</auth:outputlen><auth:convexit/><auth:orglvlinfo>Field cannot be defined as Organizational level.</auth:orglvlinfo><auth:col_searchhelp>false</auth:col_searchhelp><auth:col_searchhelp_name/><auth:col_searchhelp_descr/></auth:content></auth:auth>`;

/** Captured verbatim, 2026-09-22, DM2/310. */
const SUSO_XML = `<?xml version="1.0" encoding="utf-8"?><suso:suso adtcore:responsible="SAP" adtcore:masterLanguage="DE" adtcore:masterSystem="SAP" adtcore:abapLanguageVersion="standard" adtcore:name="S_TABU_DIS" adtcore:type="SUSO/B" adtcore:changedAt="1971-04-01T00:00:00Z" adtcore:createdBy="SAP" adtcore:description="表维护（使用标准工具，如 SM30）" adtcore:descriptionTextLimit="60" adtcore:language="ZH" xmlns:suso="http://www.sap.com/iam/suso" xmlns:adtcore="http://www.sap.com/adt/core"><adtcore:packageRef adtcore:uri="/sap/bc/adt/packages/svim" adtcore:type="DEVC/K" adtcore:name="SVIM" adtcore:description="Basis View Maintenance"/><suso:content><suso:objectClassName>BC_A</suso:objectClassName><suso:objectClassDescription>基本：管理</suso:objectClassDescription><suso:sapNewFlag>false</suso:sapNewFlag><suso:criticality>C</suso:criticality><suso:privileged>N</suso:privileged><suso:ownContext>N</suso:ownContext><suso:authFields><suso:authField><suso:name>DICBERCLS</suso:name><suso:description>表权限组</suso:description><suso:activityField>false</suso:activityField><suso:searchHelp/><suso:disable>false</suso:disable></suso:authField><suso:authField><suso:name>ACTVT</suso:name><suso:description>作业</suso:description><suso:activityField>false</suso:activityField><suso:searchHelp/><suso:disable>false</suso:disable></suso:authField></suso:authFields><suso:activities><suso:activity><suso:code>02</suso:code><suso:text>更改</suso:text><suso:accessCategory/></suso:activity><suso:activity><suso:code>03</suso:code><suso:text>显示</suso:text><suso:accessCategory/></suso:activity></suso:activities></suso:content></suso:suso>`;

describe('parseAuthorizationField — against a real captured <auth:auth>', () => {
  it('extracts document metadata and DDIC linkage', () => {
    const field = parseAuthorizationField(AUTH_XML);
    expect(field.name).toBe('ACTVT');
    expect(field.description).toBe('作业');
    expect(field.type).toBe('AUTH');
    expect(field.package_name).toBe('SUSR');
    expect(field.data_element).toBe('ACTIV_AUTH');
    expect(field.check_table).toBe('TACT');
    expect(field.domain).toBe('ACTIV_AUTH');
    expect(field.output_length).toBe('000002');
    expect(field.org_level_info).toBe(
      'Field cannot be defined as Organizational level.',
    );
  });

  it('reads boolean fields as real booleans, not the string "false"', () => {
    const field = parseAuthorizationField(AUTH_XML);
    expect(field.has_search_help).toBe(false);
    expect(field.has_exit_module).toBe(true);
  });

  it('reports an empty element as undefined, not an empty string mistaken for a value', () => {
    const field = parseAuthorizationField(AUTH_XML);
    expect(field.search_help_name).toBeUndefined();
  });
});

describe('parseAuthorizationObject — against a real captured <suso:suso>', () => {
  it('extracts document metadata and object-class info', () => {
    const obj = parseAuthorizationObject(SUSO_XML);
    expect(obj.name).toBe('S_TABU_DIS');
    expect(obj.type).toBe('SUSO/B');
    expect(obj.package_name).toBe('SVIM');
    expect(obj.object_class).toBe('BC_A');
    expect(obj.criticality).toBe('C');
  });

  it('lists every assigned authorization field, in order', () => {
    const obj = parseAuthorizationObject(SUSO_XML);
    expect(obj.fields.map((f) => f.name)).toEqual(['DICBERCLS', 'ACTVT']);
    expect(obj.fields[0].description).toBe('表权限组');
    expect(obj.fields[0].is_activity_field).toBe(false);
  });

  it('lists every allowed activity code with its text', () => {
    const obj = parseAuthorizationObject(SUSO_XML);
    expect(obj.activities).toEqual([
      { code: '02', text: '更改', access_category: undefined },
      { code: '03', text: '显示', access_category: undefined },
    ]);
  });

  it('reports a single field/activity as an array of one, never unwrapped', () => {
    const single = SUSO_XML.replace(
      /<suso:authField>[\s\S]*?<\/suso:authField><suso:authField>[\s\S]*?<\/suso:authField>/,
      '<suso:authField><suso:name>ONLY_ONE</suso:name></suso:authField>',
    ).replace(
      /<suso:activity>[\s\S]*?<\/suso:activity><suso:activity>[\s\S]*?<\/suso:activity>/,
      '<suso:activity><suso:code>01</suso:code></suso:activity>',
    );
    const obj = parseAuthorizationObject(single);
    expect(Array.isArray(obj.fields)).toBe(true);
    expect(obj.fields).toHaveLength(1);
    expect(Array.isArray(obj.activities)).toBe(true);
    expect(obj.activities).toHaveLength(1);
  });

  it('handles an object with no fields/activities without throwing', () => {
    const empty = SUSO_XML.replace(
      /<suso:authFields>[\s\S]*?<\/suso:authFields>/,
      '<suso:authFields/>',
    ).replace(
      /<suso:activities>[\s\S]*?<\/suso:activities>/,
      '<suso:activities/>',
    );
    const obj = parseAuthorizationObject(empty);
    expect(obj.fields).toEqual([]);
    expect(obj.activities).toEqual([]);
  });
});
