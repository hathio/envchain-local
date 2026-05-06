'use strict';

const { printSearchResults, printProjects, printKeys } = require('./search-cli');

describe('printSearchResults', () => {
  let log;

  beforeEach(() => {
    log = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    log.mockRestore();
  });

  test('prints no results message when empty', () => {
    printSearchResults([], 'MISSING');
    expect(log).toHaveBeenCalledWith(expect.stringContaining('No results found'));
  });

  test('prints project and keys for results', () => {
    const results = [
      { project: 'my-app', keys: ['DB_URL', 'API_KEY'] }
    ];
    printSearchResults(results, 'DB');
    const calls = log.mock.calls.flat().join(' ');
    expect(calls).toContain('my-app');
    expect(calls).toContain('DB_URL');
    expect(calls).toContain('API_KEY');
  });

  test('handles null gracefully', () => {
    printSearchResults(null, 'x');
    expect(log).toHaveBeenCalledWith(expect.stringContaining('No results found'));
  });
});

describe('printProjects', () => {
  let log;

  beforeEach(() => {
    log = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    log.mockRestore();
  });

  test('prints no projects message when empty', () => {
    printProjects([]);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('No projects found'));
  });

  test('prints each project with key count', () => {
    printProjects([{ project: 'app-one', keyCount: 3 }, { project: 'app-two', keyCount: 1 }]);
    const calls = log.mock.calls.flat().join(' ');
    expect(calls).toContain('app-one');
    expect(calls).toContain('app-two');
    expect(calls).toContain('2 project(s)');
  });
});

describe('printKeys', () => {
  let log;

  beforeEach(() => {
    log = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    log.mockRestore();
  });

  test('prints no keys message when empty', () => {
    printKeys('my-project', []);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('No keys found'));
  });

  test('prints all keys for a project', () => {
    printKeys('my-project', ['SECRET_ONE', 'SECRET_TWO']);
    const calls = log.mock.calls.flat().join(' ');
    expect(calls).toContain('my-project');
    expect(calls).toContain('SECRET_ONE');
    expect(calls).toContain('SECRET_TWO');
  });
});
