import { NextApiRequest, NextApiResponse } from 'next';
import { formattedColorTokens, getDataFromKVStorage } from '@/utils';

const getColors = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { projectId, withDarkMode } = req.query;
    if (!projectId) return res.status(401).json({ message: 'Project Id was not provided' });
    const data = await getDataFromKVStorage(projectId);

    if (data === null) {
      return void res.status(204).end();
    }

    const { withDarkMode: isDefaultDarkMode, colors } = data || {};

    const formattedColors = formattedColorTokens(colors, withDarkMode, isDefaultDarkMode);

    return res.status(200).json(formattedColors);
  } catch (error) {
    return res.status(500).json(error);
  }
};

export default getColors;
