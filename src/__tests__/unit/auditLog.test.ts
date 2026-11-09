/**
 * Tool-call audit log — off by default, and never leaks a credential to disk.
 */

import { readFileSync, unlinkSync } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { buildAuditEntry, writeAuditEntry } from '../../lib/security/auditLog';

describe('buildAuditEntry — redaction', () => {
  it('redacts a sensitive key at the top level', () => {
    const entry = buildAuditEntry(
      'CreateConnection',
      { username: 'SOME.USER', password: 'hunter2' },
      true,
      12,
    );
    expect((entry.args as any).password).toBe('[REDACTED]');
    expect((entry.args as any).username).toBe('SOME.USER');
  });

  it('redacts a sensitive key nested inside an object/array', () => {
    const entry = buildAuditEntry(
      'GetSqlQuery',
      {
        headers: [
          { name: 'Authorization', value: 'unused' },
          { authorization: 'Bearer xyz' },
        ],
      },
      true,
      1,
    );
    const headers = (entry.args as any).headers;
    expect(headers[1].authorization).toBe('[REDACTED]');
  });

  it('is case-insensitive and matches token/secret/cookie/jwt too', () => {
    const entry = buildAuditEntry(
      'x',
      {
        API_TOKEN: 'a',
        clientSecret: 'b',
        Cookie: 'c',
        jwt_value: 'd',
        ok: 'e',
      },
      true,
      1,
    );
    const args = entry.args as any;
    expect(args.API_TOKEN).toBe('[REDACTED]');
    expect(args.clientSecret).toBe('[REDACTED]');
    expect(args.Cookie).toBe('[REDACTED]');
    expect(args.jwt_value).toBe('[REDACTED]');
    expect(args.ok).toBe('e');
  });

  it('truncates a long string value rather than including it in full', () => {
    const longSource = 'x'.repeat(2000);
    const entry = buildAuditEntry(
      'UpdateClass',
      { source_code: longSource },
      true,
      5,
    );
    const value = (entry.args as any).source_code as string;
    expect(value.length).toBeLessThan(longSource.length);
    expect(value).toContain('more chars');
  });

  it('records success/failure and duration faithfully', () => {
    const ok = buildAuditEntry('GetClass', {}, true, 42);
    expect(ok.success).toBe(true);
    expect(ok.duration_ms).toBe(42);
    expect(ok.error).toBeUndefined();

    const failed = buildAuditEntry(
      'DeleteClass',
      {},
      false,
      7,
      'Object does not exist',
    );
    expect(failed.success).toBe(false);
    expect(failed.error).toBe('Object does not exist');
  });
});

describe('writeAuditEntry — off by default, appends JSONL when enabled', () => {
  const tmpFile = path.join(
    os.tmpdir(),
    `mcp-abap-rfc-audit-test-${process.pid}.jsonl`,
  );

  afterEach(() => {
    try {
      unlinkSync(tmpFile);
    } catch {
      // fine if it was never created
    }
  });

  it('does nothing when SAP_AUDIT_LOG_FILE is unset', () => {
    writeAuditEntry(buildAuditEntry('GetClass', {}, true, 1), {});
    expect(() => readFileSync(tmpFile, 'utf-8')).toThrow();
  });

  it('appends a valid JSON line per call when enabled', () => {
    const env = { SAP_AUDIT_LOG_FILE: tmpFile };
    writeAuditEntry(
      buildAuditEntry('GetClass', { class_name: 'ZCL_X' }, true, 3),
      env,
    );
    writeAuditEntry(
      buildAuditEntry('DeleteClass', { class_name: 'ZCL_X' }, false, 9, 'boom'),
      env,
    );

    const lines = readFileSync(tmpFile, 'utf-8').trim().split('\n');
    expect(lines).toHaveLength(2);
    const first = JSON.parse(lines[0]);
    const second = JSON.parse(lines[1]);
    expect(first.tool).toBe('GetClass');
    expect(first.success).toBe(true);
    expect(second.tool).toBe('DeleteClass');
    expect(second.success).toBe(false);
    expect(second.error).toBe('boom');
  });

  it('never throws when the path is unwritable — warns instead', () => {
    const warn = jest.fn();
    expect(() =>
      writeAuditEntry(
        buildAuditEntry('GetClass', {}, true, 1),
        { SAP_AUDIT_LOG_FILE: '/no/such/directory/audit.jsonl' },
        { warn },
      ),
    ).not.toThrow();
    expect(warn).toHaveBeenCalled();
  });
});
