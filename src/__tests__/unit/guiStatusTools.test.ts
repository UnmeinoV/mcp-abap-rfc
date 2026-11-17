/**
 * GetGuiStatus / AddGuiStatusButton / CopyGuiStatus / RemoveGuiStatusButton /
 * DeleteGuiStatus / the SE41 helper ZMCP_CUA.
 *
 * The fixture follows the shape RS_CUA_INTERNAL_FETCH answered on S4D for a
 * customer status (names neutralised): a key set referenced by code from the
 * status, toolbar slots with gaps and separators ('S'), alternative texts.
 */

import {
  handleAddGuiStatusButton,
  normalizeAddButton,
} from '../../handlers/gui_status/high/handleAddGuiStatusButton';
import {
  handleCopyGuiStatus,
  normalizeCopyStatus,
} from '../../handlers/gui_status/high/handleCopyGuiStatus';
import { handleDeleteGuiStatus } from '../../handlers/gui_status/high/handleDeleteGuiStatus';
import {
  handleRemoveGuiStatusButton,
  normalizeRemoveButton,
} from '../../handlers/gui_status/high/handleRemoveGuiStatusButton';
import { handleGetGuiStatus } from '../../handlers/gui_status/readonly/handleGetGuiStatus';
import { DDIC_HELPER_SPEC } from '../../lib/ddic/ddicHelperSpec';
import {
  AUTO_FUNCTION_KEYS,
  CUA_HELPER_ADD_BUTTON,
  CUA_HELPER_ADD_BUTTON_SOURCE,
  CUA_HELPER_COPY_STATUS,
  CUA_HELPER_COPY_STATUS_SOURCE,
  CUA_HELPER_DELETE_STATUS,
  CUA_HELPER_DELETE_STATUS_SOURCE,
  CUA_HELPER_REMOVE_BUTTON,
  CUA_HELPER_REMOVE_BUTTON_SOURCE,
  CUA_HELPER_VERSION,
} from '../../lib/guiStatus/cuaHelperAbap';
import { CUA_HELPER_SPEC } from '../../lib/guiStatus/cuaHelperSpec';
import {
  CUA_FETCH,
  type CuaRaw,
  compareStatusCopy,
  describeStatus,
  fetchCua,
  functionKeyName,
  GuiInterfaceNotFound,
  locateFunction,
  planButtonRemoval,
  verifyButtonRemoved,
  verifyStatusDeleted,
} from '../../lib/guiStatus/guiStatus';
import {
  callRfcHelper,
  hasStaleSignature,
  markRewritten,
  noteHelperCalled,
  resetRewritten,
} from '../../lib/rfcHelper/rfcHelper';
import { TRAN_HELPER_SPEC } from '../../lib/transaction/tranHelperSpec';
import { LXE_HELPER_SPEC } from '../../lib/translation/lxeHelperSpec';

const text = (r: any) => String(r?.content?.[0]?.text ?? '');

function fixture(): CuaRaw {
  return {
    LANGU: 'E',
    STA: [
      {
        CODE: 'MAIN',
        MODAL: 'D',
        PFKCODE: '000002',
        BUTCODE: '0001',
        INT_NOTE: 'Main list',
      },
      {
        CODE: 'POPUP',
        MODAL: 'P',
        PFKCODE: '000003',
        BUTCODE: '0001',
        INT_NOTE: 'Popup',
      },
      {
        CODE: 'TWIN',
        MODAL: 'D',
        PFKCODE: '000003',
        BUTCODE: '0001',
        INT_NOTE: 'Shares',
      },
    ],
    FUN: [
      {
        CODE: '&REFRESH',
        TEXTNO: '001',
        FUN_TEXT: 'Refresh',
        TEXT_NAME: 'ICON_REFRESH',
        ICON_ID: '@42@',
      },
      {
        CODE: '%ML',
        TEXTNO: '001',
        FUN_TEXT: 'Folder',
        TEXT_NAME: '',
        ICON_ID: '',
      },
      {
        CODE: '%ML',
        TEXTNO: '002',
        FUN_TEXT: 'Folder (alt)',
        TEXT_NAME: '',
        ICON_ID: '',
      },
      {
        CODE: 'ZOLD',
        TEXTNO: '001',
        FUN_TEXT: 'Old',
        TEXT_NAME: '',
        ICON_ID: '',
      },
    ],
    PFK: [
      { CODE: '000002', PFNO: '08', FUNCODE: '&REFRESH', FUNNO: '001' },
      { CODE: '000002', PFNO: '13', FUNCODE: '%ML', FUNNO: '002' },
      { CODE: '000002', PFNO: '25', FUNCODE: 'ZOLD', FUNNO: '001' },
    ],
    BUT: [
      { PFK_CODE: '000002', CODE: '0001', NO: '04', PFNO: '25' },
      { PFK_CODE: '000002', CODE: '0001', NO: '01', PFNO: '08' },
      { PFK_CODE: '000002', CODE: '0001', NO: '02', PFNO: 'S' },
      { PFK_CODE: '000003', CODE: '0001', NO: '01', PFNO: '08' },
    ],
    SET: [
      { STATUS: 'MAIN', FUNCTION: '&REFRESH' },
      { STATUS: 'MAIN', FUNCTION: '%ML' },
    ],
    TIT: [{ CODE: 'T1', TEXT: 'Title' }],
  };
}

function conn(impl: (name: string, params: any) => any) {
  return { callFunction: jest.fn(async (n: string, p: any) => impl(n, p)) };
}

afterEach(() => resetRewritten());

