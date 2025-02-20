import React, { FC } from 'react';
import classNames from 'classnames';
import { Label } from '@uniformdev/design-system';
import { ColorMode } from '@/constants';

type ColorItemProps = {
  className?: string;
  colorKey: string;
  colorValues: string;
};

const ColorItem: FC<ColorItemProps> = ({ className, colorKey, colorValues }) => (
  <div
    id={colorKey}
    title={colorValues}
    className={classNames('size-6 rounded border border-gray-400 shrink-0 delay-500 bg-zero-pattern', className)}
  >
    <div className="size-full rounded" style={{ backgroundColor: `var(--${colorKey})` }} />
  </div>
);

type ColorConfigItemSectionProps = {
  filteredColors: NonNullable<Type.KVStorage['colors']>;
  withDarkMode: NonNullable<Type.KVStorage['withDarkMode']>;
  allowColors: string[];
  handelSaveValue: (currentValue: string) => void;
};

const ColorConfigItemSection: FC<ColorConfigItemSectionProps> = ({
  filteredColors,
  withDarkMode,
  allowColors,
  handelSaveValue,
}) => (
  <>
    <Label>Limit the parameter to the following colors:</Label>
    <div className="flex flex-row flex-wrap gap-2">
      {filteredColors.map(({ colorKey, ...colorValues }) => {
        const isSelected = !allowColors.length || !!allowColors.find(key => key === colorKey);
        return (
          <button
            key={colorKey}
            className={classNames(
              'flex items-center w-[calc(50%-4px)]  justify-between p-2 bg-gray-50 rounded-md border border-brand-secondary-3',
              { 'text-gray-500 border-gray-50 opacity-65': !isSelected }
            )}
            title={colorKey}
            onClick={() => handelSaveValue(colorKey)}
          >
            {colorKey}
            <div className="flex flex-row gap-1">
              <ColorItem colorKey={colorKey} colorValues={colorValues[ColorMode.Light]} />
              {withDarkMode && (
                <ColorItem className="dark" colorKey={colorKey} colorValues={colorValues[ColorMode.Dark]} />
              )}
            </div>
          </button>
        );
      })}
    </div>
  </>
);

export default ColorConfigItemSection;
