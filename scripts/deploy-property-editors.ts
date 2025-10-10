#!/usr/bin/env node
/* eslint-disable no-console */

import { execSync } from 'child_process';
import { HOOK_TYPE, PROPERTY_TYPES_MAP } from './constants';
import { validateArguments } from './validation-utils';

async function deployPropertyEditors() {
  const { hooks, propertyTypes } = validateArguments(process.argv.slice(2));

  console.info('🚀 Starting property editors deployment...');
  console.info(`📋 Property types to deploy: ${propertyTypes.join(', ')}\n`);

  for (const propertyType of propertyTypes) {
    try {
      console.info(`📦 Deploying ${hooks.join(', ')} for ${propertyType}...`);

      for (const hook of hooks) {
        const hookPath =
          PROPERTY_TYPES_MAP[propertyType as keyof typeof PROPERTY_TYPES_MAP][hook as keyof typeof HOOK_TYPE];

        if (!hookPath) {
          console.error(`❌ Hook path not found for ${propertyType} and ${hook}`);
          process.exit(1);
        }

        const command = `uniform integration definition propertyEditor deploy --propertyType ${propertyType} --hook ${hook} ${hookPath}`;

        execSync(command, {
          stdio: 'inherit',
          cwd: process.cwd(),
        });
      }

      console.info(`✅ Successfully deployed ${hooks.join(', ')} for ${propertyType}\n`);
    } catch (error) {
      console.error(`❌ Failed to deploy ${hooks.join(', ')} for ${propertyType}:`, error);
      process.exit(1);
    }
  }

  console.info('🎉 All property editors deployed successfully!');
}

deployPropertyEditors().catch(error => {
  console.error('❌ Deployment failed:', error);
  process.exit(1);
});
