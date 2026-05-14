import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setTTL, clearTTL, getTTL, purgeExpiredTTLs, listTTLs } from './env-ttl.js';
import * as store from './store.js';

vi.mock('./store.js');

const mockProject = 'myapp';
const mockKey = 'normalizeProjectKey';

beforeEach(() => {
  vi.clearAllMocks();
  store.normalizeProjectKey.mockImplementation((p) => p.toLowerCase());
});

describe('setTTL', () => {
  it('sets a TTL for a key', () => {
    store.readStore.mockReturnValue({ myapp: { API_KEY: 'secret' } });
    const expiresAt = setTTL('myapp', 'API_KEY', 60);
    expect(expiresAt).toBeGreaterThan(Date.now());
    expect(store.writeStore).toHaveBeenCalled();
  });

  it('throws if project not found', () => {
    store.readStore.mockReturnValue({});
    expect(() => setTTL('missing', 'KEY', 60)).toThrow('Project "missing" not found');
  });

  it('throws if key not found in project', () => {
    store.readStore.mockReturnValue({ myapp: {} });
    expect(() => setTTL('myapp', 'GHOST', 60)).toThrow('Key "GHOST" not found');
  });
});

describe('clearTTL', () => {
  it('removes a TTL entry', () => {
    store.readStore.mockReturnValue({ myapp: { __ttl__: { API_KEY: Date.now() + 5000 } } });
    const result = clearTTL('myapp', 'API_KEY');
    expect(result).toBe(true);
    expect(store.writeStore).toHaveBeenCalled();
  });

  it('returns false if no TTL exists', () => {
    store.readStore.mockReturnValue({ myapp: {} });
    const result = clearTTL('myapp', 'API_KEY');
    expect(result).toBe(false);
  });
});

describe('getTTL', () => {
  it('returns TTL info for a key', () => {
    const future = Date.now() + 10000;
    store.readStore.mockReturnValue({ myapp: { __ttl__: { API_KEY: future } } });
    const info = getTTL('myapp', 'API_KEY');
    expect(info.expired).toBe(false);
    expect(info.expiresAt).toBe(future);
  });

  it('returns null if no TTL set', () => {
    store.readStore.mockReturnValue({ myapp: {} });
    expect(getTTL('myapp', 'API_KEY')).toBeNull();
  });
});

describe('purgeExpiredTTLs', () => {
  it('deletes expired keys and returns their names', () => {
    const past = Date.now() - 1000;
    const mockData = { myapp: { API_KEY: 'val', __ttl__: { API_KEY: past } } };
    store.readStore.mockReturnValue(mockData);
    const purged = purgeExpiredTTLs('myapp');
    expect(purged).toContain('API_KEY');
    expect(store.writeStore).toHaveBeenCalled();
  });

  it('returns empty array if nothing expired', () => {
    const future = Date.now() + 9999;
    store.readStore.mockReturnValue({ myapp: { __ttl__: { API_KEY: future } } });
    expect(purgeExpiredTTLs('myapp')).toEqual([]);
  });
});

describe('listTTLs', () => {
  it('lists all TTL entries for a project', () => {
    const future = Date.now() + 5000;
    store.readStore.mockReturnValue({ myapp: { __ttl__: { DB_PASS: future } } });
    const list = listTTLs('myapp');
    expect(list).toHaveLength(1);
    expect(list[0].key).toBe('DB_PASS');
    expect(list[0].expired).toBe(false);
  });

  it('returns empty list if no TTLs', () => {
    store.readStore.mockReturnValue({ myapp: {} });
    expect(listTTLs('myapp')).toEqual([]);
  });
});
