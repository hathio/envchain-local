import { describe, it, expect, vi, beforeEach } from 'vitest';
import { diffSecrets, loadSecretsFromFile, diffProjectAgainstFile } from './diff.js';
import * as store from './store.js';
import * as fs from 'fs';

vi.mock('./store.js');
vi.mock('fs');

describe('diffSecrets', () => {
  it('detects added keys', () => {
    const result = diffSecrets({ A: '1' }, { A: '1', B: '2' });
    expect(result.added).toEqual(['B']);
    expect(result.removed).toEqual([]);
    expect(result.unchanged).toEqual(['A']);
  });

  it('detects removed keys', () => {
    const result = diffSecrets({ A: '1', B: '2' }, { A: '1' });
    expect(result.removed).toEqual(['B']);
    expect(result.added).toEqual([]);
  });

  it('detects changed keys', () => {
    const result = diffSecrets({ A: '1' }, { A: '2' });
    expect(result.changed).toEqual(['A']);
    expect(result.unchanged).toEqual([]);
  });

  it('handles identical objects', () => {
    const result = diffSecrets({ A: '1', B: '2' }, { A: '1', B: '2' });
    expect(result.added).toEqual([]);
    expect(result.removed).toEqual([]);
    expect(result.changed).toEqual([]);
    expect(result.unchanged).toHaveLength(2);
  });

  it('handles empty stored', () => {
    const result = diffSecrets({}, { X: 'y' });
    expect(result.added).toEqual(['X']);
  });
});

describe('loadSecretsFromFile', () => {
  it('parses a .env file', () => {
    fs.readFileSync.mockReturnValue('FOO=bar\nBAZ=qux');
    const result = loadSecretsFromFile('secrets.env');
    expect(result).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  it('parses a .json file', () => {
    fs.readFileSync.mockReturnValue(JSON.stringify({ KEY: 'val' }));
    const result = loadSecretsFromFile('secrets.json');
    expect(result).toEqual({ KEY: 'val' });
  });
});

describe('diffProjectAgainstFile', () => {
  beforeEach(() => {
    store.getSecrets.mockResolvedValue({ EXISTING: 'abc' });
    fs.readFileSync.mockReturnValue('EXISTING=abc\nNEW=xyz');
  });

  it('returns correct diff for project vs file', async () => {
    const result = await diffProjectAgainstFile('my-project', 'file.env', 'pass');
    expect(result.added).toEqual(['NEW']);
    expect(result.unchanged).toEqual(['EXISTING']);
    expect(store.getSecrets).toHaveBeenCalledWith('my-project', 'pass');
  });
});
