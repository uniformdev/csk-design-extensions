export enum DesignExtensionsParameters {
  colorPalette = 'dex-color-palette-parameter',
  spacerControl = 'dex-space-control-parameter',
  slider = 'dex-slider-control-parameter',
  segmentedControl = 'dex-segmented-control-parameter',
  tokenSelector = 'dex-token-selector-parameter',
}

export const enum SliderType {
  Custom = 'custom',
  Steps = 'steps',
}

export enum ColorMode {
  Light = 'light',
  Dark = 'dark',
}

export const DESIGN_EXTENSIONS_TABS: { label: string; key: Type.TabKey }[] = [
  { label: 'Color', key: 'color' },
  { label: 'Size/Dimension', key: 'size-dimension' },
  { label: 'Font', key: 'font' },
  { label: 'Border', key: 'border' },
];

export const UNIFORM_SETTINGS_TABS: { label: string; key: Type.TabKey }[] = [{ label: 'Webhooks', key: 'webhooks' }];

export const RESERVED_FONT_KEYS = ['default'];

export const REGEX_KEY = /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/;
export const REGEX_GROUP_NAME = /^[a-z0-9_]+(\s?[a-z0-9_]+)*(\s?)?$/;
export const REGEX_BRACKETS = /[{}]/g;

export const GF_SUFFIX = '_GF_';

export const ALLOW_COLOR_GROUP = ['button', 'text'];
export const ALLOW_DIMENSION_GROUP = ['badge', 'button', 'container', 'spacer', 'table'];

export const DEFAULT_GROUP_NAME = 'general';

export const TRUE_VALIDATION_RESULT = Object.freeze({ isValid: true });

export const VIEWPORT_CHANNEL_NAME = 'viewport-selected';
export const VIEWPORT_SELECTED_MESSAGE_TYPE = 'TAB_SELECTED';

export const VIEW_PORT_TABS: { tabName: string; tabKey: Type.ViewPortKeyType }[] = [
  { tabName: 'Mobile', tabKey: 'mobile' },
  { tabName: 'Tablet', tabKey: 'tablet' },
  { tabName: 'Desktop', tabKey: 'desktop' },
];

export enum TokenType {
  Color = 'color',
  Dimension = 'dimension',
  Font = 'font',
  Border = 'border',
}

export enum CONTROL_VARIANT {
  DIMENSIONS = 'dimensions',
  CUSTOM = 'custom',
  UNITS = 'units',
}

export const SPACE_CONTROL_VARIANTS = [
  { label: 'Dimensions', value: CONTROL_VARIANT.DIMENSIONS },
  { label: 'Custom options', value: CONTROL_VARIANT.CUSTOM },
  { label: 'Units', value: CONTROL_VARIANT.UNITS },
];

export const DEFAULT_COLOR_VALUE = { [ColorMode.Light]: '#FFFFFF', [ColorMode.Dark]: '#000000' };
export const DEFAULT_DIMENSION_VALUE = '0px';
export const DEFAULT_BORDER_VALUE = { color: '#000000', width: '1px', radius: '0px', style: 'solid' };

export const ROOT_COLOR_SCHEME_KEY = ColorMode.Light;

export enum COLOR_FORMAT {
  RGB = 'rgb',
  HSL = 'hsl',
  HWB = 'hwb',
  HEX = 'hexa',
}
