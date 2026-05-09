import { readStore, writeStore, normalizeProjectKey } from './store.js';

const DEFAULT_TTL_DAYS = 90;

export function setExpiry(project, key, ttlDays = DEFAULT_TTL_DAYS) {
  const store = readStore();
  const projectKey = normalizeProjectKey(project);

  if (!store[projectKey]) throw new Error(`Project not found: ${project}`);
  if (!store[projectKey].secrets?.[key]) throw new Error(`Key not found: ${key}`);

  const expiresAt = Date.now() + ttlDays * 24 * 60 * 60 * 1000;

  store[projectKey].expiry = store[projectKey].expiry || {};
  store[projectKey].expiry[key] = { expiresAt, ttlDays };

  writeStore(store);
  return expiresAt;
}

export function clearExpiry(project, key) {
  const store = readStore();
  const projectKey = normalizeProjectKey(project);

  if (!store[projectKey]?.expiry?.[key]) return false;

  delete store[projectKey].expiry[key];
  writeStore(store);
  return true;
}

export function getExpiry(project, key) {
  const store = readStore();
  const projectKey = normalizeProjectKey(project);
  return store[projectKey]?.expiry?.[key] || null;
}

export function isExpired(project, key) {
  const expiry = getExpiry(project, key);
  if (!expiry) return false;
  return Date.now() > expiry.expiresAt;
}

export function listExpiredSecrets() {
  const store = readStore();
  const results = [];

  for (const [project, data] of Object.entries(store)) {
    if (!data.expiry) continue;
    for (const [key, info] of Object.entries(data.expiry)) {
      if (Date.now() > info.expiresAt) {
        results.push({ project, key, expiresAt: info.expiresAt, ttlDays: info.ttlDays });
      }
    }
  }

  return results;
}

export function listExpiringSecrets(withinDays = 7) {
  const store = readStore();
  const threshold = Date.now() + withinDays * 24 * 60 * 60 * 1000;
  const results = [];

  for (const [project, data] of Object.entries(store)) {
    if (!data.expiry) continue;
    for (const [key, info] of Object.entries(data.expiry)) {
      if (info.expiresAt <= threshold) {
        const daysLeft = Math.ceil((info.expiresAt - Date.now()) / (24 * 60 * 60 * 1000));
        results.push({ project, key, expiresAt: info.expiresAt, daysLeft });
      }
    }
  }

  return results.sort((a, b) => a.expiresAt - b.expiresAt);
}
