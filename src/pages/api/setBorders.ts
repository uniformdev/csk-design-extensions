import { NextApiRequest, NextApiResponse } from 'next';
import { checkRoles, getDataFromKVStorage, getEnvironmentUrl, setDataToKVStorage } from '@/utils';

const setBorder = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { projectId, baseUrl, env } = req.query;
    const environmentUrl = getEnvironmentUrl(baseUrl as string, env as string);
    const xApiKey = req.headers['x-api-key'] as string | undefined;

    if (!projectId) return res.status(401).json({ message: 'Project Id was not provided' });
    if (!xApiKey) return res.status(401).json({ message: 'Api key was not provided' });
    if (!environmentUrl) return res.status(401).json({ message: 'We are not able to recognize the environment' });

    const response = await checkRoles(projectId, xApiKey, environmentUrl);
    if (!response.ok) return res.status(response.status).json({ message: 'API key was not valid' });

    const projectKey = typeof projectId === 'string' ? projectId : projectId[0];

    const data = req.body as Record<string, NonNullable<Type.KVStorage['borders']>[number]['value']>;
    const borderKeys = Object.keys(data);

    const borders = borderKeys.reduce<NonNullable<Type.KVStorage['borders']>>((acc, key) => {
      return [...acc, { borderKey: key, value: data[key] }];
    }, []);

    const themeData = (await getDataFromKVStorage(projectId)) || {};

    await setDataToKVStorage(projectKey, { ...themeData, borders }, environmentUrl);
    res.status(200).send('OK');
  } catch (error) {
    return res.status(500).json(error);
  }
};

export default setBorder;
