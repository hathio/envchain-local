import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listTags, addTag, removeTag, findByTag, listAllTags } from './env-tag.js';
import * as store from './store.js';

vi.mock('./store.js');

const mockStore = {
  'my-app': { secrets: {}, tags: ['production', 'backend'] },
  'other-project': { secrets: {}, tags: ['staging'] },
  'no-tags-project': { secrets: {} },
};

beforeEach(() => {
  vi.mocked(store.readStore).mockReturnValue(structuredClone(mockStore));
  vi.mocked(store.writeStore).mockImplementation(() => {});
  vi.mocked(store.normalizeProjectKey).mockImplementation(k => k);
});

describe('listTags', () => {
  it('returns tags for a project', () => {
    expect(listTags('my-app')).toEqual(['production', 'backend']);
  });

  it('returns empty array if no tags', () => {
    expect(listTags('no-tags-project')).toEqual([]);
  });

  it('returns empty array if project not found', () => {
    expect(listTags('ghost')).toEqual([]);
  });
});

describe('addTag', () => {
  it('adds a new tag to a project', () => {
    const result = addTag('my-app', 'critical');
    expect(result).toBe(true);
    expect(store.writeStore).toHaveBeenCalled();
  });

  it('returns false if tag already exists', () => {
    const result = addTag('my-app', 'production');
    expect(result).toBe(false);
    expect(store.writeStore).not.toHaveBeenCalled();
  });

  it('throws if project not found', () => {
    expect(() => addTag('ghost', 'tag')).toThrow('Project not found: ghost');
  });
});

describe('removeTag', () => {
  it('removes an existing tag', () => {
    const result = removeTag('my-app', 'production');
    expect(result).toBe(true);
    expect(store.writeStore).toHaveBeenCalled();
  });

  it('returns false if tag does not exist', () => {
    const result = removeTag('my-app', 'nonexistent');
    expect(result).toBe(false);
    expect(store.writeStore).not.toHaveBeenCalled();
  });

  it('throws if project not found', () => {
    expect(() => removeTag('ghost', 'tag')).toThrow('Project not found: ghost');
  });
});

describe('findByTag', () => {
  it('finds projects with a given tag', () => {
    const result = findByTag('production');
    expect(result).toContain('my-app');
    expect(result).not.toContain('other-project');
  });

  it('returns empty array if no projects match', () => {
    expect(findByTag('unknown')).toEqual([]);
  });
});

describe('listAllTags', () => {
  it('returns all unique tags sorted', () => {
    const tags = listAllTags();
    expect(tags).toEqual(['backend', 'production', 'staging']);
  });
});
