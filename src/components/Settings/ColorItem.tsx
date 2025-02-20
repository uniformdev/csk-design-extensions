import { ChangeEvent, FC, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { Input } from '@uniformdev/design-system';
import { Trash } from '@/components/icons';
import { ColorMode, DEFAULT_COLOR_VALUE, REGEX_KEY } from '@/constants';
import { ColorItemInput } from './ColorItemInput';

type ColorItemProps = {
  withDarkMode: boolean;
  colors?: NonNullable<Type.KVStorage['colors']>;
  colorKey: string;
  value: Record<string, string>;
  isUnique: boolean;
  updateColor: (colorKey: string, value: Record<string, string>) => void;
  deleteColor: () => void;
};

export const ColorItem: FC<ColorItemProps> = ({
  withDarkMode,
  colors,
  colorKey,
  value,
  isUnique,
  updateColor,
  deleteColor,
}) => {
  const handleSetColors = useCallback(
    (name: string, newValue: string) => updateColor(colorKey, { ...value, [name]: newValue }),
    [colorKey, updateColor, value]
  );

  const handleSetColorKey = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { value: key } = e.target;
      updateColor(key, value);
    },
    [updateColor, value]
  );

  const recordColors = useMemo(
    () =>
      colors?.reduce<Record<ColorMode, Record<string, string[]>>>(
        (acc, { colorKey, ...value }) => ({
          ...acc,
          [ColorMode.Light]: {
            ...acc[ColorMode.Light],
            [colorKey]: [value[ColorMode.Light]],
          },
          [ColorMode.Dark]: {
            ...acc[ColorMode.Dark],
            [colorKey]: ['', value[ColorMode.Dark]],
          },
        }),
        { [ColorMode.Light]: {}, [ColorMode.Dark]: {} }
      ),
    [colors]
  );

  return (
    <>
      <div className="grid grid-cols-7 items-center gap-4">
        <div className="col-span-4 ml-5">
          <Input
            showLabel={false}
            className={classNames({
              '!text-red-500 !border-red-500': !isUnique || !colorKey.length || !new RegExp(REGEX_KEY).test(colorKey),
            })}
            value={colorKey}
            onChange={handleSetColorKey}
          />
        </div>
        <div className={classNames({ 'col-span-1': withDarkMode, 'col-span-2': !withDarkMode })}>
          <ColorItemInput
            name={ColorMode.Light}
            value={value[ColorMode.Light]}
            defaultValue={DEFAULT_COLOR_VALUE[ColorMode.Light]}
            setValue={handleSetColors}
            colors={recordColors?.[ColorMode.Light]}
          />
        </div>
        {withDarkMode && (
          <div className="col-span-1">
            <ColorItemInput
              name={ColorMode.Dark}
              value={value[ColorMode.Dark]}
              defaultValue={DEFAULT_COLOR_VALUE[ColorMode.Dark]}
              setValue={handleSetColors}
              colors={recordColors?.[ColorMode.Dark]}
            />
          </div>
        )}
        <div className="flex justify-center">
          <Trash className="size-5 cursor-pointer text-red-400" onClick={deleteColor} />
        </div>
      </div>
      <div className="border-b" />
    </>
  );
};
