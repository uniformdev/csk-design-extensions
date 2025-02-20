import { FC, MouseEventHandler, PropsWithChildren } from 'react';
import { Button } from '@uniformdev/design-system';

type ParameterPreviewProps = PropsWithChildren<{
  onSaveDefault?: MouseEventHandler<unknown> | undefined;
  showUpdateLabel?: boolean;
  disabled?: boolean;
}>;

const ParameterPreview: FC<ParameterPreviewProps> = ({ children, onSaveDefault, showUpdateLabel, disabled }) => (
  <div className="border border-gray-300 bg-gray-50 p-4">
    <span className="text-xs uppercase leading-4">Preview</span>
    <div className="relative py-4">{children}</div>
    <div className="flex w-full justify-end">
      <Button disabled={disabled} onClick={onSaveDefault} buttonType="secondaryInvert">
        {showUpdateLabel ? 'Update default' : 'Set as default'}
      </Button>
    </div>
  </div>
);

export default ParameterPreview;
