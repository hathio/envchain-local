import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSnapshot, compareSnapshots, watchProject } from './env-watch.js';
import * as store from './store.js';

vi.mock('./store.js');

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('getSnapshot', () => {
  it('returns secrets for a known project', () => {
    store.readStore.mockReturnValue({ 'my-project': { API_KEY: 'abc' } });
    store.normalizeProjectKey.mockReturnValue('my-project');
    expect(getSnapshot('my-project')).toEqual({ API_KEY: 'abc' });
  });

  it('returns empty object for unknown project', () => {
    store.readStore.mockReturnValue({});
    store.normalizeProjectKey.mockReturnValue('unknown');
    expect(getSnapshot('unknown')).toEqual({});
  });
});

describe('compareSnapshots', () => {
  it('detects added keys', () => {
    const diff = compareSnapshots({}, { NEW_KEY: 'val' });
    expect(diff.added).toContain('NEW_KEY');
  });

  it('detects removed keys', () => {
    const diff = compareSnapshots({ OLD_KEY: 'val' }, {});
    expect(diff.removed).toContain('OLD_KEY');
  });

  it('detects changed values', () => {
    const diff = compareSnapshots({ KEY: 'old' }, { KEY: 'new' });
    expect(diff.changed).toContain('KEY');
  });

  it('returns empty diff for identical snapshots', () => {
    const diff = compareSnapshots({ KEY: 'val' }, { KEY: 'val' });
    expect(diff.added).toHaveLength(0);
    expect(diff.removed).toHaveLength(0);
    expect(diff.changed).toHaveLength(0);
  });
});

describe('watchProject', () => {
  it('calls onChange when secrets change', () => {
    store.normalizeProjectKey.mockReturnValue('proj');
    store.readStore
      .mockReturnValueOnce({ proj: { KEY: 'v1' } })
      .mockReturnValue({ proj: { KEY: 'v2' } });

    const onChange = vi.fn();
    const stop = watchProject('proj', onChange);
    vi.advanceTimersByTime(2100);
    expect(onChange).toHaveBeenCalledOnce();
    stop();
  });

  it('does not call onChange when nothing changes', () => {
    store.normalizeProjectKey.mockReturnValue('proj');
    store.readStore.mockReturnValue({ proj: { KEY: 'v1' } });

    const onChange = vi.fn();
    const stop = watchProject('proj', onChange);
    vi.advanceTimersByTime(6000);
    expect(onChange).not.toHaveBeenCalled();
    stop();
  });
});
