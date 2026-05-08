import { readStore, writeStore, normalizeProjectKey } from './store.js';

/**
 * Copy secrets from one project to another.
 * @param {string} sourceProject
 * @param {string} targetProject
 * @param {string[]} [keys] - specific keys to copy, or all if omitted
 * @param {object} [options]
 * @param {boolean} [options.overwrite=false] - overwrite existing keys in target
 * @returns {{ copied: string[], skipped: string[] }}
 */
export function copySecrets(sourceProject, targetProject, keys = null, options = {}) {
  const { overwrite = false } = options;
  const store = readStore();

  const sourceKey = normalizeProjectKey(sourceProject);
  const targetKey = normalizeProjectKey(targetProject);

  const sourceSecrets = store[sourceKey];
  if (!sourceSecrets || Object.keys(sourceSecrets).length === 0) {
    throw new Error(`No secrets found for project: ${sourceProject}`);
  }

  const targetSecrets = store[targetKey] || {};

  const keysToCopy = keys && keys.length > 0
    ? keys
    : Object.keys(sourceSecrets);

  const copied = [];
  const skipped = [];

  for (const key of keysToCopy) {
    if (!(key in sourceSecrets)) {
      skipped.push(key);
      continue;
    }
    if (!overwrite && key in targetSecrets) {
      skipped.push(key);
      continue;
    }
    targetSecrets[key] = sourceSecrets[key];
    copied.push(key);
  }

  if (copied.length > 0) {
    store[targetKey] = targetSecrets;
    writeStore(store);
  }

  return { copied, skipped };
}

/**
 * Move secrets from one project to another (copy + delete from source).
 */
export function moveSecrets(sourceProject, targetProject, keys = null, options = {}) {
  const result = copySecrets(sourceProject, targetProject, keys, options);

  if (result.copied.length > 0) {
    const store = readStore();
    const sourceKey = normalizeProjectKey(sourceProject);
    for (const key of result.copied) {
      delete store[sourceKey][key];
    }
    if (Object.keys(store[sourceKey]).length === 0) {
      delete store[sourceKey];
    }
    writeStore(store);
  }

  return result;
}
