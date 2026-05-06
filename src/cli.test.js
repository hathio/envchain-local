'use strict';

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const CLI = path.resolve(__dirname, 'cli.js');
const TEST_PROJECT = '/tmp/envchain-test-project';

function run(args, env = {}) {
  return execSync(`node ${CLI} ${args}`, {
    encoding: 'utf8',
    env: { ...process.env, ENVCHAIN_STORE_PATH: env.storePath || tmpStore, ...env },
  }).trim();
}

let tmpStore;

beforeEach(() => {
  tmpStore = path.join(os.tmpdir(), `envchain-test-${Date.now()}.json`);
});

afterEach(() => {
  if (fs.existsSync(tmpStore)) {
    fs.unlinkSync(tmpStore);
  }
});

describe('cli set and get', () => {
  test('set stores a secret and get retrieves it', () => {
    run(`set MY_TOKEN abc123 --project ${TEST_PROJECT}`);
    const out = run(`get MY_TOKEN --project ${TEST_PROJECT}`);
    expect(out).toBe('abc123');
  });

  test('get exits with error for missing key', () => {
    expect(() => {
      run(`get MISSING_KEY --project ${TEST_PROJECT}`);
    }).toThrow();
  });
});

describe('cli list', () => {
  test('list shows stored keys', () => {
    run(`set FOO bar --project ${TEST_PROJECT}`);
    run(`set BAZ qux --project ${TEST_PROJECT}`);
    const out = run(`list --project ${TEST_PROJECT}`);
    expect(out).toContain('FOO');
    expect(out).toContain('BAZ');
  });

  test('list shows message when no secrets', () => {
    const out = run(`list --project /tmp/empty-project-${Date.now()}`);
    expect(out).toContain('No secrets');
  });
});

describe('cli delete', () => {
  test('delete removes a key', () => {
    run(`set TO_DELETE secret --project ${TEST_PROJECT}`);
    run(`delete TO_DELETE --project ${TEST_PROJECT}`);
    expect(() => {
      run(`get TO_DELETE --project ${TEST_PROJECT}`);
    }).toThrow();
  });
});

describe('cli projects', () => {
  test('projects lists known projects', () => {
    run(`set SOME_VAR val --project ${TEST_PROJECT}`);
    const out = run('projects');
    expect(out).toBeTruthy();
  });
});
