import { NextApiRequest, NextApiResponse } from 'next';
import { backwardFontCompatible, getDataFromKVStorage } from '@/utils';

const getFonts = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { projectId } = req.query;
    if (!projectId) return res.status(401).json({ message: 'Project Id was not provided' });
    const data = await getDataFromKVStorage(projectId);

    if (data === null) {
      return void res.status(204).end();
    }

    const fonts = backwardFontCompatible(data?.fonts || []).reduce<Record<string, string>>(
      (acc, { fontKey, value }) => ({ ...acc, [fontKey]: value }),
      {}
    );

    return res.status(200).send(fonts);
  } catch (error) {
    return res.status(500).json(error);
  }
};

export default getFonts;
