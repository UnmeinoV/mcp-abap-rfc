const mockRead = jest.fn();
const mockMakeAdt = jest.fn();

jest.mock('../../lib/clients', () => ({
  createAdtClient: () => ({
    getServiceBinding: () => ({ read: mockRead }),
  }),
}));

jest.mock('../../lib/utils', () => ({
  ...jest.requireActual('../../lib/utils'),
  makeAdtRequestWithTimeout: (...args: any[]) => mockMakeAdt(...args),
}));

import { handleGetServiceBinding } from '../../handlers/service_binding/high/handleGetServiceBinding';
import type { HandlerContext } from '../../lib/handlers/interfaces';

const bindingName = 'ZUI_ANTCLASS_O4_G101501';
const serviceName = 'ZUI_ANTCLASS_G101501';
const serviceRoot =
  '/sap/opu/odata4/sap/zui_antclass_o4_g101501/srvd/sap/zui_antclass_g101501/0001/';
const context = { connection: {}, logger: undefined } as HandlerContext;

function response(data: string) {
  return { data, status: 200, statusText: 'OK', headers: {}, config: {} };
}

function bindingXml(
  services = `<srvb:services srvb:name="${serviceName}"><srvb:content srvb:version="0001"/></srvb:services>`,
  published: string | undefined = 'true',
  version = 'V4',
) {
  return `<srvb:serviceBinding xmlns:srvb="http://www.sap.com/adt/ddic/ServiceBindings" ${published === undefined ? '' : `srvb:published="${published}"`}>
    ${services}
    <srvb:binding srvb:type="ODATA" srvb:version="${version}"/>
  </srvb:serviceBinding>`;
}

function categoryXml(url = serviceRoot, published = 'true') {
  return `<odatav4:serviceGroup xmlns:odatav4="http://www.sap.com/adt/businessservices/odatav4" odatav4:published="${published}">
    <odatav4:services odatav4:serviceId="${serviceName}" odatav4:serviceVersion="0001" odatav4:repositoryId="SRVD" odatav4:serviceUrl="${url}"/>
  </odatav4:serviceGroup>`;
}

async function readBinding(xml: string) {
  mockRead.mockResolvedValue({ readResult: response(xml) });
  const result: any = await handleGetServiceBinding(context, {
    service_binding_name: bindingName,
  });
  expect(result.isError).toBe(false);
  return JSON.parse(result.content[0].text);
}

