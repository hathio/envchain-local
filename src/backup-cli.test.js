import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleBackupCommand } from './backup-cli.js';

const mockCreate = vi.fn(() => '/home/user/.envchain-local/backups/backup-2024.json');
const mockList = vi.fn(() => [
  { filename: 'backup-foo.json', filepath: '/x/backup-foo.json', createdAt: new Date() },
]);
const mockRestore = vi.fn(() => ({ projects: {} }));
const mockDelete = vi.fn();
const mockWrite = vi.fn();

vi.mock('./backup.js', () => ({
  createBackup: (...a) => mockCreate(...a),
  listBackups: (...a) => mockList(...a),
  restoreBackup: (...a) => mockRestore(...a),
  deleteBackup: (...a) => mockDelete(...a),
}));
vi.mock('./store.js', () => ({ writeStore: (...a) => mockWrite(...a) }));

beforeEach(() => vi.clearAllMocks());

describe('handleBackupCommand', () => {
  it('create calls createBackup and logs path', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    handleBackupCommand(['create', 'pre-rotate']);
    expect(mockCreate).toHaveBeenCalledWith('pre-rotate');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Backup created'));
    spy.mockRestore();
  });

  it('create without label passes null', () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    handleBackupCommand(['create']);
    expect(mockCreate).toHaveBeenCalledWith(null);
  });

  it('list prints backups', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    handleBackupCommand(['list']);
    expect(mockList).toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('restore writes store from backup data', () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    handleBackupCommand(['restore', 'backup-foo.json']);
    expect(mockRestore).toHaveBeenCalledWith('backup-foo.json');
    expect(mockWrite).toHaveBeenCalledWith({ projects: {} });
  });

  it('restore without filename exits with error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    expect(() => handleBackupCommand(['restore'])).toThrow('exit');
    expect(exit).toHaveBeenCalledWith(1);
    spy.mockRestore();
    exit.mockRestore();
  });

  it('delete removes a backup', () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    handleBackupCommand(['delete', 'backup-foo.json']);
    expect(mockDelete).toHaveBeenCalledWith('backup-foo.json');
  });

  it('unknown subcommand prints usage', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    handleBackupCommand(['nope']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Usage'));
    spy.mockRestore();
  });
});
