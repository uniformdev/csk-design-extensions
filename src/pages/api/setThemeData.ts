import { NextApiRequest, NextApiResponse } from 'next';
import { getDataFromKVStorage, getEnvironmentUrl, setDataToKVStorage } from '@/utils';

// The value does not include the protocol scheme https://
const allowedOrigins = [
  process.env.VERCEL_PROJECT_PRODUCTION_URL,
  process.env.VERCEL_URL,
  process.env.VERCEL_BRANCH_URL,
].filter(Boolean);

const setThemeData = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const customOrigin = req.headers['custom-origin'];
    if (
      allowedOrigins.length &&
      (!customOrigin ||
        typeof customOrigin !== 'string' ||
        (customOrigin && !allowedOrigins.includes(new URL(customOrigin).host)))
    ) {
      return res.status(403).json({ message: 'Forbidden: Invalid host' });
    }

    const { projectId, baseUrl, env } = req.query;

    const environmentUrl = getEnvironmentUrl(baseUrl as string, env as string);

    if (!projectId) return res.status(401).json({ message: 'Project Id was not provided' });

    const { metaData } = (await getDataFromKVStorage(projectId)) || {};
    await setDataToKVStorage(projectId, { ...req.body, metaData }, environmentUrl);
    res.status(200).send('OK');
  } catch (error) {
    return res.status(500).json(error);
  }
};

export default setThemeData;
