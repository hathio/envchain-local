# Backup

The backup module lets you snapshot and restore the entire envchain-local secret store.

## CLI Usage

```bash
# Create a backup (optional label)
envchain backup create
envchain backup create pre-rotate

# List all backups
envchain backup list

# Restore a backup (overwrites current store)
envchain backup restore backup-pre-rotate-2024-05-01T12-00-00-000Z.json

# Delete a backup
envchain backup delete backup-pre-rotate-2024-05-01T12-00-00-000Z.json
```

## Backup location

Backups are stored in `~/.envchain-local/backups/` as plain JSON files named with a timestamp and optional label.

> ⚠️ Backups contain **encrypted** values from the store. The passphrase is not stored. Restoring a backup does not change your passphrase.

## Programmatic API

```js
import { createBackup, listBackups, restoreBackup, deleteBackup } from './backup.js';

// Create a snapshot before a risky operation
const filepath = createBackup('before-import');

// List available backups
const backups = listBackups();
// [{ filename, filepath, createdAt }]

// Restore from a snapshot
const storeData = restoreBackup('backup-before-import-....json');

// Remove old backups
deleteBackup('backup-before-import-....json');
```

## Audit log

All backup operations (`backup_created`, `backup_restored`, `backup_deleted`) are recorded in the audit log.
