import fs from 'fs';
import path from 'path';
import { readStore } from './store.js';
import { getBackupDir, listBackups } from './backup.js';

export function getHistoryForProject(projectKey) {
  const backups = listBackups();
  const history = [];

  for (const backup of backups) {
    try {
      const raw = fs.readFileSync(backup.path, 'utf8');
      const store = JSON.parse(raw);
      const secrets = store[projectKey];
      if (secrets) {
        history.push({
          timestamp: backup.timestamp,
          label: backup.label,
          keys: Object.keys(secrets),
          count: Object.keys(secrets).length,
        });
      }
    } catch {
      // skip unreadable backups
    }
  }

  return history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export function diffHistoryEntry(projectKey, backupPath) {
  const current = readStore();
  const currentSecrets = current[projectKey] || {};

  let historical = {};
  try {
    const raw = fs.readFileSync(backupPath, 'utf8');
    const store = JSON.parse(raw);
    historical = store[projectKey] || {};
  } catch {
    throw new Error(`Could not read backup at ${backupPath}`);
  }

  const currentKeys = new Set(Object.keys(currentSecrets));
  const historicalKeys = new Set(Object.keys(historical));
  const allKeys = new Set([...currentKeys, ...historicalKeys]);

  const changes = [];
  for (const key of allKeys) {
    if (!historicalKeys.has(key)) changes.push({ key, status: 'added' });
    else if (!currentKeys.has(key)) changes.push({ key, status: 'removed' });
    else changes.push({ key, status: 'unchanged' });
  }

  return changes;
}

export function restoreProjectFromHistory(projectKey, backupPath) {
  const store = readStore();
  let historical = {};
  try {
    const raw = fs.readFileSync(backupPath, 'utf8');
    const parsed = JSON.parse(raw);
    historical = parsed[projectKey] || {};
  } catch {
    throw new Error(`Could not read backup at ${backupPath}`);
  }

  store[projectKey] = historical;
  return store;
}
