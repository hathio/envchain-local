import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  renderTemplate,
  extractPlaceholders,
  validateTemplate,
  renderTemplateForProject,
} from './template.js';

vi.mock('./store.js', () => ({
  getSecrets: vi.fn(),
}));

import { getSecrets } from './store.js';

describe('renderTemplate', () => {
  it('replaces known placeholders', () => {
    const result = renderTemplate('Hello {{NAME}}!', { NAME: 'world' });
    expect(result).toBe('Hello world!');
  });

  it('leaves unknown placeholders intact', () => {
    const result = renderTemplate('Hello {{NAME}}!', {});
    expect(result).toBe('Hello {{NAME}}!');
  });

  it('handles multiple placeholders', () => {
    const result = renderTemplate('{{A}} and {{B}}', { A: 'foo', B: 'bar' });
    expect(result).toBe('foo and bar');
  });

  it('handles spaces inside braces', () => {
    const result = renderTemplate('{{ KEY }}', { KEY: 'val' });
    expect(result).toBe('val');
  });
});

describe('extractPlaceholders', () => {
  it('extracts all unique keys', () => {
    const keys = extractPlaceholders('{{FOO}} {{BAR}} {{FOO}}');
    expect(keys).toEqual(expect.arrayContaining(['FOO', 'BAR']));
    expect(keys).toHaveLength(2);
  });

  it('returns empty array when no placeholders', () => {
    expect(extractPlaceholders('no placeholders here')).toEqual([]);
  });
});

describe('validateTemplate', () => {
  it('returns empty array when all keys present', () => {
    expect(validateTemplate('{{A}} {{B}}', { A: '1', B: '2' })).toEqual([]);
  });

  it('returns missing keys', () => {
    const missing = validateTemplate('{{A}} {{B}}', { A: '1' });
    expect(missing).toEqual(['B']);
  });
});

describe('renderTemplateForProject', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders template using project secrets', async () => {
    getSecrets.mockResolvedValue({ DB_URL: 'postgres://localhost' });
    const result = await renderTemplateForProject('myapp', 'url={{DB_URL}}', 'pass');
    expect(result).toBe('url=postgres://localhost');
  });

  it('throws if a placeholder key is missing from secrets', async () => {
    getSecrets.mockResolvedValue({});
    await expect(
      renderTemplateForProject('myapp', '{{MISSING_KEY}}', 'pass')
    ).rejects.toThrow('MISSING_KEY');
  });
});
