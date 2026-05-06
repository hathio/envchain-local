const { encrypt, decrypt } = require('./crypto');

describe('crypto', () => {
  const password = 'super-secret-password';
  const plaintext = 'MY_API_KEY=abc123';

  describe('encrypt', () => {
    it('returns a base64 string', () => {
      const result = encrypt(plaintext, password);
      expect(typeof result).toBe('string');
      expect(() => Buffer.from(result, 'base64')).not.toThrow();
    });

    it('produces different output each call (random IV + salt)', () => {
      const a = encrypt(plaintext, password);
      const b = encrypt(plaintext, password);
      expect(a).not.toBe(b);
    });
  });

  describe('decrypt', () => {
    it('round-trips plaintext correctly', () => {
      const ciphertext = encrypt(plaintext, password);
      const result = decrypt(ciphertext, password);
      expect(result).toBe(plaintext);
    });

    it('throws on wrong password', () => {
      const ciphertext = encrypt(plaintext, password);
      expect(() => decrypt(ciphertext, 'wrong-password')).toThrow(
        'Decryption failed: invalid password or corrupted data'
      );
    });

    it('throws on corrupted ciphertext', () => {
      expect(() => decrypt('bm90dmFsaWRiYXNlNjQ=', password)).toThrow();
    });

    it('handles multi-line secret values', () => {
      const multiline = 'KEY1=val1\nKEY2=val2\nKEY3=val3';
      const ciphertext = encrypt(multiline, password);
      expect(decrypt(ciphertext, password)).toBe(multiline);
    });
  });
});
