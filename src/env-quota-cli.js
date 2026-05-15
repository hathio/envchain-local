import chalk from 'chalk';
import { getQuota, setQuota, clearQuota, checkQuota, listAllQuotas } from './env-quota.js';

function formatBar(usage, limit) {
  const pct = Math.min(1, usage / limit);
  const filled = Math.round(pct * 20);
  const bar = '█'.repeat(filled) + '░'.repeat(20 - filled);
  const color = pct >= 1 ? chalk.red : pct >= 0.8 ? chalk.yellow : chalk.green;
  return color(bar);
}

export function printQuotaStatus(project) {
  const { usage, limit, exceeded, available } = checkQuota(project);
  const status = exceeded ? chalk.red('EXCEEDED') : chalk.green('OK');
  console.log(`Project: ${chalk.cyan(project)}`);
  console.log(`Status:  ${status}`);
  console.log(`Usage:   ${formatBar(usage, limit)} ${usage}/${limit}`);
  console.log(`Available: ${chalk.bold(available)} slots`);
}

export function printAllQuotas() {
  const quotas = listAllQuotas();
  if (quotas.length === 0) {
    console.log(chalk.gray('No custom quotas configured.'));
    return;
  }
  console.log(chalk.bold('Project Quotas:'));
  for (const { project, limit, usage } of quotas) {
    const pct = usage / limit;
    const color = pct >= 1 ? chalk.red : pct >= 0.8 ? chalk.yellow : chalk.green;
    console.log(`  ${chalk.cyan(project.padEnd(30))} ${color(`${usage}/${limit}`)}`);
  }
}

export function handleQuotaCommand(args) {
  const [sub, project, value] = args;

  if (sub === 'status' && project) {
    printQuotaStatus(project);
  } else if (sub === 'set' && project && value) {
    const limit = parseInt(value, 10);
    setQuota(project, limit);
    console.log(chalk.green(`✔ Quota for "${project}" set to ${limit}.`));
  } else if (sub === 'clear' && project) {
    clearQuota(project);
    console.log(chalk.yellow(`Quota for "${project}" cleared (default restored).`));
  } else if (sub === 'list') {
    printAllQuotas();
  } else if (sub === 'get' && project) {
    const limit = getQuota(project);
    console.log(`${chalk.cyan(project)}: ${limit}`);
  } else {
    console.log('Usage: envchain quota <status|set|get|clear|list> [project] [limit]');
    process.exit(1);
  }
}
