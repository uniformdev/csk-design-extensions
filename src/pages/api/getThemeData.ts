import { NextApiRequest, NextApiResponse } from 'next';
import { getDataFromKVStorage } from '@/utils';

const getThemeData = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { projectId } = req.query;
    if (!projectId) return res.status(401).json({ message: 'Project Id was not provided' });
    const data = await getDataFromKVStorage(projectId);

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json(error);
  }
};

export default getThemeData;
