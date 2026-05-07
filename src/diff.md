# Diff Module

Compare secrets between projects or against local files.

## CLI Usage

```bash
# Diff a project against a local .env file
envchain diff file <project> <file>

# Diff two projects against each other
envchain diff projects <projectA> <projectB>
```

## Output Format

- `+` green — key added in target
- `-` red — key removed (only in base)
- `~` yellow — value changed

## API

### `diffSecrets(base, target)`

Compares two flat `{ key: value }` objects and returns a sorted array of diff entries:

```js
[
  { type: 'added',   key: 'NEW_KEY', newValue: 'val' },
  { type: 'removed', key: 'OLD_KEY', oldValue: 'val' },
  { type: 'changed', key: 'KEY',     oldValue: 'old', newValue: 'new' }
]
```

### `loadSecretsFromFile(filePath)`

Loads secrets from a `.env` or `.json` file into a flat string object. Quoted values in `.env` files are automatically unquoted.

## Notes

- Diff is non-destructive — no changes are written to the store.
- Use `envchain import` to apply changes after reviewing a diff.
