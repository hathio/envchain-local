import { describe, it, expect, beforeEach, vi } from 'vitest';
import { pinSecret, unpinSecret, isPinned, listPinnedSecrets, listAllPinned } from './env-pin.js';
import * as store from './store.js';

vi.mock('./store.js');

const mockStore = () => ({
  'my-project': {
    API_KEY: 'enc_abc',
    DB_PASS: 'enc_xyz',
  },
  'other-project': {
    TOKEN: 'enc_tok',
    __pinned__: ['TOKEN'],
  },
});

beforeEach(() => {
  vi.resetAllMocks();
  store.readStore.mockReturnValue(mockStore());
  store.writeStore.mockImplementation(() => {});
  store.normalizeProjectKey.mockImplementation(k => k);
});

describe('pinSecret', () => {
  it('pins a key and returns true', () => {
    const result = pinSecret('my-project', 'API_KEY');
    expect(result).toBe(true);
    expect(store.writeStore).toHaveBeenCalled();
  });

  it('returns false if already pinned', () => {
    store.readStore.mockReturnValue({
      'my-project': { API_KEY: 'enc_abc', __pinned__: ['API_KEY'] },
    });
    const result = pinSecret('my-project', 'API_KEY');
    expect(result).toBe(false);
  });

  it('throws if project not found', () => {
    expect(() => pinSecret('ghost', 'KEY')).toThrow("Project 'ghost' not found.");
  });

  it('throws if key not found', () => {
    expect(() => pinSecret('my-project', 'MISSING')).toThrow("Key 'MISSING' not found");
  });
});

describe('unpinSecret', () => {
  it('unpins a key and returns true', () => {
    store.readStore.mockReturnValue({
      'my-project': { API_KEY: 'enc_abc', __pinned__: ['API_KEY'] },
    });
    const result = unpinSecret('my-project', 'API_KEY');
    expect(result).toBe(true);
  });

  it('returns false if key was not pinned', () => {
    const result = unpinSecret('my-project', 'API_KEY');
    expect(result).toBe(false);
  });
});

describe('isPinned', () => {
  it('returns true for pinned key', () => {
    store.readStore.mockReturnValue({
      'my-project': { __pinned__: ['API_KEY'] },
    });
    expect(isPinned('my-project', 'API_KEY')).toBe(true);
  });

  it('returns false for unpinned key', () => {
    expect(isPinned('my-project', 'DB_PASS')).toBe(false);
  });
});

describe('listAllPinned', () => {
  it('returns map of projects with pinned keys', () => {
    const result = listAllPinned();
    expect(result).toEqual({ 'other-project': ['TOKEN'] });
  });
});
