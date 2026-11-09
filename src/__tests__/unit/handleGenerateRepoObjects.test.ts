/**
 * Unit tests for handleGenerateRepoObjects.
 *
 * Body composition + response parser + validation + end-to-end happy paths
 * with mocked makeAdtRequestWithTimeout. Mirrors the createTransportLockedRecovery
 * mock pattern.
 */

const mockMakeAdt = jest.fn();

jest.mock('../../lib/utils', () => ({
  ...jest.requireActual('../../lib/utils'),
  makeAdtRequestWithTimeout: (...args: any[]) => mockMakeAdt(...args),
}));

import {
  composeGeneratorBody,
  composeSmbcBody,
  composeUiServiceBody,
  type GenerateRepoObjectsArgs,
  handleGenerateRepoObjects,
  parseObjectReferences,
  pickServiceBindingRef,
  validateArgs,
} from '../../handlers/generator/high/handleGenerateRepoObjects';

// ---------- Helpers --------------------------------------------------------

const ctx = () =>
  ({
    connection: { makeAdtRequest: jest.fn() } as any,
    logger: undefined,
  }) as any;

const uiArgs: GenerateRepoObjectsArgs = {
  type: 'uiservice',
  reference_object_name: 'ZLEAVE_R2',
  package: '$TMP',
  master_language: 'EN',
  description: 'ZLEAVE_R23',
  cds_name: 'ZR_LEAVE_R23',
  behavior_implementation_class: 'ZBP_LEAVE_R23',
  draft_table: 'ZLEAVE_R2_D3',
  service_projection_name: 'ZC_LEAVE_R23',
  service_definition_name: 'ZUI_LEAVE_R2_O43',
  service_binding_name: 'ZUI_LEAVE_R2_O43',
  transport_request: '',
};

const webapiArgs: GenerateRepoObjectsArgs = {
  type: 'webapiservice',
  reference_object_name: 'ZLEAVE_R2',
  package: '$TMP',
  master_language: 'EN',
  description: 'Web API',
  cds_name: 'ZR_WAPI',
  behavior_implementation_class: 'ZBP_WAPI',
  service_projection_name: 'ZC_WAPI',
  service_definition_name: 'ZSD_WAPI',
  service_binding_name: 'ZSB_WAPI',
};

const smbcArgs: GenerateRepoObjectsArgs = {
  type: 'smbc',
  reference_object_name: 'ZLEAVE_R2',
  package: '$TMP',
  master_language: 'EN',
  description: 'Maintenance',
  maintenance_object_name: 'ZMO_LEAVE_R2',
};

const okAxios = (data: string, status = 200) =>
  ({ status, statusText: 'OK', headers: {}, config: {} as any, data }) as any;

// ---------- Body composition ----------------------------------------------

describe('composeUiServiceBody', () => {
  it('produces a UI-service body with default bindingType "OData V4 - UI"', () => {
    const body: any = composeUiServiceBody(uiArgs, 'OData V4 - UI');
    expect(body.metadata.package).toBe('$TMP');
    expect(body.metadata.masterLanguage).toBe('EN');
    expect(body.general.referenceObjectName).toBe('ZLEAVE_R2');
    expect(body.general.description).toBe('ZLEAVE_R23');
    expect(body.businessObject.dataModelEntity.cdsName).toBe('ZR_LEAVE_R23');
    expect(body.businessObject.behavior.implementationType).toBe('Managed');
    expect(body.businessObject.behavior.implementationClass).toBe(
      'ZBP_LEAVE_R23',
    );
    expect(body.businessObject.behavior.draftTable).toBe('ZLEAVE_R2_D3');
    expect(body.serviceProjection.name).toBe('ZC_LEAVE_R23');
    expect(body.businessService.serviceDefinition.name).toBe(
      'ZUI_LEAVE_R2_O43',
    );
    expect(body.businessService.serviceBinding.name).toBe('ZUI_LEAVE_R2_O43');
    expect(body.businessService.serviceBinding.bindingType).toBe(
      'OData V4 - UI',
    );
    // empty transport_request must NOT add a transportRequest field
    expect(body.metadata.transportRequest).toBeUndefined();
  });

  it('produces a Web API body with default bindingType "OData V4"', () => {
    const body: any = composeUiServiceBody(webapiArgs, 'OData V4');
    expect(body.businessService.serviceBinding.bindingType).toBe('OData V4');
    // webapi has no draft_table — field must NOT be set
    expect(body.businessObject.behavior.draftTable).toBeUndefined();
  });

  it('honors an explicit service_binding_type override', () => {
    const body: any = composeUiServiceBody(
      { ...webapiArgs, service_binding_type: 'OData V2' },
      'OData V4',
    );
    expect(body.businessService.serviceBinding.bindingType).toBe('OData V2');
  });

  it('includes transportRequest when transport_request is set', () => {
    const body: any = composeUiServiceBody(
      { ...uiArgs, transport_request: 'ABCK900099' },
      'OData V4 - UI',
    );
    expect(body.metadata.transportRequest).toBe('ABCK900099');
  });
});

