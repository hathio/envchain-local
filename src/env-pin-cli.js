import { pinSecret, unpinSecret, listPinnedSecrets, listAllPinned } from './env-pin.js';

const BOLD = s => `\x1b[1m${s}\x1b[0m`;
const CYAN = s => `\x1b[36m${s}\x1b[0m`;
const YELLOW = s => `\x1b[33m${s}\x1b[0m`;
const GREEN = s => `\x1b[32m${s}\x1b[0m`;
const RED = s => `\x1b[31m${s}\x1b[0m`;

export function printPinnedList(project) {
  const pinned = listPinnedSecrets(project);
  if (pinned.length === 0) {
    console.log(YELLOW(`No pinned keys for project '${project}'.`));
    return;
  }
  console.log(BOLD(`Pinned keys for ${CYAN(project)}:`));
  for (const key of pinned) {
    console.log(`  📌 ${GREEN(key)}`);
  }
}

export function printAllPinned() {
  const all = listAllPinned();
  const projects = Object.keys(all);
  if (projects.length === 0) {
    console.log(YELLOW('No pinned keys found across any project.'));
    return;
  }
  for (const project of projects) {
    console.log(BOLD(`${CYAN(project)}:`));
    for (const key of all[project]) {
      console.log(`  📌 ${GREEN(key)}`);
    }
  }
}

export function handlePinCommand(args) {
  const [sub, project, key] = args;

  if (sub === 'list' && project) {
    printPinnedList(project);
  } else if (sub === 'list-all') {
    printAllPinned();
  } else if (sub === 'add' && project && key) {
    const added = pinSecret(project, key);
    if (added) console.log(GREEN(`Pinned '${key}' in project '${project}'.`));
    else console.log(YELLOW(`'${key}' is already pinned in '${project}'.`));
  } else if (sub === 'remove' && project && key) {
    const removed = unpinSecret(project, key);
    if (removed) console.log(GREEN(`Unpinned '${key}' from project '${project}'.`));
    else console.log(RED(`'${key}' was not pinned in '${project}'.`));
  } else {
    console.log('Usage:');
    console.log('  pin list <project>');
    console.log('  pin list-all');
    console.log('  pin add <project> <key>');
    console.log('  pin remove <project> <key>');
  }
}
