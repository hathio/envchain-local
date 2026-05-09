import { setExpiry, clearExpiry, getExpiry, listExpiredSecrets, listExpiringSecrets } from './env-expire.js';

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const GRAY = '\x1b[90m';

function formatDate(ts) {
  return new Date(ts).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function printExpireList(items, type = 'expired') {
  if (items.length === 0) {
    console.log(`${GRAY}No ${type} secrets found.${RESET}`);
    return;
  }

  for (const { project, key, expiresAt, daysLeft } of items) {
    const color = type === 'expired' ? RED : YELLOW;
    const info = type === 'expired'
      ? `expired ${formatDate(expiresAt)}`
      : `expires in ${daysLeft}d (${formatDate(expiresAt)})`;
    console.log(`  ${CYAN}${project}${RESET}  ${color}${key}${RESET}  ${GRAY}${info}${RESET}`);
  }
}

export function handleExpireCommand(args) {
  const [sub, project, key, ...rest] = args;

  if (sub === 'set' && project && key) {
    const days = parseInt(rest[0]) || 90;
    const ts = setExpiry(project, key, days);
    console.log(`Set expiry for ${CYAN}${project}${RESET}.${key}: expires ${formatDate(ts)} (${days}d)`);
    return;
  }

  if (sub === 'clear' && project && key) {
    const removed = clearExpiry(project, key);
    console.log(removed ? `Cleared expiry for ${project}.${key}` : `No expiry set for ${project}.${key}`);
    return;
  }

  if (sub === 'get' && project && key) {
    const info = getExpiry(project, key);
    if (!info) { console.log(`${GRAY}No expiry set.${RESET}`); return; }
    console.log(`${project}.${key} expires ${formatDate(info.expiresAt)} (ttl: ${info.ttlDays}d)`);
    return;
  }

  if (sub === 'list-expired') {
    const items = listExpiredSecrets();
    console.log(`${RED}Expired secrets:${RESET}`);
    printExpireList(items, 'expired');
    return;
  }

  if (sub === 'list-expiring') {
    const days = parseInt(rest[0]) || 7;
    const items = listExpiringSecrets(days);
    console.log(`${YELLOW}Secrets expiring within ${days} days:${RESET}`);
    printExpireList(items, 'expiring');
    return;
  }

  console.error('Usage: envchain expire <set|clear|get|list-expired|list-expiring> [project] [key] [days]');
  process.exit(1);
}
