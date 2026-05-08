import { readStore, writeStore, normalizeProjectKey } from './store.js';

/**
 * Rename a secret key within a project.
 * @param {string} project
 * @param {string} oldKey
 * @param {string} newKey
 * @param {{ overwrite?: boolean }} options
 * @returns {{ renamed: boolean, reason?: string }}
 */
export function renameSecret(project, oldKey, newKey, options = {}) {
  const { overwrite = false } = options;
  const projectKey = normalizeProjectKey(project);
  const store = readStore();

  const secrets = store[projectKey];
  if (!secrets) {
    return { renamed: false, reason: `project '${project}' not found` };
  }

  if (!(oldKey in secrets)) {
    return { renamed: false, reason: `key '${oldKey}' not found in project '${project}'` };
  }

  if (oldKey === newKey) {
    return { renamed: false, reason: 'old and new key names are the same' };
  }

  if (newKey in secrets && !overwrite) {
    return { renamed: false, reason: `key '${newKey}' already exists; use --overwrite to replace it` };
  }

  const value = secrets[oldKey];

  // Preserve insertion order: rebuild object with new key in old key's position
  const updated = {};
  for (const k of Object.keys(secrets)) {
    if (k === oldKey) {
      updated[newKey] = value;
    } else if (k !== newKey) {
      updated[k] = secrets[k];
    }
  }

  store[projectKey] = updated;
  writeStore(store);

  return { renamed: true };
}

/**
 * Rename a secret key across ALL projects that contain it.
 * @param {string} oldKey
 * @param {string} newKey
 * @param {{ overwrite?: boolean }} options
 * @returns {string[]} list of project keys that were updated
 */
export function renameSecretGlobal(oldKey, newKey, options = {}) {
  const { overwrite = false } = options;
  const store = readStore();
  const updated = [];

  for (const projectKey of Object.keys(store)) {
    const secrets = store[projectKey];
    if (!(oldKey in secrets)) continue;
    if (newKey in secrets && !overwrite) continue;

    const rebuilt = {};
    for (const k of Object.keys(secrets)) {
      if (k === oldKey) {
        rebuilt[newKey] = secrets[oldKey];
      } else if (k !== newKey) {
        rebuilt[k] = secrets[k];
      }
    }
    store[projectKey] = rebuilt;
    updated.push(projectKey);
  }

  if (updated.length > 0) writeStore(store);
  return updated;
}
