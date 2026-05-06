import readline from 'readline';
import { isUnlocked, unlock, clearLock } from './lock.js';

export function promptPassphrase(prompt = 'Passphrase: ') {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // hide input
    const write = rl.output.write.bind(rl.output);
    rl.input.on('data', () => {
      rl.output.write('\x1B[2K\x1B[200D' + prompt);
    });

    rl.question(prompt, (answer) => {
      rl.close();
      process.stdout.write('\n');
      resolve(answer);
    });
  });
}

export async function requireUnlocked(passphrase) {
  if (isUnlocked(passphrase)) return true;

  const entered = passphrase ?? (await promptPassphrase());

  if (!entered || entered.trim() === '') {
    console.error('No passphrase provided.');
    process.exit(1);
  }

  unlock(entered.trim());
  return true;
}

export async function startSession() {
  const passphrase = await promptPassphrase('Create passphrase: ');
  if (!passphrase || passphrase.trim() === '') {
    console.error('Passphrase cannot be empty.');
    process.exit(1);
  }
  unlock(passphrase.trim());
  console.log('Session started. Passphrase cached for 15 minutes.');
  return passphrase.trim();
}

export function endSession() {
  clearLock();
  console.log('Session ended. Passphrase cache cleared.');
}