describe('reading the interface', () => {
  it('names function keys as SAP numbers them', () => {
    expect(functionKeyName('08')).toBe('F8');
    expect(functionKeyName('13')).toBe('Shift-F1');
    expect(functionKeyName('25')).toBe('Ctrl-F1');
    expect(functionKeyName('48')).toBe('Ctrl-Shift-F12');
    expect(functionKeyName('71')).toBe('71');
  });

  it('builds the toolbar in slot order, with separators, texts by FUNNO and the active flag', () => {
    const raw = fixture();
    const v = describeStatus(raw, raw.STA![0]);
    expect(v.toolbar).toEqual([
      expect.objectContaining({
        slot: '01',
        function: '&REFRESH',
        icon: 'ICON_REFRESH',
        active: true,
      }),
      { slot: '02', separator: true },
      expect.objectContaining({
        slot: '04',
        function: 'ZOLD',
        key_name: 'Ctrl-F1',
        active: false,
      }),
    ]);
    // FUNNO 002 picks the alternative text, not the first one.
    expect(v.function_keys.find((k) => k.function === '%ML')?.text).toBe(
      'Folder (alt)',
    );
    expect(v.next_toolbar_slot).toBe('05');
    expect(v.shared_key_set_with).toEqual([]);
    expect(describeStatus(raw, raw.STA![1]).shared_key_set_with).toEqual([
      'TWIN',
    ]);
  });

  it('locates a function in one status from an independent read', () => {
    expect(locateFunction(fixture(), 'MAIN', 'ZOLD')).toEqual({
      status_found: true,
      text: 'Old',
      function_key: '25',
      slot: '04',
      active: false,
    });
    expect(locateFunction(fixture(), 'NOPE', 'ZOLD').status_found).toBe(false);
  });

  // Measured: without LANGUAGE the module answers the texts of several languages at once.
  it('never reads texts without a language: the interface language first, then the texts in it', async () => {
    const c = conn((_n, p) =>
      p.WITHOUT_TEXTS ? { LANGU: 'E' } : { ...fixture(), LANGU: 'E' },
    );
    const raw = await fetchCua(c, 'ZMY_PROG');
    expect(c.callFunction.mock.calls.map((x) => x[1])).toEqual([
      { PROGRAM: 'ZMY_PROG', STATE: 'A', WITHOUT_TEXTS: 'X' },
      { PROGRAM: 'ZMY_PROG', STATE: 'A', LANGUAGE: 'E' },
    ]);
    expect(raw.LANGUAGE_USED).toBe('E');
    await fetchCua(c, 'ZMY_PROG', '1');
    expect(c.callFunction.mock.calls[2][1]).toEqual({
      PROGRAM: 'ZMY_PROG',
      STATE: 'A',
      LANGUAGE: '1',
    });
  });

  it('a missing interface and an HTTP connection are named', async () => {
    const c = conn(() => {
      throw { key: 'NOT_FOUND', message: 'not found' };
    });
    await expect(fetchCua(c, 'ZMY_PROG', 'E')).rejects.toBeInstanceOf(
      GuiInterfaceNotFound,
    );
    await expect(fetchCua({}, 'ZMY_PROG')).rejects.toThrow(/RFC connection/);
  });

  it('GetGuiStatus lists statuses, or one in full, and names the known statuses for a wrong one', async () => {
    const c = conn((n, p) => {
      expect(n).toBe(CUA_FETCH);
      return p.WITHOUT_TEXTS ? { LANGU: 'E' } : fixture();
    });
    const list = JSON.parse(
      text(
        await handleGetGuiStatus({ connection: c } as any, {
          program_name: 'zmy_prog',
        }),
      ),
    );
    expect(list.statuses.map((x: any) => x.status)).toEqual([
      'MAIN',
      'POPUP',
      'TWIN',
    ]);
    expect(list.statuses[1].shared_key_set_with).toEqual(['TWIN']);
    expect(list.language).toBe('E');
    const one = JSON.parse(
      text(
        await handleGetGuiStatus({ connection: c } as any, {
          program_name: 'ZMY_PROG',
          status: 'main',
        }),
      ),
    );
    expect(one.toolbar).toHaveLength(3);
    const bad = await handleGetGuiStatus({ connection: c } as any, {
      program_name: 'ZMY_PROG',
      status: 'X',
    });
    expect(bad.isError).toBe(true);
    expect(text(bad)).toMatch(/statuses: MAIN, POPUP, TWIN/);
  });
});

describe('normalizeAddButton', () => {
  const base = {
    program_name: 'zmy_prog',
    status: 'main',
    function_code: 'zexport',
    text: 'Export',
  };
  it('normalises and pads the key', () => {
    expect(
      normalizeAddButton({ ...base, function_key: 14, icon: 'icon_export' }),
    ).toMatchObject({
      program: 'ZMY_PROG',
      status: 'MAIN',
      fcode: 'ZEXPORT',
      fkey: '14',
      icon: 'ICON_EXPORT',
    });
  });
  it.each([
    [{ program_name: 'SAPLKKBL' }, /customer program/],
    [{ function_code: '&MINE' }, /belong to ALV/],
    [{ function_code: 'Z X' }, /A-Z, 0-9/],
    [{ text: 'x'.repeat(41) }, /at most 40/],
    [{ function_key: '03' }, /05-09 or 13-48/],
    [{ function_key: '49' }, /05-09 or 13-48/],
    [{ icon: 'EXPORT' }, /icon name/],
    [{ quick_info: 'x'.repeat(61) }, /quick_info/],
  ])('refuses %o', (patch, msg) => {
    expect(() => normalizeAddButton({ ...base, ...(patch as any) })).toThrow(
      msg,
    );
  });
});

