import { readStore, normalizeProjectKey } from './store.js';

/**
 * Search for secrets across all projects by key name or value pattern.
 * Returns matches without revealing full values (truncated for safety).
 */
export function searchByKey(store, query) {
  const results = [];
  const lowerQuery = query.toLowerCase();

  for (const [project, secrets] of Object.entries(store)) {
    for (const key of Object.keys(secrets)) {
      if (key.toLowerCase().includes(lowerQuery)) {
        results.push({ project, key });
      }
    }
  }

  return results;
}

export function searchByProject(store, projectQuery) {
  const results = [];
  const lowerQuery = projectQuery.toLowerCase();

  for (const [project, secrets] of Object.entries(store)) {
    if (project.toLowerCase().includes(lowerQuery)) {
      const keys = Object.keys(secrets);
      results.push({ project, keys });
    }
  }

  return results;
}

export function listAllProjects(store) {
  return Object.keys(store).map((project) => ({
    project,
    count: Object.keys(store[project]).length,
  }));
}

export function listProjectKeys(store, projectPath) {
  const key = normalizeProjectKey(projectPath);
  const secrets = store[key];
  if (!secrets) return null;
  return Object.keys(secrets);
}

export async function handleSearch(args) {
  const store = await readStore();

  if (args.includes('--projects') || args.includes('-p')) {
    const projects = listAllProjects(store);
    if (projects.length === 0) {
      console.log('No projects found.');
      return;
    }
    for (const { project, count } of projects) {
      console.log(`  ${project}  (${count} secret${count !== 1 ? 's' : ''})`);
    }
    return;
  }

  const query = args[0];
  if (!query) {
    console.error('Usage: envchain search <query> [--projects]');
    process.exit(1);
  }

  const results = searchByKey(store, query);
  if (results.length === 0) {
    console.log(`No secrets found matching "${query}".`);
    return;
  }

  for (const { project, key } of results) {
    console.log(`  [${project}]  ${key}`);
  }
}
