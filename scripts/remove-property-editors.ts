#!/usr/bin/env node
/* eslint-disable no-console */

import { execSync } from 'child_process';
import { validateArguments } from './validation-utils';

async function removePropertyEditors() {
  const { hooks, propertyTypes } = validateArguments(process.argv.slice(2));

  console.info('🗑️  Starting property editors removal...');
  console.info(`📋 Property types to remove: ${propertyTypes.join(', ')}\n`);

  for (const propertyType of propertyTypes) {
    try {
      console.info(`🔄 Removing ${hooks.join(', ')} for ${propertyType}...`);

      for (const hook of hooks) {
        const command = `uniform integration definition propertyEditor remove --propertyType ${propertyType} --hook ${hook}`;

        execSync(command, {
          stdio: 'inherit',
          cwd: process.cwd(),
        });
      }

      console.info(`✅ Successfully removed ${hooks.join(', ')} for ${propertyType}\n`);
    } catch (error) {
      console.error(`❌ Failed to remove ${hooks.join(', ')} for ${propertyType}:`, error);
      process.exit(1);
    }
  }

  console.info('🎉 All property editors removed successfully!');
}

removePropertyEditors().catch(error => {
  console.error('❌ Removal failed:', error);
  process.exit(1);
});
