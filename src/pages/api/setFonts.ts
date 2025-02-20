import { NextApiRequest, NextApiResponse } from 'next';
import { checkRoles, getDataFromKVStorage, setDataToKVStorage } from '@/utils';

const setFonts = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { projectId, env } = req.query;
    const environment = env === 'canary' ? 'canary' : undefined;
    const xApiKey = req.headers['x-api-key'] as string | undefined;

    if (!projectId) return res.status(401).json({ message: 'Project Id was not provided' });
    if (!xApiKey) return res.status(401).json({ message: 'Api key was not provided' });

    const response = await checkRoles(projectId, xApiKey, environment);
    if (!response.ok) return res.status(response.status).json({ message: 'API key was not valid' });

    const projectKey = typeof projectId === 'string' ? projectId : projectId[0];

    const data = req.body;

    const fonts = Object.keys(data).map(fontKey => ({
      fontKey,
      value: data[fontKey],
    }));

    const themeData = (await getDataFromKVStorage(projectKey)) || {};

    await setDataToKVStorage(projectKey, { ...themeData, fonts }, environment);
    res.status(200).send('OK');
  } catch (error) {
    return res.status(500).json(error);
  }
};

export default setFonts;
