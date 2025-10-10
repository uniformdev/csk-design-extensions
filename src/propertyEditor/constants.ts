import stable_manifest from '../../mesh-manifest.local.json';
/**
 * API endpoint for theme data
 */
const INTEGRATION_BASE_URL = stable_manifest.baseLocationUrl;
export const THEME_DATA_API_ENDPOINT = `${INTEGRATION_BASE_URL}/api/getThemeData`;

/**
 * Mobile-first responsive instructions for Tailwind CSS
 */
export const MOBILE_FIRST_INSTRUCTIONS = `Working mobile-first
Tailwind uses a mobile-first breakpoint system, similar to what you might be used to in other frameworks like Bootstrap.
What this means is that unprefixed utilities (like uppercase) take effect on all screen sizes, while prefixed utilities (like md:uppercase) only take effect at the specified breakpoint and above.`;

/**
 * Base responsive instructions for viewport-based controls
 */
export const RESPONSIVE_VIEWPORT_INSTRUCTION =
  'You can provide responsive values for different viewports (desktop, tablet, mobile).';

/**
 * Spacing properties instruction
 */
export const SPACING_PROPERTIES_INSTRUCTION =
  'You can provide values for any of the spacing properties (marginTop, marginRight, marginBottom, marginLeft, paddingTop, paddingRight, paddingBottom, paddingLeft). Only specify the properties you need to change.';

/**
 * Responsive spacing instruction
 */
export const RESPONSIVE_SPACING_INSTRUCTION =
  'You can provide responsive spacing values for different viewports (desktop, tablet, mobile). Each viewport can contain any of the spacing properties: marginTop, marginRight, marginBottom, marginLeft, paddingTop, paddingRight, paddingBottom, paddingLeft. Only specify the properties and viewports you need to change.';

/**
 * Default fallback instruction
 */
export const DEFAULT_INSTRUCTION = 'You need to specify the value.';
