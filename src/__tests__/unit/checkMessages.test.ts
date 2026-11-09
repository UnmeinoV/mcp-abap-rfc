/**
 * Syntax-check failures must carry the positions SAP already sent.
 *
 * The fixtures here are the literal bytes DM2/310 returned for a class check —
 * captured with `runObjectCheckRun` against a deliberately broken source — not
 * a hand-written approximation of what ADT might emit.
 */

import {
  collapseCheckMessages,
  describeCheckFailure,
  formatCheckFindings,
} from '../../lib/checkMessages';
import {
  parseCheckRunResponse,
  positionFromHref,
} from '../../lib/checkRunParser';

/** Verbatim from DM2/310. Note the position lives ONLY in chkrun:uri. */
const REAL_ERROR_XML = `<?xml version="1.0" encoding="utf-8"?><chkrun:checkRunReports xmlns:chkrun="http://www.sap.com/adt/checkrun"><chkrun:checkReport chkrun:reporter="abapCheckRun" chkrun:triggeringUri="/sap/bc/adt/oo/classes/zcl_mcp_lineprobe" chkrun:status="processed" chkrun:statusText="Object ZCL_MCP_LINEPROBE has been checked"><chkrun:checkMessageList><chkrun:checkMessage chkrun:uri="/sap/bc/adt/oo/classes/zcl_mcp_lineprobe/source/main#start=10,17" chkrun:type="E" chkrun:shortText="Field &quot;IO_OUT&quot; is unknown."><atom:link href="art.syntax:GTU" rel="http://www.sap.com/adt/categories/quickfixes" xmlns:atom="http://www.w3.org/2005/Atom"/></chkrun:checkMessage></chkrun:checkMessageList></chkrun:checkReport></chkrun:checkRunReports>`;

/** Also verbatim: a run SAP refused outright, with no messages at all. */
const NOT_PROCESSED_XML = `<?xml version="1.0" encoding="utf-8"?><chkrun:checkRunReports xmlns:chkrun="http://www.sap.com/adt/checkrun"><chkrun:checkReport chkrun:reporter="abapCheckRun" chkrun:triggeringUri="/sap/bc/adt/oo/classes/zcl_mcp_lineprobe" chkrun:status="notProcessed" chkrun:statusText="Resource CLASS ZCL_MCP_LINEPROBE does not exist."/></chkrun:checkRunReports>`;

const asResponse = (xml: string) => ({ data: xml }) as never;

describe('positionFromHref', () => {
  it('reads line and column out of the uri fragment', () => {
    expect(
      positionFromHref('/sap/bc/adt/oo/classes/zcl_x/source/main#start=10,17'),
    ).toEqual({ line: 10, column: 17 });
  });

  it('reads a line with no column', () => {
    expect(positionFromHref('/x/source/main#start=42')).toEqual({
      line: 42,
      column: undefined,
    });
  });

  it('returns nothing for a uri with no fragment, and for no uri', () => {
    expect(positionFromHref('/x/source/main')).toEqual({});
    expect(positionFromHref(undefined)).toEqual({});
  });
});

describe('parseCheckRunResponse', () => {
  it('populates line and column from the real DM2 payload', () => {
    // Before this, `line` came only from an `@_line` attribute that ADT never
    // emits, so every position was silently dropped.
    const parsed = parseCheckRunResponse(asResponse(REAL_ERROR_XML));
    expect(parsed.errors).toHaveLength(1);
    expect(parsed.errors[0]).toMatchObject({
      type: 'E',
      text: 'Field "IO_OUT" is unknown.',
      line: 10,
      column: 17,
    });
  });
});

describe('collapseCheckMessages', () => {
  const repeated = [
    { type: 'E', text: 'Field "IO_OUT" is unknown.', line: 12 },
    { type: 'E', text: 'Field "IO_OUT" is unknown.', line: 10 },
    { type: 'E', text: 'Field "IO_OUT" is unknown.', line: 11 },
    { type: 'E', text: 'Type "ZIF_GONE" is unknown.', line: 4 },
  ];

  it('collapses one repeated text into a single finding with every line', () => {
    const findings = collapseCheckMessages(repeated);
    expect(findings).toHaveLength(2);
    const io = findings.find((f) => f.text.includes('IO_OUT'));
    expect(io?.count).toBe(3);
    expect(io?.lines).toEqual([10, 11, 12]);
  });

  it('orders findings by first line so the list reads in source order', () => {
    expect(collapseCheckMessages(repeated).map((f) => f.lines[0])).toEqual([
      4, 10,
    ]);
  });

  it('puts positionless messages last rather than at line 0', () => {
    const findings = collapseCheckMessages([
      { type: 'E', text: 'no position here' },
      { type: 'E', text: 'has one', line: 7 },
    ]);
    expect(findings.map((f) => f.text)).toEqual([
      'has one',
      'no position here',
    ]);
  });

  it('separates severities even when the text is identical', () => {
    const findings = collapseCheckMessages([
      { type: 'E', text: 'same words', line: 1 },
      { type: 'W', text: 'same words', line: 2 },
    ]);
    expect(findings.map((f) => f.severity).sort()).toEqual([
      'error',
      'warning',
    ]);
  });

  it('ignores messages with no text', () => {
    expect(collapseCheckMessages([{ type: 'E', text: '' }])).toEqual([]);
  });
});

describe('formatCheckFindings', () => {
  it('leads with the position and states the repeat count', () => {
    const text = formatCheckFindings(
      collapseCheckMessages([
        { type: 'E', text: 'Field "IO_OUT" is unknown.', line: 10 },
        { type: 'E', text: 'Field "IO_OUT" is unknown.', line: 11 },
      ]),
    );
    expect(text).toBe(
      'line 10: Field "IO_OUT" is unknown. (x2, also lines 11)',
    );
  });
});

describe('describeCheckFailure', () => {
  it('names the subject, the count and the position', () => {
    const parsed = parseCheckRunResponse(asResponse(REAL_ERROR_XML));
    expect(describeCheckFailure(parsed, 'class ZCL_MCP_LINEPROBE')).toBe(
      'Syntax check failed for class ZCL_MCP_LINEPROBE: 1 error(s). ' +
        'line 10,17: Field "IO_OUT" is unknown.',
    );
  });

  it("reports SAP's own reason when the run was refused with no messages", () => {
    // Measured: status="notProcessed" carries the whole explanation in
    // statusText. Saying "0 error(s)." there would drop the only useful line.
    const parsed = parseCheckRunResponse(asResponse(NOT_PROCESSED_XML));
    expect(describeCheckFailure(parsed, 'class ZCL_MCP_LINEPROBE')).toBe(
      'Syntax check could not be run for class ZCL_MCP_LINEPROBE: ' +
        'Resource CLASS ZCL_MCP_LINEPROBE does not exist.',
    );
  });

  it('counts warnings without printing them', () => {
    const result = {
      success: false,
      status: 'processed',
      message: '',
      errors: [{ type: 'E', text: 'boom', line: 3 }],
      warnings: [
        { type: 'W', text: 'not the cause', line: 1 },
        { type: 'W', text: 'nor this', line: 2 },
      ],
      info: [],
      total_messages: 3,
      has_errors: true,
      has_warnings: true,
    };
    const text = describeCheckFailure(result, 'program ZP');
    expect(text).toContain('2 warning(s) not shown');
    expect(text).not.toContain('not the cause');
  });
});
