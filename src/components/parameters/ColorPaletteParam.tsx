import React, { FC, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { Callout } from '@uniformdev/design-system';
import { SetLocationValueDispatch } from '@uniformdev/mesh-sdk-react';
import WithStylesVariables from '@/components/WithStylesVariables';
import { ALLOW_COLOR_GROUP } from '@/constants';
import { getGroupFromKey } from '@/utils';

type ColorPaletteParamProps = {
  value?: string;
  setValue: SetLocationValueDispatch<string | null | undefined, string | null | undefined>;
  withDarkMode: NonNullable<Type.KVStorage['withDarkMode']>;
  colors: NonNullable<Type.KVStorage['colors']>;
  selectedGroup?: string;
  allowColors?: string[];
};

const ColorPaletteParam: FC<ColorPaletteParamProps> = ({
  value,
  setValue,
  withDarkMode,
  colors = [],
  selectedGroup,
  allowColors,
}) => {
  const availableItems = useMemo(() => {
    if (allowColors?.length) {
      return colors.filter(({ colorKey }) => allowColors.includes(colorKey));
    }
    return colors.filter(({ colorKey }) =>
      selectedGroup ? colorKey.startsWith(selectedGroup) : !ALLOW_COLOR_GROUP.includes(getGroupFromKey(colorKey))
    );
  }, [allowColors, colors, selectedGroup]);

  const handelSaveValue = useCallback(
    (currentValue: string | null) =>
      setValue(previousValue => ({ newValue: previousValue === currentValue ? null : currentValue })),
    [setValue]
  );

  if (!colors.length)
    return (
      <Callout type="info">
        <p>No available colors to select.</p>
      </Callout>
    );

  return (
    <div className="flex min-h-12 flex-row items-center gap-2 pl-1">
      <WithStylesVariables colors={colors} />
      {availableItems.map(({ colorKey }) => (
        <div
          key={colorKey}
          className={classNames('relative size-[30px] duration-500 flex-shrink-0 bg-zero-pattern', {
            'mx-2.5 transform scale-150 border-none shadow-2xl': colorKey === value,
          })}
          title={colorKey}
          onClick={() => handelSaveValue(colorKey)}
        >
          {withDarkMode ? (
            <>
              <div
                className="absolute z-10 size-0 border-r-[30px] border-t-[30px] border-r-transparent"
                style={{ borderTopColor: `var(--${colorKey})` }}
              />
              <div
                className="dark absolute z-10 size-0 border-b-[30px] border-l-[30px] border-l-transparent"
                style={{ borderBottomColor: `var(--${colorKey})` }}
              />
            </>
          ) : (
            <div className="z-10 size-full" style={{ background: `var(--${colorKey})` }} />
          )}
        </div>
      ))}
    </div>
  );
};

export default ColorPaletteParam;
