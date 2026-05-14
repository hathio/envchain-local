import { readStore, writeStore, normalizeProjectKey } from './store.js';

const PIN_META_KEY = '__pinned__';

export function listPinnedSecrets(project) {
  const store = readStore();
  const key = normalizeProjectKey(project);
  const meta = store[key]?.[PIN_META_KEY];
  if (!meta) return [];
  return Array.isArray(meta) ? meta : [];
}

export function pinSecret(project, secretKey) {
  const store = readStore();
  const key = normalizeProjectKey(project);
  if (!store[key]) throw new Error(`Project '${project}' not found.`);
  if (!store[key][secretKey]) throw new Error(`Key '${secretKey}' not found in project '${project}'.`);

  const pinned = listPinnedSecrets(project);
  if (pinned.includes(secretKey)) return false; // already pinned

  store[key][PIN_META_KEY] = [...pinned, secretKey];
  writeStore(store);
  return true;
}

export function unpinSecret(project, secretKey) {
  const store = readStore();
  const key = normalizeProjectKey(project);
  const pinned = listPinnedSecrets(project);
  const updated = pinned.filter(k => k !== secretKey);
  if (updated.length === pinned.length) return false; // not found

  store[key][PIN_META_KEY] = updated;
  writeStore(store);
  return true;
}

export function isPinned(project, secretKey) {
  return listPinnedSecrets(project).includes(secretKey);
}

export function listAllPinned() {
  const store = readStore();
  const result = {};
  for (const [key, secrets] of Object.entries(store)) {
    const pinned = secrets[PIN_META_KEY];
    if (Array.isArray(pinned) && pinned.length > 0) {
      result[key] = pinned;
    }
  }
  return result;
}
