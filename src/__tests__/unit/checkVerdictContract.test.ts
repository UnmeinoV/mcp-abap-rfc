/**
 * Structural contract: a `Check*` tool must report SAP's positions, and must
 * check the source the caller actually submitted.
 *
 * WHY A TEST (field report round 6, F-2). Round 3 routed the four PRE-WRITE
 * checks through our own check-run and formatter and stopped there. The
 * standalone `Check*` tools kept calling the dependency, so the same source, in
 * the same session, minutes apart, gave two different answers:
 *
 *     UpdateClass  -> line 16,4: Field "IO_OUT" is unknown. (x4, also lines 17, 18, 19)
 *     CheckClass   -> Field "IO_OUT" is unknown.; Field "IO_OUT" is unknown.;
 *                     Field "IO_OUT" is unknown.; Field "IO_OUT" is unknown.
 *
 * That was the worse half: `Check*` is where a caller is SENT when something
 * fails — by this server's own activation-failure text and by the reporter's
 * recovery procedure. The list a caller is told to fetch was the one still
 * arriving without positions.
 *
 * The dependency's wrappers are also wrong in a way nobody had measured:
 * `AdtStructure.check` and `AdtTable.check` hardcode `undefined` where the
 * caller's DDL belongs, so `CheckTable(ddl_code=…)` reported a verdict about
 * the STORED version while the handler logged "with new code". A fix that only
 * touched the formatter would have left that in place, so the contract is
 * "goes through checkObjectAndReport", not "prints a line number".
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

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

const rel = (p: string) =>
  path.relative(HANDLERS_ROOT, p).split(path.sep).join('/');

/**
 * The syntax-check tools. `CheckAccessControl` lives in `high/`, everything
 * else in `low/` with a thin `high/` wrapper that only reshapes the JSON, so
 * matching on the file name rather than the directory is what covers both.
 */
const checkHandlers = walk(HANDLERS_ROOT).filter((file) => {
  const name = path.basename(file);
  return /^handleCheck[A-Z]/.test(name) &&
    !file.includes(`${path.sep}high${path.sep}`)
    ? true
    : name === 'handleCheckAccessControl.ts';
});

/** Files that actually issue the check, as opposed to delegating to a low one. */
const issuers = checkHandlers
  .map((file) => ({ file, src: fs.readFileSync(file, 'utf-8') }))
  .filter(({ src }) => !/handleCheck\w+ as handleCheck\w+Low/.test(src));

describe('check verdict contract', () => {
  it('finds the check handlers (guards against a broken scan)', () => {
    // A scan that silently matched nothing would make every assertion below
    // pass vacuously — the exact failure mode this file exists to prevent.
    expect(issuers.length).toBeGreaterThanOrEqual(14);
  });

  it('every Check* handler runs through the shared formatter', () => {
    const offenders = issuers
      .filter(({ src }) => !src.includes('checkObjectAndReport'))
      .map(({ file }) => rel(file));
    expect(offenders).toEqual([]);
  });

  it('no Check* handler calls the dependency check() wrapper', () => {
    // `.getClass().check(...)` and friends collapse every message into one
    // string and throw it, which is how the positions were lost.
    const offenders = issuers
      .filter(({ src }) =>
        // Ignore comments; only real calls matter.
        src
          .split('\n')
          .filter((line) => !line.trim().startsWith('//'))
          .join('\n')
          .match(
            /\.get[A-Z]\w*\(\)\s*\n?\s*\.check\(|\.get[A-Z]\w*\(\)\.check\(/,
          ),
      )
      .map(({ file }) => rel(file));
    expect(offenders).toEqual([]);
  });

  it('a handler that accepts source passes it to the check', () => {
    // The bug this pins: the parameter was advertised in the schema, echoed in
    // the log line, and then dropped on the floor.
    const offenders = issuers
      .filter(({ src }) =>
        /^\s{6}(source_code|ddl_code|ddl_source):/m.test(src),
      )
      .filter(
        ({ src }) =>
          !/sourceCode:\s*(args\.)?(source_code|ddl_code|ddl_source)/.test(src),
      )
      .map(({ file }) => rel(file));
    expect(offenders).toEqual([]);
  });
});