describe('shipped ABAP source', () => {
  const src = CUA_HELPER_ADD_BUTTON_SOURCE;

  it('reports the helper version the server checks', () => {
    expect(src).toContain('VALUE(ev_version) TYPE char10');
    expect(src).toContain(`ev_version = '${CUA_HELPER_VERSION}'.`);
    expect(src).toContain(`Helper version ${CUA_HELPER_VERSION}.`);
  });

  it('every refusal and the test-mode exit come before the transport entry and the write', () => {
    const corr = src.indexOf("CALL FUNCTION 'RS_CORR_INSERT'");
    const write = src.indexOf("CALL FUNCTION 'RS_CUA_INTERNAL_WRITE'");
    expect(corr).toBeGreaterThan(0);
    expect(write).toBeGreaterThan(corr);
    for (const guard of [
      'not in the customer namespace',
      'must be upper case without blanks',
      'only executable programs',
      'a transport request is required',
      'is not modifiable',
      'pending INACTIVE version',
      'does not exist (table ICON)',
      "RS_ACCESS_PERMISSION'",
      'is a context menu',
      'shares its function key set',
      'already exists in the interface',
      'is already assigned to',
      'has no free function key',
      'has no slot after',
      'TEST MODE',
    ]) {
      const at = src.indexOf(guard);
      expect(at).toBeGreaterThan(0);
      expect(at).toBeLessThan(corr);
    }
  });

  it('follows SE41: lock as SCUA, transport entry as SCUA without a dialog, lock released at the end', () => {
    expect(src).toMatch(
      /mode\s+= 'MODIFY'\s+object\s+= iv_program\s+object_class\s+= 'SCUA'/,
    );
    expect(src).toMatch(
      /object_class\s+= 'SCUA'\s+mode\s+= 'MODIFY'[\s\S]*suppress_dialog\s+= 'X'/,
    );
    expect(src).toContain("suppress_corr_check      = 'X'");
    const enddo = src.lastIndexOf('ENDDO.');
    expect(src.indexOf("mode         = 'FREE'")).toBeGreaterThan(enddo);
    expect(src.lastIndexOf('RETURN.')).toBeLessThan(
      src.indexOf('lv_locked = abap_true.'),
    );
  });

  it('auto keys skip F1-F12 and Shift-F3; the toolbar stops at SAP’s 35 slots', () => {
    expect(AUTO_FUNCTION_KEYS[0]).toBe('13');
    expect(AUTO_FUNCTION_KEYS).not.toContain('15');
    expect(AUTO_FUNCTION_KEYS.at(-1)).toBe('48');
    expect(src).toContain('IF lv_no > 35.');
  });

  it('every helper source line fits ABAP’s 255 characters', () => {
    for (const spec of [
      CUA_HELPER_SPEC,
      TRAN_HELPER_SPEC,
      LXE_HELPER_SPEC,
      DDIC_HELPER_SPEC,
    ]) {
      for (const m of spec.modules) {
        const long = m.source.split('\n').filter((l) => l.length > 255);
        expect(long).toEqual([]);
      }
    }
  });

  it('fits SAP limits and the probe passes every mandatory importing parameter', () => {
    expect(CUA_HELPER_SPEC.groupDescription.length).toBeLessThanOrEqual(40);
    expect(CUA_HELPER_SPEC.group.length).toBeLessThanOrEqual(26);
    for (const m of CUA_HELPER_SPEC.modules) {
      expect(m.description.length).toBeLessThanOrEqual(74);
      expect(m.name.length).toBeLessThanOrEqual(30);
      const mandatory = [
        ...m.source.matchAll(
          /VALUE\((iv_\w+)\) TYPE \w+(?!.*(?:OPTIONAL|DEFAULT))\s*$/gm,
        ),
      ].map((x) => x[1].toUpperCase());
      expect(mandatory.length).toBeGreaterThan(0);
      for (const p of mandatory)
        expect(Object.keys(m.probeParams)).toContain(p);
    }
  });
});

describe('AddGuiStatusButton', () => {
  const args = {
    program_name: 'ZMY_PROG',
    status: 'MAIN',
    function_code: 'ZEXPORT',
    text: 'Export',
  };
  const V = CUA_HELPER_VERSION;

  /** The interface after a successful write: ZEXPORT on key 14, slot 05, active. */
  function written(): CuaRaw {
    const raw = fixture();
    raw.FUN!.push({ CODE: 'ZEXPORT', TEXTNO: '001', FUN_TEXT: 'Export' });
    raw.PFK!.push({
      CODE: '000002',
      PFNO: '14',
      FUNCODE: 'ZEXPORT',
      FUNNO: '001',
    });
    raw.BUT!.push({ PFK_CODE: '000002', CODE: '0001', NO: '05', PFNO: '14' });
    raw.SET!.push({ STATUS: 'MAIN', FUNCTION: 'ZEXPORT' });
    return raw;
  }

  function helper(
    result: Record<string, unknown>,
    after: () => CuaRaw = written,
  ) {
    return conn((n, p) => {
      if (n === CUA_HELPER_ADD_BUTTON)
        return { EV_VERSION: V, EV_LANGUAGE: 'E', ...result, _params: p };
      if (n === CUA_FETCH) return after();
      throw new Error(`unexpected ${n}`);
    });
  }

  it('success only when the independent read-back finds text, key, slot and status entry', async () => {
    const c = helper({
      EV_STATUS: 'S',
      EV_WRITTEN: 'X',
      EV_FKEY: '14',
      EV_POSITION: '05',
      EV_MESSAGE: 'Button added',
    });
    const r = await handleAddGuiStatusButton({ connection: c } as any, args);
    expect(r.isError).toBe(false);
    const j = JSON.parse(text(r));
    expect(j).toMatchObject({
      written: true,
      function_key: '14',
      key_name: 'Shift-F2',
      toolbar_slot: '05',
    });
    expect(j.message).toMatch(/Read back from the active interface/);
    // The read-back asked for the texts in the language the helper wrote.
    expect(
      c.callFunction.mock.calls.find((x) => x[0] === CUA_FETCH)?.[1],
    ).toMatchObject({ LANGUAGE: 'E' });
  });

  it('a read-back that differs is an error saying it WAS written — never "nothing was written"', async () => {
    const c = helper(
      {
        EV_STATUS: 'S',
        EV_WRITTEN: 'X',
        EV_FKEY: '14',
        EV_POSITION: '05',
        EV_MESSAGE: 'Button added',
      },
      fixture,
    );
    const r = await handleAddGuiStatusButton({ connection: c } as any, args);
    expect(r.isError).toBe(true);
    expect(text(r)).toMatch(
      /was written to ZMY_PROG, but the independent read-back differs/,
    );
    expect(text(r)).not.toMatch(/Nothing was written/);
  });

  it('a helper refusal before the write says nothing was written', async () => {
    const c = helper({
      EV_STATUS: 'F',
      EV_MESSAGE: 'Status MAIN shares its function key set',
    });
    const r = await handleAddGuiStatusButton({ connection: c } as any, args);
    expect(text(r)).toMatch(
      /shares its function key set\. Nothing was written\./,
    );
  });

  it('a failure AFTER the write says the interface WAS changed', async () => {
    const c = helper({
      EV_STATUS: 'F',
      EV_WRITTEN: 'X',
      EV_MESSAGE: 'Written, but NOT activated',
    });
    const r = await handleAddGuiStatusButton({ connection: c } as any, args);
    expect(text(r)).toMatch(/WAS changed/);
    expect(text(r)).not.toMatch(/Nothing was written/);
  });

  it('an RFC failure mid-call is UNKNOWN', async () => {
    const c = conn(() => {
      throw new Error('connection reset');
    });
    const r = await handleAddGuiStatusButton({ connection: c } as any, args);
    expect(text(r)).toMatch(/UNKNOWN/);
  });

  it('a missing helper names SetupGuiStatusHelper and nothing was written', async () => {
    const c = conn(() => {
      throw { key: 'FU_NOT_FOUND' };
    });
    const r = await handleAddGuiStatusButton({ connection: c } as any, args);
    expect(text(r)).toMatch(/SetupGuiStatusHelper/);
    expect(text(r)).toMatch(/Nothing was written/);
  });

  it('dry_run passes IV_TEST, reports the plan and reads nothing back', async () => {
    const c = helper({
      EV_STATUS: 'S',
      EV_FKEY: '14',
      EV_POSITION: '05',
      EV_MESSAGE: 'TEST MODE',
    });
    const r = await handleAddGuiStatusButton({ connection: c } as any, {
      ...args,
      dry_run: true,
    });
    const j = JSON.parse(text(r));
    expect(j).toMatchObject({
      dry_run: true,
      written: false,
      function_key: '14',
      toolbar_slot: '05',
    });
    expect(c.callFunction.mock.calls[0][1].IV_TEST).toBe('X');
    expect(c.callFunction.mock.calls.some((x) => x[0] === CUA_FETCH)).toBe(
      false,
    );
  });

  it('warns when CJK text goes into a non-CJK original language', async () => {
    const c = helper({
      EV_STATUS: 'S',
      EV_FKEY: '14',
      EV_POSITION: '05',
      EV_MESSAGE: 'TEST MODE',
    });
    const r = await handleAddGuiStatusButton({ connection: c } as any, {
      ...args,
      text: '导出',
      dry_run: true,
    });
    expect(JSON.parse(text(r)).warnings[0]).toMatch(/original language E/);
  });
});

