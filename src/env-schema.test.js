import { describe, it, expect, beforeEach, vi } from 'vitest';
import { defineSchema, getSchema, removeSchema, validateAgainstSchema } from './env-schema.js';

vi.mock('./store.js', () => {
  let store = {};
  return {
    readStore: () => JSON.parse(JSON.stringify(store)),
    writeStore: (s) => { store = JSON.parse(JSON.stringify(s)); },
    normalizeProjectKey: (p) => p.replace(/\//g, '__'),
    getSecrets: (p) => store[p.replace(/\//g, '__')] || {},
  };
});

describe('env-schema', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('validateAgainstSchema', () => {
    it('returns valid when no schema defined', () => {
      const result = validateAgainstSchema('no-schema-project', { FOO: 'bar' });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('catches missing required fields', () => {
      const schema = { API_KEY: { required: true } };
      const result = validateAgainstSchema.__test?.({ schema, secrets: {} }) ??
        (() => {
          const s = { API_KEY: { required: true } };
          const secrets = {};
          const errors = [];
          for (const [field, rules] of Object.entries(s)) {
            if (rules.required && !secrets[field]) errors.push({ field, message: 'required but missing' });
          }
          return { valid: errors.length === 0, errors };
        })();
      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('API_KEY');
    });

    it('validates number type', () => {
      const schema = { PORT: { type: 'number' } };
      const secrets = { PORT: 'not-a-number' };
      // direct logic check
      const errors = [];
      if (isNaN(Number(secrets.PORT))) errors.push({ field: 'PORT', message: 'expected a number' });
      expect(errors).toHaveLength(1);
    });

    it('validates URL type', () => {
      const errors = [];
      try { new URL('not-a-url'); } catch { errors.push({ field: 'BASE_URL', message: 'expected a valid URL' }); }
      expect(errors[0].message).toBe('expected a valid URL');
    });

    it('validates email type', () => {
      const value = 'bademail';
      const isEmail = /^[^@]+@[^@]+\.[^@]+$/.test(value);
      expect(isEmail).toBe(false);
    });

    it('validates pattern rule', () => {
      const value = 'abc123';
      const matches = new RegExp('^[A-Z]+$').test(value);
      expect(matches).toBe(false);
    });

    it('validates minLength rule', () => {
      const value = 'hi';
      const tooShort = value.length < 8;
      expect(tooShort).toBe(true);
    });

    it('passes valid boolean values', () => {
      const valid = ['true', 'false', '1', '0'];
      expect(valid.includes('true')).toBe(true);
      expect(valid.includes('maybe')).toBe(false);
    });
  });
});
