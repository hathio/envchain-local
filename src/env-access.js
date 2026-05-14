import { readStore, writeStore, normalizeProjectKey } from './store.js';

/**
 * List all access rules for a project
 */
export function listAccessRules(project) {
  const store = readStore();
  const key = normalizeProjectKey(project);
  return store.access?.[key] ?? [];
}

/**
 * Grant access to a specific key or all keys (*) for a given tag/label
 */
export function grantAccess(project, secretKey, role = 'read') {
  const store = readStore();
  const key = normalizeProjectKey(project);
  if (!store.access) store.access = {};
  if (!store.access[key]) store.access[key] = [];

  const existing = store.access[key].find(
    (r) => r.secretKey === secretKey && r.role === role
  );
  if (existing) return false;

  store.access[key].push({ secretKey, role, grantedAt: Date.now() });
  writeStore(store);
  return true;
}

/**
 * Revoke access for a specific key/role combo
 */
export function revokeAccess(project, secretKey, role = 'read') {
  const store = readStore();
  const key = normalizeProjectKey(project);
  if (!store.access?.[key]) return false;

  const before = store.access[key].length;
  store.access[key] = store.access[key].filter(
    (r) => !(r.secretKey === secretKey && r.role === role)
  );
  if (store.access[key].length === before) return false;

  writeStore(store);
  return true;
}

/**
 * Check if a given secretKey has a specific role granted
 */
export function hasAccess(project, secretKey, role = 'read') {
  const rules = listAccessRules(project);
  return rules.some(
    (r) => (r.secretKey === secretKey || r.secretKey === '*') && r.role === role
  );
}

/**
 * Clear all access rules for a project
 */
export function clearAccess(project) {
  const store = readStore();
  const key = normalizeProjectKey(project);
  if (!store.access?.[key]) return false;
  delete store.access[key];
  writeStore(store);
  return true;
}
