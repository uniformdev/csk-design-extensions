/* eslint-disable no-console */
import { HOOK_TYPE, PROPERTY_TYPES_MAP } from './constants';

export interface ValidationResult {
  hooks: string[];
  propertyTypes: string[];
}

export function validateArguments(args: string[]): ValidationResult {
  const [hookString, ...propertyTypeParam] = args;

  if (!hookString) {
    console.error(
      `❌ No hooks provided. Please specify hooks as first argument separated by '/'. Available hooks: ${Object.values(
        HOOK_TYPE
      ).join(', ')}.`
    );
    process.exit(1);
  }

  const hookParam = hookString.split('/');
  const hooks = hookParam.filter(hook => HOOK_TYPE[hook as keyof typeof HOOK_TYPE]);
  const propertyTypes = propertyTypeParam.filter(type => PROPERTY_TYPES_MAP[type as keyof typeof PROPERTY_TYPES_MAP]);

  if (hooks.length === 0) {
    console.error(
      `❌ No hooks provided. Please specify hooks as first argument separated by '/'. Available hooks: ${Object.values(
        HOOK_TYPE
      ).join(', ')}.`
    );
    process.exit(1);
  }

  if (hooks.length !== hookParam.length) {
    console.error(
      `❌ Invalid hooks provided. Please specify hooks as first argument separated by '/'. Available hooks: ${Object.values(
        HOOK_TYPE
      ).join(', ')}.`
    );
    process.exit(1);
  }

  if (propertyTypes.length === 0) {
    console.error('❌ No property types provided. Please specify property types as second arguments.');
    process.exit(1);
  }

  if (propertyTypes.length !== propertyTypeParam.length) {
    console.error(
      `❌ Invalid property types provided. Please specify property types as second arguments. Available property types: ${Object.keys(
        PROPERTY_TYPES_MAP
      ).join(', ')}.`
    );
    process.exit(1);
  }

  return {
    hooks,
    propertyTypes,
  };
}
