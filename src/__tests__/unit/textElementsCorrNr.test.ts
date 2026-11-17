/**
 * UpdateTextElements with a TASK number as transport_request (2026-11-13,
 * a customer S/4 system, ZMY_PROG): the PUT with `corrNr=<task>` answered
 *   "Object LIMU REPT ZMY_PROG is already locked in request ABCK900001 of user
 *    DEVUSER [CTS_WBO_API/020]"
 * although TLOCK held the object under that very task ABCK900002; the retry
 * with the parent request ABCK900001 worked and the object stayed in the task.
 *
 * Read from that system's ABAP source: CL_SEDX_ADT_RES_TEXTELEMENT records through
 * CL_ADT_CORR_INSERT_DARK -> CL_ADT_CTS_MANAGEMENT->insert_objects_in_wb_request
 * (dark CTS API), whose lock holder is `lock_holder-req_header-trkorr` — the
 * REQUEST. A task number never equals it. So the handler resolves a task to its
 * request through E070-STRKORR before the PUT.
 *
 * The fake SAP below behaves like the measured one: a PUT whose corrNr is a
 * task of the request holding the object is refused with that message.
 */

import { handleUpdateTextElements } from '../../handlers/program/high/handleUpdateTextElements';
import { chooseCorrNr, requestForCorrNr } from '../../lib/corrNrRequest';
import { TEXT_ELEMENTS_BASE } from '../../lib/textElements';

const E070 = [
  {
    TRKORR: 'ABCK900001',
    TRFUNCTION: 'K',
    TRSTATUS: 'D',
    STRKORR: '',
    AS4USER: 'DEVUSER',
  },
  {
    TRKORR: 'ABCK900002',
    TRFUNCTION: 'S',
    TRSTATUS: 'D',
    STRKORR: 'ABCK900001',
    AS4USER: 'DEVUSER',
  },
];

function previewXml(
  columns: string[],
  rows: Array<Record<string, string>>,
): string {
  const cols = columns
    .map(
      (c) =>
        `<dataPreview:columns><dataPreview:metadata dataPreview:name="${c}" dataPreview:type="C" dataPreview:description="${c}"/><dataPreview:dataSet>${rows
          .map((r) =>
            r[c]
              ? `<dataPreview:data>${r[c]}</dataPreview:data>`
              : '<dataPreview:data/>',
          )
          .join('')}</dataPreview:dataSet></dataPreview:columns>`,
    )
    .join('');
  return `<?xml version="1.0" encoding="utf-8"?><dataPreview:tableData xmlns:dataPreview="http://www.sap.com/adt/dataPreview"><dataPreview:totalRows>0</dataPreview:totalRows>${cols}</dataPreview:tableData>`;
}

interface FakeOptions {
  e070Fails?: boolean;
}

/** A text-elements resource + E070, with SAP's request-level corrNr check. */
function fakeSap(options: FakeOptions = {}) {
  const url = `${TEXT_ELEMENTS_BASE}/zmy_prog`;
  let symbols = '@MaxLength:10\r\n001=Old';
  const puts: Array<{ corrNr?: string }> = [];
  const sqls: string[] = [];
  const connection: any = {
    makeAdtRequest: jest.fn(async (req: any) => {
      const method = String(req.method).toUpperCase();
      const params = req.params ?? {};
      if (req.url.endsWith('/datapreview/freestyle')) {
        const sql = String(req.data);
        sqls.push(sql);
        if (options.e070Fails) throw new Error('Data Preview down');
        return {
          status: 200,
          data: previewXml(
            ['TRKORR', 'TRFUNCTION', 'TRSTATUS', 'STRKORR', 'AS4USER'],
            E070.filter((r) => sql.includes(`'${r.TRKORR}'`)),
          ),
        };
      }
      if (req.url === url && method === 'GET') {
        return {
          status: 200,
          data: '<textelements adtcore:masterLanguage="EN" adtcore:version="active"/>',
        };
      }
      if (req.url === url && method === 'POST') {
        if (params._action === 'LOCK') {
          return {
            status: 200,
            data: '<asx:abap><asx:values><DATA><LOCK_HANDLE>LH1</LOCK_HANDLE><CORRNR>ABCK900001</CORRNR></DATA></asx:values></asx:abap>',
          };
        }
        return { status: 200, data: '' };
      }
      if (req.url.startsWith(`${url}/source/`) && method === 'GET') {
        return {
          status: 200,
          data: req.url.endsWith('/symbols') ? symbols : '',
        };
      }
      if (req.url === `${url}/source/symbols` && method === 'PUT') {
        puts.push({ corrNr: params.corrNr });
        if (params.corrNr && params.corrNr !== 'ABCK900001') {
          const error: any = new Error(
            'Object LIMU REPT ZMY_PROG is already locked in request ABCK900001 of user DEVUSER [CTS_WBO_API/020]',
          );
          error.response = { status: 400, data: error.message };
          throw error;
        }
        symbols = String(req.data);
        return { status: 200, data: '' };
      }
      throw new Error(`unexpected ${method} ${req.url}`);
    }),
  };
  return { connection, puts, sqls };
}

