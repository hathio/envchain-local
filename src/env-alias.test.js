import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listAliases, addAlias, removeAlias, resolveAlias, expandAliases } from './env-alias.js';
import * as store from './store.js';

vi.mock('./store.js');

const makeStore = (aliases = {}, secrets = { DB_URL: 'postgres://localhost' }) => ({
  'my-project': { secrets, _aliases: aliases }
});

beforeEach(() => vi.clearAllMocks());

describe('listAliases', () => {
  it('returns aliases for a project', () => {
    store.readStore.mockReturnValue(makeStore({ DATABASE_URL: 'DB_URL' }));
    store.normalizeProjectKey.mockReturnValue('my-project');
    expect(listAliases('my-project')).toEqual({ DATABASE_URL: 'DB_URL' });
  });

  it('returns empty object if project not found', () => {
    store.readStore.mockReturnValue({});
    store.normalizeProjectKey.mockReturnValue('missing');
    expect(listAliases('missing')).toEqual({});
  });
});

describe('addAlias', () => {
  it('adds a new alias', () => {
    const s = makeStore();
    store.readStore.mockReturnValue(s);
    store.normalizeProjectKey.mockReturnValue('my-project');
    const result = addAlias('my-project', 'DATABASE_URL', 'DB_URL');
    expect(result).toEqual({ alias: 'DATABASE_URL', targetKey: 'DB_URL' });
    expect(store.writeStore).toHaveBeenCalled();
  });

  it('throws if project not found', () => {
    store.readStore.mockReturnValue({});
    store.normalizeProjectKey.mockReturnValue('nope');
    expect(() => addAlias('nope', 'X', 'Y')).toThrow('Project not found');
  });

  it('throws if target key does not exist', () => {
    store.readStore.mockReturnValue(makeStore());
    store.normalizeProjectKey.mockReturnValue('my-project');
    expect(() => addAlias('my-project', 'ALIAS', 'MISSING_KEY')).toThrow("Target key 'MISSING_KEY'");
  });

  it('throws if alias already exists', () => {
    store.readStore.mockReturnValue(makeStore({ DATABASE_URL: 'DB_URL' }));
    store.normalizeProjectKey.mockReturnValue('my-project');
    expect(() => addAlias('my-project', 'DATABASE_URL', 'DB_URL')).toThrow("Alias 'DATABASE_URL' already exists");
  });
});

describe('removeAlias', () => {
  it('removes an existing alias', () => {
    const s = makeStore({ DATABASE_URL: 'DB_URL' });
    store.readStore.mockReturnValue(s);
    store.normalizeProjectKey.mockReturnValue('my-project');
    const result = removeAlias('my-project', 'DATABASE_URL');
    expect(result).toEqual({ alias: 'DATABASE_URL', targetKey: 'DB_URL' });
    expect(store.writeStore).toHaveBeenCalled();
  });

  it('throws if alias not found', () => {
    store.readStore.mockReturnValue(makeStore());
    store.normalizeProjectKey.mockReturnValue('my-project');
    expect(() => removeAlias('my-project', 'GHOST')).toThrow("Alias 'GHOST' not found");
  });
});

describe('resolveAlias', () => {
  it('resolves alias to target key and value', () => {
    store.readStore.mockReturnValue(makeStore({ DATABASE_URL: 'DB_URL' }));
    store.normalizeProjectKey.mockReturnValue('my-project');
    expect(resolveAlias('my-project', 'DATABASE_URL')).toEqual({ targetKey: 'DB_URL', value: 'postgres://localhost' });
  });

  it('returns null for unknown alias', () => {
    store.readStore.mockReturnValue(makeStore());
    store.normalizeProjectKey.mockReturnValue('my-project');
    expect(resolveAlias('my-project', 'NOPE')).toBeNull();
  });
});

describe('expandAliases', () => {
  it('injects alias values into secrets map', () => {
    store.readStore.mockReturnValue(makeStore({ DATABASE_URL: 'DB_URL' }));
    store.normalizeProjectKey.mockReturnValue('my-project');
    const result = expandAliases('my-project', { DB_URL: 'postgres://localhost' });
    expect(result.DATABASE_URL).toBe('postgres://localhost');
    expect(result.DB_URL).toBe('postgres://localhost');
  });
});
