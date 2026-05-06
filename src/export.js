import { getSecrets } from './store.js';
import { normalizeProjectKey } from './store.js';
import path from 'path';

/**
 * Format secrets as shell export statements
 */
export function formatAsShellExports(secrets) {
  return Object.entries(secrets)
    .map(([key, value]) => `export ${key}=${shellEscape(value)}`)
    .join('\n');
}

/**
 * Format secrets as dotenv file content
 */
export function formatAsDotenv(secrets) {
  return Object.entries(secrets)
    .map(([key, value]) => `${key}=${dotenvEscape(value)}`)
    .join('\n');
}

/**
 * Format secrets as JSON
 */
export function formatAsJson(secrets) {
  return JSON.stringify(secrets, null, 2);
}

/**
 * Export secrets for a given project directory in the requested format
 */
export function exportSecrets(projectDir, format = 'shell') {
  const projectKey = normalizeProjectKey(projectDir || process.cwd());
  const secrets = getSecrets(projectKey);

  if (!secrets || Object.keys(secrets).length === 0) {
    return null;
  }

  switch (format) {
    case 'shell':
      return formatAsShellExports(secrets);
    case 'dotenv':
      return formatAsDotenv(secrets);
    case 'json':
      return formatAsJson(secrets);
    default:
      throw new Error(`Unknown export format: ${format}`);
  }
}

function shellEscape(value) {
  // Wrap in single quotes and escape any single quotes within
  return `'${String(value).replace(/'/g, "'\\''")}' `;
}

function dotenvEscape(value) {
  const str = String(value);
  // Quote if contains spaces, special chars, or is empty
  if (/[\s"'\\#=]/.test(str) || str === '') {
    return `"${str.replace(/"/g, '\\"')}"`;
  }
  return str;
}
