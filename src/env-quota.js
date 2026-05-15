import { readStore, writeStore, normalizeProjectKey } from './store.js';

const DEFAULT_QUOTA = 100;

export function getQuota(project) {
  const store = readStore();
  const key = normalizeProjectKey(project);
  return store.__quotas?.[key] ?? DEFAULT_QUOTA;
}

export function setQuota(project, limit) {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error('Quota limit must be a positive integer');
  }
  const store = readStore();
  const key = normalizeProjectKey(project);
  if (!store.__quotas) store.__quotas = {};
  store.__quotas[key] = limit;
  writeStore(store);
}

export function clearQuota(project) {
  const store = readStore();
  const key = normalizeProjectKey(project);
  if (store.__quotas) {
    delete store.__quotas[key];
    writeStore(store);
  }
}

export function getUsage(project) {
  const store = readStore();
  const key = normalizeProjectKey(project);
  const secrets = store[key] ?? {};
  return Object.keys(secrets).length;
}

export function checkQuota(project) {
  const usage = getUsage(project);
  const limit = getQuota(project);
  return { usage, limit, exceeded: usage >= limit, available: Math.max(0, limit - usage) };
}

export function listAllQuotas() {
  const store = readStore();
  const quotas = store.__quotas ?? {};
  return Object.entries(quotas).map(([project, limit]) => ({
    project,
    limit,
    usage: getUsage(project),
  }));
}

export function enforceQuota(project) {
  const { exceeded, usage, limit } = checkQuota(project);
  if (exceeded) {
    throw new Error(`Quota exceeded for project "${project}": ${usage}/${limit} secrets`);
  }
}