// MEASURED 2026-11-13: setup read version_before over RFC (v1, EV_MESSAGE CHAR
// 220), rewrote the module (v2, EV_MESSAGE STRING), and the verification call
// in the same process answered EV_VERSION "2" — the next real call's
// EV_MESSAGE was mojibake. A matching version is no evidence on a cached signature.
describe('a helper rewritten after this process called it', () => {
  const ok = () =>
    conn(() => ({ EV_VERSION: CUA_HELPER_VERSION, EV_STATUS: 'S' }));

  it('is refused with "restart" even when the version matches, and is not called', async () => {
    const c = ok();
    await callRfcHelper(CUA_HELPER_SPEC, c, CUA_HELPER_ADD_BUTTON, {});
    markRewritten(CUA_HELPER_SPEC);
    expect(hasStaleSignature(CUA_HELPER_SPEC)).toBe(true);
    await expect(
      callRfcHelper(CUA_HELPER_SPEC, c, CUA_HELPER_ADD_BUTTON, {}),
    ).rejects.toThrow(
      /RESTART THE MCP SERVER[\s\S]*do not run SetupGuiStatusHelper again/,
    );
    expect(c.callFunction).toHaveBeenCalledTimes(1);
  });

  it('a first install (nothing called, or only FU_NOT_FOUND) is not stale', async () => {
    noteHelperCalled(CUA_HELPER_SPEC, CUA_HELPER_ADD_BUTTON, {
      key: 'FU_NOT_FOUND',
    });
    markRewritten(CUA_HELPER_SPEC);
    expect(hasStaleSignature(CUA_HELPER_SPEC)).toBe(false);
    const r = await callRfcHelper(
      CUA_HELPER_SPEC,
      ok(),
      CUA_HELPER_ADD_BUTTON,
      {},
    );
    expect(r.EV_STATUS).toBe('S');
  });

  it('is per helper group', async () => {
    await callRfcHelper(CUA_HELPER_SPEC, ok(), CUA_HELPER_ADD_BUTTON, {});
    markRewritten(TRAN_HELPER_SPEC);
    expect(hasStaleSignature(CUA_HELPER_SPEC)).toBe(false);
    expect(hasStaleSignature(TRAN_HELPER_SPEC)).toBe(false);
  });
});

/** The fixture's MAIN as SAP's copy writes it into another program: own codes, same content. */
function copiedInto(name: string): CuaRaw {
  const src = fixture();
  return {
    LANGU: 'E',
    STA: [
      {
        CODE: name,
        MODAL: 'D',
        PFKCODE: '000001',
        BUTCODE: '0001',
        INT_NOTE: 'Main list',
      },
    ],
    FUN: src.FUN,
    PFK: src
      .PFK!.filter((p) => p.CODE === '000002')
      .map((p) => ({ ...p, CODE: '000001' })),
    BUT: src
      .BUT!.filter((b) => b.PFK_CODE === '000002')
      .map((b) => ({ ...b, PFK_CODE: '000001' })),
    SET: src.SET!.map((r) => ({ ...r, STATUS: name })),
  };
}

