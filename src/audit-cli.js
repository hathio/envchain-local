import chalk from 'chalk';
import { readAuditLog, clearAuditLog } from './audit.js';

const ACTION_COLORS = {
  set: chalk.yellow,
  delete: chalk.red,
  inject: chalk.green,
  export: chalk.cyan,
  unlock: chalk.blue,
  lock: chalk.magenta,
};

function colorAction(action) {
  const fn = ACTION_COLORS[action] || chalk.white;
  return fn(action.padEnd(8));
}

export function printAuditLog(options = {}) {
  const { limit = 20 } = options;
  const entries = readAuditLog(limit);

  if (entries.length === 0) {
    console.log(chalk.dim('No audit log entries found.'));
    return;
  }

  console.log(chalk.bold(`\nAudit log — last ${entries.length} entries:\n`));

  for (const entry of entries) {
    const ts = chalk.dim(new Date(entry.timestamp).toLocaleString());
    const action = colorAction(entry.action);
    const project = chalk.white(entry.projectKey || '-');
    const extra = entry.keys ? chalk.dim(`[${entry.keys.join(', ')}]`) : '';
    console.log(`  ${ts}  ${action}  ${project}  ${extra}`);
  }

  console.log();
}

export function handleAuditCommand(argv) {
  if (argv.clear) {
    clearAuditLog();
    console.log(chalk.green('Audit log cleared.'));
    return;
  }

  const limit = parseInt(argv.limit, 10) || 20;
  printAuditLog({ limit });
}
