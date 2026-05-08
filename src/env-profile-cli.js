import { listProfiles, getActiveProfile, setActiveProfile, createProfile, deleteProfile } from './env-profile.js';

export function printProfiles(profiles, activeProfile) {
  if (profiles.length === 0) {
    console.log('No profiles found.');
    return;
  }
  for (const profile of profiles) {
    const marker = profile === activeProfile ? ' \x1b[32m(active)\x1b[0m' : '';
    console.log(`  \x1b[36m${profile}\x1b[0m${marker}`);
  }
}

export async function handleProfileCommand(args) {
  const [subcommand, ...rest] = args;

  switch (subcommand) {
    case 'list': {
      const profiles = await listProfiles();
      const active = await getActiveProfile();
      console.log('Profiles:');
      printProfiles(profiles, active);
      break;
    }
    case 'use': {
      const name = rest[0];
      if (!name) {
        console.error('Usage: profile use <name>');
        process.exit(1);
      }
      await setActiveProfile(name);
      console.log(`Switched to profile: \x1b[36m${name}\x1b[0m`);
      break;
    }
    case 'create': {
      const name = rest[0];
      if (!name) {
        console.error('Usage: profile create <name>');
        process.exit(1);
      }
      await createProfile(name);
      console.log(`Created profile: \x1b[36m${name}\x1b[0m`);
      break;
    }
    case 'delete': {
      const name = rest[0];
      if (!name) {
        console.error('Usage: profile delete <name>');
        process.exit(1);
      }
      await deleteProfile(name);
      console.log(`Deleted profile: \x1b[36m${name}\x1b[0m`);
      break;
    }
    case 'current': {
      const active = await getActiveProfile();
      if (active) {
        console.log(`Active profile: \x1b[36m${active}\x1b[0m`);
      } else {
        console.log('No active profile set.');
      }
      break;
    }
    default:
      console.error(`Unknown profile subcommand: ${subcommand}`);
      console.error('Available: list, use, create, delete, current');
      process.exit(1);
  }
}
