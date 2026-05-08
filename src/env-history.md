# env-history

View and compare the history of secrets for a project across backups.

## Overview

`env-history` lets you inspect how a project's secrets have changed over time by reading from existing backup snapshots. It does **not** store additional data — it reuses backups created by the `backup` module.

## Functions

### `getHistoryForProject(projectKey)`

Returns a list of backup entries that contain secrets for the given project, sorted newest first.

```js
import { getHistoryForProject } from './env-history.js';
const history = getHistoryForProject('my-app');
// [{ timestamp, label, keys, count }, ...]
```

### `diffHistoryEntry(projectKey, backupPath)`

Compares the current store against a specific backup for a project. Returns an array of change objects with `key` and `status` (`added`, `removed`, `unchanged`).

```js
import { diffHistoryEntry } from './env-history.js';
const changes = diffHistoryEntry('my-app', '/path/to/backup.json');
```

### `restoreProjectFromHistory(projectKey, backupPath)`

Returns an updated store object with the project's secrets replaced by those from the given backup. You must call `writeStore()` separately to persist.

```js
import { restoreProjectFromHistory } from './env-history.js';
import { writeStore } from './store.js';
const updated = restoreProjectFromHistory('my-app', '/path/to/backup.json');
writeStore(updated);
```

## CLI Usage

```bash
# List history for a project
envchain history list my-app

# Diff current secrets vs a backup
envchain history diff my-app /path/to/backup.json
```