describe('compareStatusCopy', () => {
  it('a copy with its own codes but the same content has no differences', () => {
    expect(
      compareStatusCopy(fixture(), 'MAIN', copiedInto('ZMAIN'), 'ZMAIN'),
    ).toEqual([]);
  });
  it('names what differs: a lost button, a changed text, a missing active function', () => {
    const t = copiedInto('ZMAIN');
    t.BUT = t.BUT!.filter((b) => b.NO !== '04');
    t.FUN = t.FUN!.map((f) =>
      f.CODE === '&REFRESH' ? { ...f, FUN_TEXT: 'Neu' } : f,
    );
    t.SET = t.SET!.filter((r) => r.FUNCTION !== '%ML');
    const d = compareStatusCopy(fixture(), 'MAIN', t, 'ZMAIN').join(' | ');
    expect(d).toMatch(/toolbar missing in the copy: .*04:25:ZOLD/);
    expect(d).toMatch(/Neu/);
    expect(d).toMatch(/active function missing in the copy: %ML/);
  });
  it('a missing target status is a difference, never an empty list', () => {
    expect(
      compareStatusCopy(fixture(), 'MAIN', fixture(), 'NOPE'),
    ).toHaveLength(1);
  });
});

describe('normalizeCopyStatus', () => {
  const base = {
    source_program: 'saplkkbl',
    source_status: 'standard_fullscreen',
    target_program: 'zmy_prog',
  };
  it('accepts an SAP source, defaults the target name to the source status', () => {
    expect(normalizeCopyStatus(base)).toEqual({
      sourceProgram: 'SAPLKKBL',
      sourceStatus: 'STANDARD_FULLSCREEN',
      targetProgram: 'ZMY_PROG',
      targetStatus: 'STANDARD_FULLSCREEN',
      request: undefined,
    });
  });
  it.each([
    [{ target_program: 'SAPLKKBL' }, /customer program/],
    [{ target_status: 'MY STATUS' }, /target_status/],
    [{ source_status: '' }, /source_status/],
    [
      { source_program: 'zmy_prog', source_status: 'x', target_status: 'X' },
      /onto itself/,
    ],
  ])('refuses %o', (patch, msg) => {
    expect(() => normalizeCopyStatus({ ...base, ...(patch as any) })).toThrow(
      msg,
    );
  });
});

describe('shipped ABAP source: copy', () => {
  const src = CUA_HELPER_COPY_STATUS_SOURCE;
  it('every refusal and the test-mode exit come before the transport entry and SE41\u2019s copy', () => {
    const corr = src.indexOf("CALL FUNCTION 'RS_CORR_INSERT'");
    const copy = src.indexOf("CALL FUNCTION 'RS_CUA_COPY_STA'");
    expect(corr).toBeGreaterThan(0);
    expect(copy).toBeGreaterThan(corr);
    for (const guard of [
      'is not in the customer namespace',
      'must be upper case without blanks',
      'Source and target are the same status',
      "'RS_CUA_INTERNAL_NAME_CHECK'",
      'Source program { iv_source_program } does not exist',
      'only executable programs',
      'a transport request is required',
      'is not modifiable',
      'pending INACTIVE version',
      'has no GUI interface',
      'already exists in',
      'TEST MODE',
    ]) {
      const at = src.indexOf(guard);
      expect(at).toBeGreaterThan(0);
      expect(at).toBeLessThan(corr);
    }
  });
  it('runs SAP\u2019s copy without dialogs, catches stray messages, and always frees the lock it leaves', () => {
    expect(src).toMatch(/suppress_dialog\s+= 'X'\s+generate\s+= space/);
    expect(src).toContain('error_message           = 12');
    expect(src).toMatch(/name_type = 'C'/); // con_inttype_status (RSMPECON), not 'S'
    const locked = src.indexOf('lv_locked = abap_true.');
    expect(locked).toBeLessThan(src.indexOf("CALL FUNCTION 'RS_CUA_COPY_STA'"));
    expect(src.indexOf("mode         = 'FREE'")).toBeGreaterThan(
      src.lastIndexOf('ENDDO.'),
    );
    expect(src.lastIndexOf('RETURN.')).toBeLessThan(locked);
    expect(src).toContain(`ev_version = '${CUA_HELPER_VERSION}'.`);
  });
});

describe('CopyGuiStatus', () => {
  const args = {
    source_program: 'ZMY_SRC',
    source_status: 'MAIN',
    target_program: 'ZMY_PROG',
    target_status: 'ZMAIN',
  };
  function helper(
    result: Record<string, unknown>,
    target: () => CuaRaw = () => copiedInto('ZMAIN'),
  ) {
    return conn((n, p) => {
      if (n === CUA_HELPER_COPY_STATUS)
        return { EV_VERSION: CUA_HELPER_VERSION, EV_LANGUAGE: 'E', ...result };
      if (n === CUA_FETCH)
        return p.PROGRAM === 'ZMY_SRC' ? fixture() : target();
      throw new Error(`unexpected ${n}`);
    });
  }

  it('success only when source and copy, read back independently, match', async () => {
    const c = helper({
      EV_STATUS: 'S',
      EV_WRITTEN: 'X',
      EV_WRITE_STATE: 'I',
      EV_MESSAGE: 'copied',
    });
    const r = await handleCopyGuiStatus({ connection: c } as any, args);
    expect(r.isError).toBe(false);
    const j = JSON.parse(text(r));
    expect(j).toMatchObject({
      written: true,
      target_status: 'ZMAIN',
      function_key_set: '000001',
      toolbar_buttons: 2,
    });
    expect(j.message).toMatch(/compared slot by slot/);
    const fetches = c.callFunction.mock.calls
      .filter((x) => x[0] === CUA_FETCH)
      .map((x) => x[1]);
    expect(fetches).toEqual([
      { PROGRAM: 'ZMY_SRC', STATE: 'A', LANGUAGE: 'E' },
      { PROGRAM: 'ZMY_PROG', STATE: 'A', LANGUAGE: 'E' },
    ]);
  });

  it('a copy that reads back differently is an error saying it WAS written', async () => {
    const c = helper(
      { EV_STATUS: 'S', EV_WRITTEN: 'X', EV_MESSAGE: 'copied' },
      () => {
        const t = copiedInto('ZMAIN');
        t.BUT = [];
        return t;
      },
    );
    const r = await handleCopyGuiStatus({ connection: c } as any, args);
    expect(r.isError).toBe(true);
    expect(text(r)).toMatch(
      /was written to ZMY_PROG, but the independent read-back differs/,
    );
    expect(text(r)).not.toMatch(/Nothing was written/);
  });

  it('a refusal says nothing was written; a failure after the write says it WAS changed', async () => {
    let r = await handleCopyGuiStatus(
      {
        connection: helper({
          EV_STATUS: 'F',
          EV_MESSAGE: 'Status ZMAIN already exists in ZMY_PROG',
        }),
      } as any,
      args,
    );
    expect(text(r)).toMatch(
      /already exists in ZMY_PROG\. Nothing was written\./,
    );
    r = await handleCopyGuiStatus(
      {
        connection: helper({
          EV_STATUS: 'F',
          EV_WRITTEN: 'X',
          EV_MESSAGE: 'Copied, but NOT activated',
        }),
      } as any,
      args,
    );
    expect(text(r)).toMatch(/WAS changed/);
  });

  it('dry_run passes IV_TEST, reports the plan and reads nothing back', async () => {
    const c = helper({
      EV_STATUS: 'S',
      EV_NEW_INTERFACE: 'X',
      EV_MESSAGE: 'TEST MODE',
      EV_WARNING: '3 of the 9 function keys have no text',
    });
    const j = JSON.parse(
      text(
        await handleCopyGuiStatus({ connection: c } as any, {
          ...args,
          dry_run: true,
        }),
      ),
    );
    expect(j).toMatchObject({
      dry_run: true,
      written: false,
      creates_interface: true,
    });
    expect(j.warnings[0]).toMatch(/no text/);
    expect(c.callFunction.mock.calls[0][1].IV_TEST).toBe('X');
    expect(c.callFunction.mock.calls.some((x) => x[0] === CUA_FETCH)).toBe(
      false,
    );
  });
});

