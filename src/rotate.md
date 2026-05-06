# Secret Rotation

The `rotate` module allows re-encrypting project secrets with a new passphrase without exposing plaintext values to the shell environment.

## Why rotate?

- Passphrase compromise
- Periodic security hygiene
- Offboarding team members

## CLI Usage

```bash
# Rotate all secrets for the current project
envchain-local rotate

# Rotate a single secret
envchain-local rotate DB_PASSWORD
```

You will be prompted for your **current** passphrase and then a **new** passphrase (confirmed twice).

## What happens

1. All encrypted values are decrypted with the old derived key.
2. Each value is re-encrypted with the new derived key.
3. The lock file hash is updated to reflect the new passphrase.
4. An audit event is logged.

## Programmatic API

```js
import { rotateSecrets, rotateSecret } from './rotate.js';

// Rotate all secrets
const count = await rotateSecrets(projectPath, oldKey, newKey);

// Rotate one secret
await rotateSecret(projectPath, 'API_KEY', oldKey, newKey);
```

> **Note:** Both `oldKey` and `newKey` should be derived keys (Buffer), not raw passphrases.
