import { rotateSecrets, rotateSecret } from './rotate.js';
import { deriveKey } from './crypto.js';
import { promptPassphrase } from './session.js';
import { readLock, writeLock } from './lock.js';

export async function handleRotateCommand(args) {
  const projectPath = process.cwd();
  const secretName = args[0] ?? null;

  console.log('🔑 Enter your CURRENT passphrase:');
  const oldPassphrase = await promptPassphrase();

  const lock = readLock();
  if (!lock) {
    console.error('❌ No lock file found. Run `envchain-local unlock` first.');
    process.exit(1);
  }

  console.log('🔑 Enter your NEW passphrase:');
  const newPassphrase = await promptPassphrase();

  console.log('🔁 Confirm new passphrase:');
  const confirmPassphrase = await promptPassphrase();

  if (newPassphrase !== confirmPassphrase) {
    console.error('❌ Passphrases do not match.');
    process.exit(1);
  }

  const oldKey = await deriveKey(oldPassphrase, lock.salt);
  const newKey = await deriveKey(newPassphrase, lock.salt);

  try {
    if (secretName) {
      await rotateSecret(projectPath, secretName, oldKey, newKey);
      console.log(`✅ Rotated secret: ${secretName}`);
    } else {
      const count = await rotateSecrets(projectPath, oldKey, newKey);
      console.log(`✅ Rotated ${count} secret(s) for this project.`);
    }

    // Update lock with new passphrase hash
    const { hashPassphrase } = await import('./lock.js');
    const newHash = await hashPassphrase(newPassphrase, lock.salt);
    writeLock({ ...lock, hash: newHash });
    console.log('🔒 Lock updated with new passphrase.');
  } catch (err) {
    console.error(`❌ Rotation failed: ${err.message}`);
    process.exit(1);
  }
}
