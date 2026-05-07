import fs from 'fs';
import path from 'path';
import { readStore } from './store.js';
import { logEvent } from './audit.js';

export function getBackupDir() {
  return path.join(process.env.HOME || process.env.USERPROFILE, '.envchain-local', 'backups');
}

export function ensureBackupDirExists() {
  const dir = getBackupDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function createBackup(label = null) {
  const store = readStore();
  const dir = ensureBackupDirExists();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = label
    ? `backup-${label}-${timestamp}.json`
    : `backup-${timestamp}.json`;
  const filepath = path.join(dir, filename);
  fs.writeFileSync(filepath, JSON.stringify(store, null, 2), 'utf8');
  logEvent('backup_created', { filename });
  return filepath;
}

export function listBackups() {
  const dir = getBackupDir();
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
    .map(f => ({
      filename: f,
      filepath: path.join(dir, f),
      createdAt: fs.statSync(path.join(dir, f)).mtime,
    }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function restoreBackup(filename) {
  const dir = getBackupDir();
  const filepath = path.join(dir, filename);
  if (!fs.existsSync(filepath)) {
    throw new Error(`Backup not found: ${filename}`);
  }
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  logEvent('backup_restored', { filename });
  return data;
}

export function deleteBackup(filename) {
  const dir = getBackupDir();
  const filepath = path.join(dir, filename);
  if (!fs.existsSync(filepath)) {
    throw new Error(`Backup not found: ${filename}`);
  }
  fs.unlinkSync(filepath);
  logEvent('backup_deleted', { filename });
}
