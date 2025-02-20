import { ChangeEvent, FC, useCallback } from 'react';
import { ChangeValueProps } from './ChangeValue';

const ID_PREFIX = 'change-value-select';

export const ChangeValueSelect: FC<ChangeValueProps> = ({
  type,
  value,
  onChange,
  options,
  onMouseEnter,
  onMouseLeave,
  dataProperty,
}) => {
  const onChangeSelectValue = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const newSelectedValue = e.target.value;
      onChange(type, newSelectedValue);
    },
    [onChange, type]
  );

  const displayValue = options?.find(option => option.value === value)?.label || '-';

  return (
    <button
      tabIndex={-1}
      className="button button-events"
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
      data-property={dataProperty}
    >
      <div className={`value ${displayValue !== '-' ? 'value-selected' : ''}`} data-property={dataProperty}>
        <div className="label"> {displayValue} </div>

        <select
          data-property={dataProperty}
          className="select"
          name="units"
          id={`${ID_PREFIX}-${type}`}
          onChange={onChangeSelectValue}
          value={value}
          style={{
            width: '100%',
            opacity: 0,
            position: 'absolute',
          }}
        >
          <option value="">-</option>
          {options?.map(({ key, label, value }) => (
            <option key={key} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </button>
  );
};
