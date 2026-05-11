# env-schema

Define and validate schemas for project secrets in envchain-local.

## Overview

Schemas let you declare what env vars a project expects, their types, and constraints. This helps catch misconfigured environments before they cause runtime errors.

## CLI Usage

```bash
# Show schema for a project
envchain schema show <project>

# Set schema from JSON
envchain schema set <project> '{"API_KEY":{"required":true},"PORT":{"type":"number"}}'

# Validate current secrets against schema
envchain schema validate <project>

# Remove schema
envchain schema remove <project>
```

## Schema Format

Schemas are JSON objects where each key is an env var name and the value is a rules object:

```json
{
  "API_KEY": { "required": true, "minLength": 32 },
  "PORT": { "type": "number" },
  "BASE_URL": { "type": "url" },
  "ADMIN_EMAIL": { "type": "email" },
  "ENV": { "pattern": "^(production|staging|development)$" }
}
```

## Supported Rules

| Rule | Description |
|------|-------------|
| `required` | Field must be present and non-empty |
| `type` | One of: `string`, `number`, `boolean`, `url`, `email` |
| `pattern` | Regex the value must match |
| `minLength` | Minimum string length |

## Programmatic API

```js
import { defineSchema, getSchema, validateAgainstSchema } from './env-schema.js';

defineSchema('my-project', { PORT: { type: 'number', required: true } });

const { valid, errors } = validateAgainstSchema('my-project', { PORT: 'abc' });
// valid: false, errors: [{ field: 'PORT', message: 'expected a number' }]
```
