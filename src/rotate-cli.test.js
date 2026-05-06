import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./rotate.js', () => ({
  rotateSecrets: vi.fn().mockResolvedValue(3),
  rotateSecret: vi.fn().mockResolvedValue(true),
}));

vi.mock('./crypto.js', () => ({
  deriveKey: vi.fn().mockResolvedValue(Buffer.from('key')),
}));

vi.mock('./session.js', () => ({
  promptPassphrase: vi.fn()
    .mockResolvedValueOnce('oldpass')
    .mockResolvedValueOnce('newpass')
    .mockResolvedValueOnce('newpass'),
}));

vi.mock('./lock.js', () => ({
  readLock: vi.fn().mockReturnValue({ salt: 'abc', hash: 'oldhash' }),
  writeLock: vi.fn(),
  hashPassphrase: vi.fn().mockResolvedValue('newhash'),
}));

import { handleRotateCommand } from './rotate-cli.js';
import { rotateSecrets, rotateSecret } from './rotate.js';
import { writeLock } from './lock.js';

const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

beforeEach(() => vi.clearAllMocks());

describe('handleRotateCommand', () => {
  it('rotates all secrets when no name given', async () => {
    await handleRotateCommand([]);
    expect(rotateSecrets).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Rotated 3'));
    expect(writeLock).toHaveBeenCalledWith({ salt: 'abc', hash: 'newhash' });
  });

  it('rotates single secret when name provided', async () => {
    const { promptPassphrase } = await import('./session.js');
    promptPassphrase
      .mockResolvedValueOnce('oldpass')
      .mockResolvedValueOnce('newpass')
      .mockResolvedValueOnce('newpass');

    await handleRotateCommand(['DB_PASS']);
    expect(rotateSecret).toHaveBeenCalledWith(
      expect.any(String), 'DB_PASS',
      expect.anything(), expect.anything()
    );
  });
});
