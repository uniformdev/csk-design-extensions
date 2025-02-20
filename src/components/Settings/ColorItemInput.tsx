import { FC, ReactElement, useCallback, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import Color from 'color';
import { RgbaColor } from 'react-colorful';
import { Popover } from '@uniformdev/design-system';
import { LinkIcon } from '@/components/icons';
import { COLOR_FORMAT, ColorMode } from '@/constants';
import { getColor, isAliasValue, resolveDesignTokenValue } from '@/utils';
import TokenAliasModal from '../TokenAliasModal';
import ColorPicker from './ColorPicker';
import { colorFormatOptionLabel } from '../TokenAliasModal/FormatOptionLabels';

type ColorTriggerProps = {
  icon?: ReactElement;
  isAlias?: boolean;
  invalidColor: boolean;
  name: string;
  value: string;
};

const ColorTrigger: FC<ColorTriggerProps> = ({ icon, invalidColor, isAlias, name, value }) => (
  <div className="relative flex w-full flex-col items-center gap-1">
    <div className="absolute right-0 top-0 z-10 rounded-full bg-white shadow">
      {!!icon && <icon.type {...icon.props} />}
    </div>
    <div
      className={classNames('w-full h-[50px] border border-gray-300 cursor-pointer bg-zero-pattern !rounded-sm', {
        'border-red-500': invalidColor,
        dark: name === ColorMode.Dark,
      })}
      title={`${isAlias ? 'Alias to:' : 'Color:'} ${resolveDesignTokenValue(value)}`}
    >
      <div
        className="size-full"
        style={
          isAlias && value
            ? { backgroundColor: `var(--${resolveDesignTokenValue(value)})` }
            : { backgroundColor: invalidColor ? '' : value }
        }
      >
        {isAlias && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-white/30 p-0.5 backdrop-blur-sm">
            <LinkIcon />
          </div>
        )}
      </div>
    </div>
  </div>
);

type ColorItemInputProps = {
  icon?: ReactElement;
  name: string;
  value?: string;
  defaultValue?: string;
  setValue: (name: string, value: string) => void;
  colors?: Record<string, string[]>;
};

export const ColorItemInput: FC<ColorItemInputProps> = ({
  icon,
  name,
  value = '',
  defaultValue = '',
  setValue,
  colors,
}) => {
  const refTrigger = useRef<HTMLDivElement>(null);
  const isAlias = useMemo(() => isAliasValue(value), [value]);
  const [showAliasConfiguration, setShowAliasConfiguration] = useState(isAlias);

  const invalidColor = useMemo(() => !!value && !isAlias && !getColor(value), [value, isAlias]);

  const handleAutoChange = useCallback(
    ({ a, ...rgb }: RgbaColor) => {
      const color = Color(rgb).alpha(a).round();
      if (value.startsWith(COLOR_FORMAT.RGB)) {
        return setValue(name, color.rgb().toString());
      } else if (value.startsWith(COLOR_FORMAT.HSL)) {
        return setValue(name, color.hsl().toString());
      } else if (value.startsWith(COLOR_FORMAT.HWB)) {
        return setValue(name, color.hwb().toString());
      } else {
        return setValue(name, (a === 1 ? color.hex() : color.hexa()).toString());
      }
    },
    [name, setValue, value]
  );

  const handleManualChange = useCallback(
    (currentValue: string) => {
      setValue(name, currentValue);
    },
    [name, setValue]
  );

  const handleResetValue = useCallback(() => {
    setValue(name, '');
    refTrigger.current?.click();
  }, [name, setValue]);

  const handleSelectToAlias = useCallback(() => {
    setShowAliasConfiguration(true);
  }, []);

  const handleSelectToValue = useCallback(() => {
    if (isAlias) {
      setValue(name, defaultValue);
    }
    setShowAliasConfiguration(false);
  }, [defaultValue, name, setValue, isAlias]);

  const handleAliasChange = useCallback(
    (value: string) => {
      setValue(name, `{${value}}`);
      refTrigger.current?.click();
    },
    [name, setValue]
  );

  return (
    <div className="flex items-center justify-center [&>button]:!w-full">
      <Popover
        buttonText="Color configuration"
        trigger={
          <div ref={refTrigger}>
            <ColorTrigger icon={icon} invalidColor={invalidColor} isAlias={isAlias} name={name} value={value} />
          </div>
        }
        maxWidth="500px"
        placement="top"
      >
        <div>
          {!showAliasConfiguration ? (
            <ColorPicker
              value={value}
              defaultValue={defaultValue}
              invalidColor={invalidColor}
              handleAutoChange={handleAutoChange}
              handleManualChange={handleManualChange}
              handleSelectToAlias={handleSelectToAlias}
              handleResetValue={handleResetValue}
            />
          ) : (
            <TokenAliasModal
              initialValue={isAlias ? value : ''}
              setAliasValue={handleAliasChange}
              resetTokenToValue={handleSelectToValue}
              possibleTokenKeys={colors ? Object.keys(colors) : []}
              formatOptionLabel={colorFormatOptionLabel(colors)}
            />
          )}
        </div>
      </Popover>
    </div>
  );
};
