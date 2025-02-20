import { NextApiRequest, NextApiResponse } from 'next';
import {
  backwardFontCompatible,
  formattedBorderTokens,
  formattedColorTokens,
  formattedDimensionTokens,
  getDataFromKVStorage,
} from '@/utils';

const getBorder = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { projectId, withDarkMode } = req.query;
    if (!projectId) return res.status(401).json({ message: 'Project Id was not provided' });
    const data = await getDataFromKVStorage(projectId);

    if (data === null) {
      return void res.status(204).end();
    }

    const {
      withDarkMode: isDefaultDarkMode,
      colors,
      dimensions,
      fonts,
      defaultFont = '',
      borders,
      allowedGroup = {},
    } = data || {};

    const formattedColors = formattedColorTokens(colors, withDarkMode, isDefaultDarkMode);
    const formattedDimensions = formattedDimensionTokens(dimensions);
    const formattedFonts = backwardFontCompatible(fonts || []).reduce<Record<string, string>>(
      (acc, { fontKey, value }) => ({ ...acc, [fontKey]: value }),
      {}
    );
    const formattedBorders = formattedBorderTokens(borders);

    return res.status(200).json({
      colors: formattedColors,
      dimensions: formattedDimensions,
      defaultFont,
      fonts: formattedFonts,
      borders: formattedBorders,
      allowedGroup,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};

export default getBorder;
