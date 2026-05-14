import { getNote, setNote, clearNote, listNotes, searchNotes } from './env-note.js';

const BOLD = (s) => `\x1b[1m${s}\x1b[0m`;
const DIM = (s) => `\x1b[2m${s}\x1b[0m`;
const CYAN = (s) => `\x1b[36m${s}\x1b[0m`;
const YELLOW = (s) => `\x1b[33m${s}\x1b[0m`;

export function printNoteList(notes, project) {
  if (notes.length === 0) {
    console.log(DIM(`No notes found for project '${project}'.`));
    return;
  }
  console.log(BOLD(`Notes for ${CYAN(project)}:`));
  for (const { key, note } of notes) {
    console.log(`  ${YELLOW(key)}: ${note}`);
  }
}

export function handleNoteCommand(args) {
  const [sub, project, key, ...rest] = args;

  if (sub === 'list') {
    if (!project) { console.error('Usage: note list <project>'); process.exit(1); }
    const notes = listNotes(project);
    printNoteList(notes, project);
    return;
  }

  if (sub === 'get') {
    if (!project || !key) { console.error('Usage: note get <project> <key>'); process.exit(1); }
    const note = getNote(project, key);
    if (note === null) {
      console.log(DIM(`No note for '${key}' in '${project}'.`));
    } else {
      console.log(`${YELLOW(key)}: ${note}`);
    }
    return;
  }

  if (sub === 'set') {
    const note = rest.join(' ');
    if (!project || !key || !note) { console.error('Usage: note set <project> <key> <note text>'); process.exit(1); }
    setNote(project, key, note);
    console.log(`Note set for ${CYAN(project)}/${YELLOW(key)}.`);
    return;
  }

  if (sub === 'clear') {
    if (!project || !key) { console.error('Usage: note clear <project> <key>'); process.exit(1); }
    clearNote(project, key);
    console.log(DIM(`Note cleared for '${key}' in '${project}'.`));
    return;
  }

  if (sub === 'search') {
    const query = key;
    if (!query) { console.error('Usage: note search <query>'); process.exit(1); }
    const results = searchNotes(query);
    if (results.length === 0) {
      console.log(DIM('No matching notes found.'));
      return;
    }
    console.log(BOLD(`Search results for "${query}":`));
    for (const { project: p, key: k, note } of results) {
      console.log(`  ${CYAN(p)}/${YELLOW(k)}: ${note}`);
    }
    return;
  }

  console.error('Unknown note subcommand. Use: list, get, set, clear, search');
  process.exit(1);
}
