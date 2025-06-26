import React, { FC, MouseEventHandler, useMemo } from 'react';
import classNames from 'classnames';
import { RefreshIcon } from '@/components/icons';

export type UpdateDefaultSingleProps = {
  value?: string | Record<string, string>;
  options?: MeshType.Options[];
  hideValue?: boolean;
  viewport?: string;
  onResetToDefault?: MouseEventHandler<HTMLButtonElement>;
  onUnsetValue?: MouseEventHandler<HTMLButtonElement>;
};

const UpdateDefaultSingle: FC<UpdateDefaultSingleProps> = ({
  value = '',
  options = [],
  hideValue = false,
  viewport,
  onResetToDefault,
  onUnsetValue,
}) => {
  const showValue = useMemo(() => !hideValue && typeof value === 'string' && value.trim() !== '', [hideValue, value]);

  const displayValue = useMemo(() => {
    if (!showValue) return '';
    const strValue = value as string;
    const matched = options.find(opt => opt.value === strValue);
    return matched?.label ?? strValue;
  }, [showValue, options, value]);

  return (
    <div className="flex w-full items-center justify-center">
      {showValue && (
        <>
          <span
            className={classNames('text-xs leading-4 text-center', {
              italic: !displayValue,
            })}
          >
            {displayValue || 'no value set'}
          </span>
          <div className="mx-2 h-4 w-px bg-gray-300" />
        </>
      )}

      <div className="flex items-center justify-center gap-1 text-xs">
        <button
          type="button"
          title={`Reset to the default value${viewport ? ` for ${viewport}` : ''}`}
          className="border-none bg-transparent p-1"
          onClick={onResetToDefault}
        >
          <RefreshIcon />
        </button>

        <button
          type="button"
          title={`Clear the value${viewport ? ` for ${viewport}` : ''}`}
          className="border-none bg-transparent p-1"
          onClick={onUnsetValue}
        >
          unset
        </button>
      </div>
    </div>
  );
};

export default UpdateDefaultSingle;