describe('GetServiceBinding service root resolution', () => {
  beforeEach(() => {
    mockRead.mockReset();
    mockMakeAdt.mockReset();
    mockMakeAdt.mockResolvedValue(response(categoryXml()));
  });

  it('queries the binding category with the declared service name and version', async () => {
    const result = await readBinding(bindingXml());

    expect(mockMakeAdt).toHaveBeenCalledWith(
      context.connection,
      `/sap/bc/adt/businessservices/odatav4/${bindingName}`,
      'GET',
      'default',
      undefined,
      { servicename: serviceName, serviceversion: '0001' },
      { Accept: 'application/vnd.sap.adt.businessservices.odatav4.v1+xml' },
    );
    expect(result).toMatchObject({
      published: true,
      service_root: serviceRoot,
      repository_id: 'SRVD',
      service_id: serviceName,
      service_version: '0001',
      declared_service_version: '0001',
    });
    expect(mockMakeAdt).toHaveBeenCalledTimes(1);
  });

  it('selects the first named service and its first declared content version', async () => {
    await readBinding(
      bindingXml(
        `<srvb:services><srvb:content srvb:version="9999"/></srvb:services>
        <srvb:services srvb:name=" "/>
        <srvb:services srvb:name="${serviceName}">
          <srvb:content/><srvb:content srvb:version=" "/>
          <srvb:content srvb:version="0002"/><srvb:content srvb:version="0003"/>
        </srvb:services>
        <srvb:services srvb:name="ZOTHER_SERVICE"><srvb:content srvb:version="0004"/></srvb:services>`,
      ),
    );

    expect(mockMakeAdt.mock.calls[0][5]).toEqual({
      servicename: serviceName,
      serviceversion: '0002',
    });
    expect(mockMakeAdt).toHaveBeenCalledTimes(1);
  });

  it.each([
    '',
    '<srvb:services srvb:name=" "><srvb:content srvb:version="0009"/></srvb:services>',
  ])('falls back to the binding name when no service is declared (%s)', async (services) => {
    await readBinding(bindingXml(services));

    expect(mockMakeAdt.mock.calls[0][5]).toEqual({
      servicename: bindingName,
    });
  });

  it.each([
    '',
    '<srvb:content/>',
    '<srvb:content srvb:version=" "/>',
  ])('omits serviceversion when the selected service declares none (%s)', async (content) => {
    mockMakeAdt.mockResolvedValue(response(categoryXml('')));
    const result = await readBinding(
      bindingXml(
        `<srvb:services srvb:name="${serviceName}">${content}</srvb:services>
        <srvb:services srvb:name="ZOTHER_SERVICE"><srvb:content srvb:version="0004"/></srvb:services>`,
      ),
    );

    expect(mockMakeAdt.mock.calls[0][5]).toEqual({ servicename: serviceName });
    expect(mockMakeAdt).toHaveBeenCalledTimes(1);
    expect(result.service_root).toBeNull();
    expect(result.declared_service_version).toBeUndefined();
  });

  it('returns the category version without overwriting it from the declaration', async () => {
    mockMakeAdt.mockResolvedValue(
      response(
        categoryXml().replace('serviceVersion="0001"', 'serviceVersion="0000"'),
      ),
    );

    const result = await readBinding(bindingXml());

    expect(mockMakeAdt.mock.calls[0][5]).toEqual({
      servicename: serviceName,
      serviceversion: '0001',
    });
    expect(result.service_version).toBe('0000');
    expect(result.declared_service_version).toBe('0001');
  });

  it('queries once without the version when the explicit version returns no URL', async () => {
    const names = [
      'Classifications',
      'Answers',
      'ClassificationHeaders',
      'Questions',
      'Candidates',
    ];
    const collections = names
      .map(
        (name) =>
          `<odatav4:collection odatav4:name="${name}" odatav4:isRoot="${name === 'Classifications'}"/>`,
      )
      .join('');
    const fallbackXml = categoryXml(serviceRoot, 'false')
      .replace('serviceVersion="0001"', 'serviceVersion="0000"')
      .replace(
        '/>',
        `><odatav4:serviceInformation>${collections}</odatav4:serviceInformation></odatav4:services>`,
      );
    mockMakeAdt
      .mockResolvedValueOnce(response(categoryXml('', 'false')))
      .mockResolvedValueOnce(response(fallbackXml));

    const result = await readBinding(bindingXml());

    expect(mockMakeAdt).toHaveBeenCalledTimes(2);
    expect(mockMakeAdt.mock.calls.map((call) => call[5])).toEqual([
      { servicename: serviceName, serviceversion: '0001' },
      { servicename: serviceName },
    ]);
    for (const call of mockMakeAdt.mock.calls) {
      expect(call[1]).toBe(
        `/sap/bc/adt/businessservices/odatav4/${bindingName}`,
      );
      expect(call[2]).toBe('GET');
    }
    expect(result).toMatchObject({
      service_root: serviceRoot,
      published: true,
      service_version: '0000',
      declared_service_version: '0001',
      collections: names.map((name) => ({
        name,
        is_root: name === 'Classifications',
      })),
    });
    expect(result.service_root_note).toBeUndefined();
  });

  it('preserves published=true when the category has no URL and says false', async () => {
    mockMakeAdt.mockResolvedValue(response(categoryXml('', 'false')));

    const result = await readBinding(bindingXml());

    expect(result.published).toBe(true);
    expect(result.service_root).toBeNull();
    expect(result.service_root_note).toMatch(/no service URL/);
    expect(result.service_root_note).not.toMatch(/PublishServiceBinding/);
    expect(mockMakeAdt).toHaveBeenCalledTimes(2);
    expect(result.declared_service_version).toBe('0001');
  });

  it('stops after a failed fallback and retains the first category metadata', async () => {
    mockMakeAdt
      .mockResolvedValueOnce(response(categoryXml('')))
      .mockRejectedValueOnce({
        response: { status: 503 },
        message: 'Category unavailable',
      });

    const result = await readBinding(bindingXml());

    expect(mockMakeAdt).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({
      service_root: null,
      published: true,
      service_version: '0001',
      declared_service_version: '0001',
    });
    expect(result.service_root_note).toMatch(
      /query without serviceversion failed/,
    );
    expect(result.service_root_note).toMatch(/HTTP 503/);
  });

  it('preserves an explicitly unpublished binding over category state', async () => {
    const result = await readBinding(bindingXml(undefined, 'false'));

    expect(result.published).toBe(false);
    expect(result.service_root).toBe(serviceRoot);
  });

  it('retains binding publication when the category has no service entry', async () => {
    mockMakeAdt.mockResolvedValue(response('<serviceGroup/>'));

    const result = await readBinding(bindingXml());

    expect(result.published).toBe(true);
    expect(result.service_root).toBeNull();
    expect(result.service_root_note).toMatch(/no service entry/);
    expect(result.payload).toBeDefined();
    expect(mockMakeAdt).toHaveBeenCalledTimes(2);
  });

  it('retains binding publication and document when root resolution fails', async () => {
    mockMakeAdt.mockRejectedValue({
      response: { status: 403 },
      message: 'Category access denied',
    });

    const result = await readBinding(bindingXml());

    expect(result.published).toBe(true);
    expect(result.service_root).toBeNull();
    expect(result.service_root_note).toMatch(/HTTP 403/);
    expect(result.payload).toBeDefined();
    expect(result.declared_service_version).toBe('0001');
    expect(mockMakeAdt).toHaveBeenCalledTimes(1);
  });

  it('uses category publication only when the binding omits it', async () => {
    const result = await readBinding(
      bindingXml().replace('srvb:published="true"', ''),
    );

    expect(result.published).toBe(true);
  });

  it('uses the declared V2 category and accepts a single service entry', async () => {
    mockMakeAdt.mockResolvedValue(
      response(
        '<serviceList published="true"><services serviceUrl="/sap/opu/odata/sap/DECLARED_V2/"/></serviceList>',
      ),
    );
    const xml = bindingXml(undefined, 'true', 'V2')
      .replaceAll('srvb:', 'binding:')
      .replace('xmlns:srvb=', 'xmlns:binding=')
      .replaceAll('"', "'");
    const result = await readBinding(xml);

    expect(mockMakeAdt.mock.calls[0][1]).toBe(
      `/sap/bc/adt/businessservices/odatav2/${bindingName}`,
    );
    expect(mockMakeAdt.mock.calls[0][5]).toEqual({
      servicename: serviceName,
      serviceversion: '0001',
    });
    expect(mockMakeAdt.mock.calls[0][6]).toEqual({
      Accept: 'application/vnd.sap.adt.businessservices.odatav2.v2+xml',
    });
    expect(result.service_root).toBe('/sap/opu/odata/sap/DECLARED_V2/');
  });
});
