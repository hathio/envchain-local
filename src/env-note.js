import { readStore, writeStore, normalizeProjectKey } from './store.js';

/**
 * Get the note for a specific secret in a project.
 */
export function getNote(project, key) {
  const store = readStore();
  const projectKey = normalizeProjectKey(project);
  const secrets = store[projectKey];
  if (!secrets || !secrets[key]) return null;
  return secrets[key].__note__ ?? null;
}

/**
 * Set a note on a specific secret.
 */
export function setNote(project, key, note) {
  const store = readStore();
  const projectKey = normalizeProjectKey(project);
  if (!store[projectKey] || !store[projectKey][key]) {
    throw new Error(`Secret '${key}' not found in project '${project}'`);
  }
  store[projectKey][key] = {
    ...store[projectKey][key],
    __note__: note.trim(),
  };
  writeStore(store);
}

/**
 * Remove the note from a specific secret.
 */
export function clearNote(project, key) {
  const store = readStore();
  const projectKey = normalizeProjectKey(project);
  if (!store[projectKey] || !store[projectKey][key]) {
    throw new Error(`Secret '${key}' not found in project '${project}'`);
  }
  const entry = { ...store[projectKey][key] };
  delete entry.__note__;
  store[projectKey][key] = entry;
  writeStore(store);
}

/**
 * List all secrets in a project that have notes.
 */
export function listNotes(project) {
  const store = readStore();
  const projectKey = normalizeProjectKey(project);
  const secrets = store[projectKey];
  if (!secrets) return [];
  return Object.entries(secrets)
    .filter(([, val]) => val.__note__)
    .map(([key, val]) => ({ key, note: val.__note__ }));
}

/**
 * Search all projects for secrets containing a note matching the query.
 */
export function searchNotes(query) {
  const store = readStore();
  const results = [];
  for (const [project, secrets] of Object.entries(store)) {
    for (const [key, val] of Object.entries(secrets)) {
      if (val.__note__ && val.__note__.toLowerCase().includes(query.toLowerCase())) {
        results.push({ project, key, note: val.__note__ });
      }
    }
  }
  return results;
}
