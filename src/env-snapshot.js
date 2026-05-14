import { readStore } from './store.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

const SNAPSHOT_DIR = path.join(os.homedir(), '.envchain-local', 'snapshots');

export function getSnapshotDir() {
  return SNAPSHOT_DIR;
}

export function ensureSnapshotDirExists() {
  if (!fs.existsSync(SNAPSHOT_DIR)) {
    fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
  }
}

export function createSnapshot(label = null) {
  ensureSnapshotDirExists();
  const store = readStore();
  const timestamp = Date.now();
  const name = label ? `${timestamp}-${label}` : `${timestamp}`;
  const snapshotPath = path.join(SNAPSHOT_DIR, `${name}.json`);
  const snapshot = {
    createdAt: new Date(timestamp).toISOString(),
    label: label || null,
    store,
  };
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2), 'utf8');
  return { name, path: snapshotPath, createdAt: snapshot.createdAt };
}

export function listSnapshots() {
  ensureSnapshotDirExists();
  const files = fs.readdirSync(SNAPSHOT_DIR).filter(f => f.endsWith('.json'));
  return files
    .map(f => {
      const raw = JSON.parse(fs.readFileSync(path.join(SNAPSHOT_DIR, f), 'utf8'));
      return {
        name: f.replace('.json', ''),
        label: raw.label || null,
        createdAt: raw.createdAt,
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function loadSnapshot(name) {
  const snapshotPath = path.join(SNAPSHOT_DIR, `${name}.json`);
  if (!fs.existsSync(snapshotPath)) {
    throw new Error(`Snapshot not found: ${name}`);
  }
  return JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
}

export function deleteSnapshot(name) {
  const snapshotPath = path.join(SNAPSHOT_DIR, `${name}.json`);
  if (!fs.existsSync(snapshotPath)) {
    throw new Error(`Snapshot not found: ${name}`);
  }
  fs.unlinkSync(snapshotPath);
  return true;
}

export function restoreSnapshot(name, { writeStore }) {
  const snapshot = loadSnapshot(name);
  writeStore(snapshot.store);
  return snapshot;
}
