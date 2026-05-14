# env-note

Attach human-readable notes to individual secrets for documentation and context.

## CLI Usage

```bash
# List all notes in a project
envchain-local note list <project>

# Get the note for a specific secret
envchain-local note get <project> <key>

# Set a note on a secret
envchain-local note set <project> <key> <note text...>

# Remove a note from a secret
envchain-local note clear <project> <key>

# Search all notes across all projects
envchain-local note search <query>
```

## API

```js
import { getNote, setNote, clearNote, listNotes, searchNotes } from './env-note.js';

// Get a note
const note = getNote('my-project', 'API_KEY');
// => 'production API key' | null

// Set a note
setNote('my-project', 'API_KEY', 'Used for Stripe payments');

// Remove a note
clearNote('my-project', 'API_KEY');

// List all annotated secrets in a project
const notes = listNotes('my-project');
// => [{ key: 'API_KEY', note: 'Used for Stripe payments' }]

// Search notes by text
const results = searchNotes('stripe');
// => [{ project: 'my-project', key: 'API_KEY', note: 'Used for Stripe payments' }]
```

## Notes Storage

Notes are stored inline with each secret entry using the reserved `__note__` field.
They are never injected as environment variables — only used for documentation.

## Use Cases

- Document where a secret comes from (e.g. "Stripe dashboard > API keys")
- Add rotation reminders (e.g. "rotate every 90 days")
- Flag deprecated secrets before removal
