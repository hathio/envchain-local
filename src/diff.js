import { getSecrets } from './store.js';
import { parseDotenv, parseJson } from './import.js';
import { readFileSync } from 'fs';
import { extname } from 'path';

/**
 * Compare stored secrets for a project against a file or object.
 * Returns { added, removed, changed, unchanged } keys.
 */
export function diffSecrets(stored, incoming) {
  const storedKeys = new Set(Object.keys(stored));
  const incomingKeys = new Set(Object.keys(incoming));

  const added = [...incomingKeys].filter(k => !storedKeys.has(k));
  const removed = [...storedKeys].filter(k => !incomingKeys.has(k));
  const changed = [...incomingKeys].filter(
    k => storedKeys.has(k) && stored[k] !== incoming[k]
  );
  const unchanged = [...incomingKeys].filter(
    k => storedKeys.has(k) && stored[k] === incoming[k]
  );

  return { added, removed, changed, unchanged };
}

/**
 * Load secrets from a file based on its extension (.env or .json).
 */
export function loadSecretsFromFile(filePath) {
  const raw = readFileSync(filePath, 'utf-8');
  const ext = extname(filePath).toLowerCase();
  if (ext === '.json') {
    return parseJson(raw);
  }
  // default: treat as dotenv
  return parseDotenv(raw);
}

/**
 * High-level diff: compare a project's stored secrets against a file.
 */
export async function diffProjectAgainstFile(project, filePath, passphrase) {
  const stored = await getSecrets(project, passphrase);
  const incoming = loadSecretsFromFile(filePath);
  return diffSecrets(stored, incoming);
}
