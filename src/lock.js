import { createHash, timingSafeEqual } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const LOCK_FILE = join(process.env.HOME || process.env.USERPROFILE, '.envchain-local', '.lock');
const SESSION_TTL_MS = 15 * 60 * 1000; // 15 minutes

export function hashPassphrase(passphrase) {
  return createHash('sha256').update(passphrase).digest('hex');
}

export function readLock() {
  if (!existsSync(LOCK_FILE)) return null;
  try {
    const raw = readFileSync(LOCK_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeLock(passphraseHash) {
  const lock = {
    hash: passphraseHash,
    unlockedAt: Date.now(),
  };
  writeFileSync(LOCK_FILE, JSON.stringify(lock), { mode: 0o600 });
}

export function clearLock() {
  if (existsSync(LOCK_FILE)) {
    writeFileSync(LOCK_FILE, JSON.stringify({}));
  }
}

export function isUnlocked(passphrase) {
  const lock = readLock();
  if (!lock || !lock.hash || !lock.unlockedAt) return false;

  const now = Date.now();
  if (now - lock.unlockedAt > SESSION_TTL_MS) {
    clearLock();
    return false;
  }

  const inputHash = hashPassphrase(passphrase);
  const a = Buffer.from(inputHash);
  const b = Buffer.from(lock.hash);
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

export function unlock(passphrase) {
  const hash = hashPassphrase(passphrase);
  writeLock(hash);
}
