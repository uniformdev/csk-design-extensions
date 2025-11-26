import { z } from 'zod';

/**
 * Creates a responsive viewport schema that wraps a base schema
 * with optional desktop, tablet, and mobile variants
 */
export const createViewPortSchema = <T extends z.ZodTypeAny>(baseSchema: T) => {
  return z
    .object({
      desktop: baseSchema.describe('Desktop viewport values'),
      tablet: baseSchema.describe('Tablet viewport values'),
      mobile: baseSchema.describe('Mobile viewport values'),
    })
    .optional()
    .describe('Responsive values for different viewports');
};

/**
 * Creates a spacing schema with margin and padding properties
 * based on available values
 */
export const createSpacingSchema = <T extends z.ZodTypeAny>(baseSchema: T) => {
  const spacingProperties = z
    .object({
      marginTop: baseSchema.describe('Top margin value'),
      marginRight: baseSchema.describe('Right margin value'),
      marginBottom: baseSchema.describe('Bottom margin value'),
      marginLeft: baseSchema.describe('Left margin value'),
      paddingTop: baseSchema.describe('Top padding value'),
      paddingRight: baseSchema.describe('Right padding value'),
      paddingBottom: baseSchema.describe('Bottom padding value'),
      paddingLeft: baseSchema.describe('Left padding value'),
    })
    .optional();

  return spacingProperties.describe('Space control values for margin and padding properties');
};

/**
 * Creates a slider schema for spacing unit value
 */
export const createSpacingInputSchema = () => {
  return z.string().optional().describe('The selected spacing unit value');
};

/**
 * Creates a slider schema for custom and dimensions spacing values
 */
export const createSpacingValueSchema = (availableValues: string[]) => {
  return z.enum(availableValues).optional().describe('The selected spacing value');
};

/**
 * Creates a color palette schema based on available color keys
 */
export const createColorPaletteSchema = (availableColorKeys: string[]) => {
  return z.enum(availableColorKeys).optional().describe('The selected color key');
};

/**
 * Creates a slider schema for step-based sliders
 */
export const createStepSliderSchema = () => {
  return z.string().optional().describe('The selected slider value');
};

/**
 * Creates a slider schema for option-based sliders
 */
export const createOptionSliderSchema = (availableValues: string[]) => {
  return z.enum(availableValues).optional().describe('The selected option slider value');
};

/**
 * Creates a segmented control schema based on available values
 */
export const createSegmentedControlSchema = (availableValues: string[]) => {
  return z.enum(availableValues).optional().describe('The selected segmented control value');
};

/**
 * Creates a token selector schema based on available token values
 */
export const createTokenSelectorSchema = (availableTokenValues: string[]) => {
  return z.enum(availableTokenValues).optional().describe('The selected token key');
};

/**
 * Creates a default fallback schema
 */
export const createDefaultSchema = () => {
  return z.string().optional().describe('The selected value');
};
