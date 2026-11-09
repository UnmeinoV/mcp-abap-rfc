/**
 * Activation warnings must be summarised, not dumped.
 *
 * WHY (2026-10-27, live on S4D client 100): UpdateStructure activate=true on the
 * VBAP append ZZVBAP regenerated every SAP CDS view built on VBAP and came back
 * with 1638 W-level messages — none of them about the field that was added. The
 * handler put all 1638 into `activation_warnings` AND into `message`, a 255 KB
 * result the MCP client could not even display. 249 of them were the same
 * sentence ("Prefix "Demand" must be specified for an expression").
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  type ActivationOutcome,
  activationWarningLines,
  describeActivation,
  formatAdtMessagesCapped,
  WARNING_DISPLAY_LIMIT,
} from '../../lib/adtMessages';
import { writtenActivationFields } from '../../lib/adtObjectOps';

const W = (text: string) => ({ type: 'W', text });

/** The ZZVBAP shape: a few sentences repeated hundreds of times, plus a long tail. */
function flood(): { type: string; text: string }[] {
  const out: { type: string; text: string }[] = [];
  for (let i = 0; i < 249; i++)
    out.push(W('Prefix "Demand" must be specified for an expression'));
  for (let i = 0; i < 145; i++)
    out.push(W('Prefix "head" must be specified for an expression'));
  for (let i = 0; i < 1244; i++) out.push(W(`View I_V${i} reference missing`));
  return out; // 1638
}

function outcomeOf(
  warnings: { type: string; text: string }[],
): ActivationOutcome {
  return {
    activated: true,
    checked: true,
    generated: true,
    messages: warnings,
    errors: [],
    warnings,
    success: true,
  };
}

describe('activationWarningLines', () => {
  it('keeps a short list as it is, one line per warning', () => {
    expect(activationWarningLines([W('a'), W('b')])).toEqual(['W: a', 'W: b']);
  });

  it('folds identical warnings into one line with a count', () => {
    expect(activationWarningLines([W('a'), W('a'), W('a'), W('b')])).toEqual([
      'W: a (x3)',
      'W: b',
    ]);
  });

  it('caps the distinct lines and says how many were left out', () => {
    const lines = activationWarningLines(flood());
    expect(lines).toHaveLength(WARNING_DISPLAY_LIMIT + 1);
    expect(lines[0]).toBe(
      'W: Prefix "Demand" must be specified for an expression (x249)',
    );
    expect(lines[1]).toBe(
      'W: Prefix "head" must be specified for an expression (x145)',
    );
    const distinct = 2 + 1244;
    expect(lines[WARNING_DISPLAY_LIMIT]).toBe(
      `… ${distinct - WARNING_DISPLAY_LIMIT} more distinct warning(s) not shown (1638 in total)`,
    );
  });

  it('drops warnings that carry no text', () => {
    expect(activationWarningLines([W(''), W('  '), W('real')])).toEqual([
      'W: real',
    ]);
  });
});

describe('formatAdtMessagesCapped', () => {
  it('matches formatAdtMessages for a short list', () => {
    expect(formatAdtMessagesCapped([W('a'), W('b')], 5)).toBe('[W] a; [W] b');
  });

  it('folds duplicates and names the remainder', () => {
    const text = formatAdtMessagesCapped(flood(), 3);
    expect(text).toBe(
      '[W] Prefix "Demand" must be specified for an expression (x249); ' +
        '[W] Prefix "head" must be specified for an expression (x145); ' +
        '[W] View I_V0 reference missing; … 1243 more distinct (1638 in total)',
    );
  });
});

describe('the ZZVBAP flood stays readable', () => {
  it('describeActivation keeps the count but not the 1638 texts', () => {
    const msg = describeActivation(outcomeOf(flood()), 'structure ZZVBAP');
    expect(msg).toMatch(
      /^structure ZZVBAP activated successfully \(1638 warning\(s\): /,
    );
    expect(msg.length).toBeLessThan(1000);
    expect(msg).toContain('see activation_warnings');
  });

  it('writtenActivationFields caps activation_warnings', () => {
    const fields = writtenActivationFields(outcomeOf(flood()));
    expect(String(fields.activation_warnings).length).toBeLessThan(3000);
    expect(String(fields.activation_warnings)).toContain('1638 in total');
  });
});

describe('handlers do not dump activation warnings themselves', () => {
  const HANDLERS_ROOT = path.resolve(__dirname, '../../handlers');
  function walk(dir: string): string[] {
    const out: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) out.push(...walk(full));
      else if (entry.name.endsWith('.ts')) out.push(full);
    }
    return out;
  }

  it('no handler maps or passes activation.warnings straight into its result', () => {
    const offenders = walk(HANDLERS_ROOT).filter((file) => {
      const src = fs.readFileSync(file, 'utf8');
      return (
        /activation\??\.warnings\.map\(/.test(src) ||
        /activation_warnings:\s*activation\??\.warnings\.length\s*\?\s*activation\.warnings\b/.test(
          src,
        )
      );
    });
    expect(offenders.map((f) => path.relative(HANDLERS_ROOT, f))).toEqual([]);
  });
});
