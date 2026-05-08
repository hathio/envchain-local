import { describe, it, expect, vi, beforeEach } from 'vitest';
import { copySecrets, moveSecrets } from './env-copy.js';
import * as store from './store.js';

vi.mock('./store.js');

const mockStore = {
  'project-a': { DB_HOST: 'localhost', DB_PORT: '5432', SECRET: 'abc' },
  'project-b': { EXISTING_KEY: 'value' },
};

beforeEach(() => {
  vi.clearAllMocks();
  store.readStore.mockReturnValue(JSON.parse(JSON.stringify(mockStore)));
  store.normalizeProjectKey.mockImplementation((p) => p.toLowerCase().replace(/\//g, '-').replace(/^-+|-+$/g, ''));
  store.writeStore.mockImplementation(() => {});
});

describe('copySecrets', () => {
  it('copies all secrets when no keys specified', () => {
    const result = copySecrets('project-a', 'project-c');
    expect(result.copied).toEqual(['DB_HOST', 'DB_PORT', 'SECRET']);
    expect(result.skipped).toEqual([]);
    expect(store.writeStore).toHaveBeenCalled();
  });

  it('copies only specified keys', () => {
    const result = copySecrets('project-a', 'project-c', ['DB_HOST']);
    expect(result.copied).toEqual(['DB_HOST']);
    expect(result.skipped).toEqual([]);
  });

  it('skips keys that already exist in target without overwrite', () => {
    const result = copySecrets('project-a', 'project-b', ['DB_HOST', 'EXISTING_KEY']);
    expect(result.copied).toEqual(['DB_HOST']);
    expect(result.skipped).toContain('EXISTING_KEY');
  });

  it('overwrites existing keys when overwrite=true', () => {
    store.readStore.mockReturnValue({
      'project-a': { EXISTING_KEY: 'new-value' },
      'project-b': { EXISTING_KEY: 'old-value' },
    });
    const result = copySecrets('project-a', 'project-b', ['EXISTING_KEY'], { overwrite: true });
    expect(result.copied).toEqual(['EXISTING_KEY']);
    expect(result.skipped).toEqual([]);
  });

  it('skips keys missing from source', () => {
    const result = copySecrets('project-a', 'project-c', ['NONEXISTENT']);
    expect(result.skipped).toContain('NONEXISTENT');
    expect(result.copied).toEqual([]);
    expect(store.writeStore).not.toHaveBeenCalled();
  });

  it('throws if source project has no secrets', () => {
    store.readStore.mockReturnValue({});
    expect(() => copySecrets('missing-project', 'project-b')).toThrow('No secrets found');
  });
});

describe('moveSecrets', () => {
  it('copies and removes from source', () => {
    const result = moveSecrets('project-a', 'project-c', ['DB_HOST']);
    expect(result.copied).toContain('DB_HOST');
    const writtenStore = store.writeStore.mock.calls[1][0];
    expect(writtenStore['project-a']).not.toHaveProperty('DB_HOST');
  });

  it('removes source project entirely if all keys moved', () => {
    store.readStore
      .mockReturnValueOnce({ 'project-a': { ONLY_KEY: 'val' } })
      .mockReturnValueOnce({ 'project-a': { ONLY_KEY: 'val' }, 'project-c': { ONLY_KEY: 'val' } });
    moveSecrets('project-a', 'project-c');
    const writtenStore = store.writeStore.mock.calls[1][0];
    expect(writtenStore).not.toHaveProperty('project-a');
  });
});
