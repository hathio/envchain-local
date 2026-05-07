import { getSecrets } from './store.js';

/**
 * Replace {{KEY}} placeholders in a template string with secret values.
 */
export function renderTemplate(templateStr, secrets) {
  return templateStr.replace(/\{\{\s*([A-Z0-9_]+)\s*\}\}/g, (match, key) => {
    if (Object.prototype.hasOwnProperty.call(secrets, key)) {
      return secrets[key];
    }
    return match; // leave unreplaced if key not found
  });
}

/**
 * Find all placeholder keys in a template string.
 */
export function extractPlaceholders(templateStr) {
  const keys = new Set();
  const re = /\{\{\s*([A-Z0-9_]+)\s*\}\}/g;
  let m;
  while ((m = re.exec(templateStr)) !== null) {
    keys.add(m[1]);
  }
  return [...keys];
}

/**
 * Validate that all placeholders in a template are satisfied by the given secrets.
 * Returns an array of missing keys.
 */
export function validateTemplate(templateStr, secrets) {
  const placeholders = extractPlaceholders(templateStr);
  return placeholders.filter(key => !Object.prototype.hasOwnProperty.call(secrets, key));
}

/**
 * Render a template file for a given project, injecting its secrets.
 */
export async function renderTemplateForProject(projectKey, templateStr, passphrase) {
  const secrets = await getSecrets(projectKey, passphrase);
  const missing = validateTemplate(templateStr, secrets);
  if (missing.length > 0) {
    throw new Error(`Template references unknown keys: ${missing.join(', ')}`);
  }
  return renderTemplate(templateStr, secrets);
}
