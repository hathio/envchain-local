import { lintProject, lintAllProjects } from './env-lint.js';
import { normalizeProjectKey } from './store.js';

const SEVERITY_COLORS = {
  error: '\x1b[31m',
  warning: '\x1b[33m',
  info: '\x1b[36m',
  reset: '\x1b[0m',
};

export function colorSeverity(severity) {
  const color = SEVERITY_COLORS[severity] ?? SEVERITY_COLORS.reset;
  return `${color}${severity.toUpperCase()}${SEVERITY_COLORS.reset}`;
}

export function printLintResults(results) {
  if (!results || results.length === 0) {
    console.log('\x1b[32m✔ No lint issues found.\x1b[0m');
    return 0;
  }

  let errorCount = 0;
  let warnCount = 0;

  for (const issue of results) {
    const tag = colorSeverity(issue.severity);
    const proj = issue.project ? `\x1b[35m[${issue.project}]\x1b[0m ` : '';
    const key = issue.key ? `\x1b[33m${issue.key}\x1b[0m: ` : '';
    console.log(`  ${tag} ${proj}${key}${issue.message}`);
    if (issue.severity === 'error') errorCount++;
    else if (issue.severity === 'warning') warnCount++;
  }

  console.log(`\n${results.length} issue(s): ${errorCount} error(s), ${warnCount} warning(s)`);
  return errorCount > 0 ? 1 : 0;
}

export async function handleLintCommand(args) {
  const all = args.includes('--all');
  const projectArg = args.find((a) => !a.startsWith('--'));

  if (all) {
    console.log('Linting all projects...\n');
    const results = await lintAllProjects();
    const grouped = {};
    for (const issue of results) {
      const p = issue.project ?? '(unknown)';
      grouped[p] = grouped[p] ?? [];
      grouped[p].push(issue);
    }
    let exitCode = 0;
    for (const [proj, issues] of Object.entries(grouped)) {
      console.log(`\x1b[35m${proj}\x1b[0m`);
      const code = printLintResults(issues);
      if (code !== 0) exitCode = code;
    }
    return exitCode;
  }

  const project = projectArg ? normalizeProjectKey(projectArg) : normalizeProjectKey(process.cwd());
  console.log(`Linting project: \x1b[35m${project}\x1b[0m\n`);
  const results = await lintProject(project);
  return printLintResults(results);
}
