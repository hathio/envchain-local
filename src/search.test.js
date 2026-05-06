import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchByKey, searchByProject, listAllProjects, listProjectKeys } from './search.js';

const mockStore = {
  '/home/user/projects/api': {
    DATABASE_URL: 'encrypted:abc',
    API_KEY: 'encrypted:def',
  },
  '/home/user/projects/frontend': {
    NEXT_PUBLIC_API_URL: 'encrypted:ghi',
    STRIPE_KEY: 'encrypted:jkl',
  },
  '/home/user/projects/backend': {
    DATABASE_URL: 'encrypted:mno',
    SECRET_TOKEN: 'encrypted:pqr',
  },
};

describe('searchByKey', () => {
  it('finds keys matching the query across all projects', () => {
    const results = searchByKey(mockStore, 'DATABASE');
    expect(results).toHaveLength(2);
    expect(results.map((r) => r.key)).toEqual(['DATABASE_URL', 'DATABASE_URL']);
  });

  it('is case-insensitive', () => {
    const results = searchByKey(mockStore, 'api_key');
    expect(results).toHaveLength(1);
    expect(results[0].key).toBe('API_KEY');
  });

  it('returns empty array when no matches', () => {
    const results = searchByKey(mockStore, 'NONEXISTENT');
    expect(results).toHaveLength(0);
  });

  it('includes the project in results', () => {
    const results = searchByKey(mockStore, 'STRIPE');
    expect(results[0].project).toBe('/home/user/projects/frontend');
  });
});

describe('searchByProject', () => {
  it('finds projects matching query', () => {
    const results = searchByProject(mockStore, 'backend');
    expect(results).toHaveLength(1);
    expect(results[0].project).toBe('/home/user/projects/backend');
  });

  it('returns keys for matched projects', () => {
    const results = searchByProject(mockStore, 'frontend');
    expect(results[0].keys).toContain('STRIPE_KEY');
  });

  it('returns empty when no project matches', () => {
    const results = searchByProject(mockStore, 'nope');
    expect(results).toHaveLength(0);
  });
});

describe('listAllProjects', () => {
  it('lists all projects with secret counts', () => {
    const list = listAllProjects(mockStore);
    expect(list).toHaveLength(3);
    expect(list.find((p) => p.project.includes('api')).count).toBe(2);
  });
});

describe('listProjectKeys', () => {
  it('returns keys for a known project', () => {
    const keys = listProjectKeys(mockStore, '/home/user/projects/api');
    expect(keys).toContain('API_KEY');
    expect(keys).toContain('DATABASE_URL');
  });

  it('returns null for unknown project', () => {
    const keys = listProjectKeys(mockStore, '/unknown/path');
    expect(keys).toBeNull();
  });
});
