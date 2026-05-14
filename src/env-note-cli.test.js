import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleNoteCommand, printNoteList } from './env-note-cli.js';
import * as noteModule from './env-note.js';

vi.mock('./env-note.js');

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('printNoteList', () => {
  it('prints notes for a project', () => {
    printNoteList([{ key: 'API_KEY', note: 'prod key' }], 'my-project');
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('my-project'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('prod key'));
  });

  it('prints empty message when no notes', () => {
    printNoteList([], 'my-project');
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No notes found'));
  });
});

describe('handleNoteCommand - list', () => {
  it('calls listNotes and prints results', () => {
    vi.mocked(noteModule.listNotes).mockReturnValue([{ key: 'K', note: 'n' }]);
    handleNoteCommand(['list', 'proj']);
    expect(noteModule.listNotes).toHaveBeenCalledWith('proj');
  });

  it('exits if no project given', () => {
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    expect(() => handleNoteCommand(['list'])).toThrow('exit');
    exit.mockRestore();
  });
});

describe('handleNoteCommand - get', () => {
  it('prints the note for a key', () => {
    vi.mocked(noteModule.getNote).mockReturnValue('some note');
    handleNoteCommand(['get', 'proj', 'MY_KEY']);
    expect(noteModule.getNote).toHaveBeenCalledWith('proj', 'MY_KEY');
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('some note'));
  });

  it('prints dim message when note is null', () => {
    vi.mocked(noteModule.getNote).mockReturnValue(null);
    handleNoteCommand(['get', 'proj', 'X']);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No note'));
  });
});

describe('handleNoteCommand - set', () => {
  it('calls setNote with joined text', () => {
    vi.mocked(noteModule.setNote).mockImplementation(() => {});
    handleNoteCommand(['set', 'proj', 'KEY', 'my', 'note', 'text']);
    expect(noteModule.setNote).toHaveBeenCalledWith('proj', 'KEY', 'my note text');
  });
});

describe('handleNoteCommand - clear', () => {
  it('calls clearNote', () => {
    vi.mocked(noteModule.clearNote).mockImplementation(() => {});
    handleNoteCommand(['clear', 'proj', 'KEY']);
    expect(noteModule.clearNote).toHaveBeenCalledWith('proj', 'KEY');
  });
});

describe('handleNoteCommand - search', () => {
  it('prints matching results', () => {
    vi.mocked(noteModule.searchNotes).mockReturnValue([{ project: 'p', key: 'k', note: 'found it' }]);
    handleNoteCommand(['search', 'proj', 'found']);
    expect(noteModule.searchNotes).toHaveBeenCalledWith('found');
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('found it'));
  });

  it('prints no match message', () => {
    vi.mocked(noteModule.searchNotes).mockReturnValue([]);
    handleNoteCommand(['search', 'proj', 'xyz']);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No matching'));
  });
});

describe('handleNoteCommand - unknown', () => {
  it('exits on unknown subcommand', () => {
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    expect(() => handleNoteCommand(['bogus'])).toThrow('exit');
    exit.mockRestore();
  });
});
