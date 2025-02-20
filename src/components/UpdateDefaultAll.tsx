import { FC, MouseEventHandler } from 'react';
import { RefreshIcon } from '@/components/icons';

type UpdateDefaultAllProps = {
  onResetAllValues?: MouseEventHandler<HTMLButtonElement> | undefined;
};

const UpdateDefaultAll: FC<UpdateDefaultAllProps> = ({ onResetAllValues }) => (
  <button
    title="Reset to the default value for all view ports"
    className="absolute right-0 my-2 flex w-auto items-center justify-center gap-1 border-0 bg-transparent text-xs"
    onClick={onResetAllValues}
  >
    <RefreshIcon />
    all
  </button>
);

export default UpdateDefaultAll;
