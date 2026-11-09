/**
 * A real system's transport request number must not be an example in anything
 * we ship.
 *
 * WHY THIS TEST EXISTS. The round-7 directive said this is a general-purpose
 * server and no customer's identifiers belong in it, and the guard written for
 * it was a grep for two literal names. A name-based guard is clean the day
 * it is written and blind to every system it was not named after: while it
 * reported zero, `E19K905635` (a real transport on a real box, inherited from
 * upstream) was the `transport_request` example in about seventy tool schemas,
 * i.e. in the description every user of this server reads, and in the generated
 * tool reference built from those descriptions.
 *
 * So this test matches the SHAPE — <SID>K<6 digits> — rather than a list of
 * systems anyone has thought of, and exempts only the documented synthetic SIDs
 * below. `ABC`, `AAA` and `ZZZ` are not installation numbers; `E19` and `DM2`
 * are. Adding a prefix here is a claim that a reader will recognise it as fake.
 *
 * SCOPE is what ships: `src/` (tool schemas end up on the wire and in the
 * generated docs), the READMEs, and the `docs/` trees that `package.json`
 * `files` carries.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '../../..');

/** <SID>K<6 digits> — the CTS request/task shape. */
const TRANSPORT_SHAPE = /\b[A-Z][A-Z0-9]{2}K\d{6}\b/g;

/** Prefixes a reader is expected to read as a placeholder, not a system. */
const SYNTHETIC = /^(ABC|AAA|ZZZ)K/;

/** Everything that reaches a user, by either publish path. */
const SCANNED = [
  'src',
  'README.md',
  'README.zh-CN.md',
  'CHANGELOG.md',
  '.env.example',
  'docs/installation',
  'docs/architecture',
  'docs/user-guide',
  'docs/superpowers',
];

const TEXT_EXT = new Set([
  '.ts',
  '.js',
  '.mjs',
  '.cjs',
  '.md',
  '.json',
  '.yaml',
  '.yml',
]);

function filesUnder(rel: string): string[] {
  const abs = path.join(REPO_ROOT, rel);
  if (!fs.existsSync(abs)) return [];
  if (fs.statSync(abs).isFile()) return [abs];
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      // This file names the number that leaked, as provenance, so it would
      // otherwise report itself. It is a test and is never shipped.
      else if (entry.name === path.basename(__filename)) continue;
      else if (TEXT_EXT.has(path.extname(entry.name).toLowerCase()))
        out.push(full);
    }
  };
  walk(abs);
  return out;
}

describe('shipped identifier hygiene', () => {
  const files = SCANNED.flatMap(filesUnder);

  it('scans a real corpus (a broken scan must not pass vacuously)', () => {
    expect(files.length).toBeGreaterThan(300);
  });

  it('ships no real system’s transport request number', () => {
    const offenders: string[] = [];
    for (const file of files) {
      const text = fs.readFileSync(file, 'utf-8');
      const found = (text.match(TRANSPORT_SHAPE) ?? []).filter(
        (m) => !SYNTHETIC.test(m),
      );
      if (found.length) {
        offenders.push(
          `${path.relative(REPO_ROOT, file)} — ${[...new Set(found)].join(', ')}`,
        );
      }
    }
    expect(offenders).toEqual([]);
  });

  it('still finds the synthetic examples, so the shape regex really matches', () => {
    const all = files.flatMap(
      (f) => fs.readFileSync(f, 'utf-8').match(TRANSPORT_SHAPE) ?? [],
    );
    expect(all.some((m) => SYNTHETIC.test(m))).toBe(true);
  });
});
