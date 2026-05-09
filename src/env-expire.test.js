import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setExpiry, clearExpiry, getExpiry, isExpired, listExpiredSecrets, listExpiringSecrets } from './env-expire.js';
import * as store from './store.js';

vi.mock('./store.js');

const mockStore = {
  'myapp': {
    secrets: { DB_PASS: 'enc', API_KEY: 'enc2' },
    expiry: {}
  }
};

beforeEach(() => {
  vi.mocked(store.readStore).mockReturnValue(JSON.parse(JSON.stringify(mockStore)));
  vi.mocked(store.writeStore).mockImplementation(() => {});
  vi.mocked(store.normalizeProjectKey).mockImplementation(p => p.toLowerCase());
});

describe('setExpiry', () => {
  it('sets expiry for a known key', () => {
    const ts = setExpiry('myapp', 'DB_PASS', 30);
    expect(ts).toBeGreaterThan(Date.now());
    expect(store.writeStore).toHaveBeenCalled();
  });

  it('throws if project not found', () => {
    vi.mocked(store.readStore).mockReturnValue({});
    expect(() => setExpiry('unknown', 'KEY')).toThrow('Project not found');
  });

  it('throws if key not found', () => {
    expect(() => setExpiry('myapp', 'MISSING_KEY')).toThrow('Key not found');
  });
});

describe('clearExpiry', () => {
  it('removes expiry entry', () => {
    const s = JSON.parse(JSON.stringify(mockStore));
    s.myapp.expiry.DB_PASS = { expiresAt: Date.now() + 1000, ttlDays: 1 };
    vi.mocked(store.readStore).mockReturnValue(s);
    expect(clearExpiry('myapp', 'DB_PASS')).toBe(true);
  });

  it('returns false if no expiry set', () => {
    expect(clearExpiry('myapp', 'DB_PASS')).toBe(false);
  });
});

describe('isExpired', () => {
  it('returns true for past expiry', () => {
    const s = JSON.parse(JSON.stringify(mockStore));
    s.myapp.expiry.DB_PASS = { expiresAt: Date.now() - 1000, ttlDays: 1 };
    vi.mocked(store.readStore).mockReturnValue(s);
    expect(isExpired('myapp', 'DB_PASS')).toBe(true);
  });

  it('returns false for future expiry', () => {
    const s = JSON.parse(JSON.stringify(mockStore));
    s.myapp.expiry.DB_PASS = { expiresAt: Date.now() + 99999, ttlDays: 1 };
    vi.mocked(store.readStore).mockReturnValue(s);
    expect(isExpired('myapp', 'DB_PASS')).toBe(false);
  });

  it('returns false if no expiry', () => {
    expect(isExpired('myapp', 'DB_PASS')).toBe(false);
  });
});

describe('listExpiredSecrets', () => {
  it('returns expired entries', () => {
    const s = { myapp: { secrets: {}, expiry: { OLD_KEY: { expiresAt: Date.now() - 5000, ttlDays: 30 } } } };
    vi.mocked(store.readStore).mockReturnValue(s);
    const results = listExpiredSecrets();
    expect(results).toHaveLength(1);
    expect(results[0].key).toBe('OLD_KEY');
  });
});

describe('listExpiringSecrets', () => {
  it('returns secrets expiring within threshold', () => {
    const soon = Date.now() + 3 * 24 * 60 * 60 * 1000;
    const s = { myapp: { secrets: {}, expiry: { API_KEY: { expiresAt: soon, ttlDays: 90 } } } };
    vi.mocked(store.readStore).mockReturnValue(s);
    const results = listExpiringSecrets(7);
    expect(results).toHaveLength(1);
    expect(results[0].daysLeft).toBeLessThanOrEqual(7);
  });
});
