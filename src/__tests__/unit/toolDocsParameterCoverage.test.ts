/**
 * The generated tool reference must not claim a tool takes no parameters.
 *
 * WHY. `tools/generate-tools-docs.js` understood only JSON-Schema-shaped
 * `inputSchema` objects. Every tool whose schema is written in zod — the keys
 * are then top-level, with no `properties` sub-object — fell through to the
 * empty case and was published as **"Parameters: None"**. CreatePackage (9
 * parameters) and SearchSource (17) were both documented that way: a reference
 * that confidently states the wrong thing, which is worse than one that omits
 * the tool.
 *
 * This test pins the artifact rather than the parser: a tool may only be
 * documented as parameterless if its source really declares no properties.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const DOCS = path.resolve(__dirname, '../../../docs/user-guide');
const HANDLERS = path.resolve(__dirname, '../../handlers');

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith('.ts')) out.push(full);
  }
  return out;
}

/** name -> the TOOL_DEFINITION source block that declares it. */
function toolBlocks(): Map<string, string> {
  const map = new Map<string, string>();
  for (const file of walk(HANDLERS)) {
    const src = fs.readFileSync(file, 'utf-8');
    const block = src.match(
      /export const TOOL_DEFINITION = \{[\s\S]*?\n\} as const;/,
    );
    const name = src.match(/name: '([^']+)'/)?.[1];
    if (block && name) map.set(name, block[0]);
  }
  return map;
}

/** Tools the reference documents as taking no parameters. */
function toolsDocumentedAsParameterless(file: string): string[] {
  const md = fs.readFileSync(path.join(DOCS, file), 'utf-8');
  const out: string[] = [];
  let current = '';
  for (const line of md.split('\n')) {
    const heading = line.match(/^#### (\S+) /);
    if (heading) current = heading[1];
    if (line.trim() === '- None' && current) out.push(current);
  }
  return out;
}

const blocks = toolBlocks();

describe('generated tool reference — parameter coverage', () => {
  it('finds the reference and the handlers (guards a vacuous pass)', () => {
    expect(blocks.size).toBeGreaterThan(300);
    expect(fs.existsSync(path.join(DOCS, 'AVAILABLE_TOOLS.md'))).toBe(true);
  });

  it('never documents a tool as parameterless when its schema declares parameters', () => {
    const wrong: string[] = [];
    for (const name of toolsDocumentedAsParameterless('AVAILABLE_TOOLS.md')) {
      const block = blocks.get(name);
      if (!block) continue;
      // A genuinely parameterless tool declares `properties: {}` (and nothing
      // else). Anything with a zod field or a populated properties object has
      // parameters and must not be published as "None".
      const declaresEmpty = /properties:\s*\{\s*\}/.test(block);
      const hasZodField = /\n\s+[A-Za-z0-9_]+:\s*z\s*[.\n]/.test(block);
      if (!declaresEmpty || hasZodField) wrong.push(name);
    }
    expect(wrong).toEqual([]);
  });

  it('documents the zod-schema tools that used to be published as "None"', () => {
    // The exact regression: these were all "Parameters: None" before the fix.
    const md = fs.readFileSync(path.join(DOCS, 'AVAILABLE_TOOLS.md'), 'utf-8');
    for (const [tool, param] of [
      ['CreatePackage', 'package_name'],
      ['SearchSource', 'packages'],
      ['GetTableContents', 'table_name'],
      ['GetInclude', 'include_name'],
      ['GetPackageContents', 'package_name'],
    ]) {
      const section = md.slice(md.indexOf(`#### ${tool} `));
      const entry = section.slice(0, section.indexOf('\n---'));
      expect(entry).toContain(`\`${param}\``);
    }
  });

  it('never publishes a description that was cut mid-string', () => {
    // The description is often a `'a' + 'b'` concatenation; reading only the
    // first literal truncated it mid-word.
    const md = fs.readFileSync(path.join(DOCS, 'AVAILABLE_TOOLS.md'), 'utf-8');
    const searchSource = md.slice(md.indexOf('#### SearchSource '));
    const description = searchSource
      .slice(0, searchSource.indexOf('\n\n'))
      .split('**Description:**')[1];
    expect(description).toContain('See Notes');
  });
});
