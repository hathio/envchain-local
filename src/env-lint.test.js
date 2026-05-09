import { describe, it, expect, vi, beforeEach } from 'vitest';
import { lintKey, detectIssues, lintProject, lintAllProjects } from './env-lint.js';

vi.mock('./store.js', () => ({
  readStore: vi.fn(),
  normalizeProjectKey: vi.fn((p) => p.replace(/\//g, '_')),
}));

import { readStore } from './store.js';

describe('lintKey', () => {
  it('accepts valid SCREAMING_SNAKE_CASE keys', () => {
    expect(lintKey('MY_VAR')).toBe(true);
    expect(lintKey('DB_HOST_URL')).toBe(true);
    expect(lintKey('API2_KEY')).toBe(true);
  });

  it('rejects lowercase keys', () => {
    expect(lintKey('my_var')).toBe(false);
    expect(lintKey('dbHost')).toBe(false);
  });

  it('throws on unknown convention', () => {
    expect(() => lintKey('FOO', 'unknown')).toThrow('Unknown convention: unknown');
  });

  it('accepts snake_case with snake convention', () => {
    expect(lintKey('my_var', 'snake')).toBe(true);
    expect(lintKey('MY_VAR', 'snake')).toBe(false);
  });
});

describe('detectIssues', () => {
  it('flags bad naming convention', () => {
    const issues = detectIssues('badKey', 'value');
    expect(issues.some(i => i.type === 'naming')).toBe(true);
  });

  it('flags empty values', () => {
    const issues = detectIssues('MY_KEY', '');
    expect(issues.some(i => i.type === 'empty')).toBe(true);
  });

  it('flags leading/trailing whitespace in value', () => {
    const issues = detectIssues('MY_KEY', '  hello  ');
    expect(issues.some(i => i.type === 'whitespace')).toBe(true);
  });

  it('flags short sensitive values', () => {
    const issues = detectIssues('API_SECRET', 'abc');
    expect(issues.some(i => i.type === 'security')).toBe(true);
  });

  it('returns no issues for a clean entry', () => {
    const issues = detectIssues('MY_API_KEY', 'supersecretvalue123');
    expect(issues).toHaveLength(0);
  });
});

describe('lintProject', () => {
  beforeEach(() => {
    readStore.mockReturnValue({
      '_home_project': {
        'GOOD_KEY': 'goodvalue',
        'badKey': 'val',
        'EMPTY_KEY': '',
      },
    });
  });

  it('returns issues for the given project', () => {
    const results = lintProject('/home/project');
    expect(results.length).toBeGreaterThan(0);
    const keys = results.map(r => r.key);
    expect(keys).toContain('badKey');
    expect(keys).toContain('EMPTY_KEY');
    expect(keys).not.toContain('GOOD_KEY');
  });
});

describe('lintAllProjects', () => {
  beforeEach(() => {
    readStore.mockReturnValue({
      'project_a': { 'CLEAN': 'value' },
      'project_b': { 'dirty_key': 'val', 'EMPTY': '' },
    });
  });

  it('returns only projects with issues', () => {
    const report = lintAllProjects();
    expect(report['project_a']).toBeUndefined();
    expect(report['project_b']).toBeDefined();
    expect(report['project_b'].length).toBe(2);
  });
});
