import React, { FC, useCallback, useMemo, useState, ChangeEvent } from 'react';
import classNames from 'classnames';
import { Button, Callout } from '@uniformdev/design-system';
import { SetLocationValueDispatch } from '@uniformdev/mesh-sdk-react';
import WithStylesVariables from '@/components/WithStylesVariables';
import { ALLOW_COLOR_GROUP } from '@/constants';
import { getGroupFromKey } from '@/utils';
import Sketch from '@uiw/react-color-sketch';

const CUSTOM_HEX_PREFIX = 'custom:';

type ColorPaletteParamProps = {
  value?: string;
  setValue: SetLocationValueDispatch<string | null, string | null>;
  withDarkMode: NonNullable<Type.KVStorage['withDarkMode']>;
  colors: NonNullable<Type.KVStorage['colors']>;
  selectedGroup?: string;
  allowColors?: string[];
  allowCustomHex?: boolean;
};

const ColorPaletteParam: FC<ColorPaletteParamProps> = ({
  value,
  setValue,
  withDarkMode,
  colors = [],
  selectedGroup,
  allowColors,
  allowCustomHex,
}) => {
  const isCustomHexValue = value?.startsWith(CUSTOM_HEX_PREFIX) ?? false;
  const customHexColor = isCustomHexValue && value ? value.slice(CUSTOM_HEX_PREFIX.length) : undefined;
  const [showPicker, setShowPicker] = useState(false);

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
      setShowPicker(false);
      setValue(prev => ({ newValue: prev === selected ? null : selected }));
    },
    [setValue]
  );

  const handlePickerChange = useCallback(
    (color: { hex: string }) => {
      setValue(() => ({ newValue: `${CUSTOM_HEX_PREFIX}${color.hex}` }));
    },
    [setValue]
  );

  const handleCustomSquareClick = useCallback(() => {
    setShowPicker(prev => !prev);
  }, []);

  const handleClear = useCallback(() => {
    setShowPicker(false);
    setValue(() => ({ newValue: null }));
  }, [setValue]);

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
        {allowCustomHex && (
          <button
            type="button"
            onClick={handleCustomSquareClick}
            className={classNames(
              'relative size-8 rounded-sm border cursor-pointer',
              'hover:outline hover:outline-2 hover:outline-accent-dark-hover',
              'flex items-center justify-center',
              isCustomHexValue ? 'outline outline-2 outline-accent-dark border-white' : 'border-dashed border-gray-400'
            )}
            style={customHexColor ? { backgroundColor: customHexColor } : undefined}
            title="Custom hex color"
          >
            {!customHexColor && <span className="text-sm font-bold text-gray-400">?</span>}
          </button>
        )}
      </div>
      {allowCustomHex && showPicker && (
        <div className="mt-2 flex flex-col items-start gap-1.5">
          <Sketch color={customHexColor || '#000000'} onChange={handlePickerChange} />
          <Button buttonType="secondary" size="sm" onClick={() => setShowPicker(false)}>
            Accept
          </Button>
        </div>
      )}
      <div className="mt-2 flex items-center justify-between">
        <span className="h-6 truncate">{isCustomHexValue ? customHexColor : value}</span>
        <button
          // eslint-disable-next-line tailwindcss/no-custom-classname
          className="text-action-destructive-default disabled:text-gray-400"
          onClick={handleClear}
          disabled={!value}
        >
          clear
        </button>
      </div>
    </div>
  );
};

export default ColorPaletteParam;
