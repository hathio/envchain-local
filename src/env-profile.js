import fs from 'fs';
import path from 'path';
import os from 'os';
import { readStore, writeStore, normalizeProjectKey } from './store.js';

const PROFILES_META_KEY = '__profiles__';

export function listProfiles(projectKey) {
  const store = readStore();
  const key = normalizeProjectKey(projectKey);
  const meta = store[key]?.[PROFILES_META_KEY] || {};
  return Object.keys(meta);
}

export function getActiveProfile(projectKey) {
  const store = readStore();
  const key = normalizeProjectKey(projectKey);
  return store[key]?.[PROFILES_META_KEY]?.active || 'default';
}

export function setActiveProfile(projectKey, profileName) {
  const store = readStore();
  const key = normalizeProjectKey(projectKey);
  if (!store[key]) throw new Error(`Project not found: ${projectKey}`);
  if (!store[key][PROFILES_META_KEY]) store[key][PROFILES_META_KEY] = {};
  const profiles = store[key][PROFILES_META_KEY].names || [];
  if (profileName !== 'default' && !profiles.includes(profileName)) {
    throw new Error(`Profile not found: ${profileName}`);
  }
  store[key][PROFILES_META_KEY].active = profileName;
  writeStore(store);
}

export function createProfile(projectKey, profileName, secrets = {}) {
  if (profileName === PROFILES_META_KEY) throw new Error('Reserved profile name.');
  const store = readStore();
  const key = normalizeProjectKey(projectKey);
  if (!store[key]) store[key] = {};
  if (!store[key][PROFILES_META_KEY]) store[key][PROFILES_META_KEY] = { names: [], active: 'default' };
  const meta = store[key][PROFILES_META_KEY];
  if (!meta.names.includes(profileName)) meta.names.push(profileName);
  store[key][`${PROFILES_META_KEY}:${profileName}`] = secrets;
  writeStore(store);
}

export function deleteProfile(projectKey, profileName) {
  if (profileName === 'default') throw new Error('Cannot delete the default profile.');
  const store = readStore();
  const key = normalizeProjectKey(projectKey);
  const meta = store[key]?.[PROFILES_META_KEY];
  if (!meta) throw new Error(`No profiles found for: ${projectKey}`);
  meta.names = meta.names.filter(n => n !== profileName);
  delete store[key][`${PROFILES_META_KEY}:${profileName}`];
  if (meta.active === profileName) meta.active = 'default';
  writeStore(store);
}

export function getProfileSecrets(projectKey, profileName) {
  const store = readStore();
  const key = normalizeProjectKey(projectKey);
  if (profileName === 'default') {
    const raw = store[key] || {};
    return Object.fromEntries(
      Object.entries(raw).filter(([k]) => !k.startsWith(PROFILES_META_KEY))
    );
  }
  return store[key]?.[`${PROFILES_META_KEY}:${profileName}`] || {};
}
