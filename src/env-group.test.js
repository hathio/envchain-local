import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  listGroups,
  assignGroup,
  unassignGroup,
  getSecretsInGroup,
  renameGroup,
  deleteGroup,
} from './env-group.js';

vi.mock('./store.js', () => {
  let store = {};
  return {
    normalizeProjectKey: (p) => p.toLowerCase().replace(/\//g, '_'),
    readStore: () => JSON.parse(JSON.stringify(store)),
    writeStore: (s) => { store = JSON.parse(JSON.stringify(s)); },
    __setStore: (s) => { store = JSON.parse(JSON.stringify(s)); },
  };
});

import { __setStore } from './store.js';

const baseStore = {
  myproject: {
    DB_URL: { value: 'enc1', group: 'database' },
    DB_PASS: { value: 'enc2', group: 'database' },
    API_KEY: { value: 'enc3', group: 'api' },
    SECRET: { value: 'enc4', group: null },
  },
};

beforeEach(() => {
  __setStore(JSON.parse(JSON.stringify(baseStore)));
});

describe('listGroups', () => {
  it('returns sorted unique group names', () => {
    expect(listGroups('myproject')).toEqual(['api', 'database']);
  });

  it('returns empty array for unknown project', () => {
    expect(listGroups('unknown')).toEqual([]);
  });
});

describe('assignGroup', () => {
  it('assigns group to an existing secret', () => {
    assignGroup('myproject', 'SECRET', 'misc');
    expect(getSecretsInGroup('myproject', 'misc')).toHaveProperty('SECRET');
  });

  it('throws if secret does not exist', () => {
    expect(() => assignGroup('myproject', 'MISSING', 'x')).toThrow();
  });
});

describe('unassignGroup', () => {
  it('removes group from a secret', () => {
    unassignGroup('myproject', 'API_KEY');
    const group = getSecretsInGroup('myproject', 'api');
    expect(group).not.toHaveProperty('API_KEY');
  });
});

describe('getSecretsInGroup', () => {
  it('returns secrets in the given group', () => {
    const result = getSecretsInGroup('myproject', 'database');
    expect(Object.keys(result)).toEqual(expect.arrayContaining(['DB_URL', 'DB_PASS']));
  });

  it('returns empty object for nonexistent group', () => {
    expect(getSecretsInGroup('myproject', 'nope')).toEqual({});
  });
});

describe('renameGroup', () => {
  it('renames all secrets in a group', () => {
    const count = renameGroup('myproject', 'database', 'db');
    expect(count).toBe(2);
    expect(getSecretsInGroup('myproject', 'db')).toHaveProperty('DB_URL');
  });
});

describe('deleteGroup', () => {
  it('removes group assignment from all matching secrets', () => {
    deleteGroup('myproject', 'api');
    expect(getSecretsInGroup('myproject', 'api')).toEqual({});
  });
});
