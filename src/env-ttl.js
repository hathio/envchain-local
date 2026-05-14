import { readStore, writeStore, normalizeProjectKey } from './store.js';

const TTL_META_KEY = '__ttl__';

export function setTTL(project, key, seconds) {
  const store = readStore();
  const projectKey = normalizeProjectKey(project);

  if (!store[projectKey]) {
    throw new Error(`Project "${project}" not found`);
  }

  if (!(key in store[projectKey])) {
    throw new Error(`Key "${key}" not found in project "${project}"`);
  }

  if (!store[projectKey][TTL_META_KEY]) {
    store[projectKey][TTL_META_KEY] = {};
  }

  const expiresAt = Date.now() + seconds * 1000;
  store[projectKey][TTL_META_KEY][key] = expiresAt;
  writeStore(store);
  return expiresAt;
}

export function clearTTL(project, key) {
  const store = readStore();
  const projectKey = normalizeProjectKey(project);

  if (!store[projectKey]?.[TTL_META_KEY]?.[key]) return false;

  delete store[projectKey][TTL_META_KEY][key];
  writeStore(store);
  return true;
}

export function getTTL(project, key) {
  const store = readStore();
  const projectKey = normalizeProjectKey(project);
  const expiresAt = store[projectKey]?.[TTL_META_KEY]?.[key];
  if (!expiresAt) return null;
  const remainingMs = expiresAt - Date.now();
  return { expiresAt, remainingMs, expired: remainingMs <= 0 };
}

export function purgeExpiredTTLs(project) {
  const store = readStore();
  const projectKey = normalizeProjectKey(project);
  const meta = store[projectKey]?.[TTL_META_KEY];
  if (!meta) return [];

  const purged = [];
  const now = Date.now();

  for (const [key, expiresAt] of Object.entries(meta)) {
    if (expiresAt <= now) {
      delete store[projectKey][key];
      delete store[projectKey][TTL_META_KEY][key];
      purged.push(key);
    }
  }

  if (purged.length > 0) writeStore(store);
  return purged;
}

export function listTTLs(project) {
  const store = readStore();
  const projectKey = normalizeProjectKey(project);
  const meta = store[projectKey]?.[TTL_META_KEY] ?? {};
  const now = Date.now();

  return Object.entries(meta).map(([key, expiresAt]) => ({
    key,
    expiresAt,
    remainingMs: expiresAt - now,
    expired: expiresAt <= now,
  }));
}
