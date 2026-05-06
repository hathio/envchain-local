import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { logEvent, readAuditLog, clearAuditLog, getAuditLogPath } from './audit.js';

const TEST_LOG = path.join(os.tmpdir(), 'envchain-test-audit.log');

vi.mock('./audit.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getAuditLogPath: () => TEST_LOG,
  };
});

beforeEach(() => {
  if (fs.existsSync(TEST_LOG)) fs.unlinkSync(TEST_LOG);
});

afterEach(() => {
  if (fs.existsSync(TEST_LOG)) fs.unlinkSync(TEST_LOG);
});

describe('audit log', () => {
  it('readAuditLog returns empty array when no log exists', () => {
    const entries = readAuditLog();
    expect(entries).toEqual([]);
  });

  it('logEvent writes a JSON entry to the log', () => {
    logEvent('set', 'my-project', { keys: ['API_KEY'] });
    const raw = fs.readFileSync(TEST_LOG, 'utf8');
    const entry = JSON.parse(raw.trim());
    expect(entry.action).toBe('set');
    expect(entry.projectKey).toBe('my-project');
    expect(entry.keys).toEqual(['API_KEY']);
    expect(entry.timestamp).toBeDefined();
  });

  it('readAuditLog returns parsed entries', () => {
    logEvent('set', 'proj-a');
    logEvent('inject', 'proj-b');
    const entries = readAuditLog();
    expect(entries).toHaveLength(2);
    expect(entries[0].action).toBe('set');
    expect(entries[1].action).toBe('inject');
  });

  it('readAuditLog respects limit', () => {
    for (let i = 0; i < 10; i++) logEvent('set', `proj-${i}`);
    const entries = readAuditLog(3);
    expect(entries).toHaveLength(3);
    expect(entries[2].projectKey).toBe('proj-9');
  });

  it('clearAuditLog empties the log file', () => {
    logEvent('set', 'proj');
    clearAuditLog();
    const entries = readAuditLog();
    expect(entries).toHaveLength(0);
  });
});
