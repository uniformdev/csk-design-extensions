import { NextApiRequest, NextApiResponse } from 'next';

const DIMENSION_TOKENS = {
  container: {
    $type: 'dimension',
    small: {
      $value: '12px',
    },
    medium: {
      $value: '24px',
    },
    large: {
      $value: '36px',
    },
    xlarge: {
      $value: '48px',
    },
  },
};

const BORDERS_TOKENS = {
  border: {
    $type: 'border',
    primary: {
      $value: {
        radius: '5px 5px 5px 5px',
        width: '2px 2px 2px 2px',
        color: '#041142',
        style: 'solid dashed dotted dashed',
      },
    },
    secondary: {
      $value: {
        radius: '10px',
        width: '1px',
        color: '#DF0000',
        style: 'solid',
      },
    },
  },
};

const DESIGN_TOKENS_LIGHT = {
  button: {
    $type: 'color',
    primary: {
      $value: '#001C6C',
    },
    secondary: {
      $value: '#B10D00',
    },
    tertiary: {
      $value: '#99C6FF',
    },
  },
  text: {
    $type: 'color',
    primary: {
      $value: '#000000',
    },
    secondary: {
      $value: '#FFFFFF',
    },
    tertiary: {
      $value: '#0052ED',
    },
    light: {
      $value: '#FFFFFF',
    },
  },
  general: {
    $type: 'color',
    'color-1': {
      $value: '#FFFFFF',
    },
    'color-2': {
      $value: '#041142',
    },
  },
  ...DIMENSION_TOKENS,
  ...BORDERS_TOKENS,
};

const DESIGN_TOKENS_DARK = {
  button: {
    $type: 'color',
    primary: {
      $value: '#0052ED',
    },
    secondary: {
      $value: '#DF0000',
    },
    tertiary: {
      $value: '#DCEEFF',
    },
  },
  text: {
    $type: 'color',
    primary: {
      $value: '#FFFFFF',
    },
    secondary: {
      $value: '#000000',
    },
    tertiary: {
      $value: '#0052ED',
    },
    light: {
      $value: '#FFFFFF',
    },
  },
  general: {
    $type: 'color',
    'color-1': {
      $value: '#041142',
    },
    'color-2': {
      $value: '#FFFFFF',
    },
  },
  ...DIMENSION_TOKENS,
  ...BORDERS_TOKENS,
};

const getBaseDesignTokensFile = async (req: NextApiRequest, res: NextApiResponse) => {
  const { mode } = req.query;
  return res.status(200).json(mode === 'dark' ? DESIGN_TOKENS_DARK : DESIGN_TOKENS_LIGHT);
};

export default getBaseDesignTokensFile;
