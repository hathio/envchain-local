import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleTemplateCommand } from './template-cli.js';

vi.mock('fs', () => ({
  default: {
    readFileSync: vi.fn(() => 'DB={{DB_URL}}'),
    writeFileSync: vi.fn(),
  },
}));

vi.mock('./template.js', () => ({
  renderTemplateForProject: vi.fn(),
  extractPlaceholders: vi.fn(() => ['DB_URL']),
  validateTemplate: vi.fn(() => []),
}));

vi.mock('./session.js', () => ({
  promptPassphrase: vi.fn(async () => 'secret'),
}));

vi.mock('./store.js', () => ({
  normalizeProjectKey: vi.fn(() => 'myapp'),
  getSecrets: vi.fn(async () => ({ DB_URL: 'postgres://localhost' })),
}));

import { renderTemplateForProject, validateTemplate } from './template.js';

describe('handleTemplateCommand - render', () => {
  beforeEach(() => vi.clearAllMocks());

  it('prints rendered output to stdout when no output file given', async () => {
    renderTemplateForProject.mockResolvedValue('DB=postgres://localhost');
    const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => {});
    await handleTemplateCommand(['render', 'template.txt']);
    expect(writeSpy).toHaveBeenCalledWith('DB=postgres://localhost');
    writeSpy.mockRestore();
  });

  it('writes to file when output path provided', async () => {
    renderTemplateForProject.mockResolvedValue('DB=postgres://localhost');
    const fs = (await import('fs')).default;
    await handleTemplateCommand(['render', 'template.txt', 'out.env']);
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('exits with error if render throws', async () => {
    renderTemplateForProject.mockRejectedValue(new Error('Missing key'));
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(handleTemplateCommand(['render', 'template.txt'])).rejects.toThrow('exit');
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });
});

describe('handleTemplateCommand - check', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reports all placeholders satisfied', async () => {
    validateTemplate.mockReturnValue([]);
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handleTemplateCommand(['check', 'template.txt']);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('satisfied'));
    logSpy.mockRestore();
  });

  it('exits 1 when missing keys found', async () => {
    validateTemplate.mockReturnValue(['DB_URL']);
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(handleTemplateCommand(['check', 'template.txt'])).rejects.toThrow('exit');
    exitSpy.mockRestore();
  });
});
