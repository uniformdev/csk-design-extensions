import Color from 'color';
import { KeyValueItem } from '@uniformdev/design-system';
import {
  GF_SUFFIX,
  TokenType,
  DEFAULT_GROUP_NAME,
  DEFAULT_BORDER_VALUE,
  DEFAULT_DIMENSION_VALUE,
  DEFAULT_COLOR_VALUE,
  ColorMode,
  REGEX_BRACKETS,
  REGEX_KEY,
  ROOT_COLOR_SCHEME_KEY,
} from '@/constants';
import { kv } from '@vercel/kv';

export const checkTokenKeys = (tokensKey: string[]) =>
  !tokensKey.some(key => !new RegExp(REGEX_KEY).test(key)) &&
  [...new Set(tokensKey.filter(Boolean))].length === tokensKey.length;

export const checkColorValueKeys = (colorValue: string[]) => !colorValue.some(value => !getColor(value));

export const getFontURL = (font: string): string =>
  `https://fonts.googleapis.com/css2?family=${font.replaceAll(' ', '+')}&display=swap`;
export const getFontFamilyName = (font: string): string => font.split(':')[0];
export const getFontKey = (font: string): string => getFontFamilyName(font).toLowerCase().replaceAll(' ', '-');

export const backwardFontCompatible = (fonts: string[] | NonNullable<Type.KVStorage['fonts']>) =>
  fonts.map(value => {
    if (typeof value !== 'string') return value;
    return {
      fontKey: getFontKey(value),
      value: value.endsWith(GF_SUFFIX) ? value.replaceAll(GF_SUFFIX, '') : '',
    };
  });

export function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export const getIndexByFontName = (fontName: string | undefined, fonts: NonNullable<Type.KVStorage['fonts']>) =>
  fontName ? fonts.map(({ fontKey }) => fontKey).indexOf(fontName) : -1;

export const getFontNameByIndex = (index: number, fonts: NonNullable<Type.KVStorage['fonts']>) =>
  index === -1 || !fonts[index] ? undefined : fonts[index].fontKey;

const normalizeKey = (str: string) => str.replace(/[\s_]/g, '-');

type JSONValue = string | number | boolean | null | { [key: string]: JSONValue } | JSONValue[];

const isSimpleValue = (value: JSONValue) =>
  typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';

const getTokenValue = (value: JSONValue, type: TokenType) => {
  switch (type) {
    // Simple Tokens https://second-editors-draft.tr.designtokens.org/format/#types
    case TokenType.Color:
    case TokenType.Dimension:
      return isSimpleValue(value) ? value.toString() : '';
    // Composite Tokens https://second-editors-draft.tr.designtokens.org/format/#composite-types
    case TokenType.Border:
      return typeof value === 'object' && value !== null && !Array.isArray(value) ? value : {};
    default:
      return '';
  }
};

export const transformDesignTokens = (designTokens: object, type: TokenType) => {
  const tokens: Type.DesignToken[] = [];
  const processTokenGroup = (group: object, isCurrentType = false, prefix = '') => {
    Object.entries(group).forEach(([key, value]) => {
      const currentType =
        isCurrentType && (!value?.$type || !value?.type)
          ? isCurrentType
          : value?.$type === type || value?.type === type;
      if (value && typeof value === 'object') {
        if (currentType && (value.$value || value.value)) {
          tokens.push({
            key: `${prefix}${normalizeKey(key)}`,
            value: getTokenValue(value.$value || value.value, type),
            type,
          });
        } else {
          processTokenGroup(value, currentType, `${prefix}${normalizeKey(key)}-`);
        }
      }
    });
  };
  processTokenGroup(designTokens);
  return tokens;
};

export const transformToEntityValue = (value: string | object, type: TokenType): string | Record<string, string> => {
  switch (type) {
    case TokenType.Color:
      return typeof value === 'string' ? value : DEFAULT_COLOR_VALUE[ColorMode.Light];
    case TokenType.Dimension:
      return typeof value === 'string' ? value : DEFAULT_DIMENSION_VALUE;
    case TokenType.Border:
      if (typeof value === 'object') {
        const {
          color = DEFAULT_BORDER_VALUE.color,
          width = DEFAULT_BORDER_VALUE.width,
          radius = DEFAULT_BORDER_VALUE.radius,
          style = DEFAULT_BORDER_VALUE.style,
        } = (value as never) || {};
        return { color, width, radius, style };
      } else {
        return DEFAULT_BORDER_VALUE;
      }
    default:
      return '';
  }
};

