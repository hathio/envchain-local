import { readStore, writeStore, normalizeProjectKey } from './store.js';
import { encrypt, decrypt } from './crypto.js';
import { logEvent } from './audit.js';

/**
 * Re-encrypts all secrets for a project with a new passphrase.
 * Returns the number of secrets rotated.
 */
export async function rotateSecrets(projectPath, oldKey, newKey) {
  const store = readStore();
  const projectKey = normalizeProjectKey(projectPath);

  if (!store[projectKey]) {
    throw new Error(`No secrets found for project: ${projectKey}`);
  }

  const secrets = store[projectKey];
  const rotated = {};
  let count = 0;

  for (const [name, encryptedValue] of Object.entries(secrets)) {
    const plaintext = decrypt(encryptedValue, oldKey);
    rotated[name] = encrypt(plaintext, newKey);
    count++;
  }

  store[projectKey] = rotated;
  writeStore(store);

  logEvent('rotate', { project: projectKey, count });
  return count;
}

/**
 * Rotate a single secret by name.
 */
export async function rotateSecret(projectPath, name, oldKey, newKey) {
  const store = readStore();
  const projectKey = normalizeProjectKey(projectPath);

  if (!store[projectKey]?.[name]) {
    throw new Error(`Secret "${name}" not found in project: ${projectKey}`);
  }

  const plaintext = decrypt(store[projectKey][name], oldKey);
  store[projectKey][name] = encrypt(plaintext, newKey);
  writeStore(store);

  logEvent('rotate-single', { project: projectKey, name });
  return true;
}
