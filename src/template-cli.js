import fs from 'fs';
import path from 'path';
import { renderTemplateForProject } from './template.js';
import { extractPlaceholders, validateTemplate } from './template.js';
import { promptPassphrase } from './session.js';
import { normalizeProjectKey } from './store.js';

export async function handleTemplateCommand(args) {
  const [subcommand, ...rest] = args;

  if (subcommand === 'render') {
    const [templateFile, outputFile] = rest;
    if (!templateFile) {
      console.error('Usage: envchain-local template render <template-file> [output-file]');
      process.exit(1);
    }

    const templateStr = fs.readFileSync(path.resolve(templateFile), 'utf8');
    const projectKey = normalizeProjectKey(process.cwd());
    const passphrase = await promptPassphrase();

    let rendered;
    try {
      rendered = await renderTemplateForProject(projectKey, templateStr, passphrase);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }

    if (outputFile) {
      fs.writeFileSync(path.resolve(outputFile), rendered, 'utf8');
      console.log(`Rendered template written to ${outputFile}`);
    } else {
      process.stdout.write(rendered);
    }
    return;
  }

  if (subcommand === 'check') {
    const [templateFile] = rest;
    if (!templateFile) {
      console.error('Usage: envchain-local template check <template-file>');
      process.exit(1);
    }

    const templateStr = fs.readFileSync(path.resolve(templateFile), 'utf8');
    const placeholders = extractPlaceholders(templateStr);

    if (placeholders.length === 0) {
      console.log('No placeholders found in template.');
      return;
    }

    const projectKey = normalizeProjectKey(process.cwd());
    const passphrase = await promptPassphrase();
    const { getSecrets } = await import('./store.js');
    const secrets = await getSecrets(projectKey, passphrase);
    const missing = validateTemplate(templateStr, secrets);

    if (missing.length === 0) {
      console.log(`✓ All ${placeholders.length} placeholder(s) satisfied.`);
    } else {
      console.warn(`✗ Missing keys: ${missing.join(', ')}`);
      process.exit(1);
    }
    return;
  }

  console.error('Unknown template subcommand. Use: render | check');
  process.exit(1);
}
