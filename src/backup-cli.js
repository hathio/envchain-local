import { createBackup, listBackups, restoreBackup, deleteBackup } from './backup.js';
import { writeStore } from './store.js';

function printBackupList(backups) {
  if (backups.length === 0) {
    console.log('No backups found.');
    return;
  }
  backups.forEach(({ filename, createdAt }) => {
    const date = createdAt.toLocaleString();
    console.log(`  \x1b[36m${filename}\x1b[0m  (${date})`);
  });
}

export function handleBackupCommand(args) {
  const [sub, ...rest] = args;

  switch (sub) {
    case 'create': {
      const label = rest[0] || null;
      const filepath = createBackup(label);
      console.log(`✓ Backup created: ${filepath}`);
      break;
    }

    case 'list': {
      const backups = listBackups();
      printBackupList(backups);
      break;
    }

    case 'restore': {
      const filename = rest[0];
      if (!filename) {
        console.error('Usage: envchain backup restore <filename>');
        process.exit(1);
      }
      try {
        const data = restoreBackup(filename);
        writeStore(data);
        console.log(`✓ Restored from ${filename}`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
      break;
    }

    case 'delete': {
      const filename = rest[0];
      if (!filename) {
        console.error('Usage: envchain backup delete <filename>');
        process.exit(1);
      }
      try {
        deleteBackup(filename);
        console.log(`✓ Deleted backup ${filename}`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
      break;
    }

    default:
      console.log('Usage: envchain backup <create|list|restore|delete> [args]');
  }
}
