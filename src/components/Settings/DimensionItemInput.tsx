import { FC, useCallback, useMemo, useRef } from 'react';
import classNames from 'classnames';
import { Input, Popover } from '@uniformdev/design-system';
import { isAliasValue, resolveDesignTokenValue } from '@/utils';
import { LinkIcon } from '../icons';
import TokenAliasModal from '../TokenAliasModal';
import { dimensionFormatOptionLabel } from '../TokenAliasModal/FormatOptionLabels';

type DimensionItemInputProps = {
  name: string;
  value: string;
  setValue: (name: string, value: string) => void;
  recordDimensions?: Record<string, string>;
  defaultValue?: string;
};

export const DimensionItemInput: FC<DimensionItemInputProps> = ({
  name,
  value,
  setValue,
  recordDimensions,
  defaultValue = '',
}) => {
  const refTrigger = useRef<HTMLDivElement>(null);
  const isAlias = useMemo(() => isAliasValue(value), [value]);

  const handleSelectToValue = useCallback(() => {
    if (isAlias) {
      setValue(name, defaultValue);
    }
    refTrigger.current?.click();
  }, [name, setValue, defaultValue, isAlias]);

  const handleAliasChange = useCallback(
    (value: string) => {
      setValue(name, `{${value}}`);
      refTrigger.current?.click();
    },
    [name, setValue]
  );

  return (
    <div>
      <div className="relative">
        <Input
          showLabel={false}
          className={classNames({
            '!text-red-500 !border-red-500': !value.length,
          })}
          value={isAlias ? `Alias to: ${resolveDesignTokenValue(value)}` : value}
          onChange={e => setValue(name, e.target.value)}
        />
        <div className="[&>button]:!absolute [&>button]:right-3 [&>button]:top-1/2 [&>button]:-translate-y-1/2 ">
          <Popover
            buttonText="Dimension configuration"
            placement="top"
            maxWidth="500px"
            trigger={
              <div ref={refTrigger}>
                <LinkIcon
                  className={classNames({
                    'text-primary-action-default': isAlias,
                  })}
                />
              </div>
            }
          >
            <TokenAliasModal
              initialValue={isAlias ? value : ``}
              setAliasValue={handleAliasChange}
              resetTokenToValue={handleSelectToValue}
              possibleTokenKeys={recordDimensions ? Object.keys(recordDimensions) : []}
              formatOptionLabel={dimensionFormatOptionLabel(recordDimensions)}
            />
          </Popover>
        </div>
      </div>
    </div>
  );
};
