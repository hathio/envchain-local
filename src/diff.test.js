import { describe, it, expect, vi, beforeEach } from 'vitest';
import { diffSecrets, loadSecretsFromFile } from './diff.js';
import fs from 'fs';

vi.mock('fs');

describe('diffSecrets', () => {
  it('returns empty array for identical objects', () => {
    expect(diffSecrets({ A: '1', B: '2' }, { A: '1', B: '2' })).toEqual([]);
  });

  it('detects added keys', () => {
    const diff = diffSecrets({}, { NEW_KEY: 'val' });
    expect(diff).toEqual([{ type: 'added', key: 'NEW_KEY', newValue: 'val' }]);
  });

  it('detects removed keys', () => {
    const diff = diffSecrets({ OLD_KEY: 'val' }, {});
    expect(diff).toEqual([{ type: 'removed', key: 'OLD_KEY', oldValue: 'val' }]);
  });

  it('detects changed values', () => {
    const diff = diffSecrets({ KEY: 'old' }, { KEY: 'new' });
    expect(diff).toEqual([{ type: 'changed', key: 'KEY', oldValue: 'old', newValue: 'new' }]);
  });

  it('returns results sorted by key', () => {
    const diff = diffSecrets({ Z: '1' }, { A: '2' });
    expect(diff[0].key).toBe('A');
    expect(diff[1].key).toBe('Z');
  });

  it('handles mixed changes', () => {
    const base = { A: '1', B: '2', C: '3' };
    const target = { A: '1', B: 'changed', D: 'new' };
    const diff = diffSecrets(base, target);
    expect(diff).toHaveLength(3);
    expect(diff.find(d => d.key === 'B')?.type).toBe('changed');
    expect(diff.find(d => d.key === 'C')?.type).toBe('removed');
    expect(diff.find(d => d.key === 'D')?.type).toBe('added');
  });
});

describe('loadSecretsFromFile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws if file does not exist', () => {
    fs.existsSync.mockReturnValue(false);
    expect(() => loadSecretsFromFile('.env')).toThrow('File not found');
  });

  it('parses a .env file', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue('KEY=value\nOTHER="quoted"\n# comment\n');
    const result = loadSecretsFromFile('test.env');
    expect(result).toEqual({ KEY: 'value', OTHER: 'quoted' });
  });

  it('parses a .json file', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify({ FOO: 'bar', NUM: 42 }));
    const result = loadSecretsFromFile('secrets.json');
    expect(result).toEqual({ FOO: 'bar', NUM: '42' });
  });

  it('ignores blank lines and comments in .env', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue('\n# comment\nVALID=yes\n');
    const result = loadSecretsFromFile('test.env');
    expect(Object.keys(result)).toEqual(['VALID']);
  });
});
