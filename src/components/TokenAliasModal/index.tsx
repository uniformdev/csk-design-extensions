import { FC, useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { Caption, InputComboBox, Button, Label } from '@uniformdev/design-system';
import { resolveDesignTokenValue, toOption } from '@/utils';
import { FormatOptionLabelProps } from './FormatOptionLabels';

type TokenAliasModalProps = {
  initialValue?: string;
  setAliasValue: (value: string) => void;
  resetTokenToValue: () => void;
  possibleTokenKeys?: string[];
  formatOptionLabel?: FC<FormatOptionLabelProps>;
};

const TokenAliasModal: FC<TokenAliasModalProps> = ({
  initialValue = '',
  setAliasValue,
  resetTokenToValue,
  possibleTokenKeys = [],
  formatOptionLabel,
}) => {
  const [value, setValue] = useState<string>(resolveDesignTokenValue(initialValue));
  const isNeedToSave = useMemo(() => resolveDesignTokenValue(initialValue) !== value, [initialValue, value]);

  const handleSaveValue = useCallback(() => {
    setAliasValue(value);
  }, [setAliasValue, value]);

  const handleAliasChange = useCallback((newValue: MeshType.Options | null) => {
    setValue(newValue?.value || '');
  }, []);

  return (
    <div className="flex flex-col gap-4 text-start">
      <div>
        <Label>Set alias to: </Label>
        <InputComboBox
          className={classNames('w-full')}
          options={possibleTokenKeys.map(toOption)}
          value={toOption(value)}
          onChange={handleAliasChange}
          formatOptionLabel={formatOptionLabel}
        />
        <Caption>To make a design token refer to another token</Caption>
      </div>
      <div className="flex flex-row gap-2">
        <Button type="button" buttonType="primary" onClick={handleSaveValue} disabled={!isNeedToSave}>
          Save
        </Button>
        <Button type="button" buttonType="secondary" onClick={resetTokenToValue}>
          Reset to value
        </Button>
      </div>
    </div>
  );
};

export default TokenAliasModal;