const parse = (r: any) => JSON.parse(String(r?.content?.[0]?.text ?? '{}'));

const args = (transport: string) => ({
  program_name: 'ZMY_PROG',
  symbols: [{ key: '001', text: 'New' }],
  transport_request: transport,
  activate: false,
});

describe('chooseCorrNr (E070 rows -> the corrNr to send)', () => {
  it('a task is sent as its request', () => {
    expect(chooseCorrNr('ABCK900002', E070)).toEqual({
      given: 'ABCK900002',
      send: 'ABCK900001',
      taskOf: 'ABCK900001',
    });
  });

  it('a request is sent unchanged', () => {
    expect(chooseCorrNr('ABCK900001', E070)).toEqual({
      given: 'ABCK900001',
      send: 'ABCK900001',
    });
  });

  it('a number E070 does not know is sent unchanged (SAP decides)', () => {
    expect(chooseCorrNr('ABCK999999', E070)).toEqual({
      given: 'ABCK999999',
      send: 'ABCK999999',
    });
  });
});

describe('requestForCorrNr', () => {
  it('reads E070 for the given number only', async () => {
    const sap = fakeSap();
    const choice = await requestForCorrNr(sap.connection, ' abck900002 ');
    expect(choice.send).toBe('ABCK900001');
    expect(sap.sqls).toHaveLength(1);
    expect(sap.sqls[0]).toMatch(/FROM e070 WHERE trkorr = 'ABCK900002'/i);
  });

  it('a value that is not a transport number is not put into SQL', async () => {
    const sap = fakeSap();
    const choice = await requestForCorrNr(sap.connection, "X' OR '1'='1");
    expect(sap.sqls).toHaveLength(0);
    expect(choice.send).toBe("X' OR '1'='1");
  });

  it('a failed E070 read sends the number as given, with a warning', async () => {
    const sap = fakeSap({ e070Fails: true });
    const choice = await requestForCorrNr(sap.connection, 'ABCK900002');
    expect(choice.send).toBe('ABCK900002');
    expect(choice.warning).toMatch(/E070/);
  });
});

describe('UpdateTextElements sends the REQUEST when given a task', () => {
  it('task ABCK900002 -> PUT corrNr=ABCK900001, reported both ways', async () => {
    const sap = fakeSap();
    const result = await handleUpdateTextElements(
      { connection: sap.connection } as any,
      args('ABCK900002'),
    );
    expect(result.isError).toBe(false);
    expect(sap.puts).toEqual([{ corrNr: 'ABCK900001' }]);
    const out = parse(result);
    expect(out.transport_request).toBe('ABCK900002');
    expect(out.corr_nr_sent).toBe('ABCK900001');
    expect(out.warnings ?? []).toEqual([]);
  });

  it('the request itself is sent unchanged', async () => {
    const sap = fakeSap();
    const result = await handleUpdateTextElements(
      { connection: sap.connection } as any,
      args('ABCK900001'),
    );
    expect(result.isError).toBe(false);
    expect(sap.puts).toEqual([{ corrNr: 'ABCK900001' }]);
    expect(parse(result).corr_nr_sent).toBe('ABCK900001');
  });

  it('no transport -> no corrNr and no E070 read', async () => {
    const sap = fakeSap();
    const result = await handleUpdateTextElements(
      { connection: sap.connection } as any,
      { ...args(''), transport_request: undefined } as any,
    );
    expect(result.isError).toBe(false);
    expect(sap.puts).toEqual([{ corrNr: undefined }]);
    expect(sap.sqls).toHaveLength(0);
  });

  it('E070 unreadable -> the task is sent as given; SAP refuses; the error says what to pass', async () => {
    const sap = fakeSap({ e070Fails: true });
    const result = await handleUpdateTextElements(
      { connection: sap.connection } as any,
      args('ABCK900002'),
    );
    expect(result.isError).toBe(true);
    expect(sap.puts).toEqual([{ corrNr: 'ABCK900002' }]);
    const text = String(result.content[0].text);
    expect(text).toMatch(/CTS_WBO_API\/020/);
    expect(text).toMatch(/Nothing was written/);
  });
});
