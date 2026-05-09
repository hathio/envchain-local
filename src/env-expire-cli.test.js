import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleExpireCommand, printExpireList } from './env-expire-cli.js';
import * as expire from './env-expire.js';

vi.mock('./env-expire.js');

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
});

describe('handleExpireCommand - set', () => {
  it('calls setExpiry and logs result', () => {
    vi.mocked(expire.setExpiry).mockReturnValue(Date.now() + 86400000 * 30);
    handleExpireCommand(['set', 'myapp', 'DB_PASS', '30']);
    expect(expire.setExpiry).toHaveBeenCalledWith('myapp', 'DB_PASS', 30);
    expect(console.log).toHaveBeenCalled();
  });

  it('defaults to 90 days if no ttl given', () => {
    vi.mocked(expire.setExpiry).mockReturnValue(Date.now() + 86400000 * 90);
    handleExpireCommand(['set', 'myapp', 'API_KEY']);
    expect(expire.setExpiry).toHaveBeenCalledWith('myapp', 'API_KEY', 90);
  });
});

describe('handleExpireCommand - clear', () => {
  it('logs cleared message when expiry existed', () => {
    vi.mocked(expire.clearExpiry).mockReturnValue(true);
    handleExpireCommand(['clear', 'myapp', 'DB_PASS']);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Cleared'));
  });

  it('logs no expiry set when nothing to clear', () => {
    vi.mocked(expire.clearExpiry).mockReturnValue(false);
    handleExpireCommand(['clear', 'myapp', 'DB_PASS']);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No expiry'));
  });
});

describe('handleExpireCommand - get', () => {
  it('prints expiry info when set', () => {
    vi.mocked(expire.getExpiry).mockReturnValue({ expiresAt: Date.now() + 1000, ttlDays: 30 });
    handleExpireCommand(['get', 'myapp', 'DB_PASS']);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('expires'));
  });

  it('prints no expiry set when null', () => {
    vi.mocked(expire.getExpiry).mockReturnValue(null);
    handleExpireCommand(['get', 'myapp', 'DB_PASS']);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No expiry'));
  });
});

describe('handleExpireCommand - list-expired', () => {
  it('calls listExpiredSecrets and prints results', () => {
    vi.mocked(expire.listExpiredSecrets).mockReturnValue([{ project: 'myapp', key: 'OLD', expiresAt: Date.now() - 1000 }]);
    handleExpireCommand(['list-expired']);
    expect(expire.listExpiredSecrets).toHaveBeenCalled();
  });
});

describe('handleExpireCommand - list-expiring', () => {
  it('calls listExpiringSecrets with default 7 days', () => {
    vi.mocked(expire.listExpiringSecrets).mockReturnValue([]);
    handleExpireCommand(['list-expiring']);
    expect(expire.listExpiringSecrets).toHaveBeenCalledWith(7);
  });
});

describe('handleExpireCommand - unknown', () => {
  it('exits on unknown subcommand', () => {
    expect(() => handleExpireCommand(['unknown'])).toThrow('exit');
    expect(console.error).toHaveBeenCalled();
  });
});

describe('printExpireList', () => {
  it('prints no secrets found when empty', () => {
    printExpireList([], 'expired');
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No expired'));
  });
});
