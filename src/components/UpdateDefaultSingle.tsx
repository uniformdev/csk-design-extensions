import { FC, MouseEventHandler } from 'react';
import classNames from 'classnames';
import { RefreshIcon } from '@/components/icons';

type UpdateDefaultSingleProps = {
  onResetToDefault?: MouseEventHandler<HTMLButtonElement> | undefined;
  onUnsetValue?: MouseEventHandler<HTMLButtonElement> | undefined;
  value?: string | Record<string, string>;
  hideValue?: boolean;
  viewport?: string;
};

const UpdateDefaultSingle: FC<UpdateDefaultSingleProps> = ({
  value,
  onResetToDefault,
  onUnsetValue,
  hideValue,
  viewport,
}) => (
  <div className="flex w-full items-center justify-center">
    {!hideValue && value && typeof value === 'string' && (
      <>
        <span className={classNames('text-xs leading-4 text-center', { italic: !value })}>
          {value || 'no value set'}
        </span>
        <div className="mx-2 h-4 w-px bg-gray-300" />
      </>
    )}
    <div className="flex items-center justify-center gap-1 text-xs">
      <button
        title={`Reset to the default value ${viewport ? `for ${viewport}` : ''}`}
        className="my-2 border-0 bg-transparent"
        onClick={onResetToDefault}
      >
        <RefreshIcon />
      </button>
      <button
        title={`Clear the value ${viewport ? `for ${viewport}` : ''}`}
        className="my-2 border-0 bg-transparent"
        onClick={onUnsetValue}
      >
        unset
      </button>
    </div>
  </div>
);

export default UpdateDefaultSingle;
