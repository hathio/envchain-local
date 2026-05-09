import { describe, it, expect, vi, beforeEach } from 'vitest';
import { colorSeverity, printLintResults, handleLintCommand } from './env-lint-cli.js';
import * as lintModule from './env-lint.js';

vi.mock('./env-lint.js');
vi.mock('./store.js', () => ({ normalizeProjectKey: (p) => p.replace(/\//g, '_') }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('colorSeverity', () => {
  it('wraps error in red', () => {
    expect(colorSeverity('error')).toContain('ERROR');
  });

  it('wraps warning in yellow', () => {
    expect(colorSeverity('warning')).toContain('WARNING');
  });

  it('falls back to reset for unknown severity', () => {
    expect(colorSeverity('unknown')).toContain('UNKNOWN');
  });
});

describe('printLintResults', () => {
  it('prints success message when no issues', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const code = printLintResults([]);
    expect(code).toBe(0);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('No lint issues found'));
  });

  it('returns 1 when errors present', () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const issues = [{ severity: 'error', key: 'MY_KEY', message: 'bad name', project: 'proj' }];
    const code = printLintResults(issues);
    expect(code).toBe(1);
  });

  it('returns 0 when only warnings', () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const issues = [{ severity: 'warning', key: 'my_key', message: 'lowercase key', project: 'proj' }];
    const code = printLintResults(issues);
    expect(code).toBe(0);
  });
});

describe('handleLintCommand', () => {
  it('lints a named project', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    lintModule.lintProject.mockResolvedValue([]);
    const code = await handleLintCommand(['my_project']);
    expect(lintModule.lintProject).toHaveBeenCalledWith('my_project');
    expect(code).toBe(0);
  });

  it('lints all projects with --all flag', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    lintModule.lintAllProjects.mockResolvedValue([
      { severity: 'warning', key: 'foo', message: 'issue', project: 'proj_a' },
    ]);
    const code = await handleLintCommand(['--all']);
    expect(lintModule.lintAllProjects).toHaveBeenCalled();
    expect(code).toBe(0);
  });

  it('returns exit code 1 if errors found in --all mode', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    lintModule.lintAllProjects.mockResolvedValue([
      { severity: 'error', key: 'bad', message: 'critical', project: 'proj_b' },
    ]);
    const code = await handleLintCommand(['--all']);
    expect(code).toBe(1);
  });
});
