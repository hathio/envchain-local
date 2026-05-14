import { describe, it, expect, vi, beforeEach } from 'vitest';
import { printAccessRules, handleAccessCommand } from './env-access-cli.js';

vi.mock('./env-access.js', () => ({
  listAccessRules: vi.fn(),
  grantAccess: vi.fn(),
  revokeAccess: vi.fn(),
  clearAccess: vi.fn(),
}));

import { listAccessRules, grantAccess, revokeAccess, clearAccess } from './env-access.js';

beforeEach(() => vi.clearAllMocks());

describe('printAccessRules', () => {
  it('prints message when no rules', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    printAccessRules('myapp', []);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('No access rules'));
    spy.mockRestore();
  });

  it('prints each rule', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    printAccessRules('myapp', [
      { secretKey: 'API_KEY', role: 'read', grantedAt: Date.now() },
    ]);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('myapp'));
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('API_KEY'));
    spy.mockRestore();
  });
});

describe('handleAccessCommand', () => {
  it('calls listAccessRules for list subcommand', () => {
    listAccessRules.mockReturnValue([]);
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    handleAccessCommand(['list', 'myapp']);
    expect(listAccessRules).toHaveBeenCalledWith('myapp');
    spy.mockRestore();
  });

  it('calls grantAccess for grant subcommand', () => {
    grantAccess.mockReturnValue(true);
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    handleAccessCommand(['grant', 'myapp', 'TOKEN', 'read']);
    expect(grantAccess).toHaveBeenCalledWith('myapp', 'TOKEN', 'read');
    spy.mockRestore();
  });

  it('calls revokeAccess for revoke subcommand', () => {
    revokeAccess.mockReturnValue(true);
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    handleAccessCommand(['revoke', 'myapp', 'TOKEN', 'read']);
    expect(revokeAccess).toHaveBeenCalledWith('myapp', 'TOKEN', 'read');
    spy.mockRestore();
  });

  it('calls clearAccess for clear subcommand', () => {
    clearAccess.mockReturnValue(true);
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    handleAccessCommand(['clear', 'myapp']);
    expect(clearAccess).toHaveBeenCalledWith('myapp');
    spy.mockRestore();
  });

  it('exits on missing project', () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => handleAccessCommand(['list'])).toThrow('exit');
    exitSpy.mockRestore();
    errSpy.mockRestore();
  });

  it('exits on unknown subcommand', () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => handleAccessCommand(['nope', 'myapp'])).toThrow('exit');
    exitSpy.mockRestore();
    errSpy.mockRestore();
  });
});
