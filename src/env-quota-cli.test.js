import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleQuotaCommand, printAllQuotas } from './env-quota-cli.js';
import * as quota from './env-quota.js';

vi.mock('./env-quota.js');
vi.mock('chalk', () => ({
  default: {
    cyan: s => s, green: s => s, red: s => s, yellow: s => s,
    bold: s => s, gray: s => s,
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
});

describe('handleQuotaCommand - set', () => {
  it('sets quota and logs success', () => {
    handleQuotaCommand(['set', 'myapp', '50']);
    expect(quota.setQuota).toHaveBeenCalledWith('myapp', 50);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('50'));
  });
});

describe('handleQuotaCommand - get', () => {
  it('prints quota for project', () => {
    quota.getQuota.mockReturnValue(75);
    handleQuotaCommand(['get', 'myapp']);
    expect(quota.getQuota).toHaveBeenCalledWith('myapp');
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('75'));
  });
});

describe('handleQuotaCommand - clear', () => {
  it('clears quota and logs', () => {
    handleQuotaCommand(['clear', 'myapp']);
    expect(quota.clearQuota).toHaveBeenCalledWith('myapp');
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('cleared'));
  });
});

describe('handleQuotaCommand - status', () => {
  it('calls checkQuota and prints result', () => {
    quota.checkQuota.mockReturnValue({ usage: 3, limit: 10, exceeded: false, available: 7 });
    handleQuotaCommand(['status', 'myapp']);
    expect(quota.checkQuota).toHaveBeenCalledWith('myapp');
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('myapp'));
  });
});

describe('handleQuotaCommand - list', () => {
  it('delegates to printAllQuotas', () => {
    quota.listAllQuotas.mockReturnValue([{ project: 'proj', limit: 20, usage: 5 }]);
    handleQuotaCommand(['list']);
    expect(quota.listAllQuotas).toHaveBeenCalled();
  });

  it('prints message when no quotas', () => {
    quota.listAllQuotas.mockReturnValue([]);
    handleQuotaCommand(['list']);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No custom'));
  });
});

describe('handleQuotaCommand - invalid', () => {
  it('exits with usage message on bad args', () => {
    expect(() => handleQuotaCommand(['unknown'])).toThrow('exit');
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
