import { getSecrets, setSecret } from './store.js';

/**
 * Merge secrets from sourceProject into targetProject.
 * @param {string} sourceProject
 * @param {string} targetProject
 * @param {object} options
 * @param {boolean} options.overwrite - overwrite existing keys in target
 * @returns {{ merged: string[], skipped: string[], added: string[] }}
 */
export function mergeSecrets(sourceProject, targetProject, options = {}) {
  const { overwrite = false } = options;

  const sourceSecrets = getSecrets(sourceProject);
  const targetSecrets = getSecrets(targetProject);

  const merged = [];
  const skipped = [];
  const added = [];

  for (const [key, value] of Object.entries(sourceSecrets)) {
    if (key in targetSecrets) {
      if (overwrite) {
        setSecret(targetProject, key, value);
        merged.push(key);
      } else {
        skipped.push(key);
      }
    } else {
      setSecret(targetProject, key, value);
      added.push(key);
    }
  }

  return { merged, skipped, added };
}

/**
 * Preview merge without writing changes.
 * @param {string} sourceProject
 * @param {string} targetProject
 * @returns {{ toAdd: string[], toOverwrite: string[], toSkip: string[] }}
 */
export function previewMerge(sourceProject, targetProject) {
  const sourceSecrets = getSecrets(sourceProject);
  const targetSecrets = getSecrets(targetProject);

  const toAdd = [];
  const toOverwrite = [];
  const toSkip = [];

  for (const key of Object.keys(sourceSecrets)) {
    if (key in targetSecrets) {
      toOverwrite.push(key);
      toSkip.push(key);
    } else {
      toAdd.push(key);
    }
  }

  return { toAdd, toOverwrite, toSkip };
}