export const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const getGroupFromKey = (key: string) => (key.includes('-') ? key.split('-')[0] : '');

export const getNameFromKey = (key: string, selectedGroup = DEFAULT_GROUP_NAME) => {
  const [group, ...name] = key.split('-');
  return [group === selectedGroup ? '' : group, ...name].filter(Boolean).join('-');
};

export const validateOptions = (newOptions: KeyValueItem[]) => {
  return newOptions.map(option => {
    if (!option.value) {
      return { value: 'Value is required', key: '' };
    }

    const existingOptions = newOptions.filter(o => o.value === option.value);
    if (existingOptions.length > 1) {
      return { value: 'Values must be unique', key: '' };
    }

    return null;
  });
};

export const addNewOption = (index = 0) => ({ key: `option-${index + 1}`, value: `value-${index + 1}` });

const mapToOption = (tokenKey: string, selectedGroup = DEFAULT_GROUP_NAME) => ({
  label: getNameFromKey(tokenKey, selectedGroup),
  key: tokenKey,
  value: tokenKey,
});

export const getOptionFromToken = (
  tokens: string[],
  allowTokens: string[],
  selectedGroup: string,
  allowedGroups?: string[]
) => {
  if (allowTokens?.length) {
    return tokens
      .filter(tokenKey => allowTokens.includes(tokenKey))
      .map(tokenKey => mapToOption(tokenKey, selectedGroup));
  }
  return (
    selectedGroup
      ? tokens.filter(tokenKey =>
          selectedGroup !== DEFAULT_GROUP_NAME
            ? tokenKey.startsWith(selectedGroup)
            : !allowedGroups?.includes(getGroupFromKey(tokenKey))
        )
      : tokens
  ).map(tokenKey => mapToOption(tokenKey, selectedGroup));
};

export const toOption = (value: string) => ({ key: value, label: value, value });

export const isAliasValue = (value?: string) => value?.startsWith('{') && value.endsWith('}');

export const resolveDesignTokenValue = (value: string, withBrackets = false) => {
  if (isAliasValue(value)) {
    const tokenValue = value.replaceAll('.', '-');
    return withBrackets ? tokenValue : tokenValue.replace(REGEX_BRACKETS, '');
  } else {
    return value;
  }
};

export const getDataFromKVStorage = (projectId: string | string[]) =>
  kv.get<Type.KVStorage & Type.KVMetaData>(typeof projectId === 'string' ? projectId : projectId[0]);

export const setDataToKVStorage = (
  projectId: string | string[],
  data: Type.KVStorage & Type.KVMetaData,
  environmentUrl = 'https://uniform.app'
) =>
  kv.set(typeof projectId === 'string' ? projectId : projectId[0], {
    ...data,
    metaData: {
      environment: getEnvironmentFromUrl(environmentUrl) || data?.metaData?.environment,
      lastUpdated: new Date().toISOString(),
    },
  });

export const checkRoles = (projectId: string | string[], xApiKey: string, baseUrl: string) => {
  if (!new URL(baseUrl).hostname?.endsWith('uniform.app')) {
    return {
      ok: false,
      status: 403,
      message: 'Forbidden domain',
    };
  }
  return fetch(`${baseUrl}/api/v2/manifest?projectId=${projectId}`, {
    method: 'GET',
    headers: { 'x-api-key': xApiKey },
  }).then(({ ok, status }) => ({ ok, status, message: ok ? 'API key is valid' : 'API key is not valid' }));
};