describe('composeSmbcBody', () => {
  it('places package at the top level and puts maintenanceObject nested', () => {
    const body: any = composeSmbcBody(smbcArgs);
    expect(body.package).toBe('$TMP');
    expect(body.masterLanguage).toBe('EN');
    expect(body.referenceObject.name).toBe('ZLEAVE_R2');
    expect(body.maintenanceObject.name).toBe('ZMO_LEAVE_R2');
    expect(body.maintenanceObject.description).toBe('Maintenance');
    expect(body.transportRequest).toBeUndefined();
  });

  it('falls back to maintenance_object_name when no description provided', () => {
    const body: any = composeSmbcBody({
      ...smbcArgs,
      description: undefined,
      smbc_description: undefined,
    });
    expect(body.maintenanceObject.description).toBe('ZMO_LEAVE_R2');
  });
});

describe('composeGeneratorBody dispatcher', () => {
  it('dispatches to uiservice composer', () => {
    const body: any = composeGeneratorBody(uiArgs);
    expect(body.businessService.serviceBinding.bindingType).toBe(
      'OData V4 - UI',
    );
  });
  it('dispatches to webapiservice composer', () => {
    const body: any = composeGeneratorBody(webapiArgs);
    expect(body.businessService.serviceBinding.bindingType).toBe('OData V4');
  });
  it('dispatches to smbc composer', () => {
    const body: any = composeGeneratorBody(smbcArgs);
    expect(body.maintenanceObject).toBeDefined();
  });
});

// ---------- Response parsing -----------------------------------------------

describe('parseObjectReferences', () => {
  it('parses a multi-ref objectReferences XML', () => {
    const xml =
      `<?xml version="1.0" encoding="utf-8"?>` +
      `<adtcore:objectReferences xmlns:adtcore="http://www.sap.com/adt/core">` +
      `<adtcore:objectReference adtcore:uri="/sap/bc/adt/businessservices/bindings/zui_leave_r2_o43" adtcore:type="SRVB/SVB" adtcore:name="ZUI_LEAVE_R2_O43"/>` +
      `<adtcore:objectReference adtcore:uri="/sap/bc/adt/ddic/srvd/sources/zui_leave_r2_o43" adtcore:type="SRVD/SRV" adtcore:name="ZUI_LEAVE_R2_O43"/>` +
      `</adtcore:objectReferences>`;
    const { references, raw } = parseObjectReferences(xml);
    expect(references).toHaveLength(2);
    expect(references[0]).toEqual({
      uri: '/sap/bc/adt/businessservices/bindings/zui_leave_r2_o43',
      type: 'SRVB/SVB',
      name: 'ZUI_LEAVE_R2_O43',
      meta: {
        uri: '/sap/bc/adt/businessservices/bindings/zui_leave_r2_o43',
        type: 'SRVB/SVB',
        name: 'ZUI_LEAVE_R2_O43',
      },
    });
    expect(references[1].type).toBe('SRVD/SRV');
    expect(raw.objectReferences).toBeDefined();
  });

  it('parses a single-ref response (fast-xml-parser collapses to object)', () => {
    const xml =
      `<adtcore:objectReferences xmlns:adtcore="http://www.sap.com/adt/core">` +
      `<adtcore:objectReference adtcore:uri="/foo" adtcore:type="TABL/TAB" adtcore:name="ZBAR"/>` +
      `</adtcore:objectReferences>`;
    const { references } = parseObjectReferences(xml);
    expect(references).toHaveLength(1);
    expect(references[0].name).toBe('ZBAR');
  });

  it('returns empty array on empty body', () => {
    const { references } = parseObjectReferences(
      `<adtcore:objectReferences xmlns:adtcore="http://www.sap.com/adt/core"/>`,
    );
    expect(references).toEqual([]);
  });

  it('returns empty array on non-XML / garbage body', () => {
    const { references } = parseObjectReferences('not xml at all');
    expect(references).toEqual([]);
  });
});

