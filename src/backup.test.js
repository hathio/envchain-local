import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  getBackupDir,
  createBackup,
  listBackups,
  restoreBackup,
  deleteBackup,
} from './backup.js';

vi.mock('./store.js', () => ({ readStore: () => ({ projects: { myapp: { SECRET: 'enc' } } }) }));
vi.mock('./audit.js', () => ({ logEvent: vi.fn() }));

const TEST_HOME = '/tmp/envchain-test-backup';

beforeEach(() => {
  process.env.HOME = TEST_HOME;
  fs.mkdirSync(path.join(TEST_HOME, '.envchain-local', 'backups'), { recursive: true });
});

afterEach(() => {
  fs.rmSync(TEST_HOME, { recursive: true, force: true });
});

describe('createBackup', () => {
  it('creates a backup file', () => {
    const filepath = createBackup();
    expect(fs.existsSync(filepath)).toBe(true);
  });

  it('uses label in filename when provided', () => {
    const filepath = createBackup('pre-rotate');
    expect(path.basename(filepath)).toContain('pre-rotate');
  });

  it('backup file contains valid json', () => {
    const filepath = createBackup();
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    expect(data).toHaveProperty('projects');
  });
});

describe('listBackups', () => {
  it('returns empty array when no backups exist', () => {
    expect(listBackups()).toEqual([]);
  });

  it('lists created backups sorted newest first', () => {
    createBackup('a');
    createBackup('b');
    const list = listBackups();
    expect(list.length).toBe(2);
    expect(list[0].createdAt >= list[1].createdAt).toBe(true);
  });
});

describe('restoreBackup', () => {
  it('restores data from a backup', () => {
    createBackup('snap');
    const [{ filename }] = listBackups();
    const data = restoreBackup(filename);
    expect(data).toHaveProperty('projects');
  });

  it('throws if backup not found', () => {
    expect(() => restoreBackup('nonexistent.json')).toThrow('Backup not found');
  });
});

describe('deleteBackup', () => {
  it('removes the backup file', () => {
    createBackup();
    const [{ filename, filepath }] = listBackups();
    deleteBackup(filename);
    expect(fs.existsSync(filepath)).toBe(false);
  });

  it('throws if backup not found', () => {
    expect(() => deleteBackup('ghost.json')).toThrow('Backup not found');
  });
});
