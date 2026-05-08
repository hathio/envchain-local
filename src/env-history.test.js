import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import { getHistoryForProject, diffHistoryEntry, restoreProjectFromHistory } from './env-history.js';
import * as backup from './backup.js';
import * as store from './store.js';

vi.mock('./backup.js');
vi.mock('./store.js');
vi.mock('fs');

const fakeBackups = [
  { path: '/backups/b1.json', timestamp: '2024-01-02T10:00:00Z', label: 'after-deploy' },
  { path: '/backups/b2.json', timestamp: '2024-01-01T08:00:00Z', label: null },
];

const fakeStoreB1 = { 'my-project': { API_KEY: 'enc1', DB_URL: 'enc2' } };
const fakeStoreB2 = { 'my-project': { API_KEY: 'enc1' } };

beforeEach(() => {
  vi.clearAllMocks();
  backup.listBackups.mockReturnValue(fakeBackups);
  fs.readFileSync.mockImplementation((p) => {
    if (p === '/backups/b1.json') return JSON.stringify(fakeStoreB1);
    if (p === '/backups/b2.json') return JSON.stringify(fakeStoreB2);
    throw new Error('not found');
  });
  store.readStore.mockReturnValue({ 'my-project': { API_KEY: 'enc1', DB_URL: 'enc2', NEW_KEY: 'enc3' } });
});

describe('getHistoryForProject', () => {
  it('returns history entries for a known project', () => {
    const history = getHistoryForProject('my-project');
    expect(history).toHaveLength(2);
    expect(history[0].timestamp).toBe('2024-01-02T10:00:00Z');
    expect(history[0].keys).toContain('API_KEY');
  });

  it('returns empty array if project not in any backup', () => {
    const history = getHistoryForProject('unknown-project');
    expect(history).toHaveLength(0);
  });
});

describe('diffHistoryEntry', () => {
  it('detects added keys (in current but not backup)', () => {
    const changes = diffHistoryEntry('my-project', '/backups/b2.json');
    const added = changes.filter(c => c.status === 'added').map(c => c.key);
    expect(added).toContain('DB_URL');
    expect(added).toContain('NEW_KEY');
  });

  it('throws if backup path is invalid', () => {
    expect(() => diffHistoryEntry('my-project', '/bad/path.json')).toThrow();
  });
});

describe('restoreProjectFromHistory', () => {
  it('returns store with project replaced by historical data', () => {
    const result = restoreProjectFromHistory('my-project', '/backups/b2.json');
    expect(Object.keys(result['my-project'])).toEqual(['API_KEY']);
  });

  it('throws if backup is unreadable', () => {
    expect(() => restoreProjectFromHistory('my-project', '/bad/path.json')).toThrow();
  });
});