/**
 * The fixture after RemoveGuiStatusButton MAIN: ZOLD (key 25, slot 04, used
 * nowhere else) -> gone with its function; &REFRESH (key 08, slot 01, also in
 * key set 000003) -> slot gone, separator 02 -> 01, ZOLD 04 -> 03, key 08 gone
 * from 000002, the function kept.
 */
function removed(fcode: 'ZOLD' | '&REFRESH', keepKey = false): CuaRaw {
  const raw = fixture();
  const key = fcode === 'ZOLD' ? '25' : '08';
  const slot = fcode === 'ZOLD' ? 4 : 1;
  raw.BUT = raw
    .BUT!.filter(
      (b) => !(b.PFK_CODE === '000002' && b.CODE === '0001' && b.PFNO === key),
    )
    .map((b) =>
      b.PFK_CODE === '000002' && Number(b.NO) > slot
        ? { ...b, NO: String(Number(b.NO) - 1).padStart(2, '0') }
        : b,
    );
  if (!keepKey) {
    raw.PFK = raw.PFK!.filter(
      (p) => !(p.CODE === '000002' && p.FUNCODE === fcode),
    );
  }
  if (fcode === 'ZOLD' && !keepKey) {
    raw.FUN = raw.FUN!.filter((f) => f.CODE !== 'ZOLD');
    raw.SET = raw.SET!.filter((r) => r.FUNCTION !== 'ZOLD');
  }
  return raw;
}

describe('verifying a button removal', () => {
  it('plans from the read before: slots and keys of the function in that status', () => {
    expect(planButtonRemoval(fixture(), 'MAIN', '&REFRESH')).toEqual({
      slots: ['01'],
      function_keys: ['08'],
    });
    expect(planButtonRemoval(fixture(), 'MAIN', '%ML').slots).toEqual([]);
  });
  it('accepts the old toolbar minus the entry, later slots moved left', () => {
    expect(
      verifyButtonRemoved(
        fixture(),
        removed('&REFRESH'),
        'MAIN',
        '&REFRESH',
        false,
        false,
      ),
    ).toEqual([]);
    expect(
      verifyButtonRemoved(
        fixture(),
        removed('ZOLD'),
        'MAIN',
        'ZOLD',
        false,
        true,
      ),
    ).toEqual([]);
    expect(
      verifyButtonRemoved(
        fixture(),
        removed('ZOLD', true),
        'MAIN',
        'ZOLD',
        true,
        false,
      ),
    ).toEqual([]);
  });
  it('a gap left behind, a kept key, a function said gone but there, another status touched — each named', () => {
    const gap = removed('&REFRESH');
    gap.BUT = fixture().BUT!.filter(
      (b) => !(b.PFK_CODE === '000002' && b.NO === '01'),
    );
    expect(
      verifyButtonRemoved(
        fixture(),
        gap,
        'MAIN',
        '&REFRESH',
        false,
        false,
      ).join(' | '),
    ).toMatch(
      /toolbar of MAIN reads \[02:separator, 04:25:ZOLD:Old:\], expected \[01:separator, 03:25:ZOLD:Old:\]/,
    );
    expect(
      verifyButtonRemoved(
        fixture(),
        removed('&REFRESH', true),
        'MAIN',
        '&REFRESH',
        false,
        false,
      ).join(' | '),
    ).toMatch(/function keys of MAIN read/);
    expect(
      verifyButtonRemoved(
        fixture(),
        removed('ZOLD', true),
        'MAIN',
        'ZOLD',
        false,
        true,
      ).join(' | '),
    ).toMatch(/ZOLD is still defined/);
    const other = removed('ZOLD');
    other.STA = other.STA!.map((r) =>
      r.CODE === 'POPUP' ? { ...r, INT_NOTE: 'x' } : r,
    );
    expect(
      verifyButtonRemoved(fixture(), other, 'MAIN', 'ZOLD', false, true).join(
        ' | ',
      ),
    ).toMatch(/other status\(es\) changed: POPUP/);
    expect(
      verifyButtonRemoved(
        fixture(),
        fixture(),
        'MAIN',
        'ZOLD',
        false,
        true,
      ).join(' | '),
    ).toMatch(/ZOLD is still on the toolbar of MAIN/);
  });
});

