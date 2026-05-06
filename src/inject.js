const { spawnSync } = require('child_process');
const { getSecrets } = require('./store');

/**
 * Injects secrets for the given project directory into the
 * environment and runs the specified command.
 *
 * @param {string} projectPath - Absolute path to the project directory
 * @param {string[]} command - Command + args to execute
 * @param {object} options
 * @param {boolean} options.verbose - Print injected var names before running
 * @returns {number} exit code of the child process
 */
function injectAndRun(projectPath, command, options = {}) {
  if (!command || command.length === 0) {
    throw new Error('No command provided to run.');
  }

  const secrets = getSecrets(projectPath);
  const secretKeys = Object.keys(secrets);

  if (secretKeys.length === 0 && options.verbose) {
    console.warn(`[envchain-local] No secrets found for ${projectPath}`);
  }

  if (options.verbose && secretKeys.length > 0) {
    console.log(`[envchain-local] Injecting: ${secretKeys.join(', ')}`);
  }

  const env = {
    ...process.env,
    ...secrets
  };

  const [bin, ...args] = command;

  const result = spawnSync(bin, args, {
    env,
    stdio: 'inherit',
    shell: false
  });

  if (result.error) {
    throw result.error;
  }

  return result.status ?? 1;
}

module.exports = { injectAndRun };
