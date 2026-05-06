const fs = require('fs');
const path = require('path');
const os = require('os');

const STORE_DIR = path.join(os.homedir(), '.envchain-local');
const STORE_FILE = path.join(STORE_DIR, 'secrets.json');

function ensureStoreExists() {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true, mode: 0o700 });
  }
  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(STORE_FILE, JSON.stringify({}), { mode: 0o600 });
  }
}

function readStore() {
  ensureStoreExists();
  const raw = fs.readFileSync(STORE_FILE, 'utf8');
  return JSON.parse(raw);
}

function writeStore(data) {
  ensureStoreExists();
  fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), { mode: 0o600 });
}

function normalizeProjectKey(projectPath) {
  return path.resolve(projectPath);
}

function getSecrets(projectPath) {
  const store = readStore();
  const key = normalizeProjectKey(projectPath);
  return store[key] || {};
}

function setSecret(projectPath, name, value) {
  const store = readStore();
  const key = normalizeProjectKey(projectPath);
  if (!store[key]) store[key] = {};
  store[key][name] = value;
  writeStore(store);
}

function deleteSecret(projectPath, name) {
  const store = readStore();
  const key = normalizeProjectKey(projectPath);
  if (!store[key] || !(name in store[key])) return false;
  delete store[key][name];
  if (Object.keys(store[key]).length === 0) delete store[key];
  writeStore(store);
  return true;
}

function listProjects() {
  const store = readStore();
  return Object.keys(store);
}

module.exports = { getSecrets, setSecret, deleteSecret, listProjects, STORE_FILE };
