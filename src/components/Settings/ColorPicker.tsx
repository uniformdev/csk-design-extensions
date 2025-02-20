import { ChangeEvent, FC, useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import Color from 'color';
import { RgbaColor, RgbaColorPicker } from 'react-colorful';
import { Button, Input } from '@uniformdev/design-system';
import { BackspaceIcon, LinkIcon } from '@/components/icons';
import { COLOR_FORMAT } from '@/constants';
import { getColor } from '@/utils';

const transformColorToValue = (color: Color | null) => {
  if (!color) return { r: 0, g: 0, b: 0, a: 1 };
  const { r, g, b, alpha: a = 1 } = color.rgb().object();
  return { r, g, b, a };
};

type ColorPickerProps = {
  value: string;
  defaultValue: string;
  invalidColor: boolean;
  handleAutoChange: (color: RgbaColor) => void;
  handleManualChange: (value: string) => void;
  handleSelectToAlias: () => void;
  handleResetValue: () => void;
};

const ColorPicker: FC<ColorPickerProps> = ({
  value,
  defaultValue,
  invalidColor,
  handleAutoChange,
  handleManualChange,
  handleSelectToAlias,
  handleResetValue,
}: ColorPickerProps) => {
  const [{ r, g, b, a }, setColorSettings] = useState(transformColorToValue(getColor(value, defaultValue)));

  const transform = useMemo(() => {
    const opacityPercent = Math.round(a * 100);
    if (opacityPercent < 30) {
      return `translateX(calc(${opacityPercent * 7.75}% - 225%))`;
    }
    return `translateX(calc(325% - ${(100 - opacityPercent) * 7.75}%))`;
  }, [a]);

  const colorModel = useMemo(() => {
    const color = value || defaultValue;
    return (
      Object.values(COLOR_FORMAT).find(format => color.startsWith(format)) ||
      (color.startsWith('#') ? COLOR_FORMAT.HEX : 'c')
    );
  }, [value, defaultValue]);

  const switchColorFormat = useCallback(
    (currentFormat: string) => {
      const formats = Object.values(COLOR_FORMAT);
      const nextFormat = formats[formats.findIndex(format => format === currentFormat) + 1] || formats[0];
      const alpha = Math.round(a * 100) / 100;
      const color = Color(value).alpha(alpha).round();
      handleManualChange(color?.[nextFormat]?.().toString() || color?.hexa().toString());
    },
    [value, a, handleManualChange]
  );

  const onChangeColor = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const color = e.target.value;
      handleManualChange(color);
      setColorSettings(transformColorToValue(getColor(color, defaultValue)));
    },
    [defaultValue, handleManualChange]
  );

  const onChangePick = useCallback(
    (value: RgbaColor) => {
      setColorSettings(value);
      handleAutoChange(value);
    },
    [handleAutoChange, setColorSettings]
  );

  return (
    <div className="relative w-[310px]">
      <RgbaColorPicker className="!w-full [&>*]:!rounded-b-none" color={{ r, g, b, a }} onChange={onChangePick} />
      <div className="absolute bottom-[54px] right-1/2 flex translate-x-1/2 gap-2" style={{ transform }}>
        <span className="min-w-[40px] cursor-default rounded bg-white/30 px-1 text-center text-xs backdrop-blur-sm">
          {Math.round(a * 100)}%
        </span>
      </div>
      <div className="relative">
        <Input
          className={classNames(
            'w-full truncate !pl-[50px] !pr-16 px-4 !-mt-1 !rounded !border-x-[1px] !border-b-[1px] !outline-none !rounded-tl-none !rounded-tr-none',
            {
              '!border-red-500': invalidColor,
            }
          )}
          value={value}
          onChange={onChangeColor}
        />
        <div className="absolute left-1 top-1/2 flex -translate-y-1/2 gap-2">
          <Button
            className="!min-w-11 !p-1"
            buttonType="secondary"
            disabled={!value || invalidColor}
            onClick={() => switchColorFormat(colorModel)}
          >
            <span className="w-full text-center uppercase">{colorModel}</span>
          </Button>
        </div>
        <div className="absolute right-1 top-1/2 flex -translate-y-1/2 gap-2">
          <Button className="!p-0" buttonType="ghost" onClick={handleSelectToAlias}>
            <LinkIcon />
          </Button>
          <Button className="!p-0" buttonType="ghost" onClick={handleResetValue}>
            <BackspaceIcon />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
