import { FC } from 'react';
import classNames from 'classnames';
import { LinkIcon } from '@/components/icons';
import { ColorMode } from '@/constants';
import { getTokenNameFromVar, isAliasValue, resolveDesignTokenValue } from '@/utils';

export type FormatOptionLabelProps = { key: string; label: string; value: string };

const dimensionFormatOptionLabel: (dimensions?: Record<string, string>) => FC<FormatOptionLabelProps> = dimensions => {
  const InnerComponent: FC<FormatOptionLabelProps> = ({ label }) => {
    const currentValue = dimensions?.[label];
    const isAlias = isAliasValue(currentValue);
    const resolvedValue = isAlias && currentValue ? resolveDesignTokenValue(currentValue) : currentValue;
    return (
      <div className="flex items-center justify-between gap-1">
        <span className="truncate" title={label}>
          {label}
        </span>
        <div className="flex items-center gap-1">
          {isAlias && <LinkIcon className="size-[14px]" />}
          {resolvedValue}
        </div>
      </div>
    );
  };

  return InnerComponent;
};

const ColorPreviewItem: FC<{
  mode?: string;
  value?: string;
}> = ({ mode = '', value }) => {
  const isAlias = isAliasValue(value);
  const resolvedValue = isAlias && value ? `var(--${resolveDesignTokenValue(value)})` : value;
  return (
    <div className="flex items-center gap-0.5" title={getTokenNameFromVar(resolvedValue)}>
      <div
        className={classNames('relative w-10 h-6 border border-gray-400 bg-zero-pattern', {
          'bg-zero-pattern': !value,
          [mode]: mode,
        })}
      >
        <div
          className="size-full"
          style={{
            backgroundColor: resolvedValue,
          }}
        >
          {isAlias && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-white/30 p-0.5 backdrop-blur-sm">
              <LinkIcon className="size-[14px]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const colorFormatOptionLabel: (colors?: Record<string, string[]>) => FC<FormatOptionLabelProps> = colors => {
  const InnerComponent: FC<FormatOptionLabelProps> = ({ label }) => {
    const currentValue = colors?.[label];
    return (
      <div className="flex items-center justify-between gap-1">
        <span className="truncate" title={label}>
          {label}
        </span>
        <div className="flex gap-1">
          {currentValue?.map((value, index) =>
            value ? <ColorPreviewItem key={index} mode={Object.values(ColorMode)[index]} value={value} /> : null
          )}
        </div>
      </div>
    );
  };
  return InnerComponent;
};

export { dimensionFormatOptionLabel, colorFormatOptionLabel };
