#!/usr/bin/env node
// Live read-only smoke test.
// Usage: node tools/smoke-rfc.mjs --env-path=<file> [--second-client=<n>]
//   --second-client=<n>  run check 3 (sap_client routing) against client <n>;
//                        the env file must list it in SAP_CLIENTS. Without it
//                        check 3 is SKIPPED.
//   Check 5 (GetTranslation) needs the RFC helper ZMCP_LXE installed on the
//   system (SetupTranslationHelper); without it check 5 FAILs.
// Never prints env values or tool arguments; prints check name,
// PASS/FAIL/SKIP and short evidence. FAIL lines carry no tool-result text.
import { readFileSync } from 'node:fs';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import * as dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const USAGE =
  'usage: node tools/smoke-rfc.mjs --env-path=<file> [--second-client=<n>]\n' +
  '  check 3 runs only with --second-client=<n> (a client listed in SAP_CLIENTS)\n' +
  '  check 5 needs the RFC helper ZMCP_LXE installed (SetupTranslationHelper)';
const envArg = process.argv.find((a) => a.startsWith('--env-path='));
if (!envArg) {
  console.error(USAGE);
  process.exit(2);
}
const secondArg = process.argv.find((a) => a.startsWith('--second-client='));
const secondClient = secondArg?.slice('--second-client='.length).trim();
if (secondArg && !/^\d{3}$/.test(secondClient)) {
  console.error(`--second-client must be a three-digit client number\n${USAGE}`);
  process.exit(2);
}
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const expectedVersion = JSON.parse(
  readFileSync(path.join(root, 'package.json'), 'utf8'),
).version;

// The configured default client: SAP_CLIENT in the env file (it wins over the
// shell, as in the server), else the shell's. Compared, never printed.
const envPath = path.resolve(envArg.slice('--env-path='.length));
let defaultClient;
try {
  const fileValues = dotenv.parse(readFileSync(envPath, 'utf8'));
  defaultClient = (
    'SAP_CLIENT' in fileValues ? fileValues.SAP_CLIENT : process.env.SAP_CLIENT
  )?.trim();
} catch (e) {
  console.error(`cannot read the env file (error_class=${e?.name ?? 'Error'})`);
  process.exit(2);
}

const transport = new StdioClientTransport({
  command: process.execPath,
  args: [path.join(root, 'bin/mcp-abap-rfc.js'), envArg, '--exposition=readonly,high'],
  cwd: root,
  stderr: 'ignore',
});
const client = new Client({ name: 'smoke-rfc', version: '0.0.0' });
const LONG = { timeout: 300000 };
let failed = 0;

const text = (r) => (r.content || []).filter((c) => c.type === 'text').map((c) => c.text);
const report = (name, ok, passEvidence, failEvidence) => {
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  -- ${ok ? passEvidence : failEvidence}`);
};
const call = async (name, args) => {
  try {
    return await client.callTool({ name, arguments: args }, undefined, LONG);
  } catch (e) {
    return { isError: true, content: [{ type: 'text', text: `EXC ${e?.name ?? 'Error'}${e?.code !== undefined ? ` code=${e.code}` : ''}` }] };
  }
};

try {
  await client.connect(transport, LONG);

  // 1. wrong answer: error, or a version other than package.json's
  {
    const r = await call('GetSession', {});
    const t = text(r).join('\n');
    const m = t.match(/"server_version"\s*:\s*"([^"]+)"/);
    const ok = !r.isError && m?.[1] === expectedVersion;
    report(`1 GetSession server_version ${expectedVersion}`, ok, `server_version=${m?.[1]}`, `isError=${!!r.isError} version_matches=${ok}`);
  }
  // 2. wrong answer: T000 empty (rows reported as success), or the configured
  //    default client is not among its clients
  {
    const r = await call('GetSqlQuery', { sql_query: 'SELECT mandt FROM t000' });
    const t = text(r).join('\n');
    const rows = [...t.matchAll(/"MANDT"\s*:\s*"(\d+)"/gi)].map((m) => m[1]);
    const hasDefault = !!defaultClient && rows.includes(defaultClient);
    report('2 T000 non-empty and holds the default client', !r.isError && rows.length > 0 && hasDefault, `rows=${rows.length} default_client_present=true`, `isError=${!!r.isError} rows=${rows.length} default_client_present=${hasDefault}`);
  }
  // 3. wrong answer: no label item, or label names another client
  if (secondClient) {
    const r = await call('GetSqlQuery', { sql_query: 'SELECT mandt FROM t000', sap_client: secondClient });
    const items = text(r);
    const last = items[items.length - 1];
    const ok = !r.isError && last?.trim() === `sap_client: ${secondClient}`;
    report('3 sap_client label (--second-client)', ok, 'label names the requested client', `isError=${!!r.isError} items=${items.length} label_matches=${ok}`);
  } else {
    console.log('SKIP  3 sap_client label  -- pass --second-client=<n> to run it');
  }
  // 4. wrong answer: error / not-found text / empty source
  {
    const r = await call('GetClass', { class_name: 'CL_ABAP_CHAR_UTILITIES' });
    const t = text(r).join('\n');
    report('4 GetClass CL_ABAP_CHAR_UTILITIES', !r.isError && /CLASS cl_abap_char_utilities DEFINITION/i.test(t), `len=${t.length}`, `isError=${!!r.isError} len=${t.length}`);
  }
  // 5. wrong answer: "needs RFC", "not installed", "outdated", "newer", or an error
  {
    const r = await call('GetTranslation', { object_type: 'DTEL', object_name: 'MANDT', language: 'ZH' });
    const t = text(r).join('\n');
    const bad = /needs? (SAP_CONNECTION_TYPE=)?rfc|not installed|outdated|newer|restart/i.test(t);
    report('5 GetTranslation DTEL MANDT ZH', !r.isError && !bad, `len=${t.length}`, `isError=${!!r.isError} helper_problem=${bad} len=${t.length}`);
  }
} catch (e) {
  failed++;
  console.log(`FAIL  connect/run -- error_class=${e?.name ?? 'Error'}${e?.code !== undefined ? ` code=${e.code}` : ''} message_len=${String(e?.message ?? '').length} (text withheld: may carry host/user/router)`);
} finally {
  await client.close().catch(() => {});
}
process.exit(failed ? 1 : 0);
