import { listAccessRules, grantAccess, revokeAccess, clearAccess } from './env-access.js';

const COLORS = {
  role: (r) => r === 'write' ? `\x1b[33m${r}\x1b[0m` : `\x1b[36m${r}\x1b[0m`,
  key: (k) => `\x1b[32m${k}\x1b[0m`,
  project: (p) => `\x1b[35m${p}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
};

export function printAccessRules(project, rules) {
  if (rules.length === 0) {
    console.log(`No access rules for ${COLORS.project(project)}.`);
    return;
  }
  console.log(`Access rules for ${COLORS.project(project)}:`);
  for (const rule of rules) {
    const date = COLORS.dim(new Date(rule.grantedAt).toISOString());
    console.log(`  ${COLORS.key(rule.secretKey)}  [${COLORS.role(rule.role)}]  ${date}`);
  }
}

export function handleAccessCommand(argv) {
  const [sub, project, secretKey, role = 'read'] = argv;

  if (!sub || !project) {
    console.error('Usage: envchain access <list|grant|revoke|clear> <project> [key] [role]');
    process.exit(1);
  }

  switch (sub) {
    case 'list': {
      const rules = listAccessRules(project);
      printAccessRules(project, rules);
      break;
    }
    case 'grant': {
      if (!secretKey) { console.error('Missing secret key'); process.exit(1); }
      const ok = grantAccess(project, secretKey, role);
      console.log(ok
        ? `Granted ${COLORS.role(role)} on ${COLORS.key(secretKey)} for ${COLORS.project(project)}.`
        : 'Rule already exists.');
      break;
    }
    case 'revoke': {
      if (!secretKey) { console.error('Missing secret key'); process.exit(1); }
      const ok = revokeAccess(project, secretKey, role);
      console.log(ok
        ? `Revoked ${COLORS.role(role)} on ${COLORS.key(secretKey)} for ${COLORS.project(project)}.`
        : 'Rule not found.');
      break;
    }
    case 'clear': {
      const ok = clearAccess(project);
      console.log(ok
        ? `Cleared all access rules for ${COLORS.project(project)}.`
        : 'No rules found.');
      break;
    }
    default:
      console.error(`Unknown subcommand: ${sub}`);
      process.exit(1);
  }
}
