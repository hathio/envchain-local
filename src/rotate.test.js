import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rotateSecrets, rotateSecret } from './rotate.js';

vi.mock('./store.js', () => ({
  readStore: vi.fn(),
  writeStore: vi.fn(),
  normalizeProjectKey: vi.fn((p) => p.replace(/\//g, '_').replace(/^_/, '')),
}));

vi.mock('./crypto.js', () => ({
  encrypt: vi.fn((val, key) => `enc:${key}:${val}`),
  decrypt: vi.fn((val, key) => val.replace(`enc:${key}:`, '')),
}));

vi.mock('./audit.js', () => ({ logEvent: vi.fn() }));

import { readStore, writeStore } from './store.js';

beforeEach(() => vi.clearAllMocks());

describe('rotateSecrets', () => {
  it('re-encrypts all secrets with new key', async () => {
    readStore.mockReturnValue({
      my_project: {
        DB_PASS: 'enc:oldkey:hunter2',
        API_KEY: 'enc:oldkey:abc123',
      },
    });

    const count = await rotateSecrets('my/project', 'oldkey', 'newkey');
    expect(count).toBe(2);
    expect(writeStore).toHaveBeenCalledWith({
      my_project: {
        DB_PASS: 'enc:newkey:hunter2',
        API_KEY: 'enc:newkey:abc123',
      },
    });
  });

  it('throws if project not found', async () => {
    readStore.mockReturnValue({});
    await expect(rotateSecrets('missing/proj', 'a', 'b')).rejects.toThrow('No secrets found');
  });
});

describe('rotateSecret', () => {
  it('rotates a single named secret', async () => {
    readStore.mockReturnValue({
      my_project: { TOKEN: 'enc:oldkey:secret' },
    });
    const result = await rotateSecret('my/project', 'TOKEN', 'oldkey', 'newkey');
    expect(result).toBe(true);
    expect(writeStore).toHaveBeenCalledWith({
      my_project: { TOKEN: 'enc:newkey:secret' },
    });
  });

  it('throws if secret not found', async () => {
    readStore.mockReturnValue({ my_project: {} });
    await expect(rotateSecret('my/project', 'MISSING', 'a', 'b')).rejects.toThrow('not found');
  });
});
