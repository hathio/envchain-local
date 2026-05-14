import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  listAccessRules,
  grantAccess,
  revokeAccess,
  hasAccess,
  clearAccess,
} from './env-access.js';

vi.mock('./store.js', () => {
  let store = {};
  return {
    readStore: () => JSON.parse(JSON.stringify(store)),
    writeStore: (s) => { store = JSON.parse(JSON.stringify(s)); },
    normalizeProjectKey: (p) => p.toLowerCase().replace(/\//g, ':'),
    __reset: () => { store = {}; },
  };
});

import { __reset } from './store.js';

beforeEach(() => __reset());

describe('listAccessRules', () => {
  it('returns empty array for unknown project', () => {
    expect(listAccessRules('myapp')).toEqual([]);
  });

  it('returns rules after granting', () => {
    grantAccess('myapp', 'API_KEY', 'read');
    const rules = listAccessRules('myapp');
    expect(rules).toHaveLength(1);
    expect(rules[0].secretKey).toBe('API_KEY');
  });
});

describe('grantAccess', () => {
  it('adds a new rule and returns true', () => {
    expect(grantAccess('myapp', 'DB_PASS', 'read')).toBe(true);
  });

  it('returns false if rule already exists', () => {
    grantAccess('myapp', 'DB_PASS', 'read');
    expect(grantAccess('myapp', 'DB_PASS', 'read')).toBe(false);
  });

  it('allows same key with different role', () => {
    grantAccess('myapp', 'DB_PASS', 'read');
    expect(grantAccess('myapp', 'DB_PASS', 'write')).toBe(true);
  });
});

describe('revokeAccess', () => {
  it('removes an existing rule', () => {
    grantAccess('myapp', 'TOKEN', 'read');
    expect(revokeAccess('myapp', 'TOKEN', 'read')).toBe(true);
    expect(listAccessRules('myapp')).toHaveLength(0);
  });

  it('returns false if rule does not exist', () => {
    expect(revokeAccess('myapp', 'GHOST', 'read')).toBe(false);
  });
});

describe('hasAccess', () => {
  it('returns true for exact match', () => {
    grantAccess('myapp', 'SECRET', 'read');
    expect(hasAccess('myapp', 'SECRET', 'read')).toBe(true);
  });

  it('returns true for wildcard rule', () => {
    grantAccess('myapp', '*', 'read');
    expect(hasAccess('myapp', 'ANY_KEY', 'read')).toBe(true);
  });

  it('returns false when no matching rule', () => {
    expect(hasAccess('myapp', 'MISSING', 'read')).toBe(false);
  });
});

describe('clearAccess', () => {
  it('removes all rules for project', () => {
    grantAccess('myapp', 'A', 'read');
    grantAccess('myapp', 'B', 'write');
    expect(clearAccess('myapp')).toBe(true);
    expect(listAccessRules('myapp')).toHaveLength(0);
  });

  it('returns false for unknown project', () => {
    expect(clearAccess('nobody')).toBe(false);
  });
});