describe('verifying a status deletion', () => {
  const without = (code: string) => {
    const raw = fixture();
    raw.STA = raw.STA!.filter((r) => r.CODE !== code);
    raw.SET = raw.SET!.filter((r) => r.STATUS !== code);
    return raw;
  };
  it('gone, and the others as before — a shared key set losing a partner is not a change', () => {
    expect(verifyStatusDeleted(fixture(), without('TWIN'), 'TWIN')).toEqual([]);
    expect(verifyStatusDeleted(fixture(), without('MAIN'), 'MAIN')).toEqual([]);
  });
  it('still there, rows left, or another status gone — each named', () => {
    expect(
      verifyStatusDeleted(fixture(), fixture(), 'MAIN').join(' | '),
    ).toMatch(/status MAIN is still there.*active-function rows/);
    const both = without('MAIN');
    both.STA = both.STA!.filter((r) => r.CODE !== 'POPUP');
    expect(verifyStatusDeleted(fixture(), both, 'MAIN')).toContain(
      'status POPUP is gone',
    );
  });
});

describe('normalizeRemoveButton', () => {
  const base = {
    program_name: 'zmy_prog',
    status: 'main',
    function_code: '&abc',
  };
  it('accepts ALV codes and defaults keep_function_key to false', () => {
    expect(normalizeRemoveButton(base)).toEqual({
      program: 'ZMY_PROG',
      status: 'MAIN',
      fcode: '&ABC',
      keepKey: false,
      request: undefined,
    });
  });
  it.each([
    [{ program_name: 'SAPLKKBL' }, /customer program/],
    [{ status: 'MY STATUS' }, /status/],
    [{ function_code: 'A B' }, /function_code/],
    [{ function_code: '' }, /function_code/],
  ])('refuses %o', (patch, msg) => {
    expect(() => normalizeRemoveButton({ ...base, ...(patch as any) })).toThrow(
      msg,
    );
  });
});

describe.each([
  ['delete status', CUA_HELPER_DELETE_STATUS_SOURCE, [] as string[]],
  [
    'remove button',
    CUA_HELPER_REMOVE_BUTTON_SOURCE,
    [
      'is a context menu',
      'has no function key set / application toolbar',
      'shares its function key set',
      'is not on the application toolbar',
    ],
  ],
])('shipped ABAP source: %s', (_label, src, own) => {
  it('every refusal and the test-mode exit come before the transport entry and the write', () => {
    const corr = src.indexOf("CALL FUNCTION 'RS_CORR_INSERT'");
    const write = src.indexOf("CALL FUNCTION 'RS_CUA_INTERNAL_WRITE'");
    expect(corr).toBeGreaterThan(0);
    expect(write).toBeGreaterThan(corr);
    for (const guard of [
      'not in the customer namespace',
      'only executable programs',
      'a transport request is required',
      'is not modifiable',
      'pending INACTIVE version',
      "CALL FUNCTION 'RS_ACCESS_PERMISSION'",
      'as a MODIFICATION',
      'has no GUI interface',
      'does not exist in { iv_program } (statuses:',
      ...own,
      'TEST MODE',
    ]) {
      const at = src.indexOf(guard);
      expect(at).toBeGreaterThan(0);
      expect(at).toBeLessThan(corr);
    }
    // The tables change only after the test-mode exit.
    expect(src.indexOf('DELETE lt_')).toBeGreaterThan(src.indexOf('TEST MODE'));
  });
  it('locks and records as SCUA without a dialog, refuses only before the lock, frees after ENDDO', () => {
    expect(src).toMatch(
      /mode\s+= 'MODIFY'\s+object\s+= iv_program\s+object_class\s+= 'SCUA'/,
    );
    expect(src).toMatch(
      /object_class\s+= 'SCUA'\s+mode\s+= 'MODIFY'[\s\S]*suppress_dialog\s+= 'X'/,
    );
    expect(src.lastIndexOf('RETURN.')).toBeLessThan(
      src.indexOf('lv_locked = abap_true.'),
    );
    expect(src.indexOf("mode         = 'FREE'")).toBeGreaterThan(
      src.lastIndexOf('ENDDO.'),
    );
    expect(src).toContain(`ev_version = '${CUA_HELPER_VERSION}'.`);
    expect(src).toContain(`Helper version ${CUA_HELPER_VERSION}.`);
    // Verdict from a re-fetch AFTER the commit.
    expect(
      src.lastIndexOf("CALL FUNCTION 'RS_CUA_INTERNAL_FETCH'"),
    ).toBeGreaterThan(src.indexOf('COMMIT WORK AND WAIT.'));
  });
});

describe('remove button source follows SE41', () => {
  const src = CUA_HELPER_REMOVE_BUTTON_SOURCE;
  it('renumbers later slots of the same toolbar, highest removal first', () => {
    expect(src).toContain('SORT lt_remove BY code no DESCENDING.');
    expect(src).toMatch(/ELSEIF lv_no > ls_remove-no\.\s+lv_no = lv_no - 1\./);
  });
  it('drops a function only when no key and no menu refers to it', () => {
    expect(src).toContain(
      "IF NOT line_exists( lt_pfk[ funcode = iv_function ] ) AND NOT line_exists( lt_men[ ref_type = 'F' ref_code = iv_function ] ).",
    );
    expect(src.indexOf('DELETE lt_pfk WHERE')).toBeLessThan(
      src.indexOf('DELETE lt_fun WHERE code = iv_function.'),
    );
  });
});

