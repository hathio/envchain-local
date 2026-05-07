# Template Feature

The template module lets you render text files (e.g. `.env`, config files) by substituting `{{KEY}}` placeholders with secrets stored for the current project.

## Placeholder syntax

Placeholders use double curly braces and uppercase key names:

```
DATABASE_URL={{DB_URL}}
API_KEY={{API_KEY}}
```

Spaces inside the braces are allowed: `{{ DB_URL }}`.

## CLI usage

### Render a template

Outputs the rendered result to stdout, or writes to a file:

```bash
envchain-local template render .env.template
envchain-local template render .env.template .env
```

The current working directory is used to resolve the project key.

### Check a template

Verifies that all placeholders in the template are satisfied by the current project's secrets without writing any output:

```bash
envchain-local template check .env.template
```

Exits with code `1` and lists missing keys if any placeholder cannot be resolved.

## API

### `renderTemplate(templateStr, secrets) → string`

Replaces all `{{KEY}}` placeholders in `templateStr` using the `secrets` object. Unknown placeholders are left as-is.

### `extractPlaceholders(templateStr) → string[]`

Returns a deduplicated list of all placeholder key names found in the template.

### `validateTemplate(templateStr, secrets) → string[]`

Returns the list of placeholder keys that are **not** present in `secrets`.

### `renderTemplateForProject(projectKey, templateStr, passphrase) → Promise<string>`

Loads secrets for `projectKey`, validates the template, and returns the rendered string. Throws if any keys are missing.
