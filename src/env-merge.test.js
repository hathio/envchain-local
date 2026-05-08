import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mergeSecrets, previewMerge } from './env-merge.js';

vi.mock('./store.js', () => {
  const store = {
    projectA: { FOO: 'foo_val', SHARED: 'from_a' },
    projectB: { BAR: 'bar_val', SHARED: 'from_b' },
  };
  return {
    getSecrets: vi.fn((project) => ({ ...store[project] } || {})),
    setSecret: vi.fn((project, key, value) => {
      store[project] = store[project] || {};
      store[project][key] = value;
    }),
  };
});

import { getSecrets, setSecret } from './store.js';

beforeEach(() => {
  vi.clearAllMocks();
  getSecrets.mockImplementation((project) => {
    const store = {
      projectA: { FOO: 'foo_val', SHARED: 'from_a' },
      projectB: { BAR: 'bar_val', SHARED: 'from_b' },
    };
    return { ...(store[project] || {}) };
  });
});

describe('mergeSecrets', () => {
  it('adds new keys from source to target', () => {
    const result = mergeSecrets('projectA', 'projectB');
    expect(result.added).toContain('FOO');
    expect(setSecret).toHaveBeenCalledWith('projectB', 'FOO', 'foo_val');
  });

  it('skips existing keys when overwrite is false', () => {
    const result = mergeSecrets('projectA', 'projectB', { overwrite: false });
    expect(result.skipped).toContain('SHARED');
    expect(setSecret).not.toHaveBeenCalledWith('projectB', 'SHARED', expect.anything());
  });

  it('overwrites existing keys when overwrite is true', () => {
    const result = mergeSecrets('projectA', 'projectB', { overwrite: true });
    expect(result.merged).toContain('SHARED');
    expect(setSecret).toHaveBeenCalledWith('projectB', 'SHARED', 'from_a');
  });

  it('returns empty arrays when source is empty', () => {
    getSecrets.mockImplementation((p) => p === 'empty' ? {} : { X: '1' });
    const result = mergeSecrets('empty', 'projectB');
    expect(result.added).toHaveLength(0);
    expect(result.skipped).toHaveLength(0);
  });
});

describe('previewMerge', () => {
  it('identifies keys to add and keys that would conflict', () => {
    const result = previewMerge('projectA', 'projectB');
    expect(result.toAdd).toContain('FOO');
    expect(result.toOverwrite).toContain('SHARED');
    expect(result.toSkip).toContain('SHARED');
  });

  it('does not call setSecret during preview', () => {
    previewMerge('projectA', 'projectB');
    expect(setSecret).not.toHaveBeenCalled();
  });
});
