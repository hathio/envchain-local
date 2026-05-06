import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formatAsShellExports, formatAsDotenv, formatAsJson, exportSecrets } from './export.js';

vi.mock('./store.js', () => ({
  normalizeProjectKey: vi.fn((dir) => dir.replace(/\//g, '_')),
  getSecrets: vi.fn(),
}));

import { getSecrets } from './store.js';

describe('formatAsShellExports', () => {
  it('formats simple key-value pairs as export statements', () => {
    const result = formatAsShellExports({ FOO: 'bar', BAZ: 'qux' });
    expect(result).toContain("export FOO='bar'");
    expect(result).toContain("export BAZ='qux'");
  });

  it('escapes single quotes in values', () => {
    const result = formatAsShellExports({ KEY: "it's a value" });
    expect(result).toContain("export KEY='it'\\''s a value'");
  });
});

describe('formatAsDotenv', () => {
  it('formats simple values without quotes', () => {
    const result = formatAsDotenv({ FOO: 'bar' });
    expect(result).toBe('FOO=bar');
  });

  it('quotes values with spaces', () => {
    const result = formatAsDotenv({ FOO: 'hello world' });
    expect(result).toBe('FOO="hello world"');
  });

  it('quotes empty values', () => {
    const result = formatAsDotenv({ FOO: '' });
    expect(result).toBe('FOO=""');
  });
});

describe('formatAsJson', () => {
  it('returns pretty-printed JSON', () => {
    const result = formatAsJson({ FOO: 'bar' });
    expect(JSON.parse(result)).toEqual({ FOO: 'bar' });
    expect(result).toContain('\n');
  });
});

describe('exportSecrets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when no secrets found', () => {
    getSecrets.mockReturnValue({});
    expect(exportSecrets('/some/project')).toBeNull();
  });

  it('returns shell exports by default', () => {
    getSecrets.mockReturnValue({ API_KEY: 'abc123' });
    const result = exportSecrets('/some/project');
    expect(result).toContain('export API_KEY=');
  });

  it('returns dotenv format when requested', () => {
    getSecrets.mockReturnValue({ API_KEY: 'abc123' });
    const result = exportSecrets('/some/project', 'dotenv');
    expect(result).toContain('API_KEY=abc123');
    expect(result).not.toContain('export');
  });

  it('returns json format when requested', () => {
    getSecrets.mockReturnValue({ API_KEY: 'abc123' });
    const result = exportSecrets('/some/project', 'json');
    expect(JSON.parse(result)).toEqual({ API_KEY: 'abc123' });
  });

  it('throws on unknown format', () => {
    getSecrets.mockReturnValue({ API_KEY: 'abc123' });
    expect(() => exportSecrets('/some/project', 'xml')).toThrow('Unknown export format');
  });
});
