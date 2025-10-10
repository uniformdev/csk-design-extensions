import {
  MOBILE_FIRST_INSTRUCTIONS,
  RESPONSIVE_VIEWPORT_INSTRUCTION,
  SPACING_PROPERTIES_INSTRUCTION,
  RESPONSIVE_SPACING_INSTRUCTION,
  DEFAULT_INSTRUCTION,
} from './constants';

export interface InstructionOptions {
  availableItems?: { colorKey: string }[];
  optionsToRender?: { value: string }[];
  tokensToRender?: { value: string }[];
  tokens?:
    | Type.KVStorage['colors']
    | Type.KVStorage['dimensions']
    | Type.KVStorage['fonts']
    | Type.KVStorage['borders'];
  dimensions?: { dimensionKey: string }[];
  withViewPort?: boolean;
  minValue?: number;
  maxValue?: number;
  step?: number;
  units?: string;
  selectedParameterType?: string;
}

/**
 * Generates instructions for color palette parameter
 */
export const createColorPaletteInstructions = (availableItems: { colorKey: string }[]): string => {
  return `You choose from the available colors: ${JSON.stringify(
    availableItems
  )}. Where light and dark fields are color values. You only need to specify the color key.`;
};

/**
 * Generates instructions for spacer control parameter
 */
export const createSpacerControlInstructions = (options: InstructionOptions): string => {
  const { optionsToRender = [], dimensions = [], withViewPort = false, selectedParameterType } = options;

  const baseInstruction = withViewPort ? RESPONSIVE_SPACING_INSTRUCTION : SPACING_PROPERTIES_INSTRUCTION;

  const availableValuesInstruction = `Available values: ${JSON.stringify(
    optionsToRender
  )}. Use the value field from the available options.`;

  const mobileFirstInstruction = withViewPort ? MOBILE_FIRST_INSTRUCTIONS : '';

  const dimensionReferenceInstruction =
    selectedParameterType === 'dimensions'
      ? `\nHere for reference: Dimension keys with values: ${JSON.stringify(dimensions)}`
      : '';

  return baseInstruction + availableValuesInstruction + mobileFirstInstruction + dimensionReferenceInstruction;
};

/**
 * Generates instructions for slider parameter (steps type)
 */
export const createStepSliderInstructions = (options: InstructionOptions): string => {
  const { withViewPort = false, minValue, maxValue, step, units } = options;

  const baseInstruction = withViewPort
    ? `${RESPONSIVE_VIEWPORT_INSTRUCTION} You need to specify the value from ${minValue} to ${maxValue} with ${step} step`
    : `You need to specify the value from ${minValue} to ${maxValue} with ${step} step`;

  const unitsInstruction = units ? ` and add ${units} to the value` : '';
  const mobileFirstInstruction = withViewPort ? MOBILE_FIRST_INSTRUCTIONS : '';

  return baseInstruction + unitsInstruction + mobileFirstInstruction;
};

/**
 * Generates instructions for spacing unit parameter
 */
export const createSpacingUnitInstructions = (): string => {
  return `You need to specify the value in numbers(it can be negative or positive values) and add the unit to the value. 
  Available units: px, %, em, rem. Also you can specify the value as auto. For example: 10px, -10px, 10%, -10%, 10em, -10em, 10rem, -10rem, auto.`;
};

/**
 * Generates instructions for slider parameter (options type)
 */
export const createOptionSliderInstructions = (options: InstructionOptions): string => {
  const { optionsToRender = [], withViewPort = false } = options;

  const baseInstruction = withViewPort ? `${RESPONSIVE_VIEWPORT_INSTRUCTION}\n` : '';

  const availableValuesInstruction = `You choose from the available slider values: ${JSON.stringify(
    optionsToRender
  )}. You only need to specify the slider value.`;

  const mobileFirstInstruction = withViewPort ? MOBILE_FIRST_INSTRUCTIONS : '';

  return baseInstruction + availableValuesInstruction + mobileFirstInstruction;
};

/**
 * Generates instructions for segmented control parameter
 */
export const createSegmentedControlInstructions = (options: InstructionOptions): string => {
  const { optionsToRender = [], withViewPort = false } = options;

  const baseInstruction = withViewPort ? `${RESPONSIVE_VIEWPORT_INSTRUCTION}\n` : '';

  const availableValuesInstruction = `You choose from the available segmented control values: ${JSON.stringify(
    optionsToRender
  )}. You only need to specify the segmented control value.`;

  const mobileFirstInstruction = withViewPort ? MOBILE_FIRST_INSTRUCTIONS : '';

  return baseInstruction + availableValuesInstruction + mobileFirstInstruction;
};

/**
 * Generates instructions for token selector parameter
 */
export const createTokenSelectorInstructions = (options: InstructionOptions): string => {
  const { tokensToRender = [], tokens = [], withViewPort = false } = options;

  const baseInstruction = withViewPort ? `${RESPONSIVE_VIEWPORT_INSTRUCTION}\n` : '';

  const availableValuesInstruction = `You choose from the available token selector values: ${JSON.stringify(
    tokensToRender.map(({ value }) => value)
  )}. You only need to specify the token selector value.`;

  const mobileFirstInstruction = withViewPort ? MOBILE_FIRST_INSTRUCTIONS : '';
  const tokensReferenceInstruction = `\nHere for reference: Tokens keys are: ${JSON.stringify(tokens)}`;

  return baseInstruction + availableValuesInstruction + mobileFirstInstruction + tokensReferenceInstruction;
};

/**
 * Generates default instructions
 */
export const createDefaultInstructions = (): string => {
  return DEFAULT_INSTRUCTION;
};
