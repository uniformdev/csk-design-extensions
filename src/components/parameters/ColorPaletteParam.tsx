import React, { FC, useCallback, useMemo, ChangeEvent } from 'react';
import classNames from 'classnames';
import { Button, Callout } from '@uniformdev/design-system';
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

  const handleSelection = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const selected = event.currentTarget.value;
      setValue(prev => ({ newValue: prev === selected ? null : selected }));
    },
    [setValue]
  );

  const handleClear = useCallback(() => setValue(() => ({ newValue: null })), [setValue]);

  if (!colors.length) {
    return (
      <Callout type="info">
        <p>No available colors to select.</p>
      </Callout>
    );
  }

  return (
    <div className="m-0.5">
      <WithStylesVariables colors={colors} />
      <div className="flex flex-wrap gap-1.5">
        {availableItems.map(({ colorKey }) => {
          const isSelected = colorKey === value;
          return (
            <label
              key={colorKey}
              className={classNames(
                'cursor-pointer relative size-8 rounded-sm border border-white bg-zero-pattern',
                'hover:outline hover:outline-2 hover:outline-accent-dark-hover',
                { 'outline outline-2 outline-accent-dark': isSelected }
              )}
            >
              <input
                name="color-palette"
                type="checkbox"
                value={colorKey}
                checked={isSelected}
                onChange={handleSelection}
                className="sr-only"
              />
              {withDarkMode ? (
                <>
                  <span
                    aria-hidden
                    className="absolute z-10 size-0 border-r-[30px] border-t-[30px] border-r-transparent"
                    style={{ borderTopColor: `var(--${colorKey})` }}
                  />
                  <span
                    aria-hidden
                    className="dark absolute z-10 size-0 border-b-[30px] border-l-[30px] border-l-transparent"
                    style={{ borderBottomColor: `var(--${colorKey})` }}
                  />
                </>
              ) : (
                <span
                  aria-hidden
                  className="z-10 block size-full"
                  style={{ background: `var(--${colorKey})` }}
                  title={colorKey}
                />
              )}
            </label>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center text-sm">
          <span className="mr-1 uppercase text-gray-400">Selected:</span>
          <span className="truncate">{value || 'none'}</span>
        </div>
        <Button buttonType="ghostDestructive" onClick={handleClear} disabled={!value}>
          Clear
        </Button>
      </div>
    </div>
  );
};

export default ColorPaletteParam;
