/**
 * Write guardrails (SAP_DENY_TOOLS / SAP_ALLOWED_PACKAGES) — both off by default.
 *
 * Pins the two things this project's own defect-class table would flag if they were wrong:
 * the config is truly a no-op when the env vars are unset (no surprise behaviour change), and the
 * package restriction's SCOPE is exactly what it claims — only fires on args carrying
 * `package_name`, never treated as covering Update/Delete/Activate on an existing object.
 */

import {
  checkPackageAllowed,
  checkToolDenied,
  loadWriteGuardConfig,
} from '../../lib/security/writeGuard';

describe('loadWriteGuardConfig', () => {
  it('is fully off when neither env var is set — no behaviour change by default', () => {
    const config = loadWriteGuardConfig({});
    expect(config.deniedTools).toEqual([]);
    expect(config.allowedPackages).toBeUndefined();
  });

  it('parses comma-separated lists, trimming whitespace', () => {
    const config = loadWriteGuardConfig({
      SAP_DENY_TOOLS: ' DeleteClass , DeletePackage ,Delete*',
      SAP_ALLOWED_PACKAGES: 'Z*, $TMP',
    });
    expect(config.deniedTools).toEqual([
      'DeleteClass',
      'DeletePackage',
      'Delete*',
    ]);
    expect(config.allowedPackages).toEqual(['Z*', '$TMP']);
  });
});

describe('checkToolDenied', () => {
  it('is a no-op with an empty deny list', () => {
    expect(checkToolDenied('DeleteClass', { deniedTools: [] })).toBeUndefined();
  });

  it('refuses an exact-match tool name', () => {
    const refusal = checkToolDenied('DeleteClass', {
      deniedTools: ['DeleteClass'],
    });
    expect(refusal?.reason).toContain('DeleteClass');
    expect(refusal?.reason).toContain('SAP_DENY_TOOLS');
  });

  it('does not refuse a DIFFERENT tool with the same prefix', () => {
    expect(
      checkToolDenied('DeleteClassLow', { deniedTools: ['DeleteClass'] }),
    ).toBeUndefined();
  });

  it('refuses via a glob pattern', () => {
    const refusal = checkToolDenied('DeleteTransport', {
      deniedTools: ['Delete*'],
    });
    expect(refusal).toBeDefined();
  });

  it('never refuses a tool the pattern does not match', () => {
    expect(
      checkToolDenied('GetClass', { deniedTools: ['Delete*', 'UpdateTable'] }),
    ).toBeUndefined();
  });
});

describe('checkPackageAllowed — scope is exactly "args carrying package_name"', () => {
  it('is a no-op when allowedPackages is unset (default off)', () => {
    expect(
      checkPackageAllowed({ package_name: 'ZANYTHING' }, { deniedTools: [] }),
    ).toBeUndefined();
  });

  it('is a no-op when the call carries no package_name at all — e.g. Update*/Delete*/Activate* on an existing object', () => {
    // Simulates UpdateClass({class_name: 'ZCL_X', source_code: '...'}) — no package_name param.
    expect(
      checkPackageAllowed(
        { class_name: 'ZCL_X', source_code: '...' },
        { deniedTools: [], allowedPackages: ['Z*'] },
      ),
    ).toBeUndefined();
  });

  it('allows a package_name matching an allow-list pattern', () => {
    expect(
      checkPackageAllowed(
        { package_name: 'ZMY_PKG' },
        { deniedTools: [], allowedPackages: ['Z*', '$TMP'] },
      ),
    ).toBeUndefined();
  });

  it('allows an EXACT match like $TMP (no wildcard needed)', () => {
    expect(
      checkPackageAllowed(
        { package_name: '$TMP' },
        { deniedTools: [], allowedPackages: ['Z*', '$TMP'] },
      ),
    ).toBeUndefined();
  });

  it('refuses a package_name outside every allow-list pattern', () => {
    const refusal = checkPackageAllowed(
      { package_name: 'YCUSTOM_PKG' },
      { deniedTools: [], allowedPackages: ['Z*', '$TMP'] },
    );
    expect(refusal?.reason).toContain('YCUSTOM_PKG');
    expect(refusal?.reason).toContain('SAP_ALLOWED_PACKAGES');
    // The refusal message itself states the scope limit, so a reader of the raw refusal (not
    // just the source code) still learns this does not cover Update/Delete/Activate.
    expect(refusal?.reason.toLowerCase()).toContain('does not restrict writes');
  });

  it('is a no-op when args is undefined entirely', () => {
    expect(
      checkPackageAllowed(undefined, {
        deniedTools: [],
        allowedPackages: ['Z*'],
      }),
    ).toBeUndefined();
  });
});
