#!/usr/bin/env node
import path from 'node:path';
// Prints the sorted tool names the compiled dist/ registers for SAP_SYSTEM_TYPE=onprem.
// Mirrors createHandlersRegistry (src/server/launcher.ts) and the available_in filter in
// BaseMcpServer.registerHandlers. Never connects to SAP.
// Usage: node scripts/list-tools.mjs [--exposition=readonly,high,low,compact]
import { fileURLToPath, pathToFileURL } from 'node:url';

// fileURLToPath, not URL.pathname: the latter keeps %20 escapes and yields
// "/C:/..." on Windows.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const load = (p) => import(pathToFileURL(path.join(root, 'dist', p)).href);

const arg = process.argv.find((a) => a.startsWith('--exposition='));
const exposition = arg
  ? arg
      .slice('--exposition='.length)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  : ['readonly', 'high', 'low', 'compact'];

const groups = await load('lib/handlers/groups/index.js');
const { ReadVsGetDedupStrategy } = await load(
  'lib/handlers/groups/strategies/index.js',
);

// validateExposition is deliberately NOT applied: it forbids 'compact' together with other
// groups, but the baseline wants the union of all four groups (a superset surface check).
const ctx = { connection: undefined, logger: undefined };

const overriding = [];
if (exposition.includes('high'))
  overriding.push(new groups.HighLevelHandlersGroup(ctx));
if (exposition.includes('low'))
  overriding.push(new groups.LowLevelHandlersGroup(ctx));
if (exposition.includes('compact'))
  overriding.push(new groups.CompactHandlersGroup(ctx));

const overridingNames = new Set();
for (const g of overriding)
  for (const e of g.getHandlers()) overridingNames.add(e.toolDefinition.name);

const all = [];
if (exposition.includes('readonly')) {
  all.push(
    new groups.ReadOnlyHandlersGroup(
      ctx,
      overridingNames,
      new ReadVsGetDedupStrategy(),
    ),
  );
  all.push(new groups.SystemHandlersGroup(ctx));
}
all.push(...overriding);
all.push(new groups.SearchHandlersGroup(ctx));

const systemType = 'onprem';
const names = new Set();
for (const g of all) {
  for (const e of g.getHandlers()) {
    const availableIn = e.toolDefinition.available_in;
    if (
      availableIn &&
      availableIn.length > 0 &&
      !availableIn.includes(systemType)
    )
      continue;
    names.add(e.toolDefinition.name);
  }
}
console.log(JSON.stringify([...names].sort(), null, 2));
