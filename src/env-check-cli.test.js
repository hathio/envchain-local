import { describe, it, expect, vi, beforeEach } from 'vitest';
import { printValidationResults, handleEnvCheckCommand } from './env-check-cli.js';

vi.mock('./store.js', () => ({
  getSecrets: vi.fn(() => ({ DB_URL: 'postgres://...', API_KEY: '', PORT: '3000' })),
  normalizeProjectKey: vi.fn((dir) => dir),
}));

vi.mock('./env-check.js', () => ({
  validateSecrets: vi.fn((secrets, keys) => ({
    missing: keys.filter((k) => !(k in secrets)),
    empty: keys.filter((k) => k in secrets && secrets[k] === ''),
  })),
  parseRequiredKeysFile: vi.fn(() => ['DB_URL', 'API_KEY']),
  checkMissingKeys: vi.fn(),
  checkEmptyValues: vi.fn(),
}));

describe('printValidationResults', () => {
  it('prints ok when no issues', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    printValidationResults({ missing: [], empty: [] });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('All required keys'));
    spy.mockRestore();
  });

  it('prints missing keys', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    printValidationResults({ missing: ['SECRET_KEY'], empty: [] });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Missing keys'));
    spy.mockRestore();
  });

  it('prints empty keys as warnings', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    printValidationResults({ missing: [], empty: ['API_KEY'] });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Empty values'));
    spy.mockRestore();
  });
});

describe('handleEnvCheckCommand', () => {
  beforeEach(() => {
    vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  });

  it('exits 0 when all keys present and non-empty', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const secrets = { DB_URL: 'postgres://...', PORT: '3000' };
    await handleEnvCheckCommand({ _: ['DB_URL', 'PORT'] }, secrets);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('All required'));
    logSpy.mockRestore();
  });

  it('exits 1 when keys are missing', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const secrets = { PORT: '3000' };
    await expect(
      handleEnvCheckCommand({ _: ['DB_URL', 'PORT'] }, secrets)
    ).rejects.toThrow('exit');
  });

  it('exits 1 with no args and no --require', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(
      handleEnvCheckCommand({ _: [] }, {})
    ).rejects.toThrow('exit');
  });
});
