# envchain-local

> Lightweight local secret manager that injects env vars per project directory

## Installation

```bash
npm install -g envchain-local
```

## Usage

Initialize a new secret store in your project directory:

```bash
envchain-local init
```

Add secrets for the current project:

```bash
envchain-local set MY_API_KEY=abc123 DB_PASSWORD=supersecret
```

Run a command with your secrets injected as environment variables:

```bash
envchain-local run -- node server.js
```

Secrets are stored locally and scoped to the directory they were defined in. When you run a command, `envchain-local` automatically resolves the correct secrets based on your current working directory.

### Example `.envchain` config

```json
{
  "scope": "/home/user/projects/my-app",
  "vars": ["MY_API_KEY", "DB_PASSWORD"]
}
```

Secrets are encrypted at rest using your system keychain or a local encrypted store.

## Commands

| Command | Description |
|---|---|
| `init` | Initialize envchain in the current directory |
| `set KEY=VALUE` | Store a secret for the current directory |
| `run -- <cmd>` | Run a command with secrets injected |
| `list` | List all secret keys for the current directory |
| `remove KEY` | Remove a stored secret |

## License

MIT © envchain-local contributors