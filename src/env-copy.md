# env-copy

Copy or move secrets between projects.

## Functions

### `copySecrets(sourceProject, targetProject, keys?, options?)`

Copies secrets from one project to another.

- `keys` — array of specific keys to copy; copies all if omitted
- `options.overwrite` — if `true`, overwrites existing keys in the target (default: `false`)

Returns `{ copied: string[], skipped: string[] }`.

**Skipped keys** are those that:
- Already exist in the target (when `overwrite` is false)
- Do not exist in the source

### `moveSecrets(sourceProject, targetProject, keys?, options?)`

Same as `copySecrets`, but also removes the copied keys from the source project.
If all keys are moved, the source project entry is deleted from the store.

## CLI Usage

```
# Copy all secrets from project-a to project-b
envchain copy /path/to/project-a /path/to/project-b

# Copy specific keys only
envchain copy /path/to/project-a /path/to/project-b --keys DB_HOST,DB_PORT

# Overwrite existing keys
envchain copy /path/to/project-a /path/to/project-b --overwrite

# Move instead of copy
envchain move /path/to/project-a /path/to/project-b
```

## Notes

- Project paths are normalized before lookup (lowercased, slashes replaced with dashes)
- Encrypted values are copied as-is; no re-encryption is performed
- The store is only written if at least one key was successfully copied
