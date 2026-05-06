# Import Secrets

The `import` module allows you to bulk-import secrets from `.env` or `.json` files into a project's secret store.

## Supported Formats

### `.env`

Standard dotenv format:

```
# This is a comment
DB_HOST=localhost
DB_PASS="my secret"
API_KEY='abc123'
```

### `.json`

A flat JSON object with string values:

```json
{
  "DB_HOST": "localhost",
  "API_KEY": "abc123"
}
```

## CLI Usage

```bash
# Import from .env (skip existing keys)
envchain-local import .env

# Import from JSON, overwriting existing keys
envchain-local import secrets.json --overwrite

# Import for a specific project key
envchain-local import .env --project my-app
```

## Behaviour

- By default, existing keys are **not** overwritten.
- Use `--overwrite` to allow incoming values to replace stored ones.
- A summary is printed showing added, skipped, and updated keys.

## Return Value

`importSecrets` returns an object:

```js
{ added: [...], skipped: [...], updated: [...], total: N }
```
