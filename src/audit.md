# Audit Log

envchain-local keeps a local audit trail of sensitive operations so you can review what was accessed and when.

## Log Location

```
~/.envchain-local/audit.log
```

The file is created with mode `0600` (owner read/write only).

## Logged Events

| Action | Triggered by |
|---|---|
| `set` | Setting or updating a secret |
| `delete` | Removing a secret or project |
| `inject` | Running a command with injected secrets |
| `export` | Exporting secrets to shell/dotenv/JSON |
| `unlock` | Unlocking the store with a passphrase |
| `lock` | Manually locking the session |

## Entry Format

Each line is a JSON object:

```json
{
  "timestamp": "2024-05-01T12:00:00.000Z",
  "action": "inject",
  "projectKey": "my-app",
  "user": "alice",
  "pid": 12345
}
```

## CLI Commands

```bash
# View last 20 audit entries
envchain-local audit

# View last N entries
envchain-local audit --limit 100

# Clear the audit log
envchain-local audit --clear
```

## Log Rotation

The log is automatically trimmed to the last **500 entries** to prevent unbounded growth.
