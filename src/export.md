# Secret Export

The `export` module lets you dump project secrets in various formats — handy for piping into scripts, generating `.env` files, or debugging what's stored.

## Formats

### `shell` (default)

Outputs `export KEY='value'` lines suitable for `eval`-ing in a shell session.

```sh
envchain-local export
# export API_KEY='supersecret'
# export DB_URL='postgres://localhost/mydb'
```

To load into your current shell:

```sh
eval $(envchain-local export)
```

### `dotenv`

Outputs a `.env`-compatible file. Values with spaces or special characters are quoted.

```sh
envchain-local export --format dotenv > .env
```

### `json`

Outputs pretty-printed JSON — useful for piping into other tools.

```sh
envchain-local export --format json | jq '.API_KEY'
```

## Notes

- Requires an active session (run `envchain-local unlock` first)
- Exports secrets for the **current directory** by default
- Use `--dir <path>` to export secrets for a different project
- Never commit exported secrets to version control
