import { checkMissingKeys, checkEmptyValues, validateSecrets, parseRequiredKeysFile } from './env-check.js';
import { getSecrets } from './store.js';
import { normalizeProjectKey } from './store.js';
import path from 'path';

const colorKey = (k) => `\x1b[36m${k}\x1b[0m`;
const colorWarn = (msg) => `\x1b[33m${msg}\x1b[0m`;
const colorError = (msg) => `\x1b[31m${msg}\x1b[0m`;
const colorOk = (msg) => `\x1b[32m${msg}\x1b[0m`;

export function printValidationResults(results) {
  const { missing, empty } = results;

  if (missing.length === 0 && empty.length === 0) {
    console.log(colorOk('✔ All required keys are present and non-empty.'));
    return;
  }

  if (missing.length > 0) {
    console.error(colorError(`✘ Missing keys (${missing.length}):`) );
    for (const key of missing) {
      console.error(`  - ${colorKey(key)}`);
    }
  }

  if (empty.length > 0) {
    console.warn(colorWarn(`⚠ Empty values (${empty.length}):`) );
    for (const key of empty) {
      console.warn(`  - ${colorKey(key)}`);
    }
  }
}

export async function handleEnvCheckCommand(args, secrets) {
  const projectDir = args['--dir'] || process.cwd();
  const projectKey = normalizeProjectKey(projectDir);
  const requiredFile = args['--require'] || args['-r'];
  const warnEmpty = args['--warn-empty'] || args['-e'];

  let requiredKeys = [];

  if (requiredFile) {
    try {
      const filePath = path.resolve(requiredFile);
      requiredKeys = parseRequiredKeysFile(filePath);
    } catch (err) {
      console.error(colorError(`Failed to read required keys file: ${err.message}`));
      process.exit(1);
    }
  } else if (args._.length > 0) {
    requiredKeys = args._;
  } else {
    console.error(colorError('Provide required keys as arguments or via --require <file>.'));
    process.exit(1);
  }

  const projectSecrets = secrets || getSecrets(projectKey);
  const results = validateSecrets(projectSecrets, requiredKeys, { warnEmpty: !!warnEmpty });

  printValidationResults(results);

  const hasErrors = results.missing.length > 0;
  if (hasErrors) process.exit(1);
}
