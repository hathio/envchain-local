import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getQuota, setQuota, clearQuota, getUsage, checkQuota, listAllQuotas, enforceQuota } from './env-quota.js';
import * as store from './store.js';

vi.mock('./store.js');

const mockStore = {};

beforeEach(() => {
  vi.clearAllMocks();
  Object.keys(mockStore).forEach(k => delete mockStore[k]);
  store.readStore.mockReturnValue(mockStore);
  store.writeStore.mockImplementation(s => Object.assign(mockStore, s));
  store.normalizeProjectKey.mockImplementation(p => p.toLowerCase().replace(/\//g, ':'));
});

describe('getQuota', () => {
  it('returns default quota when none set', () => {
    expect(getQuota('myapp')).toBe(100);
  });

  it('returns custom quota if set', () => {
    mockStore.__quotas = { myapp: 20 };
    expect(getQuota('myapp')).toBe(20);
  });
});

describe('setQuota', () => {
  it('sets quota for a project', () => {
    setQuota('myapp', 50);
    expect(mockStore.__quotas.myapp).toBe(50);
  });

  it('throws on invalid limit', () => {
    expect(() => setQuota('myapp', 0)).toThrow('positive integer');
    expect(() => setQuota('myapp', -5)).toThrow('positive integer');
    expect(() => setQuota('myapp', 1.5)).toThrow('positive integer');
  });
});

describe('clearQuota', () => {
  it('removes quota for a project', () => {
    mockStore.__quotas = { myapp: 30 };
    clearQuota('myapp');
    expect(mockStore.__quotas.myapp).toBeUndefined();
  });
});

describe('getUsage', () => {
  it('returns number of secrets for project', () => {
    mockStore.myapp = { KEY1: 'v1', KEY2: 'v2' };
    expect(getUsage('myapp')).toBe(2);
  });

  it('returns 0 for unknown project', () => {
    expect(getUsage('unknown')).toBe(0);
  });
});

describe('checkQuota', () => {
  it('reports not exceeded when under limit', () => {
    mockStore.myapp = { KEY1: 'v1' };
    mockStore.__quotas = { myapp: 5 };
    const result = checkQuota('myapp');
    expect(result.exceeded).toBe(false);
    expect(result.available).toBe(4);
  });

  it('reports exceeded when at limit', () => {
    mockStore.myapp = { A: '1', B: '2' };
    mockStore.__quotas = { myapp: 2 };
    const result = checkQuota('myapp');
    expect(result.exceeded).toBe(true);
    expect(result.available).toBe(0);
  });
});

describe('enforceQuota', () => {
  it('throws when quota exceeded', () => {
    mockStore.myapp = { A: '1', B: '2' };
    mockStore.__quotas = { myapp: 2 };
    expect(() => enforceQuota('myapp')).toThrow('Quota exceeded');
  });

  it('does not throw when under quota', () => {
    mockStore.myapp = { A: '1' };
    mockStore.__quotas = { myapp: 5 };
    expect(() => enforceQuota('myapp')).not.toThrow();
  });
});
