import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  listProfiles,
  getActiveProfile,
  setActiveProfile,
  createProfile,
  deleteProfile,
  getProfileSecrets,
} from './env-profile.js';

vi.mock('./store.js', () => {
  let store = {};
  return {
    readStore: () => JSON.parse(JSON.stringify(store)),
    writeStore: (s) => { store = JSON.parse(JSON.stringify(s)); },
    normalizeProjectKey: (k) => k.toLowerCase(),
    __setStore: (s) => { store = s; },
    __getStore: () => store,
  };
});

import { __setStore, __getStore } from './store.js';

beforeEach(() => {
  __setStore({
    myproject: {
      API_KEY: 'abc123',
      __profiles__: { names: ['staging'], active: 'default' },
      '__profiles__:staging': { API_KEY: 'staging-key', DB_URL: 'staging-db' },
    },
  });
});

describe('listProfiles', () => {
  it('returns named profiles for a project', () => {
    expect(listProfiles('myproject')).toEqual(['staging']);
  });

  it('returns empty array for project with no profiles', () => {
    __setStore({ myproject: { API_KEY: 'x' } });
    expect(listProfiles('myproject')).toEqual([]);
  });
});

describe('getActiveProfile', () => {
  it('returns default when no active set explicitly', () => {
    expect(getActiveProfile('myproject')).toBe('default');
  });
});

describe('setActiveProfile', () => {
  it('sets an existing profile as active', () => {
    setActiveProfile('myproject', 'staging');
    expect(getActiveProfile('myproject')).toBe('staging');
  });

  it('throws if profile does not exist', () => {
    expect(() => setActiveProfile('myproject', 'ghost')).toThrow('Profile not found');
  });

  it('throws if project does not exist', () => {
    expect(() => setActiveProfile('unknown', 'staging')).toThrow('Project not found');
  });
});

describe('createProfile', () => {
  it('creates a new profile with secrets', () => {
    createProfile('myproject', 'prod', { API_KEY: 'prod-key' });
    const secrets = getProfileSecrets('myproject', 'prod');
    expect(secrets).toEqual({ API_KEY: 'prod-key' });
  });

  it('throws on reserved profile name', () => {
    expect(() => createProfile('myproject', '__profiles__', {})).toThrow('Reserved');
  });
});

describe('deleteProfile', () => {
  it('removes a profile and resets active if needed', () => {
    setActiveProfile('myproject', 'staging');
    deleteProfile('myproject', 'staging');
    expect(listProfiles('myproject')).toEqual([]);
    expect(getActiveProfile('myproject')).toBe('default');
  });

  it('throws when trying to delete default', () => {
    expect(() => deleteProfile('myproject', 'default')).toThrow('Cannot delete');
  });
});

describe('getProfileSecrets', () => {
  it('returns base secrets for default profile', () => {
    const s = getProfileSecrets('myproject', 'default');
    expect(s.API_KEY).toBe('abc123');
    expect(s['__profiles__']).toBeUndefined();
  });

  it('returns profile-specific secrets', () => {
    const s = getProfileSecrets('myproject', 'staging');
    expect(s.API_KEY).toBe('staging-key');
  });
});
