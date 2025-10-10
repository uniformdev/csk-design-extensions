import manifest from '../mesh-manifest.local.json';

export enum HOOK_TYPE {
  createAIEdit = 'createAIEdit',
  afterAIEdit = 'afterAIEdit',
}

export const HOOK_MAP = {
  commonCreateAIEdit: './src/propertyEditor/createAIEdit.ts',
  commonAfterAIEdit: './src/propertyEditor/afterAIEdit.ts',
};

export const PROPERTY_TYPES_MAP: Record<
  (typeof manifest.locations.canvas.parameterTypes)[0]['type'],
  Record<HOOK_TYPE, string>
> = {
  'dex-color-palette-parameter': {
    [HOOK_TYPE.createAIEdit]: HOOK_MAP.commonCreateAIEdit,
    [HOOK_TYPE.afterAIEdit]: HOOK_MAP.commonAfterAIEdit,
  },
  'dex-space-control-parameter': {
    [HOOK_TYPE.createAIEdit]: HOOK_MAP.commonCreateAIEdit,
    [HOOK_TYPE.afterAIEdit]: HOOK_MAP.commonAfterAIEdit,
  },
  'dex-slider-control-parameter': {
    [HOOK_TYPE.createAIEdit]: HOOK_MAP.commonCreateAIEdit,
    [HOOK_TYPE.afterAIEdit]: HOOK_MAP.commonAfterAIEdit,
  },
  'dex-segmented-control-parameter': {
    [HOOK_TYPE.createAIEdit]: HOOK_MAP.commonCreateAIEdit,
    [HOOK_TYPE.afterAIEdit]: HOOK_MAP.commonAfterAIEdit,
  },
  'dex-token-selector-parameter': {
    [HOOK_TYPE.createAIEdit]: HOOK_MAP.commonCreateAIEdit,
    [HOOK_TYPE.afterAIEdit]: HOOK_MAP.commonAfterAIEdit,
  },
};
