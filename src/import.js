import fs from 'fs';
import path from 'path';
import { getSecrets, setSecrets } from './store.js';

/**
 * Parse a .env file into key-value pairs
 */
export function parseDotenv(content) {
  const result = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key) result[key] = value;
  }
  return result;
}

/**
 * Parse a JSON object into key-value pairs (flat string values only)
 */
export function parseJson(content) {
  const parsed = JSON.parse(content);
  if (typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('JSON must be a flat object of string key-value pairs');
  }
  const result = {};
  for (const [k, v] of Object.entries(parsed)) {
    if (typeof v !== 'string') throw new Error(`Value for key "${k}" must be a string`);
    result[k] = v;
  }
  return result;
}

/**
 * Import secrets from a file into the store for a given project
 */
export async function importSecrets(projectKey, filePath, { overwrite = false } = {}) {
  const content = fs.readFileSync(filePath, 'utf8');
  const ext = path.extname(filePath).toLowerCase();

  let incoming;
  if (ext === '.json') {
    incoming = parseJson(content);
  } else {
    // treat as .env by default
    incoming = parseDotenv(content);
  }

  const existing = await getSecrets(projectKey);
  const merged = overwrite ? { ...existing, ...incoming } : { ...incoming, ...existing };
  const added = Object.keys(incoming).filter(k => !(k in existing));
  const skipped = Object.keys(incoming).filter(k => k in existing && !overwrite);
  const updated = Object.keys(incoming).filter(k => k in existing && overwrite);

  await setSecrets(projectKey, merged);
  return { added, skipped, updated, total: Object.keys(incoming).length };
}
