/**
 * `steps_completed` must list only the steps that actually ran.
 *
 * WHY (2026-10-20, live on S4D): UpdateProgram with `activate=false` answered
 * `steps_completed: ["lock","check_new_code","update","unlock","check_inactive"]`
 * while both checks are skipped unless the caller activates — the run that
 * prompted this had just bypassed a failing pre-check on purpose, and the
 * result claimed the check had passed. The five Update* handlers that check
 * before writing all built the list as a literal, so they now share one helper
 * and a structural test keeps the literal from coming back.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { updateStepsCompleted } from '../../lib/updateSteps';

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

describe('updateStepsCompleted', () => {
  it('omits both checks and activation when the caller did not activate', () => {
    expect(updateStepsCompleted(false)).toEqual(['lock', 'update', 'unlock']);
  });

  it('lists the checks and activation when the caller activated', () => {
    expect(updateStepsCompleted(true)).toEqual([
      'lock',
      'check_new_code',
      'update',
      'unlock',
      'check_inactive',
      'activate',
    ]);
  });
});

describe('steps_completed contract', () => {
  const files = walk(HANDLERS_ROOT);

  it('finds handler files to check (guards against a broken scan)', () => {
    expect(files.length).toBeGreaterThan(100);
  });

  it('no handler hard-codes check_new_code into its result', () => {
    const offenders = files
      .filter((file) =>
        fs.readFileSync(file, 'utf-8').includes("'check_new_code'"),
      )
      .map((file) =>
        path.relative(HANDLERS_ROOT, file).split(path.sep).join('/'),
      );
    expect(offenders).toEqual([]);
  });
});
