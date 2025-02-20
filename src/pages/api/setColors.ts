import { NextApiRequest, NextApiResponse } from 'next';
import { ColorMode } from '@/constants';
import { checkRoles, getDataFromKVStorage, setDataToKVStorage } from '@/utils';

const setColors = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { projectId, env } = req.query;
    const environment = env === 'canary' ? 'canary' : undefined;
    const xApiKey = req.headers['x-api-key'] as string | undefined;

    if (!projectId) return res.status(401).json({ message: 'Project Id was not provided' });
    if (!xApiKey) return res.status(401).json({ message: 'Api key was not provided' });

    const response = await checkRoles(projectId, xApiKey, environment);
    if (!response.ok) return res.status(response.status).json({ message: 'API key was not valid' });

    const projectKey = typeof projectId === 'string' ? projectId : projectId[0];

    const data = req.body as Record<string, Record<string, string>>;

    const modes = Object.keys(data);

    const withDarkMode = modes.includes(ColorMode.Dark);

    const colors = [...new Set(Object.values(data).map(Object.keys).flat())].reduce<
      NonNullable<Type.KVStorage['colors']>
    >(
      (acc, colorKey) => [
        ...acc,
        {
          colorKey,
          ...modes.reduce((colorValuesAcc, mode) => ({ ...colorValuesAcc, [mode]: data[mode][colorKey] || '' }), {}),
        },
      ],
      []
    );

    const themeData = (await getDataFromKVStorage(projectId)) || {};

    await setDataToKVStorage(projectKey, { ...themeData, colors, withDarkMode }, environment);
    res.status(200).send('OK');
  } catch (error) {
    return res.status(500).json(error);
  }
};

export default setColors;