describe('pickServiceBindingRef', () => {
  const refs = [
    { uri: '/a', type: 'DDLS/VI', name: 'ZC_LEAVE', meta: {} },
    { uri: '/b', type: 'SRVB/SVB', name: 'ZUI_LEAVE_R2_O43', meta: {} },
    { uri: '/c', type: 'SRVD/SRV', name: 'ZUI_LEAVE_R2_O43', meta: {} },
  ];
  it('prefers a reference whose name matches expectedName', () => {
    const picked = pickServiceBindingRef(refs, 'ZUI_LEAVE_R2_O43');
    // pickServiceBindingRef walks the array — first match wins. Since both
    // SRVB and SRVD have the same name, the SRVB comes first → picks SRVB.
    expect(picked?.uri).toBe('/b');
  });
  it('falls back to type prefix SRVB/', () => {
    const refs2 = [
      { uri: '/a', type: 'DDLS/VI', name: 'ZC', meta: {} },
      { uri: '/c', type: 'SRVD/SRV', name: 'ZUI', meta: {} },
      { uri: '/b', type: 'SRVB/SVB', name: 'ZUI', meta: {} },
    ];
    expect(pickServiceBindingRef(refs2)?.uri).toBe('/b');
  });
  it('falls back to first ref when nothing matches', () => {
    const refs2 = [
      { uri: '/a', type: 'DDLS/VI', name: 'ZC', meta: {} },
      { uri: '/b', type: 'TABL/TAB', name: 'ZT', meta: {} },
    ];
    expect(pickServiceBindingRef(refs2)?.uri).toBe('/a');
  });
  it('returns undefined on empty input', () => {
    expect(pickServiceBindingRef([])).toBeUndefined();
  });
});

// ---------- Validation -----------------------------------------------------

describe('validateArgs', () => {
  it('returns a string error when args is missing', () => {
    expect(validateArgs(undefined)).toMatch(/required/);
    expect(validateArgs(null)).toMatch(/required/);
  });

  it('flags invalid type', () => {
    const errors = validateArgs({ ...uiArgs, type: 'wat' as any });
    expect(errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'type' })]),
    );
  });

  it('flags missing reference_object_name and package', () => {
    const errors = validateArgs({
      type: 'uiservice',
      cds_name: 'X',
      behavior_implementation_class: 'X',
      service_projection_name: 'X',
      service_definition_name: 'X',
      service_binding_name: 'X',
    } as any);
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'reference_object_name' }),
        expect.objectContaining({ field: 'package' }),
      ]),
    );
  });

  it('requires all RAP fields for uiservice', () => {
    const errors = validateArgs({
      type: 'uiservice',
      reference_object_name: 'Z',
      package: '$TMP',
    } as any);
    // validateArgs returns a string only for a missing/non-object args; with a
    // real object it is always the error array. Narrow so .map() type-checks.
    if (typeof errors === 'string') throw new Error(errors);
    expect(errors.length).toBeGreaterThanOrEqual(5);
    expect(errors.map((e) => e.field)).toEqual(
      expect.arrayContaining([
        'cds_name',
        'behavior_implementation_class',
        'service_projection_name',
        'service_definition_name',
        'service_binding_name',
      ]),
    );
  });

  it('requires only maintenance_object_name for smbc', () => {
    const errors = validateArgs({
      type: 'smbc',
      reference_object_name: 'Z',
      package: '$TMP',
    } as any);
    expect(errors).toEqual([
      { field: 'maintenance_object_name', message: expect.any(String) },
    ]);
  });

  it('returns empty array on valid uiservice args', () => {
    expect(validateArgs(uiArgs)).toEqual([]);
  });

  it('returns empty array on valid smbc args', () => {
    expect(validateArgs(smbcArgs)).toEqual([]);
  });
});

