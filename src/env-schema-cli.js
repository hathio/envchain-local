import { defineSchema, getSchema, removeSchema, validateAgainstSchema } from './env-schema.js';
import { getSecrets, normalizeProjectKey } from './store.js';

function printSchema(schema) {
  if (!schema || Object.keys(schema).length === 0) {
    console.log('  (no schema defined)');
    return;
  }
  for (const [field, rules] of Object.entries(schema)) {
    const parts = [];
    if (rules.required) parts.push('required');
    if (rules.type) parts.push(`type:${rules.type}`);
    if (rules.pattern) parts.push(`pattern:${rules.pattern}`);
    if (rules.minLength) parts.push(`minLength:${rules.minLength}`);
    console.log(`  ${field}: ${parts.join(', ') || '(no rules)'}`);
  }
}

export function handleSchemaCommand(args) {
  const [sub, project, ...rest] = args;

  if (!sub || sub === 'help') {
    console.log('Usage: envchain schema <show|set|remove|validate> <project> [options]');
    return;
  }

  if (sub === 'show') {
    if (!project) return console.error('Project required');
    const schema = getSchema(project);
    console.log(`Schema for ${normalizeProjectKey(project)}:`);
    printSchema(schema);
    return;
  }

  if (sub === 'set') {
    if (!project) return console.error('Project required');
    const schemaArg = rest[0];
    if (!schemaArg) return console.error('Schema JSON required');
    let schema;
    try {
      schema = JSON.parse(schemaArg);
    } catch {
      return console.error('Invalid JSON schema');
    }
    defineSchema(project, schema);
    console.log(`Schema set for ${normalizeProjectKey(project)}`);
    return;
  }

  if (sub === 'remove') {
    if (!project) return console.error('Project required');
    removeSchema(project);
    console.log(`Schema removed for ${normalizeProjectKey(project)}`);
    return;
  }

  if (sub === 'validate') {
    if (!project) return console.error('Project required');
    const secrets = getSecrets(project);
    const { valid, errors } = validateAgainstSchema(project, secrets);
    if (valid) {
      console.log(`✓ ${normalizeProjectKey(project)} passes schema validation`);
    } else {
      console.log(`✗ ${normalizeProjectKey(project)} has schema violations:`);
      for (const e of errors) {
        console.log(`  - ${e.field}: ${e.message}`);
      }
    }
    return;
  }

  console.error(`Unknown subcommand: ${sub}`);
}
