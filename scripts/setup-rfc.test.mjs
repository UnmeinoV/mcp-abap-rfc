import assert from 'node:assert/strict';
import { test } from 'node:test';
import path from 'node:path';
import {
  dylibsToCopy,
  npmInvocation,
  selectSdkDir,
  withRfcTraceDir,
} from './setup-rfc.mjs';

test('linux x64 uses the x86 SDK', () => {
  assert.equal(selectSdkDir('linux', 'x64'), 'runtime/linux/x86/nwrfcsdk');
});

test('linux arm64 uses the arm SDK', () => {
  assert.equal(selectSdkDir('linux', 'arm64'), 'runtime/linux/arm/nwrfcsdk');
});

test('macOS x64 uses the macOS SDK', () => {
  assert.equal(selectSdkDir('darwin', 'x64'), 'runtime/macos/nwrfcsdk');
});

test('macOS arm64 is refused before building: the SDK is x86_64-only', () => {
  assert.throws(() => selectSdkDir('darwin', 'arm64'), /x86_64-only/);
  assert.throws(() => selectSdkDir('darwin', 'arm64'), /Rosetta/);
  assert.throws(() => selectSdkDir('darwin', 'arm64'), /x64/);
});

test('windows x64 uses the windows SDK', () => {
  assert.equal(selectSdkDir('win32', 'x64'), 'runtime/windows/nwrfcsdk');
});

test('windows arm64 has no SDK and is refused, naming it', () => {
  assert.throws(() => selectSdkDir('win32', 'arm64'), /win32-arm64/);
  assert.throws(
    () => selectSdkDir('win32', 'arm64'),
    /No SAP NW RFC SDK for win32-arm64 — supported platforms/,
  );
});

test('linux ia32 has no SDK and is refused, naming it', () => {
  assert.throws(() => selectSdkDir('linux', 'ia32'), /linux-ia32/);
});

test('macOS copy step selects every .dylib and nothing else, sorted', () => {
  assert.deepEqual(
    dylibsToCopy([
      'libsapucum.dylib',
      'libsapnwrfc.dylib',
      'libicuuc57.dylib',
      'libicudata57.dylib',
      'libicui18n57.dylib',
      'sapnwrfc.lib',
      'README.txt',
      'libsapnwrfc.dylib.dSYM',
      'libsapnwrfc.so',
    ]),
    [
      'libicudata57.dylib',
      'libicui18n57.dylib',
      'libicuuc57.dylib',
      'libsapnwrfc.dylib',
      'libsapucum.dylib',
    ],
  );
  assert.deepEqual(dylibsToCopy([]), []);
});

test('npm is run with this Node and no shell when npm_execpath is set', () => {
  const inv = npmInvocation(
    ['rebuild', 'x'],
    { npm_execpath: '/opt/npm/bin/npm-cli.js' },
    'win32',
    '/usr/bin/node',
  );
  assert.deepEqual(inv, {
    command: '/usr/bin/node',
    args: ['/opt/npm/bin/npm-cli.js', 'rebuild', 'x'],
    shell: false,
  });
});

test('npm falls back to the PATH npm (shell only on Windows) without npm_execpath', () => {
  assert.deepEqual(npmInvocation(['ci'], {}, 'linux', '/usr/bin/node'), {
    command: 'npm',
    args: ['ci'],
    shell: false,
  });
  assert.deepEqual(npmInvocation(['ci'], { npm_execpath: ' ' }, 'win32', 'n'), {
    command: 'npm',
    args: ['ci'],
    shell: true,
  });
});

test('build and probe env get RFC_TRACE_DIR in the temp dir, a user value wins', () => {
  assert.equal(
    withRfcTraceDir({ A: '1' }, '/tmp').RFC_TRACE_DIR,
    path.join('/tmp', 'mcp-abap-rfc-rfc-trace'),
  );
  assert.equal(withRfcTraceDir({ A: '1' }, '/tmp').A, '1');
  assert.equal(
    withRfcTraceDir({ RFC_TRACE_DIR: '/var/trc' }, '/tmp').RFC_TRACE_DIR,
    '/var/trc',
  );
  const env = {};
  withRfcTraceDir(env, '/tmp');
  assert.equal(env.RFC_TRACE_DIR, undefined, 'input env is not mutated');
});
