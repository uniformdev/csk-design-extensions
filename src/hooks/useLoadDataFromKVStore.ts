import { useEffect, useMemo, useState } from 'react';
import { backwardFontCompatible, getIndexByFontName } from '@/utils';

export const useLoadDataFromKVStore = (projectId: string) => {
  const [withDarkMode, setWithDarkMode] = useState(false);
  const [colors, setColors] = useState<NonNullable<Type.KVStorage['colors']>>([]);
  const [dimensions, setDimensions] = useState<NonNullable<Type.KVStorage['dimensions']>>([]);
  const [fonts, setFonts] = useState<NonNullable<Type.KVStorage['fonts']>>([]);
  const [borders, setBorders] = useState<NonNullable<Type.KVStorage['borders']>>([]);
  const [defaultFontIndex, setDefaultFontIndex] = useState<number>(-1);
  const [allowedGroup, setAllowedGroup] = useState<Type.KVStorage['allowedGroup']>(undefined);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    setIsLoading(true);
    const run = async () => {
      const response = await fetch(`/api/getThemeData?projectId=${projectId}`);

      if (!response.ok) throw Error(response.statusText);

      const {
        withDarkMode = false,
        colors = [],
        dimensions = [],
        fonts = [],
        defaultFont = '',
        borders = [],
        allowedGroup,
      }: Omit<Type.KVStorage, 'fonts'> & {
        fonts?: string[] | Type.KVStorage['fonts'];
      } = (await response.json()) || {};

      const mappedFonts = backwardFontCompatible(fonts);

      setWithDarkMode(withDarkMode);
      setColors(colors);
      setDimensions(dimensions);
      setFonts(backwardFontCompatible(fonts));
      setDefaultFontIndex(getIndexByFontName(defaultFont, mappedFonts));
      setBorders(borders);
      setAllowedGroup(allowedGroup);
    };

    run()
      .catch(error => {
        console.error(error);
        setErrorMessage(`Failed to get data for ${projectId} project.`);
      })
      .finally(() => setIsLoading(false));
  }, [projectId]);

  return {
    data: useMemo(
      () => ({ withDarkMode, colors, dimensions, fonts, defaultFontIndex, borders, allowedGroup }),
      [withDarkMode, colors, dimensions, fonts, defaultFontIndex, borders, allowedGroup]
    ),
    isLoading,
    errorMessage,
    setWithDarkMode,
    setColors,
    setDimensions,
    setFonts,
    setDefaultFontIndex,
    setBorders,
    setAllowedGroup,
  };
};
