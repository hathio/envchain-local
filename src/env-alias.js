import { readStore, writeStore, normalizeProjectKey } from './store.js';

/**
 * List all aliases for a project
 */
export function listAliases(project) {
  const store = readStore();
  const key = normalizeProjectKey(project);
  const entry = store[key];
  if (!entry) return {};
  return entry._aliases || {};
}

/**
 * Add an alias: alias -> existing key mapping
 */
export function addAlias(project, alias, targetKey) {
  const store = readStore();
  const key = normalizeProjectKey(project);
  if (!store[key]) throw new Error(`Project not found: ${project}`);
  if (!store[key].secrets || !(targetKey in store[key].secrets)) {
    throw new Error(`Target key '${targetKey}' does not exist in project '${project}'`);
  }
  if (!store[key]._aliases) store[key]._aliases = {};
  if (store[key]._aliases[alias]) {
    throw new Error(`Alias '${alias}' already exists in project '${project}'`);
  }
  store[key]._aliases[alias] = targetKey;
  writeStore(store);
  return { alias, targetKey };
}

/**
 * Remove an alias from a project
 */
export function removeAlias(project, alias) {
  const store = readStore();
  const key = normalizeProjectKey(project);
  if (!store[key] || !store[key]._aliases || !(alias in store[key]._aliases)) {
    throw new Error(`Alias '${alias}' not found in project '${project}'`);
  }
  const targetKey = store[key]._aliases[alias];
  delete store[key]._aliases[alias];
  writeStore(store);
  return { alias, targetKey };
}

/**
 * Resolve an alias to its target key value.
 * Returns null if alias not found.
 */
export function resolveAlias(project, alias) {
  const store = readStore();
  const key = normalizeProjectKey(project);
  const entry = store[key];
  if (!entry || !entry._aliases) return null;
  const targetKey = entry._aliases[alias];
  if (!targetKey) return null;
  return { targetKey, value: entry.secrets?.[targetKey] ?? null };
}

/**
 * Expand all aliases into the secrets map for injection
 */
export function expandAliases(project, secrets) {
  const aliases = listAliases(project);
  const expanded = { ...secrets };
  for (const [alias, targetKey] of Object.entries(aliases)) {
    if (targetKey in secrets) {
      expanded[alias] = secrets[targetKey];
    }
  }
  return expanded;
}
