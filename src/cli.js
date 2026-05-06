#!/usr/bin/env node

'use strict';

const { program } = require('commander');
const { getSecrets, setSecret, deleteSecret, listProjects } = require('./store');
const { injectAndRun } = require('./inject');
const path = require('path');

program
  .name('envchain-local')
  .description('Lightweight local secret manager that injects env vars per project')
  .version('1.0.0');

program
  .command('set <key> <value>')
  .description('Set a secret for the current project directory')
  .option('-p, --project <project>', 'project key (defaults to current directory)')
  .action((key, value, options) => {
    const project = options.project || process.cwd();
    setSecret(project, key, value);
    console.log(`✓ Set ${key} for project ${path.basename(project)}`);
  });

program
  .command('get <key>')
  .description('Get a secret value for the current project directory')
  .option('-p, --project <project>', 'project key (defaults to current directory)')
  .action((key, options) => {
    const project = options.project || process.cwd();
    const secrets = getSecrets(project);
    if (secrets[key] === undefined) {
      console.error(`✗ Key "${key}" not found for this project`);
      process.exit(1);
    }
    console.log(secrets[key]);
  });

program
  .command('delete <key>')
  .description('Delete a secret for the current project directory')
  .option('-p, --project <project>', 'project key (defaults to current directory)')
  .action((key, options) => {
    const project = options.project || process.cwd();
    deleteSecret(project, key);
    console.log(`✓ Deleted ${key} from project ${path.basename(project)}`);
  });

program
  .command('list')
  .description('List all secret keys for the current project directory')
  .option('-p, --project <project>', 'project key (defaults to current directory)')
  .action((options) => {
    const project = options.project || process.cwd();
    const secrets = getSecrets(project);
    const keys = Object.keys(secrets);
    if (keys.length === 0) {
      console.log('No secrets stored for this project.');
    } else {
      keys.forEach(k => console.log(`  ${k}`));
    }
  });

program
  .command('projects')
  .description('List all projects that have stored secrets')
  .action(() => {
    const projects = listProjects();
    if (projects.length === 0) {
      console.log('No projects found.');
    } else {
      projects.forEach(p => console.log(`  ${p}`));
    }
  });

program
  .command('run <cmd> [args...]')
  .description('Run a command with secrets injected as env vars')
  .option('-p, --project <project>', 'project key (defaults to current directory)')
  .action((cmd, args, options) => {
    const project = options.project || process.cwd();
    injectAndRun(project, cmd, args);
  });

program.parse(process.argv);
