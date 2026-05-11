# env-group

Group secrets within a project for easier organization and bulk operations.

## Overview

Groups are lightweight labels attached to individual secrets. A secret can belong to at most one group. Groups are stored as metadata alongside the encrypted value in the store.

## API

### `listGroups(project) → string[]`

Returns a sorted list of all group names used in the given project.

### `assignGroup(project, secretKey, group)`

Assigns a group label to an existing secret. Throws if the secret does not exist.

### `unassignGroup(project, secretKey)`

Removes the group assignment from a secret (sets it to `null`).

### `getSecretsInGroup(project, group) → object`

Returns all secrets (with metadata) that belong to the specified group.

### `renameGroup(project, oldGroup, newGroup) → number`

Renames a group across all secrets in a project. Returns the number of secrets updated.

### `deleteGroup(project, group) → number`

Removes group assignment from all secrets in the given group. Equivalent to renaming to `null`.

## CLI Usage

```
envchain group list <project>
envchain group assign <project> <key> <group>
envchain group unassign <project> <key>
envchain group show <project> <group>
envchain group rename <project> <old> <new>
envchain group delete <project> <group>
```

## Notes

- Group names are case-sensitive.
- Deleting a group does not delete the secrets themselves — only the label is removed.
- Groups are project-scoped; the same group name can exist in multiple projects independently.
