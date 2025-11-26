import { ALLOW_COLOR_GROUP, ALLOW_DIMENSION_GROUP, CONTROL_VARIANT, DEFAULT_GROUP_NAME, TokenType } from '@/constants';
import { getGroupFromKey, getNameFromKey, getOptionFromToken } from '@/utils';
import { THEME_DATA_API_ENDPOINT } from './constants';

export interface OptionItem {
  label: string;
  value: string;
  key: string;
}

export interface ConfigOptions {
  allowColors?: string[];
  selectedGroup?: string;
  allowDimensions?: string[];
  options?: Array<{ key: string; value: string; label?: string }>;
  allowTokens?: string[];
}

/**
 * Fetches theme data from the API
 */
export const fetchThemeData = async (projectId: string): Promise<Type.KVStorage> => {
  const response = await fetch(`${THEME_DATA_API_ENDPOINT}?projectId=${projectId}`);
  return (response.json() || {}) as Promise<Type.KVStorage>;
};

/**
 * Filters available colors based on configuration
 */
export const getAvailableColors = (
  colors: Array<{ colorKey: string }> = [],
  config: ConfigOptions
): Array<{ colorKey: string }> => {
  const { allowColors, selectedGroup } = config;

  if (allowColors && allowColors.length) {
    return colors.filter(({ colorKey }) => allowColors.includes(colorKey));
  }

  return colors.filter(({ colorKey }) =>
    selectedGroup ? colorKey.startsWith(selectedGroup) : !ALLOW_COLOR_GROUP.includes(getGroupFromKey(colorKey))
  );
};

/**
 * Gets options for spacer control based on parameter type
 */
export const getSpacerControlOptions = (
  selectedParameterType: string,
  config: ConfigOptions,
  dimensions: Array<{ dimensionKey: string }> = []
): OptionItem[] => {
  const { allowDimensions = [], selectedGroup, options } = config;

  switch (selectedParameterType) {
    case CONTROL_VARIANT.DIMENSIONS: {
      const filteredDimensions = (() => {
        if (allowDimensions?.length) {
          return dimensions.filter(({ dimensionKey }) => allowDimensions.includes(dimensionKey));
        }
        return dimensions.filter(({ dimensionKey }) =>
          selectedGroup
            ? dimensionKey.startsWith(selectedGroup)
            : !ALLOW_DIMENSION_GROUP.includes(getGroupFromKey(dimensionKey))
        );
      })();

      return filteredDimensions.map(({ dimensionKey }, index) => ({
        label: getNameFromKey(dimensionKey, selectedGroup),
        value: dimensionKey,
        key: `${dimensionKey}-${index}`,
      }));
    }

    case CONTROL_VARIANT.CUSTOM:
      return (
        options?.map(({ key, value }, index) => ({
          label: key,
          value,
          key: `${key}-${index}`,
        })) || []
      );

    case CONTROL_VARIANT.UNITS:
    default:
      return [];
  }
};

/**
 * Gets options for regular controls (slider, segmented control)
 */
export const getControlOptions = (
  options: Array<{ key: string; value: string; label?: string }> = []
): OptionItem[] => {
  return options.map(({ label, key, value }, index) => ({
    label: label || key,
    value,
    key: `${key}-${index}`,
  }));
};

/**
 * Gets token options based on token type
 */
export const getTokenOptions = (
  selectedTokenType: string,
  themeData: Type.KVStorage,
  config: ConfigOptions
): OptionItem[] => {
  const { allowTokens = [], selectedGroup } = config;
  const { colors = [], dimensions = [], fonts = [], borders = [], allowedGroup } = themeData;

  switch (selectedTokenType) {
    case TokenType.Color:
      return getOptionFromToken(
        colors.map(({ colorKey }) => colorKey),
        allowTokens,
        selectedGroup || DEFAULT_GROUP_NAME
      );

    case TokenType.Dimension:
      return getOptionFromToken(
        dimensions.map(({ dimensionKey }) => dimensionKey),
        allowTokens,
        selectedGroup || DEFAULT_GROUP_NAME,
        allowedGroup?.dimension || ALLOW_DIMENSION_GROUP
      );

    case TokenType.Font:
      return getOptionFromToken(
        fonts.map(({ fontKey }) => fontKey),
        allowTokens,
        DEFAULT_GROUP_NAME
      );

    case TokenType.Border:
      return getOptionFromToken(
        borders.map(({ borderKey }) => borderKey),
        allowTokens,
        DEFAULT_GROUP_NAME
      );

    default:
      return [];
  }
};

/**
 * Gets token data based on token type
 */
export const getTokenData = (
  selectedTokenType: string,
  themeData: Type.KVStorage
): Type.KVStorage['colors'] | Type.KVStorage['dimensions'] | Type.KVStorage['fonts'] | Type.KVStorage['borders'] => {
  const { colors = [], dimensions = [], fonts = [], borders = [] } = themeData;

  switch (selectedTokenType) {
    case TokenType.Color:
      return colors;
    case TokenType.Dimension:
      return dimensions;
    case TokenType.Font:
      return fonts;
    case TokenType.Border:
      return borders;
    default:
      return [];
  }
};
