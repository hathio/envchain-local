import { diffSecrets, loadSecretsFromFile } from './diff.js';
import { readStore } from './store.js';
import chalk from 'chalk';

const colorAdded = (s) => chalk.green(s);
const colorRemoved = (s) => chalk.red(s);
const colorChanged = (s) => chalk.yellow(s);
const colorKey = (s) => chalk.cyan(s);

function printDiff(diff) {
  if (diff.length === 0) {
    console.log(chalk.gray('No differences found.'));
    return;
  }

  for (const entry of diff) {
    const key = colorKey(entry.key);
    if (entry.type === 'added') {
      console.log(`${colorAdded('+')} ${key}: ${colorAdded(entry.newValue)}`);
    } else if (entry.type === 'removed') {
      console.log(`${colorRemoved('-')} ${key}: ${colorRemoved(entry.oldValue)}`);
    } else if (entry.type === 'changed') {
      console.log(`${colorChanged('~')} ${key}: ${colorRemoved(entry.oldValue)} → ${colorAdded(entry.newValue)}`);
    }
  }
}

export async function handleDiffCommand(args) {
  const [subcommand, ...rest] = args;

  if (subcommand === 'file') {
    const [project, filePath] = rest;
    if (!project || !filePath) {
      console.error('Usage: envchain diff file <project> <file>');
      process.exit(1);
    }
    const store = readStore();
    const projectSecrets = store[project] || {};
    const fileSecrets = loadSecretsFromFile(filePath);
    const diff = diffSecrets(projectSecrets, fileSecrets);
    console.log(`Diff for project ${chalk.bold(project)} vs ${filePath}:`);
    printDiff(diff);

  } else if (subcommand === 'projects') {
    const [projectA, projectB] = rest;
    if (!projectA || !projectB) {
      console.error('Usage: envchain diff projects <projectA> <projectB>');
      process.exit(1);
    }
    const store = readStore();
    const secretsA = store[projectA] || {};
    const secretsB = store[projectB] || {};
    const diff = diffSecrets(secretsA, secretsB);
    console.log(`Diff between ${chalk.bold(projectA)} and ${chalk.bold(projectB)}:`);
    printDiff(diff);

  } else {
    console.error('Usage: envchain diff <file|projects> ...');
    process.exit(1);
  }
}
