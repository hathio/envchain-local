# env-merge

Merge secrets from one project into another.

## Usage

```bash
envchain merge <source-project> <target-project> [--overwrite]
```

## Options

| Flag | Description |
|------|-------------|
| `--overwrite` | Overwrite existing keys in the target project |
| `--dry-run` | Preview what would be merged without making changes |

## Examples

### Merge without overwriting

```bash
envchain merge staging production
```

Adds keys from `staging` that don't already exist in `production`. Existing keys in `production` are left untouched.

### Merge with overwrite

```bash
envchain merge staging production --overwrite
```

Adds new keys and overwrites any conflicting keys in `production` with values from `staging`.

### Preview a merge

```bash
envchain merge staging production --dry-run
```

Shows which keys would be added, overwritten, or skipped — without making any changes.

## Output

```
✔ Added:     DB_HOST, REDIS_URL
~ Merged:    API_KEY
- Skipped:   SECRET_TOKEN
```

## Notes

- Both projects must exist in the store before merging.
- The source project is never modified.
- Use `--dry-run` before `--overwrite` to avoid accidental data loss.
