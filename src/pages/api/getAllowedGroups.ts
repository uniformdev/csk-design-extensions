import { NextApiRequest, NextApiResponse } from 'next';
import { getDataFromKVStorage } from '@/utils';

const getAllowedGroups = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { projectId } = req.query;
    if (!projectId) return res.status(401).json({ message: 'Project Id was not provided' });
    const data = await getDataFromKVStorage(projectId);

    if (data === null) {
      return void res.status(204).end();
    }

    const { allowedGroup = {} } = data || {};

    return res.status(200).json(allowedGroup);
  } catch (error) {
    return res.status(500).json(error);
  }
};

export default getAllowedGroups;
