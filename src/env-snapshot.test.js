import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import {
  createSnapshot,
  listSnapshots,
  loadSnapshot,
  deleteSnapshot,
  restoreSnapshot,
  getSnapshotDir,
} from './env-snapshot.js';

vi.mock('fs');
vi.mock('./store.js', () => ({
  readStore: vi.fn(() => ({ myproject: { API_KEY: 'enc123' } })),
}));

const fakeDir = '/home/user/.envchain-local/snapshots';
const fakeSnapshot = {
  createdAt: '2024-01-01T00:00:00.000Z',
  label: 'before-deploy',
  store: { myproject: { API_KEY: 'enc123' } },
};

beforeEach(() => {
  vi.clearAllMocks();
  fs.existsSync.mockReturnValue(true);
  fs.mkdirSync.mockImplementation(() => {});
  fs.writeFileSync.mockImplementation(() => {});
  fs.unlinkSync.mockImplementation(() => {});
  fs.readFileSync.mockReturnValue(JSON.stringify(fakeSnapshot));
  fs.readdirSync.mockReturnValue(['1700000000000-before-deploy.json']);
});

describe('createSnapshot', () => {
  it('creates a snapshot file with label', () => {
    const result = createSnapshot('before-deploy');
    expect(result.name).toContain('before-deploy');
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('creates a snapshot file without label', () => {
    const result = createSnapshot();
    expect(result.name).toBeTruthy();
    expect(result.label).toBeUndefined();
  });
});

describe('listSnapshots', () => {
  it('returns sorted list of snapshots', () => {
    const list = listSnapshots();
    expect(list).toHaveLength(1);
    expect(list[0].label).toBe('before-deploy');
  });

  it('creates snapshot dir if missing', () => {
    fs.existsSync.mockReturnValue(false);
    listSnapshots();
    expect(fs.mkdirSync).toHaveBeenCalled();
  });
});

describe('loadSnapshot', () => {
  it('loads a snapshot by name', () => {
    const snap = loadSnapshot('1700000000000-before-deploy');
    expect(snap.label).toBe('before-deploy');
    expect(snap.store).toBeDefined();
  });

  it('throws if snapshot not found', () => {
    fs.existsSync.mockReturnValue(false);
    expect(() => loadSnapshot('missing')).toThrow('Snapshot not found');
  });
});

describe('deleteSnapshot', () => {
  it('deletes an existing snapshot', () => {
    deleteSnapshot('1700000000000-before-deploy');
    expect(fs.unlinkSync).toHaveBeenCalled();
  });

  it('throws if snapshot not found', () => {
    fs.existsSync.mockReturnValue(false);
    expect(() => deleteSnapshot('ghost')).toThrow('Snapshot not found');
  });
});

describe('restoreSnapshot', () => {
  it('restores store from snapshot', () => {
    const writeStore = vi.fn();
    const result = restoreSnapshot('1700000000000-before-deploy', { writeStore });
    expect(writeStore).toHaveBeenCalledWith(fakeSnapshot.store);
    expect(result.label).toBe('before-deploy');
  });
});