export const getColorTokensCSSVars = (tokens: NonNullable<Type.KVStorage['colors']>): string => {
  const simpleColors =
    tokens?.reduce<Record<string, Record<string, string>>>(
      (acc, { colorKey, ...colorsValues }) => ({
        ...acc,
        ...Object.keys(colorsValues).reduce((modeAcc, mode) => {
          return {
            ...modeAcc,
            [mode]: {
              ...acc[mode],
              [colorKey]: isAliasValue(colorsValues[mode])
                ? `var(--${resolveDesignTokenValue(colorsValues[mode])})`
                : colorsValues[mode],
            },
          };
        }, {}),
      }),
      {}
    ) || {};

  const colorSchemes = Object.entries(simpleColors).reduce(
    (acc, [scheme, tokenValues]) => {
      acc[scheme] = Object.entries(tokenValues)
        .map(([tokenKey, tokenValue]) => `--${tokenKey}: ${resolveDesignTokenValue(tokenValue)};\r\n\t`)
        .join('');
      return acc;
    },
    {} as Record<string, string>
  );

  const sccVars = Object.entries(colorSchemes).reduce((css, [scheme, styles]) => {
    const selector = scheme === ROOT_COLOR_SCHEME_KEY ? ':root' : `.${scheme}`;
    return `${css}${selector} {\r\n\t${styles}}\r\n`;
  }, '');
  return sccVars ? `<style>${sccVars}</style>` : '';
};

export const getDimensionTokensCSSVars = (tokens: NonNullable<Type.KVStorage['dimensions']>): string => {
  const cssVars = tokens
    .map(({ dimensionKey, ...dimensionValues }) => {
      return `--${dimensionKey}: ${
        isAliasValue(dimensionValues.value)
          ? `var(--${resolveDesignTokenValue(dimensionValues.value)})`
          : dimensionValues.value
      }`;
    })
    .join(';\r\n');

  return cssVars ? `<style>:root {\r\n\t${cssVars}\r\n}</style>` : '';
};

export const getTokenNameFromVar = (value?: string) =>
  value ? value.replaceAll('var(--', '').replaceAll(')', '') : '';

export const getColor = (value: string, fallback?: string): Color | null => {
  try {
    return Color(value);
  } catch {
    return fallback ? getColor(fallback) : null;
  }
};

export const formattedColorTokens = (
  colors: Type.KVStorage['colors'],
  withDarkMode: string | string[] | undefined,
  isDefaultDarkMode: boolean | undefined
) =>
  colors?.reduce<Record<string, Record<string, string>>>(
    (acc, { colorKey, ...colorsValues }) => ({
      ...acc,
      ...Object.keys(colorsValues).reduce<Record<string, Record<string, string>>>((modeAcc, mode) => {
        if (mode === ColorMode.Dark) {
          const darkModeEnabled = typeof withDarkMode === 'string' ? withDarkMode === 'true' : isDefaultDarkMode;
          if (!darkModeEnabled) return modeAcc;
        }
        return {
          ...modeAcc,
          [mode]: { ...acc[mode], [colorKey]: resolveDesignTokenValue(colorsValues[mode], true) },
        };
      }, {}),
    }),
    {}
  ) || {};

export const formattedDimensionTokens = (dimensions: Type.KVStorage['dimensions']) =>
  dimensions?.reduce(
    (acc, { dimensionKey, value }) => ({
      ...acc,
      [dimensionKey]: resolveDesignTokenValue(value, true),
    }),
    {}
  ) || {};

export const formattedBorderTokens = (borders: Type.KVStorage['borders']) =>
  borders?.reduce(
    (acc, { borderKey, value }) => ({
      ...acc,
      [borderKey]: {
        radius: resolveDesignTokenValue(value.radius, true),
        width: resolveDesignTokenValue(value.width, true),
        color: resolveDesignTokenValue(value.color, true),
        style: resolveDesignTokenValue(value.style, true),
      },
    }),
    {}
  ) || {};

export const getEnvironmentUrl = (baseUrl?: string, env?: string) => {
  if (!baseUrl && !env) {
    return 'https://uniform.app';
  }
  if (baseUrl) {
    return baseUrl;
  }
  const environment = env === 'canary' ? 'canary' : undefined;

  return `https://${environment ? `${environment}.` : ''}uniform.app`;
};

export const getEnvironmentFromUrl = (url: string): string => {
  try {
    const hostname = new URL(url).hostname;

    if (hostname.startsWith('localhost')) {
      return 'localhost';
    }

    const predefinedEnvironments: Record<string, string> = {
      'uniform.app': 'production',
      'canary.uniform.app': 'canary',
    };

    if (predefinedEnvironments[hostname]) {
      return predefinedEnvironments[hostname];
    }

    return hostname?.replaceAll('.uniform.app', '');
  } catch {
    return '';
  }
};
