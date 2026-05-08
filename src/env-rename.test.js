import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renameSecret, renameSecretGlobal } from './env-rename.js';
import * as store from './store.js';

vi.mock('./store.js');

const makeStore = () => ({
  'my-project': { DB_HOST: 'enc_host', DB_PASS: 'enc_pass' },
  'other-project': { DB_HOST: 'enc_other', API_KEY: 'enc_key' },
});

beforeEach(() => {
  vi.mocked(store.normalizeProjectKey).mockImplementation((p) => p);
  vi.mocked(store.readStore).mockReturnValue(makeStore());
  vi.mocked(store.writeStore).mockImplementation(() => {});
});

describe('renameSecret', () => {
  it('renames an existing key', () => {
    const result = renameSecret('my-project', 'DB_HOST', 'DATABASE_HOST');
    expect(result).toEqual({ renamed: true });
    const written = vi.mocked(store.writeStore).mock.calls[0][0];
    expect(written['my-project']).toHaveProperty('DATABASE_HOST');
    expect(written['my-project']).not.toHaveProperty('DB_HOST');
  });

  it('preserves value when renaming', () => {
    renameSecret('my-project', 'DB_HOST', 'DATABASE_HOST');
    const written = vi.mocked(store.writeStore).mock.calls[0][0];
    expect(written['my-project']['DATABASE_HOST']).toBe('enc_host');
  });

  it('returns error if project not found', () => {
    const result = renameSecret('missing', 'FOO', 'BAR');
    expect(result.renamed).toBe(false);
    expect(result.reason).toMatch(/not found/);
  });

  it('returns error if old key not found', () => {
    const result = renameSecret('my-project', 'NONEXISTENT', 'NEW_KEY');
    expect(result.renamed).toBe(false);
    expect(result.reason).toMatch(/not found/);
  });

  it('returns error when old and new key are the same', () => {
    const result = renameSecret('my-project', 'DB_HOST', 'DB_HOST');
    expect(result.renamed).toBe(false);
    expect(result.reason).toMatch(/same/);
  });

  it('refuses to overwrite existing key without flag', () => {
    const result = renameSecret('my-project', 'DB_HOST', 'DB_PASS');
    expect(result.renamed).toBe(false);
    expect(result.reason).toMatch(/overwrite/);
  });

  it('overwrites existing key when overwrite=true', () => {
    const result = renameSecret('my-project', 'DB_HOST', 'DB_PASS', { overwrite: true });
    expect(result.renamed).toBe(true);
    const written = vi.mocked(store.writeStore).mock.calls[0][0];
    expect(Object.keys(written['my-project'])).not.toContain('DB_HOST');
    expect(written['my-project']['DB_PASS']).toBe('enc_host');
  });
});

describe('renameSecretGlobal', () => {
  it('renames key in all matching projects', () => {
    const updated = renameSecretGlobal('DB_HOST', 'DATABASE_HOST');
    expect(updated).toContain('my-project');
    expect(updated).toContain('other-project');
    const written = vi.mocked(store.writeStore).mock.calls[0][0];
    expect(written['my-project']).toHaveProperty('DATABASE_HOST');
    expect(written['other-project']).toHaveProperty('DATABASE_HOST');
  });

  it('skips projects where key does not exist', () => {
    const updated = renameSecretGlobal('API_KEY', 'SERVICE_KEY');
    expect(updated).toContain('other-project');
    expect(updated).not.toContain('my-project');
  });

  it('returns empty array and does not write when nothing matched', () => {
    const updated = renameSecretGlobal('GHOST_KEY', 'NEW_KEY');
    expect(updated).toHaveLength(0);
    expect(store.writeStore).not.toHaveBeenCalled();
  });
});
