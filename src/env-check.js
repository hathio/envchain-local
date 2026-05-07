import { getSecrets } from './store.js';
import { normalizeProjectKey } from './store.js';

/**
 * Check which required env vars are missing for a project
 */
export function checkMissingKeys(projectPath, requiredKeys, secrets) {
  return requiredKeys.filter(key => !(key in secrets));
}

/**
 * Check which keys are present but have empty/blank values
 */
export function checkEmptyValues(secrets) {
  return Object.entries(secrets)
    .filter(([, val]) => !val || val.trim() === '')
    .map(([key]) => key);
}

/**
 * Validate secrets against a list of required keys
 * Returns a report object
 */
export function validateSecrets(projectPath, requiredKeys, secrets) {
  const missing = checkMissingKeys(projectPath, requiredKeys, secrets);
  const empty = checkEmptyValues(secrets);
  const present = requiredKeys.filter(k => k in secrets && secrets[k]?.trim() !== '');

  return {
    project: normalizeProjectKey(projectPath),
    total: requiredKeys.length,
    present,
    missing,
    empty: empty.filter(k => requiredKeys.includes(k)),
    ok: missing.length === 0 && empty.filter(k => requiredKeys.includes(k)).length === 0,
  };
}

/**
 * Parse a .env.required or similar file listing required keys (one per line, # comments)
 */
export function parseRequiredKeysFile(content) {
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split('=')[0].trim());
}

/**
 * Run a full env check for a project given its secrets and required keys
 */
export async function runEnvCheck(projectPath, requiredKeys) {
  const secrets = await getSecrets(projectPath);
  return validateSecrets(projectPath, requiredKeys, secrets);
}
