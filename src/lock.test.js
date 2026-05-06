import { describe, it, expect, beforeEach, vi } from 'vitest';
import { hashPassphrase, isUnlocked, unlock, clearLock, readLock } from './lock.js';
import { writeFileSync, existsSync } from 'fs';

vi.mock('fs');

const MOCK_PASSPHRASE = 'supersecret';

beforeEach(() => {
  vi.resetAllMocks();
});

describe('hashPassphrase', () => {
  it('returns a 64-char hex string', () => {
    const hash = hashPassphrase(MOCK_PASSPHRASE);
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });

  it('is deterministic', () => {
    expect(hashPassphrase(MOCK_PASSPHRASE)).toBe(hashPassphrase(MOCK_PASSPHRASE));
  });

  it('differs for different passphrases', () => {
    expect(hashPassphrase('abc')).not.toBe(hashPassphrase('xyz'));
  });
});

describe('readLock', () => {
  it('returns null if file does not exist', () => {
    existsSync.mockReturnValue(false);
    expect(readLock()).toBeNull();
  });

  it('returns null on malformed JSON', () => {
    existsSync.mockReturnValue(true);
    const { readFileSync } = await import('fs');
    readFileSync.mockReturnValue('not-json');
    expect(readLock()).toBeNull();
  });
});

describe('isUnlocked', () => {
  it('returns false when no lock file exists', () => {
    existsSync.mockReturnValue(false);
    expect(isUnlocked(MOCK_PASSPHRASE)).toBe(false);
  });

  it('returns false when session is expired', () => {
    existsSync.mockReturnValue(true);
    const { readFileSync } = await import('fs');
    const expiredLock = {
      hash: hashPassphrase(MOCK_PASSPHRASE),
      unlockedAt: Date.now() - 20 * 60 * 1000,
    };
    readFileSync.mockReturnValue(JSON.stringify(expiredLock));
    expect(isUnlocked(MOCK_PASSPHRASE)).toBe(false);
  });

  it('returns true for valid passphrase within TTL', () => {
    existsSync.mockReturnValue(true);
    const { readFileSync } = await import('fs');
    const activeLock = {
      hash: hashPassphrase(MOCK_PASSPHRASE),
      unlockedAt: Date.now(),
    };
    readFileSync.mockReturnValue(JSON.stringify(activeLock));
    expect(isUnlocked(MOCK_PASSPHRASE)).toBe(true);
  });
});
