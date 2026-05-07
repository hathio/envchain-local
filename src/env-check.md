# env-check

Validate that required environment variable keys exist and are non-empty for a given project.

## Usage

```bash
# Check specific keys directly
envchain-local check DB_URL API_KEY SECRET_TOKEN

# Check against a required-keys file
envchain-local check --require .env.required

# Also warn on empty values
envchain-local check --warn-empty DB_URL API_KEY
```

## Required Keys File Format

A plain text file with one key per line. Lines starting with `#` are treated as comments.

```
# Database
DB_URL
DB_PASSWORD

# Auth
JWT_SECRET
API_KEY
```

## API

### `checkMissingKeys(secrets, requiredKeys)`

Returns an array of keys that are not present in `secrets`.

### `checkEmptyValues(secrets, keys)`

Returns an array of keys whose values are empty strings.

### `validateSecrets(secrets, requiredKeys, options?)`

Runs both checks and returns `{ missing, empty }`.

Options:
- `warnEmpty` (boolean) — include empty-value check (default: `false`)

### `parseRequiredKeysFile(filePath)`

Reads a newline-separated file of key names, stripping comments and blank lines.

## Exit Codes

| Code | Meaning |
|------|---------|
| `0`  | All required keys present (and non-empty if `--warn-empty`) |
| `1`  | One or more missing keys detected |
