const fs = require('fs');
const path = require('path');
const os = require('os');

// Override store location for tests
const TEST_STORE_DIR = path.join(os.tmpdir(), '.envchain-local-test-' + Date.now());
const TEST_STORE_FILE = path.join(TEST_STORE_DIR, 'secrets.json');

jest.mock('os', () => ({
  ...jest.requireActual('os'),
  homedir: () => path.join(require('os').tmpdir(), '.envchain-local-test-' + process.env.TEST_ID)
}));

process.env.TEST_ID = Date.now().toString();

const { getSecrets, setSecret, deleteSecret, listProjects } = require('./store');

const PROJECT_PATH = '/tmp/my-project';

afterAll(() => {
  const storePath = path.join(os.tmpdir(), '.envchain-local-test-' + process.env.TEST_ID);
  if (fs.existsSync(storePath)) {
    fs.rmSync(storePath, { recursive: true, force: true });
  }
});

describe('store', () => {
  test('returns empty object for unknown project', () => {
    expect(getSecrets('/nonexistent/path')).toEqual({});
  });

  test('sets and retrieves a secret', () => {
    setSecret(PROJECT_PATH, 'API_KEY', 'abc123');
    const secrets = getSecrets(PROJECT_PATH);
    expect(secrets['API_KEY']).toBe('abc123');
  });

  test('overwrites existing secret', () => {
    setSecret(PROJECT_PATH, 'API_KEY', 'newvalue');
    expect(getSecrets(PROJECT_PATH)['API_KEY']).toBe('newvalue');
  });

  test('sets multiple secrets for same project', () => {
    setSecret(PROJECT_PATH, 'DB_PASS', 'secret');
    const secrets = getSecrets(PROJECT_PATH);
    expect(Object.keys(secrets).length).toBeGreaterThanOrEqual(2);
  });

  test('deletes a secret and returns true', () => {
    const result = deleteSecret(PROJECT_PATH, 'DB_PASS');
    expect(result).toBe(true);
    expect(getSecrets(PROJECT_PATH)['DB_PASS']).toBeUndefined();
  });

  test('returns false when deleting nonexistent secret', () => {
    expect(deleteSecret(PROJECT_PATH, 'GHOST_VAR')).toBe(false);
  });

  test('lists projects', () => {
    const projects = listProjects();
    expect(projects).toContain(path.resolve(PROJECT_PATH));
  });

  test('removes project entry when last secret deleted', () => {
    deleteSecret(PROJECT_PATH, 'API_KEY');
    expect(listProjects()).not.toContain(path.resolve(PROJECT_PATH));
  });
});
