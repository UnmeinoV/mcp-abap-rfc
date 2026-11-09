/**
 * Structural contract: an activation result must come from SAP, never from the
 * caller's own request flag.
 *
 * WHY A TEST AND NOT A REVIEW (field report round 3, cross-cutting):
 *
 *   > Every result field must declare whether it is an echo, a client-side
 *   > assumption, or SAP's verdict — and that must be enforced by a test, not
 *   > by review.
 *
 * This defect has now been found and fixed twice, and reappeared twice. The
 * first round fixed the low `Activate*` handlers and the `Update*` mechanism
 * groups; nine high-level handlers that call `.activate()` were missed and kept
 * building `{ success: true, message: '... activated successfully' }`
 * unconditionally. Measured cost on DM2/310: five of eight metadata extensions
 * reported success while SAP had rejected every one of them.
 *
 * A `success: true` literal cannot be reviewed into correctness — it has to be
 * impossible to write. These tests are what makes it impossible.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const HANDLERS_ROOT = path.resolve(__dirname, '../../handlers');

/** Anything that derives the verdict from SAP's own activation messages. */
const EVALUATORS = [
  'evaluateActivation',
  'evaluateActivationResponse',
  'activateAndEvaluate',
  'activateOrThrow',
  'activateWrittenObject',
  'activationFlags',
];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith('.ts')) out.push(full);
  }
  return out;
}

const handlerFiles = walk(HANDLERS_ROOT);
const rel = (p: string) =>
  path.relative(HANDLERS_ROOT, p).split(path.sep).join('/');

describe('activation verdict contract', () => {
  it('finds handler files to check (guards against a broken scan)', () => {
    // If the scan itself silently found nothing, every assertion below would
    // pass vacuously — which is the exact failure mode being guarded against.
    expect(handlerFiles.length).toBeGreaterThan(100);
  });

  it('every handler that activates also evaluates SAP verdict', () => {
    const offenders = handlerFiles
      .map((file) => ({ file, src: fs.readFileSync(file, 'utf-8') }))
      .filter(({ src }) => /\.activate\(/.test(src))
      .filter(({ src }) => !EVALUATORS.some((name) => src.includes(name)))
      .map(({ file }) => rel(file));

    expect(offenders).toEqual([]);
  });

  it('no handler derives an activation status from the request flag', () => {
    // `status: shouldActivate ? 'active' : 'inactive'` is the echo in its
    // purest form: the caller asked to activate, so the tool reports the object
    // is active — without ever asking SAP.
    const echo =
      /(status|activated)\s*:\s*(shouldActivate|args\.activate|activate)\s*(\?|===|\|\|)/;
    const offenders = handlerFiles
      .filter((file) => echo.test(fs.readFileSync(file, 'utf-8')))
      .map(rel);

    expect(offenders).toEqual([]);
  });
});
