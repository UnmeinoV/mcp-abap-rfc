import { readFileSync } from 'node:fs';
import path from 'node:path';

// The launcher cannot be imported without starting a server, so this pins the
// source ORDER: the RFC module guard loads the NW RFC SDK, which drops
// rfc<pid>.trc into the cwd unless RFC_TRACE_DIR is already set (measured live).
describe('launcher: RFC trace dir default precedes the RFC module guard', () => {
  const src = readFileSync(
    path.join(__dirname, '../../server/launcher.ts'),
    'utf8',
  );

  it('calls defaultRfcTraceDir() before assertRfcModuleLoadable()', () => {
    const trace = src.search(/^\s*defaultRfcTraceDir\(\);\s*$/m);
    const guard = src.search(/^\s*assertRfcModuleLoadable\(\);\s*$/m);
    expect(trace).toBeGreaterThan(-1);
    expect(guard).toBeGreaterThan(-1);
    expect(trace).toBeLessThan(guard);
  });

  it('bridges the env file (RFC_TRACE_DIR) before the trace-dir default', () => {
    const bridge = src.search(/^\s*applyEnvFileBridge\(\{\s*$/m);
    const trace = src.search(/^\s*defaultRfcTraceDir\(\);\s*$/m);
    expect(bridge).toBeGreaterThan(-1);
    expect(bridge).toBeLessThan(trace);
  });
});
