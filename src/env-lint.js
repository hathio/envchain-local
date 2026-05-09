import { readStore, normalizeProjectKey } from './store.js';

const NAMING_CONVENTIONS = {
  screaming_snake: /^[A-Z][A-Z0-9_]*$/,
  snake: /^[a-z][a-z0-9_]*$/,
  upper_camel: /^[A-Z][A-Za-z0-9]*$/,
};

const DEFAULT_CONVENTION = 'screaming_snake';

export function lintKey(key, convention = DEFAULT_CONVENTION) {
  const pattern = NAMING_CONVENTIONS[convention];
  if (!pattern) throw new Error(`Unknown convention: ${convention}`);
  return pattern.test(key);
}

export function detectIssues(key, value) {
  const issues = [];

  if (!lintKey(key)) {
    issues.push({ type: 'naming', message: `Key "${key}" does not follow SCREAMING_SNAKE_CASE convention` });
  }

  if (key.startsWith('_') || key.endsWith('_')) {
    issues.push({ type: 'naming', message: `Key "${key}" has leading or trailing underscores` });
  }

  if (value === '' || value === null || value === undefined) {
    issues.push({ type: 'empty', message: `Key "${key}" has an empty value` });
  }

  if (typeof value === 'string' && value.trim() !== value) {
    issues.push({ type: 'whitespace', message: `Key "${key}" has leading or trailing whitespace in value` });
  }

  if (typeof value === 'string' && /password|secret|token|key/i.test(key) && value.length < 8) {
    issues.push({ type: 'security', message: `Key "${key}" looks sensitive but has a short value (< 8 chars)` });
  }

  return issues;
}

export function lintProject(projectPath) {
  const store = readStore();
  const key = normalizeProjectKey(projectPath);
  const secrets = store[key] || {};

  const results = [];
  for (const [envKey, envVal] of Object.entries(secrets)) {
    const issues = detectIssues(envKey, envVal);
    if (issues.length > 0) {
      results.push({ key: envKey, issues });
    }
  }

  return results;
}

export function lintAllProjects() {
  const store = readStore();
  const report = {};

  for (const projectKey of Object.keys(store)) {
    const secrets = store[projectKey] || {};
    const results = [];
    for (const [envKey, envVal] of Object.entries(secrets)) {
      const issues = detectIssues(envKey, envVal);
      if (issues.length > 0) {
        results.push({ key: envKey, issues });
      }
    }
    if (results.length > 0) {
      report[projectKey] = results;
    }
  }

  return report;
}
