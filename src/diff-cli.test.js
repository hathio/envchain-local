import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleDiffCommand } from './diff-cli.js';
import * as diffModule from './diff.js';
import * as storeModule from './store.js';

vi.mock('./diff.js');
vi.mock('./store.js');

describe('handleDiffCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('prints no differences when diff is empty (file subcommand)', async () => {
    storeModule.readStore.mockReturnValue({ myproject: { KEY: 'val' } });
    diffModule.loadSecretsFromFile.mockReturnValue({ KEY: 'val' });
    diffModule.diffSecrets.mockReturnValue([]);

    await handleDiffCommand(['file', 'myproject', '.env']);

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No differences'));
  });

  it('prints diff entries for file subcommand', async () => {
    storeModule.readStore.mockReturnValue({ myproject: { KEY: 'old' } });
    diffModule.loadSecretsFromFile.mockReturnValue({ KEY: 'new' });
    diffModule.diffSecrets.mockReturnValue([{ type: 'changed', key: 'KEY', oldValue: 'old', newValue: 'new' }]);

    await handleDiffCommand(['file', 'myproject', '.env']);

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('KEY'));
  });

  it('prints diff between two projects', async () => {
    storeModule.readStore.mockReturnValue({
      proj1: { A: '1' },
      proj2: { A: '2' }
    });
    diffModule.diffSecrets.mockReturnValue([{ type: 'changed', key: 'A', oldValue: '1', newValue: '2' }]);

    await handleDiffCommand(['projects', 'proj1', 'proj2']);

    expect(diffModule.diffSecrets).toHaveBeenCalledWith({ A: '1' }, { A: '2' });
  });

  it('exits with error if file subcommand missing args', async () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(handleDiffCommand(['file', 'onlyproject'])).rejects.toThrow('exit');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('exits with error for unknown subcommand', async () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(handleDiffCommand(['unknown'])).rejects.toThrow('exit');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
