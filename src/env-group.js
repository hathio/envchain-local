import { readStore, writeStore, normalizeProjectKey } from './store.js';

/**
 * List all groups for a project
 */
export function listGroups(project) {
  const store = readStore();
  const key = normalizeProjectKey(project);
  const secrets = store[key] || {};
  const groups = new Set();

  for (const meta of Object.values(secrets)) {
    if (meta && meta.group) groups.add(meta.group);
  }

  return [...groups].sort();
}

/**
 * Assign a group to a secret key
 */
export function assignGroup(project, secretKey, group) {
  const store = readStore();
  const key = normalizeProjectKey(project);

  if (!store[key] || !store[key][secretKey]) {
    throw new Error(`Secret '${secretKey}' not found in project '${project}'`);
  }

  store[key][secretKey].group = group || null;
  writeStore(store);
}

/**
 * Remove group assignment from a secret key
 */
export function unassignGroup(project, secretKey) {
  assignGroup(project, secretKey, null);
}

/**
 * Get all secrets belonging to a specific group in a project
 */
export function getSecretsInGroup(project, group) {
  const store = readStore();
  const key = normalizeProjectKey(project);
  const secrets = store[key] || {};
  const result = {};

  for (const [secretKey, meta] of Object.entries(secrets)) {
    if (meta && meta.group === group) {
      result[secretKey] = meta;
    }
  }

  return result;
}

/**
 * Rename a group across all secrets in a project
 */
export function renameGroup(project, oldGroup, newGroup) {
  if (!oldGroup || !newGroup) throw new Error('Group names must not be empty');
  const store = readStore();
  const key = normalizeProjectKey(project);
  const secrets = store[key] || {};
  let changed = 0;

  for (const meta of Object.values(secrets)) {
    if (meta && meta.group === oldGroup) {
      meta.group = newGroup;
      changed++;
    }
  }

  if (changed > 0) writeStore(store);
  return changed;
}

/**
 * Delete a group — removes group assignment from all matching secrets
 */
export function deleteGroup(project, group) {
  return renameGroup(project, group, null);
}
