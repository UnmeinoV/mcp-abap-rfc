/**
 * Issue #4: UpdateFunctionModule reported a FAILED update for a source whose
 * syntax check carried only WARNINGS.
 *
 * The dependency's `checkFunctionModule` throws whenever `warnings.length > 0`,
 * with SAP's info line ("Object SAPLZMY_FG ZMY_FM has been checked") as the
 * message. The source had already been written (inactive), activation was
 * skipped, and the caller was told nothing happened. The verdict must be
 * error-level messages only; warnings travel in the result.
 */

const fmCheckSpy = jest.fn();
const activateSpy = jest.fn();

jest.mock('../../lib/clients', () => ({
  createAdtClient: () => ({
    getFunctionModule: () => ({
      lock: () => Promise.resolve('LH1'),
      update: () => Promise.resolve({}),
      unlock: () => Promise.resolve({}),
      read: () => Promise.resolve({}),
      check: (...a: any[]) => {
        fmCheckSpy(...a);
        return Promise.reject(
          new Error('Function module check failed: has been checked'),
        );
      },
      activate: (...a: any[]) => {
        activateSpy(...a);
        return Promise.resolve({ status: 200, data: '' });
      },
    }),
  }),
}));

import { handleUpdateFunctionModule } from '../../handlers/function/high/handleUpdateFunctionModule';

const report = (messages: string) =>
  `<?xml version="1.0" encoding="utf-8"?><chkrun:checkRunReports xmlns:chkrun="http://www.sap.com/adt/checkrun">` +
  `<chkrun:checkReport chkrun:reporter="abapCheckRun" chkrun:triggeringUri="/sap/bc/adt/functions/groups/zmy_fg/fmodules/zmy_fm" chkrun:status="processed" chkrun:statusText="Object SAPLZMY_FG    ZMY_FM has been checked">` +
  `<chkrun:checkMessageList>${messages}</chkrun:checkMessageList></chkrun:checkReport></chkrun:checkRunReports>`;

const msg = (type: string, text: string, line: number) =>
  `<chkrun:checkMessage chkrun:uri="/sap/bc/adt/functions/groups/zmy_fg/fmodules/zmy_fm/source/main#start=${line},4" chkrun:type="${type}" chkrun:shortText="${text}"/>`;

function ctx(checkXml: string) {
  const requests: any[] = [];
  return {
    requests,
    context: {
      connection: {
        makeAdtRequest: (req: any) => {
          requests.push(req);
          return Promise.resolve({ status: 200, data: checkXml, headers: {} });
        },
      } as any,
      logger: undefined,
    },
  };
}

const ARGS = {
  function_group_name: 'ZMY_FG',
  function_module_name: 'ZMY_FM',
  source_code: 'FUNCTION zmy_fm.\nENDFUNCTION.',
  activate: true,
};

describe('UpdateFunctionModule: a warnings-only check is not a failure (#4)', () => {
  beforeEach(() => {
    fmCheckSpy.mockClear();
    activateSpy.mockClear();
  });

  it('activates and reports the warnings', async () => {
    const { context, requests } = ctx(
      report(
        msg('W', 'Redundant conversion for type DDOBJNAME.', 12) +
          msg('W', 'Redundant conversion for type DDOBJNAME.', 20),
      ),
    );
    const res: any = await handleUpdateFunctionModule(context as any, ARGS);
    expect(res.isError).toBeFalsy();
    const body = JSON.parse(res.content[0].text);
    expect(body.success).toBe(true);
    expect(activateSpy).toHaveBeenCalledTimes(1);
    expect(body.check_warnings.join('\n')).toContain(
      'Redundant conversion for type DDOBJNAME.',
    );
    // The dependency's warning-throwing check is not used at all.
    expect(fmCheckSpy).not.toHaveBeenCalled();
    // Our checkrun went to the function module's inactive version.
    const check = requests.find((r) => String(r.url).includes('checkruns'));
    expect(String(check.data)).toContain(
      '/sap/bc/adt/functions/groups/zmy_fg/fmodules/zmy_fm',
    );
    expect(String(check.data)).toContain('chkrun:version="inactive"');
  });

  it('a check with errors fails, says the source WAS written, does not activate', async () => {
    const { context } = ctx(
      report(msg('E', 'Field &quot;LV_X&quot; is unknown.', 7)),
    );
    const res: any = await handleUpdateFunctionModule(context as any, ARGS);
    expect(res.isError).toBe(true);
    const text = res.content[0].text;
    expect(text).toContain('was written (INACTIVE)');
    expect(text).toContain('Field "LV_X" is unknown.');
    expect(text).toContain('line 7');
    expect(activateSpy).not.toHaveBeenCalled();
  });
});
