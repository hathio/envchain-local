import fs from 'fs';
import path from 'path';

/**
 * Compare two flat secret objects and return a list of differences.
 * @param {Record<string,string>} base
 * @param {Record<string,string>} target
 * @returns {Array<{type: 'added'|'removed'|'changed', key: string, oldValue?: string, newValue?: string}>}
 */
export function diffSecrets(base, target) {
  const diff = [];
  const allKeys = new Set([...Object.keys(base), ...Object.keys(target)]);

  for (const key of allKeys) {
    const inBase = Object.prototype.hasOwnProperty.call(base, key);
    const inTarget = Object.prototype.hasOwnProperty.call(target, key);

    if (inBase && !inTarget) {
      diff.push({ type: 'removed', key, oldValue: base[key] });
    } else if (!inBase && inTarget) {
      diff.push({ type: 'added', key, newValue: target[key] });
    } else if (base[key] !== target[key]) {
      diff.push({ type: 'changed', key, oldValue: base[key], newValue: target[key] });
    }
  }

  return diff.sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * Load secrets from a .env or .json file into a flat object.
 * @param {string} filePath
 * @returns {Record<string,string>}
 */
export function loadSecretsFromFile(filePath) {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) {
    throw new Error(`File not found: ${abs}`);
  }

  const content = fs.readFileSync(abs, 'utf8');
  const ext = path.extname(abs).toLowerCase();

  if (ext === '.json') {
    const parsed = JSON.parse(content);
    return Object.fromEntries(
      Object.entries(parsed).map(([k, v]) => [k, String(v)])
    );
  }

  // Default: parse as .env
  const result = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    result[key] = value;
  }
  return result;
}
