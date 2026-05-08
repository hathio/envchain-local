import { describe, it, expect, vi, beforeEach } from 'vitest';
import { printProfiles, handleProfileCommand } from './env-profile-cli.js';
import * as profileModule from './env-profile.js';

vi.mock('./env-profile.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('printProfiles', () => {
  it('prints message when no profiles exist', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    printProfiles([], null);
    expect(spy).toHaveBeenCalledWith('No profiles found.');
    spy.mockRestore();
  });

  it('marks the active profile', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    printProfiles(['default', 'staging'], 'staging');
    const calls = spy.mock.calls.map(c => c[0]);
    expect(calls.some(c => c.includes('staging') && c.includes('active'))).toBe(true);
    expect(calls.some(c => c.includes('default') && !c.includes('active'))).toBe(true);
    spy.mockRestore();
  });
});

describe('handleProfileCommand', () => {
  it('lists profiles', async () => {
    profileModule.listProfiles.mockResolvedValue(['default', 'prod']);
    profileModule.getActiveProfile.mockResolvedValue('default');
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handleProfileCommand(['list']);
    expect(profileModule.listProfiles).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('switches active profile', async () => {
    profileModule.setActiveProfile.mockResolvedValue();
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handleProfileCommand(['use', 'prod']);
    expect(profileModule.setActiveProfile).toHaveBeenCalledWith('prod');
    spy.mockRestore();
  });

  it('creates a new profile', async () => {
    profileModule.createProfile.mockResolvedValue();
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handleProfileCommand(['create', 'staging']);
    expect(profileModule.createProfile).toHaveBeenCalledWith('staging');
    spy.mockRestore();
  });

  it('deletes a profile', async () => {
    profileModule.deleteProfile.mockResolvedValue();
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handleProfileCommand(['delete', 'staging']);
    expect(profileModule.deleteProfile).toHaveBeenCalledWith('staging');
    spy.mockRestore();
  });

  it('shows current active profile', async () => {
    profileModule.getActiveProfile.mockResolvedValue('default');
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handleProfileCommand(['current']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('default'));
    spy.mockRestore();
  });

  it('exits on unknown subcommand', async () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(handleProfileCommand(['unknown'])).rejects.toThrow('exit');
    exitSpy.mockRestore();
    errSpy.mockRestore();
  });
});
