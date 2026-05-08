import { readStore, writeStore, normalizeProjectKey } from './store.js';

/**
 * List all tags for a project
 */
export function listTags(project) {
  const store = readStore();
  const key = normalizeProjectKey(project);
  const entry = store[key];
  if (!entry) return [];
  return entry.tags || [];
}

/**
 * Add a tag to a project
 */
export function addTag(project, tag) {
  const store = readStore();
  const key = normalizeProjectKey(project);
  if (!store[key]) throw new Error(`Project not found: ${project}`);
  const tags = store[key].tags || [];
  if (tags.includes(tag)) return false; // already exists
  store[key].tags = [...tags, tag];
  writeStore(store);
  return true;
}

/**
 * Remove a tag from a project
 */
export function removeTag(project, tag) {
  const store = readStore();
  const key = normalizeProjectKey(project);
  if (!store[key]) throw new Error(`Project not found: ${project}`);
  const tags = store[key].tags || [];
  if (!tags.includes(tag)) return false;
  store[key].tags = tags.filter(t => t !== tag);
  writeStore(store);
  return true;
}

/**
 * Find all projects that have a given tag
 */
export function findByTag(tag) {
  const store = readStore();
  return Object.entries(store)
    .filter(([, entry]) => Array.isArray(entry.tags) && entry.tags.includes(tag))
    .map(([key]) => key);
}

/**
 * List all unique tags across all projects
 */
export function listAllTags() {
  const store = readStore();
  const tagSet = new Set();
  for (const entry of Object.values(store)) {
    if (Array.isArray(entry.tags)) {
      entry.tags.forEach(t => tagSet.add(t));
    }
  }
  return [...tagSet].sort();
}