// ---------- End-to-end handler flow ---------------------------------------

describe('handleGenerateRepoObjects — end-to-end (mocked)', () => {
  beforeEach(() => mockMakeAdt.mockReset());

  it('uiservice happy path: POST + GET SRVB', async () => {
    const srvbXml =
      `<?xml version="1.0" encoding="utf-8"?>` +
      `<srvb:serviceBinding xmlns:srvb="http://www.sap.com/adt/ddic/ServiceBindings" ` +
      `xmlns:adtcore="http://www.sap.com/adt/core" ` +
      `srvb:bindingCreated="true" srvb:published="false" ` +
      `adtcore:name="ZUI_LEAVE_R2_O43" adtcore:type="SRVB/SVB"/>`;
    mockMakeAdt
      .mockResolvedValueOnce(
        okAxios(
          `<?xml version="1.0" encoding="utf-8"?>` +
            `<adtcore:objectReferences xmlns:adtcore="http://www.sap.com/adt/core">` +
            `<adtcore:objectReference adtcore:uri="/sap/bc/adt/businessservices/bindings/zui_leave_r2_o43" adtcore:type="SRVB/SVB" adtcore:name="ZUI_LEAVE_R2_O43"/>` +
            `<adtcore:objectReference adtcore:uri="/sap/bc/adt/ddic/srvd/sources/zui_leave_r2_o43" adtcore:type="SRVD/SRV" adtcore:name="ZUI_LEAVE_R2_O43"/>` +
            `</adtcore:objectReferences>`,
        ),
      )
      .mockResolvedValueOnce(okAxios(srvbXml));

    const res: any = await handleGenerateRepoObjects(ctx(), uiArgs);
    expect(res.isError).toBe(false);
    const payload = JSON.parse(res.content[0].text);
    expect(payload.success).toBe(true);
    expect(payload.type).toBe('uiservice');
    expect(payload.generated_objects).toHaveLength(2);
    expect(payload.service_binding.uri).toBe(
      '/sap/bc/adt/businessservices/bindings/zui_leave_r2_o43',
    );
    expect(payload.service_binding.http_status).toBe(200);
    expect(payload.message).toMatch(/Generated 2 object/);

    // POST then GET
    expect(mockMakeAdt).toHaveBeenCalledTimes(2);
    const [postCall, getCall] = mockMakeAdt.mock.calls;
    expect(postCall[1]).toContain(
      '/sap/bc/adt/businessservices/generators/uiservice',
    );
    expect(postCall[1]).toContain(
      'referencedObject=' +
        encodeURIComponent('/sap/bc/adt/ddic/tables/ZLEAVE_R2'),
    );
    expect(postCall[2]).toBe('POST');
    expect(postCall[6]['Content-Type']).toBe(
      'application/vnd.sap.adt.repository.generator.content.v1+json',
    );
    const body = JSON.parse(postCall[4]);
    expect(body.businessService.serviceBinding.bindingType).toBe(
      'OData V4 - UI',
    );

    expect(getCall[1]).toBe(
      '/sap/bc/adt/businessservices/bindings/zui_leave_r2_o43',
    );
    expect(getCall[2]).toBe('GET');
    expect(getCall[6].Accept).toBe(
      'application/vnd.sap.adt.businessservices.servicebinding.v1+xml, application/vnd.sap.adt.businessservices.servicebinding.v2+xml',
    );
  });

  it('webapiservice happy path: same flow with default bindingType "OData V4"', async () => {
    mockMakeAdt
      .mockResolvedValueOnce(
        okAxios(
          `<adtcore:objectReferences xmlns:adtcore="http://www.sap.com/adt/core">` +
            `<adtcore:objectReference adtcore:uri="/sap/bc/adt/businessservices/bindings/zsb_wapi" adtcore:type="SRVB/SVB" adtcore:name="ZSB_WAPI"/>` +
            `</adtcore:objectReferences>`,
        ),
      )
      .mockResolvedValueOnce(okAxios('<srvb:serviceBinding/>'));

    const res: any = await handleGenerateRepoObjects(ctx(), webapiArgs);
    expect(res.isError).toBe(false);
    const payload = JSON.parse(res.content[0].text);
    expect(payload.type).toBe('webapiservice');
    expect(payload.service_binding.uri).toBe(
      '/sap/bc/adt/businessservices/bindings/zsb_wapi',
    );
    const [, , , , bodyStr] = mockMakeAdt.mock.calls[0];
    expect(JSON.parse(bodyStr).businessService.serviceBinding.bindingType).toBe(
      'OData V4',
    );
  });

  it('smbc happy path: POST only, no SRVB follow-up', async () => {
    mockMakeAdt.mockResolvedValueOnce(
      okAxios(
        `<adtcore:objectReferences xmlns:adtcore="http://www.sap.com/adt/core">` +
          `<adtcore:objectReference adtcore:uri="/sap/bc/adt/bct/maintenances/zmo_leave_r2" adtcore:type="SMBC/SMO" adtcore:name="ZMO_LEAVE_R2"/>` +
          `</adtcore:objectReferences>`,
      ),
    );

    const res: any = await handleGenerateRepoObjects(ctx(), smbcArgs);
    expect(res.isError).toBe(false);
    const payload = JSON.parse(res.content[0].text);
    expect(payload.type).toBe('smbc');
    expect(payload.generated_objects).toHaveLength(1);
    expect(payload.generated_objects[0].name).toBe('ZMO_LEAVE_R2');
    expect(payload.service_binding).toBeUndefined();
    expect(mockMakeAdt).toHaveBeenCalledTimes(1);

    // Verify the POST body shape — package at top level, maintenanceObject nested
    const [, , , , bodyStr] = mockMakeAdt.mock.calls[0];
    const body = JSON.parse(bodyStr);
    expect(body.package).toBe('$TMP');
    expect(body.maintenanceObject.name).toBe('ZMO_LEAVE_R2');
    expect(body.referenceObject.name).toBe('ZLEAVE_R2');
    expect(mockMakeAdt.mock.calls[0][1]).toContain(
      '/sap/bc/adt/bct/generators/smbc',
    );
  });

  it('SRVB follow-up GET Accept header includes both v1 and v2 media types (no 406)', async () => {
    mockMakeAdt
      .mockResolvedValueOnce(
        okAxios(
          `<adtcore:objectReferences xmlns:adtcore="http://www.sap.com/adt/core">` +
            `<adtcore:objectReference adtcore:uri="/sap/bc/adt/businessservices/bindings/zui_x" adtcore:type="SRVB/SVB" adtcore:name="ZUI_LEAVE_R2_O43"/>` +
            `</adtcore:objectReferences>`,
        ),
      )
      .mockResolvedValueOnce(okAxios('<srvb:serviceBinding/>'));

    await handleGenerateRepoObjects(ctx(), uiArgs);
    const getCall = mockMakeAdt.mock.calls[1];
    const accept: string = getCall[6].Accept;
    // Regression guard — SAP returns 406 if either media type is missing.
    expect(accept).toMatch(/businessservices\.servicebinding\.v1\+xml/);
    expect(accept).toMatch(/businessservices\.servicebinding\.v2\+xml/);
  });

  it('zero-ref response surfaces raw body + SAP message', async () => {
    mockMakeAdt.mockResolvedValueOnce(
      okAxios(
        `<?xml version="1.0" encoding="utf-8"?>` +
          `<exc:exception xmlns:exc="http://www.sap.com/adt/exceptions">` +
          `<message lang="EN">Source table ZLEAVE_R2 not found</message>` +
          `</exc:exception>`,
      ),
    );
    const res: any = await handleGenerateRepoObjects(ctx(), smbcArgs);
    expect(res.isError).toBe(false);
    const payload = JSON.parse(res.content[0].text);
    expect(payload.generated_objects).toEqual([]);
    expect(payload.message).toMatch(/Generator returned 0 references/);
    expect(payload.message).toMatch(/Source table ZLEAVE_R2 not found/);
    expect(payload.raw_response_body).toContain('<exc:exception');
  });

  it('uiservice with SRVB GET failure still returns success with warning', async () => {
    mockMakeAdt
      .mockResolvedValueOnce(
        okAxios(
          `<adtcore:objectReferences xmlns:adtcore="http://www.sap.com/adt/core">` +
            `<adtcore:objectReference adtcore:uri="/sap/bc/adt/businessservices/bindings/zui" adtcore:type="SRVB/SVB" adtcore:name="ZUI_LEAVE_R2_O43"/>` +
            `</adtcore:objectReferences>`,
        ),
      )
      .mockRejectedValueOnce(new Error('HTTP 500 on GET'));
    const res: any = await handleGenerateRepoObjects(ctx(), uiArgs);
    expect(res.isError).toBe(false);
    const payload = JSON.parse(res.content[0].text);
    expect(payload.success).toBe(true);
    expect(payload.service_binding_warning).toMatch(/Follow-up GET/);
  });

  it('returns error when no args are provided', async () => {
    const res: any = await handleGenerateRepoObjects(ctx(), undefined as any);
    expect(res.isError).toBe(true);
  });

  it('returns error when type is unknown', async () => {
    const res: any = await handleGenerateRepoObjects(ctx(), {
      ...uiArgs,
      type: 'unknown' as any,
    });
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toMatch(
      /must be one of: uiservice, webapiservice, smbc/,
    );
  });

  it('returns error when uiservice missing required RAP fields', async () => {
    const res: any = await handleGenerateRepoObjects(ctx(), {
      type: 'uiservice',
      reference_object_name: 'Z',
      package: '$TMP',
    });
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toMatch(/Invalid args/);
    expect(res.content[0].text).toMatch(/cds_name/);
  });

  it('returns error when smbc missing maintenance_object_name', async () => {
    const res: any = await handleGenerateRepoObjects(ctx(), {
      type: 'smbc',
      reference_object_name: 'Z',
      package: '$TMP',
    });
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toMatch(/maintenance_object_name/);
  });

  it('forwards transport_request as corrNr query param', async () => {
    mockMakeAdt.mockResolvedValueOnce(
      okAxios(
        `<adtcore:objectReferences xmlns:adtcore="http://www.sap.com/adt/core"/>`,
      ),
    );
    await handleGenerateRepoObjects(ctx(), {
      ...uiArgs,
      transport_request: 'ABCK900099',
    });
    const [, , , , , params] = mockMakeAdt.mock.calls[0];
    expect(params).toEqual({ corrNr: 'ABCK900099' });
  });

  it('surfaces the underlying SAP error message on POST failure', async () => {
    mockMakeAdt.mockRejectedValueOnce(new Error('HTTP 400: bad body'));
    const res: any = await handleGenerateRepoObjects(ctx(), uiArgs);
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toMatch(/HTTP 400/);
  });
});
