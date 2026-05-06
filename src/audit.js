import fs from 'fs';
import path from 'path';
import os from 'os';

const AUDIT_LOG_PATH = path.join(os.homedir(), '.envchain-local', 'audit.log');
const MAX_LOG_ENTRIES = 500;

export function getAuditLogPath() {
  return AUDIT_LOG_PATH;
}

export function logEvent(action, projectKey, details = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    action,
    projectKey,
    user: os.userInfo().username,
    pid: process.pid,
    ...details,
  };

  const logDir = path.dirname(AUDIT_LOG_PATH);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const line = JSON.stringify(entry) + '\n';
  fs.appendFileSync(AUDIT_LOG_PATH, line, { mode: 0o600 });

  trimLogIfNeeded();
}

export function readAuditLog(limit = 50) {
  if (!fs.existsSync(AUDIT_LOG_PATH)) return [];

  const raw = fs.readFileSync(AUDIT_LOG_PATH, 'utf8');
  const lines = raw.trim().split('\n').filter(Boolean);
  const parsed = lines.map((line) => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);

  return parsed.slice(-limit);
}

export function clearAuditLog() {
  if (fs.existsSync(AUDIT_LOG_PATH)) {
    fs.writeFileSync(AUDIT_LOG_PATH, '', { mode: 0o600 });
  }
}

function trimLogIfNeeded() {
  if (!fs.existsSync(AUDIT_LOG_PATH)) return;

  const raw = fs.readFileSync(AUDIT_LOG_PATH, 'utf8');
  const lines = raw.trim().split('\n').filter(Boolean);

  if (lines.length > MAX_LOG_ENTRIES) {
    const trimmed = lines.slice(-MAX_LOG_ENTRIES).join('\n') + '\n';
    fs.writeFileSync(AUDIT_LOG_PATH, trimmed, { mode: 0o600 });
  }
}
