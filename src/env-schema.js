import { readStore, normalizeProjectKey } from './store.js';

const VALID_TYPES = ['string', 'number', 'boolean', 'url', 'email'];

export function defineSchema(project, schema) {
  const store = readStore();
  const key = normalizeProjectKey(project);
  if (!store[key]) store[key] = {};
  store[key].__schema = schema;
  const { writeStore } = require('./store.js');
  writeStore(store);
  return schema;
}

export function getSchema(project) {
  const store = readStore();
  const key = normalizeProjectKey(project);
  return store[key]?.__schema || null;
}

export function removeSchema(project) {
  const store = readStore();
  const key = normalizeProjectKey(project);
  if (store[key]) {
    delete store[key].__schema;
    const { writeStore } = require('./store.js');
    writeStore(store);
  }
}

export function validateAgainstSchema(project, secrets) {
  const schema = getSchema(project);
  if (!schema) return { valid: true, errors: [] };

  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = secrets[field];

    if (rules.required && (value === undefined || value === '')) {
      errors.push({ field, message: 'required but missing' });
      continue;
    }

    if (value === undefined) continue;

    if (rules.type) {
      if (!VALID_TYPES.includes(rules.type)) {
        errors.push({ field, message: `unknown type: ${rules.type}` });
      } else if (rules.type === 'number' && isNaN(Number(value))) {
        errors.push({ field, message: 'expected a number' });
      } else if (rules.type === 'boolean' && !['true', 'false', '1', '0'].includes(value)) {
        errors.push({ field, message: 'expected a boolean' });
      } else if (rules.type === 'url') {
        try { new URL(value); } catch {
          errors.push({ field, message: 'expected a valid URL' });
        }
      } else if (rules.type === 'email' && !/^[^@]+@[^@]+\.[^@]+$/.test(value)) {
        errors.push({ field, message: 'expected a valid email' });
      }
    }

    if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
      errors.push({ field, message: `does not match pattern: ${rules.pattern}` });
    }

    if (rules.minLength && value.length < rules.minLength) {
      errors.push({ field, message: `must be at least ${rules.minLength} characters` });
    }
  }

  return { valid: errors.length === 0, errors };
}