describe('DeleteGuiStatus and RemoveGuiStatusButton', () => {
  function helper(
    module: string,
    result: Record<string, unknown>,
    after: () => CuaRaw,
  ) {
    let called = false;
    return conn((n, p) => {
      if (n === module) {
        called = true;
        return {
          EV_VERSION: CUA_HELPER_VERSION,
          EV_LANGUAGE: 'E',
          ...result,
          _p: p,
        };
      }
      if (n === CUA_FETCH) return called ? after() : fixture();
      throw new Error(`unexpected ${n}`);
    });
  }
  const remove = {
    program_name: 'ZMY_PROG',
    status: 'MAIN',
    function_code: 'ZOLD',
  };

  it('removal succeeds only on the verified read-back, and reports the function as deleted', async () => {
    const c = helper(
      CUA_HELPER_REMOVE_BUTTON,
      {
        EV_STATUS: 'S',
        EV_WRITTEN: 'X',
        EV_FUNCTION_DELETED: 'X',
        EV_MESSAGE: 'removed',
      },
      () => removed('ZOLD'),
    );
    const r = await handleRemoveGuiStatusButton(
      { connection: c } as any,
      remove,
    );
    expect(r.isError).toBe(false);
    const j = JSON.parse(text(r));
    expect(j).toMatchObject({
      written: true,
      function_deleted: true,
      toolbar_slots: ['04'],
      function_keys: ['25'],
    });
    const call = c.callFunction.mock.calls.find(
      (x) => x[0] === CUA_HELPER_REMOVE_BUTTON,
    )!;
    expect(call[1]).toMatchObject({
      IV_FUNCTION: 'ZOLD',
      IV_KEEP_KEY: '',
      IV_TEST: '',
    });
    const fetches = c.callFunction.mock.calls
      .filter((x) => x[0] === CUA_FETCH)
      .map((x) => x[1]);
    expect(fetches.at(-1)).toEqual({
      PROGRAM: 'ZMY_PROG',
      STATE: 'A',
      LANGUAGE: 'E',
    });
  });

  it('a function not on the toolbar is refused before the helper runs', async () => {
    const c = helper(CUA_HELPER_REMOVE_BUTTON, {}, fixture);
    const r = await handleRemoveGuiStatusButton({ connection: c } as any, {
      ...remove,
      function_code: '%ML',
    });
    expect(text(r)).toMatch(
      /not on the application toolbar of status MAIN \(toolbar: &REFRESH, ZOLD\)\. Nothing was written\./,
    );
    expect(
      c.callFunction.mock.calls.some((x) => x[0] === CUA_HELPER_REMOVE_BUTTON),
    ).toBe(false);
  });

  it('a read-back that differs says the interface WAS changed, never "nothing was written"', async () => {
    const c = helper(
      CUA_HELPER_REMOVE_BUTTON,
      {
        EV_STATUS: 'S',
        EV_WRITTEN: 'X',
        EV_FUNCTION_DELETED: 'X',
        EV_MESSAGE: 'removed',
      },
      fixture,
    );
    const r = await handleRemoveGuiStatusButton(
      { connection: c } as any,
      remove,
    );
    expect(r.isError).toBe(true);
    expect(text(r)).toMatch(
      /was removed in ZMY_PROG, but the independent read-back differs/,
    );
    expect(text(r)).not.toMatch(/Nothing was written/);
  });

  it('removal dry_run passes IV_TEST and reads nothing back', async () => {
    const c = helper(
      CUA_HELPER_REMOVE_BUTTON,
      { EV_STATUS: 'S', EV_MESSAGE: 'TEST MODE' },
      () => {
        throw new Error('no read-back expected');
      },
    );
    const j = JSON.parse(
      text(
        await handleRemoveGuiStatusButton({ connection: c } as any, {
          ...remove,
          dry_run: true,
        }),
      ),
    );
    expect(j).toMatchObject({
      dry_run: true,
      written: false,
      toolbar_slots: ['04'],
    });
  });

  it('deletion succeeds on the verified read-back and lists the remaining statuses', async () => {
    const c = helper(
      CUA_HELPER_DELETE_STATUS,
      {
        EV_STATUS: 'S',
        EV_WRITTEN: 'X',
        EV_MESSAGE: 'Status TWIN deleted from ZMY_PROG',
        EV_WARNING: 'No other status uses toolbar 0001',
      },
      () => {
        const raw = fixture();
        raw.STA = raw.STA!.filter((r) => r.CODE !== 'TWIN');
        return raw;
      },
    );
    const r = await handleDeleteGuiStatus({ connection: c } as any, {
      program_name: 'zmy_prog',
      status: 'twin',
    });
    expect(r.isError).toBe(false);
    const j = JSON.parse(text(r));
    expect(j.remaining_statuses).toEqual(['MAIN', 'POPUP']);
    expect(j.warnings).toHaveLength(1);
  });

  it('deleting an unknown status is refused before the helper, listing the statuses', async () => {
    const c = helper(CUA_HELPER_DELETE_STATUS, {}, fixture);
    const r = await handleDeleteGuiStatus({ connection: c } as any, {
      program_name: 'ZMY_PROG',
      status: 'NOPE',
    });
    expect(text(r)).toMatch(
      /Status NOPE does not exist in ZMY_PROG \(statuses: MAIN, POPUP, TWIN\)\. Nothing was written\./,
    );
    expect(
      c.callFunction.mock.calls.some((x) => x[0] === CUA_HELPER_DELETE_STATUS),
    ).toBe(false);
  });

  it('a helper failure after the write says the interface WAS changed; a status still there is caught', async () => {
    let r = await handleDeleteGuiStatus(
      {
        connection: helper(
          CUA_HELPER_DELETE_STATUS,
          {
            EV_STATUS: 'F',
            EV_WRITTEN: 'X',
            EV_MESSAGE: 'Written, but NOT activated',
          },
          fixture,
        ),
      } as any,
      { program_name: 'ZMY_PROG', status: 'MAIN' },
    );
    expect(text(r)).toMatch(/WAS changed/);
    r = await handleDeleteGuiStatus(
      {
        connection: helper(
          CUA_HELPER_DELETE_STATUS,
          { EV_STATUS: 'S', EV_WRITTEN: 'X', EV_MESSAGE: 'deleted' },
          fixture,
        ),
      } as any,
      { program_name: 'ZMY_PROG', status: 'MAIN' },
    );
    expect(text(r)).toMatch(/status MAIN is still there/);
  });
});
