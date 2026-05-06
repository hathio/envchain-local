'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const STORE_PATH = process.env.ENVCHAIN_STORE_PATH ||
  path.join(os.homedir(), '.envchain-local', 'store.json');

function ensureStoreExists() {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, JSON.stringify({}), 'utf8');
  }
}

function readStore() {
  ensureStoreExists();
  const raw = fs.readFileSync(STORE_PATH, 'utf8');
  return JSON.parse(raw);
}

function writeStore(data) {
  ensureStoreExists();
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf8');
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
  if (store[key]) {
    delete store[key][name];
    if (Object.keys(store[key]).length === 0) {
      delete store[key];
    }
    writeStore(store);
  }
}

function listProjects() {
  const store = readStore();
  return Object.keys(store);
}

module.exports = {
  ensureStoreExists,
  readStore,
  writeStore,
  normalizeProjectKey,
  getSecrets,
  setSecret,
  deleteSecret,
  listProjects,
};
