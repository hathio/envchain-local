import fs from 'fs';
import path from 'path';
import { readStore, normalizeProjectKey } from './store.js';

const POLL_INTERVAL_MS = 2000;

/**
 * Get a snapshot of secrets for a given project.
 */
export function getSnapshot(projectKey) {
  const store = readStore();
  const key = normalizeProjectKey(projectKey);
  return store[key] ? { ...store[key] } : {};
}

/**
 * Compare two snapshots and return a diff summary.
 */
export function compareSnapshots(prev, next) {
  const added = [];
  const removed = [];
  const changed = [];

  for (const k of Object.keys(next)) {
    if (!(k in prev)) added.push(k);
    else if (prev[k] !== next[k]) changed.push(k);
  }

  for (const k of Object.keys(prev)) {
    if (!(k in next)) removed.push(k);
  }

  return { added, removed, changed };
}

/**
 * Watch a project's secrets for changes, calling onChange with a diff.
 * Returns a stop function.
 */
export function watchProject(projectKey, onChange) {
  let prev = getSnapshot(projectKey);

  const interval = setInterval(() => {
    const next = getSnapshot(projectKey);
    const diff = compareSnapshots(prev, next);
    const hasChanges =
      diff.added.length > 0 ||
      diff.removed.length > 0 ||
      diff.changed.length > 0;

    if (hasChanges) {
      onChange(diff, next);
      prev = next;
    }
  }, POLL_INTERVAL_MS);

  return function stop() {
    clearInterval(interval);
  };
}
