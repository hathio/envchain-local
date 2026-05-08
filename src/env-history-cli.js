import chalk from 'chalk';
import path from 'path';
import { listBackups } from './backup.js';
import { getHistoryForProject, diffHistoryEntry } from './env-history.js';

export function printHistory(projectKey, history) {
  if (history.length === 0) {
    console.log(chalk.yellow(`No history found for project: ${projectKey}`));
    return;
  }
  console.log(chalk.bold(`\nHistory for ${chalk.cyan(projectKey)}:\n`));
  for (const entry of history) {
    const label = entry.label ? chalk.gray(` (${entry.label})`) : '';
    console.log(`  ${chalk.dim(entry.timestamp)}${label} — ${chalk.green(entry.count)} keys: ${entry.keys.join(', ')}`);
  }
}

export function printHistoryDiff(projectKey, backupPath) {
  const changes = diffHistoryEntry(projectKey, backupPath);
  console.log(chalk.bold(`\nDiff for ${chalk.cyan(projectKey)} vs backup:\n`));
  for (const change of changes) {
    if (change.status === 'added') {
      console.log(`  ${chalk.green('+')} ${change.key}`);
    } else if (change.status === 'removed') {
      console.log(`  ${chalk.red('-')} ${change.key}`);
    } else {
      console.log(`  ${chalk.dim('=')} ${change.key}`);
    }
  }
}

export function handleHistoryCommand(args) {
  const [sub, projectKey, backupPath] = args;

  if (!projectKey) {
    console.error(chalk.red('Usage: envchain history <list|diff> <project> [backupPath]'));
    process.exit(1);
  }

  if (sub === 'list') {
    const { getHistoryForProject: ghfp } = require('./env-history.js');
    const history = getHistoryForProject(projectKey);
    printHistory(projectKey, history);
  } else if (sub === 'diff') {
    if (!backupPath) {
      console.error(chalk.red('diff requires a backup path'));
      process.exit(1);
    }
    printHistoryDiff(projectKey, backupPath);
  } else {
    console.error(chalk.red(`Unknown history subcommand: ${sub}`));
    process.exit(1);
  }
}
