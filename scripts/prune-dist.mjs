#!/usr/bin/env node
/**
 * Delete build artifacts in `dist/` whose source no longer exists.
 *
 * WHY: `tsc` only ever writes. Delete a handler from `src/` and its compiled
 * `.js`, `.d.ts` and source maps stay in `dist/` forever — invisible in a diff,
 * because `dist/` is not reviewed, and shipped in every package built from that
 * tree. Two such orphans (`handleDeleteMessage`, `handleEditMessage`, removed
 * when the underlying ADT operation turned out to be impossible on 7.58) rode
 * along in a published bundle before this script existed.
 *
 * `make clean` also fixes it, by deleting `dist/` and forcing a full recompile.
 * That is the wrong trade for a dev loop that builds constantly, so this runs as
 * `postbuild` instead: incremental builds stay incremental, and stale files
 * still cannot accumulate.
 *
 * Usage: node scripts/prune-dist.mjs [--dry-run]
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const SRC = path.join(ROOT, 'src');
const DRY_RUN = process.argv.includes('--dry-run');

/** Compiled outputs, longest suffix first so `.d.ts` wins over `.ts`. */
const ARTIFACT_SUFFIXES = ['.d.ts.map', '.d.ts', '.js.map', '.js'];
/** A source file for `<stem>` may be any of these. */
const SOURCE_SUFFIXES = ['.ts', '.tsx', '.js', '.json'];

function walk(dir, base = dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, base, out);
    else out.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return out;
}

function splitArtifact(rel) {
  for (const suffix of ARTIFACT_SUFFIXES) {
    if (rel.endsWith(suffix)) {
      return { stem: rel.slice(0, -suffix.length), suffix };
    }
  }
  return null;
}

function main() {
  if (!fs.existsSync(DIST)) {
    console.log('dist/ does not exist — nothing to prune.');
    return;
  }

  const sources = new Set(walk(SRC));
  const orphans = [];
  const unknown = [];

  for (const rel of walk(DIST)) {
    const parsed = splitArtifact(rel);
    if (!parsed) {
      // Anything that is not a tsc output was put here by something else.
      // Report it rather than delete it — guessing would be worse than noise.
      unknown.push(rel);
      continue;
    }
    const hasSource = SOURCE_SUFFIXES.some((s) => sources.has(parsed.stem + s));
    if (!hasSource) orphans.push(rel);
  }

  if (unknown.length) {
    console.log(
      `Note: ${unknown.length} file(s) in dist/ are not tsc output and were left alone:`,
    );
    for (const rel of unknown.slice(0, 10)) console.log(`  ${rel}`);
    if (unknown.length > 10) console.log(`  … and ${unknown.length - 10} more`);
  }

  if (orphans.length === 0) {
    console.log('dist/ is clean — no orphaned build artifacts.');
    return;
  }

  console.log(
    `${DRY_RUN ? 'Would remove' : 'Removing'} ${orphans.length} orphaned artifact(s):`,
  );
  for (const rel of orphans) {
    console.log(`  ${rel}`);
    if (!DRY_RUN) fs.rmSync(path.join(DIST, rel), { force: true });
  }

  if (!DRY_RUN) {
    // Directories left empty by the removals above.
    let removedDirs = 0;
    const dirs = [];
    (function collect(dir) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
          const full = path.join(dir, entry.name);
          collect(full);
          dirs.push(full);
        }
      }
    })(DIST);
    // Deepest first, so a directory that only held other empty ones also goes.
    for (const dir of dirs.reverse()) {
      if (fs.readdirSync(dir).length === 0) {
        fs.rmdirSync(dir);
        removedDirs++;
      }
    }
    if (removedDirs) console.log(`Removed ${removedDirs} empty director(ies).`);
  }
}

main();
