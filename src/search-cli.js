#!/usr/bin/env node
'use strict';

const { searchByKey, searchByProject, listAllProjects, listProjectKeys } = require('./search');

function colorProject(name) {
  return `\x1b[36m${name}\x1b[0m`;
}

function colorKey(name) {
  return `\x1b[33m${name}\x1b[0m`;
}

function colorCount(n) {
  return `\x1b[90m(${n} key${n !== 1 ? 's' : ''})\x1b[0m`;
}

function printSearchResults(results, query) {
  if (!results || results.length === 0) {
    console.log(`No results found for "${query}".`);
    return;
  }
  for (const { project, keys } of results) {
    console.log(`  ${colorProject(project)} ${colorCount(keys.length)}`);
    for (const key of keys) {
      console.log(`    ${colorKey(key)}`);
    }
  }
}

function printProjects(projects) {
  if (!projects || projects.length === 0) {
    console.log('No projects found in store.');
    return;
  }
  console.log(`Found ${projects.length} project(s):`);
  for (const { project, keyCount } of projects) {
    console.log(`  ${colorProject(project)} ${colorCount(keyCount)}`);
  }
}

function printKeys(project, keys) {
  if (!keys || keys.length === 0) {
    console.log(`No keys found for project "${project}".`);
    return;
  }
  console.log(`Keys for ${colorProject(project)}:`);
  for (const key of keys) {
    console.log(`  ${colorKey(key)}`);
  }
}

async function handleSearchCommand(args) {
  const sub = args[0];

  if (sub === 'key' && args[1]) {
    const results = searchByKey(args[1]);
    console.log(`\nSearching for key matching "${args[1]}":`);
    printSearchResults(results, args[1]);
  } else if (sub === 'project' && args[1]) {
    const results = searchByProject(args[1]);
    console.log(`\nSearching for project matching "${args[1]}":`);
    printSearchResults(results, args[1]);
  } else if (sub === 'list' && args[1]) {
    const keys = listProjectKeys(args[1]);
    console.log();
    printKeys(args[1], keys);
  } else if (sub === 'list') {
    const projects = listAllProjects();
    console.log();
    printProjects(projects);
  } else {
    console.log('Usage:');
    console.log('  envchain search key <pattern>       Search secrets by key name');
    console.log('  envchain search project <pattern>   Search by project name');
    console.log('  envchain search list                List all projects');
    console.log('  envchain search list <project>      List keys in a project');
  }
}

module.exports = { handleSearchCommand, printSearchResults, printProjects, printKeys };
