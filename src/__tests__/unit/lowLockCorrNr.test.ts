/**
 * Issue #3, second half: Lock*Low returns SAP's CORRNR, and an Update*Low
 * without transport_request uses the CORRNR of the lock that produced its
 * handle. The dependency's lock() parsed only the handle; these tools now send
 * the same LOCK themselves (same URL, same Accept, session made stateful).
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

import { handleLockClass } from '../../handlers/class/low/handleLockClass';
import { handleUpdateClass } from '../../handlers/class/low/handleUpdateClass';
import { handleLockMetadataExtension } from '../../handlers/ddlx/low/handleLockMetadataExtension';
import { handleUpdateMetadataExtension } from '../../handlers/ddlx/low/handleUpdateMetadataExtension';
import { handleLockInterface } from '../../handlers/interface/low/handleLockInterface';
import { handleUpdateInterface } from '../../handlers/interface/low/handleUpdateInterface';
import { handleLockProgram } from '../../handlers/program/low/handleLockProgram';
import { handleUpdateProgram } from '../../handlers/program/low/handleUpdateProgram';
import { handleLockStructure } from '../../handlers/structure/low/handleLockStructure';
import { handleUpdateStructure } from '../../handlers/structure/low/handleUpdateStructure';
import { handleLockView } from '../../handlers/view/low/handleLockView';
import { handleUpdateView } from '../../handlers/view/low/handleUpdateView';
import { resetLowLockTransports } from '../../lib/lowLockTransport';

const lockXml = (handle: string, corr: string) =>
  `<?xml version="1.0" encoding="utf-8"?><asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0"><asx:values><DATA>` +
  `<LOCK_HANDLE>${handle}</LOCK_HANDLE><CORRNR>${corr}</CORRNR><CORRUSER>${corr ? 'SOME.USER' : ''}</CORRUSER>` +
  `<CORRTEXT>${corr ? 'My request' : ''}</CORRTEXT><IS_LOCAL>${corr ? '' : 'X'}</IS_LOCAL></DATA></asx:values></asx:abap>`;

function ctx(handle: string, corr: string) {
  const requests: any[] = [];
  const sessionTypes: string[] = [];
  return {
    requests,
    sessionTypes,
    context: {
      connection: {
        getConfig: () => ({ systemType: 'onprem' }),
        setSessionType: (t: string) => sessionTypes.push(t),
        makeAdtRequest: (req: any) => {
          requests.push(req);
          return Promise.resolve({
            status: 200,
            data: lockXml(handle, corr),
            headers: {},
          });
        },
      } as any,
      logger: undefined,
    },
  };
}

type Case = [
  string,
  (c: any, a: any) => Promise<any>,
  any,
  string,
  (c: any, a: any) => Promise<any>,
  any,
];
const cases: Case[] = [
  [
    'program',
    handleLockProgram,
    { program_name: 'ZMY_PROG' },
    '/sap/bc/adt/programs/programs/zmy_prog',
    handleUpdateProgram,
    { program_name: 'ZMY_PROG', source_code: 'REPORT x.' },
  ],
  [
    'interface',
    handleLockInterface,
    { interface_name: 'ZIF_MY' },
    '/sap/bc/adt/oo/interfaces/zif_my',
    handleUpdateInterface,
    { interface_name: 'ZIF_MY', source_code: 'INTERFACE x.' },
  ],
  [
    'class',
    handleLockClass,
    { class_name: 'ZCL_MY' },
    '/sap/bc/adt/oo/classes/zcl_my',
    handleUpdateClass,
    { class_name: 'ZCL_MY', source_code: 'CLASS x.' },
  ],
  [
    'view',
    handleLockView,
    { view_name: 'ZMY_V' },
    '/sap/bc/adt/ddic/ddl/sources/zmy_v',
    handleUpdateView,
    { view_name: 'ZMY_V', ddl_source: 'define view entity x' },
  ],
  [
    'structure',
    handleLockStructure,
    { structure_name: 'ZMY_S' },
    '/sap/bc/adt/ddic/structures/zmy_s',
    handleUpdateStructure,
    { structure_name: 'ZMY_S', ddl_code: 'define structure x' },
  ],
  [
    'metadata extension',
    handleLockMetadataExtension,
    { name: 'ZMY_X' },
    '/sap/bc/adt/ddic/ddlx/sources/zmy_x',
    handleUpdateMetadataExtension,
    { name: 'ZMY_X', source_code: 'annotate entity x' },
  ],
];

const body = (res: any) => JSON.parse(res.content[0].text);

describe.each(
  cases,
)('%s: Lock*Low CORRNR -> Update*Low (#3)', (_n, lock, lockArgs, url, update, updateArgs) => {
  beforeEach(() => {
    updateSpy.mockClear();
    resetLowLockTransports();
  });

  it('the lock returns CORRNR, sent as the dependency sends it', async () => {
    const { context, requests, sessionTypes } = ctx('LH-A', 'ABCK900002');
    const res = await lock(context, lockArgs);
    expect(res.isError).toBeFalsy();
    const out = body(res);
    expect(out.lock_handle).toBe('LH-A');
    expect(out.corr_nr).toBe('ABCK900002');
    expect(out.corr_user).toBe('SOME.USER');
    expect(sessionTypes).toEqual(['stateful']);
    const req = requests.find((r) => String(r.url).startsWith(url));
    expect(req).toBeDefined();
    expect(req.method).toBe('POST');
    expect(req.params).toMatchObject({ _action: 'LOCK', accessMode: 'MODIFY' });
    expect(req.headers.Accept).toContain('com.sap.adt.lock.result2');
  });

  it('an update without transport_request uses that CORRNR', async () => {
    const { context } = ctx('LH-B', 'ABCK900002');
    await lock(context, lockArgs);
    const res = await update(context, { ...updateArgs, lock_handle: 'LH-B' });
    expect(res.isError).toBeFalsy();
    expect(updateSpy.mock.calls[0][0].transportRequest).toBe('ABCK900002');
    expect(body(res).transport_request_source).toBe('lock (CORRNR)');
  });

  it('an explicit transport_request wins over the lock', async () => {
    const { context } = ctx('LH-C', 'ABCK900002');
    await lock(context, lockArgs);
    await update(context, {
      ...updateArgs,
      lock_handle: 'LH-C',
      transport_request: 'ABCK900005',
    });
    expect(updateSpy.mock.calls[0][0].transportRequest).toBe('ABCK900005');
  });

  it('a local object ($TMP, empty CORRNR) sends no corrNr', async () => {
    const { context } = ctx('LH-D', '');
    const out = body(await lock(context, lockArgs));
    expect(out.corr_nr).toBeNull();
    await update(context, { ...updateArgs, lock_handle: 'LH-D' });
    expect(updateSpy.mock.calls[0][0].transportRequest).toBeUndefined();
  });
});
