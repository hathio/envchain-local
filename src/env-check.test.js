import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  checkMissingKeys,
  checkEmptyValues,
  validateSecrets,
  parseRequiredKeysFile,
  runEnvCheck,
} from './env-check.js';

vi.mock('./store.js', () => ({
  getSecrets: vi.fn(),
  normalizeProjectKey: (p) => p.replace(/\//g, '_').replace(/^_/, ''),
}));

import { getSecrets } from './store.js';

describe('checkMissingKeys', () => {
  it('returns keys not present in secrets', () => {
    const result = checkMissingKeys('/proj', ['DB_URL', 'API_KEY'], { DB_URL: 'x' });
    expect(result).toEqual(['API_KEY']);
  });

  it('returns empty array when all keys present', () => {
    const result = checkMissingKeys('/proj', ['A'], { A: '1' });
    expect(result).toEqual([]);
  });
});

describe('checkEmptyValues', () => {
  it('detects blank string values', () => {
    const result = checkEmptyValues({ A: '', B: '  ', C: 'ok' });
    expect(result).toContain('A');
    expect(result).toContain('B');
    expect(result).not.toContain('C');
  });
});

describe('validateSecrets', () => {
  it('reports ok when all required keys are set', () => {
    const report = validateSecrets('/app', ['FOO', 'BAR'], { FOO: 'x', BAR: 'y' });
    expect(report.ok).toBe(true);
    expect(report.missing).toEqual([]);
    expect(report.present).toEqual(['FOO', 'BAR']);
  });

  it('reports missing keys', () => {
    const report = validateSecrets('/app', ['FOO', 'BAR'], { FOO: 'x' });
    expect(report.ok).toBe(false);
    expect(report.missing).toEqual(['BAR']);
  });

  it('reports empty required keys', () => {
    const report = validateSecrets('/app', ['FOO'], { FOO: '' });
    expect(report.ok).toBe(false);
    expect(report.empty).toContain('FOO');
  });
});

describe('parseRequiredKeysFile', () => {
  it('parses key names from file content', () => {
    const content = '# comment\nDB_URL\nAPI_KEY=example\n\nSECRET\n';
    expect(parseRequiredKeysFile(content)).toEqual(['DB_URL', 'API_KEY', 'SECRET']);
  });
});

describe('runEnvCheck', () => {
  beforeEach(() => {
    getSecrets.mockResolvedValue({ TOKEN: 'abc' });
  });

  it('returns validation report using store secrets', async () => {
    const report = await runEnvCheck('/myapp', ['TOKEN', 'MISSING']);
    expect(report.present).toContain('TOKEN');
    expect(report.missing).toContain('MISSING');
    expect(report.ok).toBe(false);
  });
});
