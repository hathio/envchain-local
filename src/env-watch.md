# env-watch

Watch a project's secrets in real time and react to changes.

## Overview

`env-watch` polls the local secret store at a fixed interval and fires a callback whenever secrets are added, removed, or changed for a given project.

## API

### `getSnapshot(projectKey)`

Returns the current map of secret keys → encrypted values for the given project.

### `compareSnapshots(prev, next)`

Compares two snapshots and returns a diff object:

```js
{
  added: ['NEW_KEY'],
  removed: ['OLD_KEY'],
  changed: ['CHANGED_KEY']
}
```

### `watchProject(projectKey, onChange)`

Starts watching a project. Calls `onChange(diff, currentSnapshot)` whenever changes are detected.

Returns a `stop()` function to cancel the watcher.

```js
import { watchProject } from './env-watch.js';

const stop = watchProject('/home/user/myapp', (diff, snapshot) => {
  console.log('Added:', diff.added);
  console.log('Removed:', diff.removed);
  console.log('Changed:', diff.changed);
});

// Later...
stop();
```

## Notes

- Poll interval is 2000 ms by default.
- No file system watchers are used; polling keeps it simple and cross-platform.
- Only metadata (key names) is compared — secret values are compared in their stored (encrypted) form.
