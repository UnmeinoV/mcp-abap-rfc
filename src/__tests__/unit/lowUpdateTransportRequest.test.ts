/**
 * Issue #3: six Update*Low tools neither advertised nor forwarded
 * `transport_request`, so writing into an object in a transportable package
 * failed with "Parameter corrNr could not be found". The dependency's update
 * (lockHandle path) appends `corrNr` when `config.transportRequest` is set, so
 * the handler only has to pass it.
 */

const updateSpy = jest.fn();

jest.mock('../../lib/clients', () => {
  const objectClient = {
    update: (...a: any[]) => {
      updateSpy(...a);
      return Promise.resolve({ updateResult: { status: 200 } });
    },
  };
  return {
    createAdtClient: () =>
      new Proxy({}, { get: () => () => objectClient }) as any,
  };
});

import {
  TOOL_DEFINITION as CLAS,
  handleUpdateClass,
} from '../../handlers/class/low/handleUpdateClass';
import {
  TOOL_DEFINITION as DDLX,
  handleUpdateMetadataExtension,
} from '../../handlers/ddlx/low/handleUpdateMetadataExtension';
import {
  handleUpdateInterface,
  TOOL_DEFINITION as INTF,
} from '../../handlers/interface/low/handleUpdateInterface';
import {
  handleUpdateProgram,
  TOOL_DEFINITION as PROG,
} from '../../handlers/program/low/handleUpdateProgram';
import {
  handleUpdateStructure,
  TOOL_DEFINITION as STRU,
} from '../../handlers/structure/low/handleUpdateStructure';
import {
  handleUpdateView,
  TOOL_DEFINITION as VIEW,
} from '../../handlers/view/low/handleUpdateView';

const cases: [string, any, (c: any, a: any) => Promise<any>, any][] = [
  [
    'UpdateProgramLow',
    PROG,
    handleUpdateProgram,
    { program_name: 'ZMY_PROG', source_code: 'REPORT x.' },
  ],
  [
    'UpdateInterfaceLow',
    INTF,
    handleUpdateInterface,
    { interface_name: 'ZIF_MY', source_code: 'INTERFACE x.' },
  ],
  [
    'UpdateClassLow',
    CLAS,
    handleUpdateClass,
    { class_name: 'ZCL_MY', source_code: 'CLASS x.' },
  ],
  [
    'UpdateViewLow',
    VIEW,
    handleUpdateView,
    { view_name: 'ZMY_V', ddl_source: 'define view entity x' },
  ],
  [
    'UpdateStructureLow',
    STRU,
    handleUpdateStructure,
    { structure_name: 'ZMY_S', ddl_code: 'define structure x' },
  ],
  [
    'UpdateMetadataExtensionLow',
    DDLX,
    handleUpdateMetadataExtension,
    { name: 'ZMY_X', source_code: 'annotate entity x' },
  ],
];

const ctx = () => ({
  connection: { getConfig: () => ({ systemType: 'onprem' }) } as any,
  logger: undefined,
});

describe.each(
  cases,
)('%s forwards transport_request (#3)', (name, def, handler, base) => {
  beforeEach(() => updateSpy.mockClear());

  it('advertises transport_request', () => {
    expect(def.name).toBe(name);
    expect(def.inputSchema.properties.transport_request).toBeDefined();
  });

  it('passes it to the dependency as transportRequest', async () => {
    const res = await handler(ctx(), {
      ...base,
      lock_handle: 'LH1',
      transport_request: 'ABCK900001',
    });
    expect(res.isError).toBeFalsy();
    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy.mock.calls[0][0].transportRequest).toBe('ABCK900001');
    expect(updateSpy.mock.calls[0][1]).toEqual({ lockHandle: 'LH1' });
  });

  it('omits it for $TMP objects (no corrNr sent)', async () => {
    await handler(ctx(), { ...base, lock_handle: 'LH1' });
    expect(updateSpy.mock.calls[0][0].transportRequest).toBeUndefined();
  });
});
