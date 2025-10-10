import { z } from 'zod';
import { CONTROL_VARIANT, DesignExtensionsParameters, SliderType } from '@/constants';
import {
  ConfigOptions,
  getAvailableColors,
  getSpacerControlOptions,
  getControlOptions,
  getTokenOptions,
  getTokenData,
} from './helpers';
import {
  createColorPaletteInstructions,
  createSpacerControlInstructions,
  createStepSliderInstructions,
  createOptionSliderInstructions,
  createSegmentedControlInstructions,
  createTokenSelectorInstructions,
  createDefaultInstructions,
  InstructionOptions,
  createSpacingUnitInstructions,
} from './instructions';
import {
  createViewPortSchema,
  createColorPaletteSchema,
  createSpacingSchema,
  createStepSliderSchema,
  createOptionSliderSchema,
  createSegmentedControlSchema,
  createTokenSelectorSchema,
  createDefaultSchema,
  createSpacingValueSchema,
  createSpacingInputSchema,
} from './schemas';

export interface AIEditOutput {
  outputJsonSchema: z.ZodTypeAny;
  instructions: string;
}

export interface ParameterConfig extends ConfigOptions {
  type?: string;
  withViewPort?: boolean;
  minValue?: number;
  maxValue?: number;
  units?: string;
  step?: number;
  selectedTokenType?: string;
}

/**
 * Handles color palette parameter
 */
export const handleColorPalette = async (
  config: ParameterConfig,
  getThemeData: () => Promise<Type.KVStorage>
): Promise<AIEditOutput> => {
  const { colors = [] } = await getThemeData();
  const availableItems = getAvailableColors(colors, config);
  const colorKeys = availableItems.map(({ colorKey }) => colorKey);

  return {
    outputJsonSchema: createColorPaletteSchema(colorKeys),
    instructions: createColorPaletteInstructions(availableItems),
  };
};

/**
 * Handles spacer control parameter
 */
export const handleSpacerControl = async (
  config: ParameterConfig,
  getThemeData: () => Promise<Type.KVStorage>
): Promise<AIEditOutput> => {
  const { dimensions = [] } = await getThemeData();
  const { type: selectedParameterType = CONTROL_VARIANT.DIMENSIONS, withViewPort = false } = config;

  if (selectedParameterType === CONTROL_VARIANT.UNITS) {
    const baseSpacingUnitSchema = createSpacingSchema(createSpacingInputSchema());
    return {
      outputJsonSchema: baseSpacingUnitSchema,
      instructions: createSpacingUnitInstructions(),
    };
  }

  const optionsToRender = getSpacerControlOptions(selectedParameterType, config, dimensions);

  const baseSpacingSchema = createSpacingSchema(createSpacingValueSchema(optionsToRender.map(({ value }) => value)));

  return {
    outputJsonSchema: withViewPort ? createViewPortSchema(baseSpacingSchema) : baseSpacingSchema,
    instructions: createSpacerControlInstructions({
      optionsToRender,
      dimensions,
      withViewPort,
      selectedParameterType,
    }),
  };
};

/**
 * Handles slider parameter
 */
export const handleSlider = async (
  config: ParameterConfig,
  _getThemeData: () => Promise<Type.KVStorage>
): Promise<AIEditOutput> => {
  const { type: selectedParameterType, withViewPort = false, minValue, maxValue, step, units, options } = config;

  if (selectedParameterType === SliderType.Steps) {
    const baseSliderSchema = createStepSliderSchema();
    const instructionOptions: InstructionOptions = {
      withViewPort,
      minValue,
      maxValue,
      step,
      units,
    };

    return {
      outputJsonSchema: withViewPort ? createViewPortSchema(baseSliderSchema) : baseSliderSchema,
      instructions: createStepSliderInstructions(instructionOptions),
    };
  }

  const optionsToRender = getControlOptions(options);
  const baseSliderSchema = createOptionSliderSchema(optionsToRender.map(({ value }) => value));

  const instructionOptions: InstructionOptions = {
    optionsToRender,
    withViewPort,
  };

  return {
    outputJsonSchema: withViewPort ? createViewPortSchema(baseSliderSchema) : baseSliderSchema,
    instructions: createOptionSliderInstructions(instructionOptions),
  };
};

/**
 * Handles segmented control parameter
 */
export const handleSegmentedControl = async (
  config: ParameterConfig,
  _getThemeData: () => Promise<Type.KVStorage>
): Promise<AIEditOutput> => {
  const { options, withViewPort = false } = config;

  const optionsToRender = getControlOptions(options);
  const baseSegmentedControlSchema = createSegmentedControlSchema(optionsToRender.map(({ value }) => value));

  const instructionOptions: InstructionOptions = {
    optionsToRender,
    withViewPort,
  };

  return {
    outputJsonSchema: withViewPort ? createViewPortSchema(baseSegmentedControlSchema) : baseSegmentedControlSchema,
    instructions: createSegmentedControlInstructions(instructionOptions),
  };
};

/**
 * Handles token selector parameter
 */
export const handleTokenSelector = async (
  config: ParameterConfig,
  getThemeData: () => Promise<Type.KVStorage>
): Promise<AIEditOutput> => {
  const themeData = await getThemeData();
  const { selectedTokenType = '', withViewPort = false } = config;

  const tokensToRender = getTokenOptions(selectedTokenType, themeData, config);
  const tokens = getTokenData(selectedTokenType, themeData);

  const baseTokenSelectorSchema = createTokenSelectorSchema(tokensToRender.map(({ value }) => value));

  return {
    outputJsonSchema: withViewPort ? createViewPortSchema(baseTokenSelectorSchema) : baseTokenSelectorSchema,
    instructions: createTokenSelectorInstructions({
      tokensToRender,
      tokens,
      withViewPort,
    }),
  };
};

/**
 * Handles default/unknown parameter types
 */
export const handleDefault = async (
  _config: ParameterConfig,
  _getThemeData: () => Promise<Type.KVStorage>
): Promise<AIEditOutput> => {
  return {
    outputJsonSchema: createDefaultSchema(),
    instructions: createDefaultInstructions(),
  };
};

/**
 * Main parameter handler dispatcher
 */
export const getParameterHandler = (parameterType: string) => {
  switch (parameterType) {
    case DesignExtensionsParameters.colorPalette:
      return handleColorPalette;
    case DesignExtensionsParameters.spacerControl:
      return handleSpacerControl;
    case DesignExtensionsParameters.slider:
      return handleSlider;
    case DesignExtensionsParameters.segmentedControl:
      return handleSegmentedControl;
    case DesignExtensionsParameters.tokenSelector:
      return handleTokenSelector;
    default:
      return handleDefault;
  }
};
