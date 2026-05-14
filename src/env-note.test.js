import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getNote, setNote, clearNote, listNotes, searchNotes } from './env-note.js';
import * as store from './store.js';

vi.mock('./store.js');

const makeStore = () => ({
  'my-project': {
    API_KEY: { value: 'abc123', __note__: 'production API key' },
    DB_PASS: { value: 'secret' },
    TOKEN: { value: 'tok', __note__: 'oauth token for staging' },
  },
});

beforeEach(() => {
  vi.mocked(store.readStore).mockReturnValue(makeStore());
  vi.mocked(store.writeStore).mockImplementation(() => {});
  vi.mocked(store.normalizeProjectKey).mockImplementation((p) => p);
});

describe('getNote', () => {
  it('returns the note for a key that has one', () => {
    expect(getNote('my-project', 'API_KEY')).toBe('production API key');
  });

  it('returns null when no note exists', () => {
    expect(getNote('my-project', 'DB_PASS')).toBeNull();
  });

  it('returns null for unknown project', () => {
    expect(getNote('other', 'API_KEY')).toBeNull();
  });
});

describe('setNote', () => {
  it('sets a note on an existing secret', () => {
    let saved;
    vi.mocked(store.writeStore).mockImplementation((s) => { saved = s; });
    setNote('my-project', 'DB_PASS', 'main db password');
    expect(saved['my-project']['DB_PASS'].__note__).toBe('main db password');
  });

  it('throws if secret does not exist', () => {
    expect(() => setNote('my-project', 'MISSING', 'note')).toThrow("Secret 'MISSING' not found");
  });
});

describe('clearNote', () => {
  it('removes the note from a secret', () => {
    let saved;
    vi.mocked(store.writeStore).mockImplementation((s) => { saved = s; });
    clearNote('my-project', 'API_KEY');
    expect(saved['my-project']['API_KEY'].__note__).toBeUndefined();
  });

  it('throws if secret does not exist', () => {
    expect(() => clearNote('my-project', 'NOPE', 'x')).toThrow();
  });
});

describe('listNotes', () => {
  it('returns all keys with notes', () => {
    const result = listNotes('my-project');
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.key)).toContain('API_KEY');
    expect(result.map((r) => r.key)).toContain('TOKEN');
  });

  it('returns empty array for unknown project', () => {
    expect(listNotes('unknown')).toEqual([]);
  });
});

describe('searchNotes', () => {
  it('finds secrets whose notes match query', () => {
    const results = searchNotes('staging');
    expect(results).toHaveLength(1);
    expect(results[0].key).toBe('TOKEN');
  });

  it('is case-insensitive', () => {
    expect(searchNotes('PRODUCTION')).toHaveLength(1);
  });

  it('returns empty when no match', () => {
    expect(searchNotes('zzznomatch')).toEqual([]);
  });
});
