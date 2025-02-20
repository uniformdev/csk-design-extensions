import { ChangeEvent, FC, KeyboardEvent, FocusEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChangeValueProps } from './ChangeValue';
import useOnClickOutside from '../hooks/useOnClickOutside';

const getPositionBasedOnType = (type: ChangeValueProps['type']) => {
  switch (type) {
    case 'paddingTop':
    case 'marginTop': {
      return {
        top: '35%',
        left: '50%',
        transform: 'translateX(-50%) translateY(50%)',
      };
    }
    case 'paddingBottom':
    case 'marginBottom': {
      return {
        bottom: '35%',
        left: '50%',
        transform: 'translateX(-50%) translateY(-50%)',
      };
    }
    case 'paddingLeft':
    case 'marginLeft': {
      return {
        top: '50%',
        transform: 'translateY(-50%)',
        left: 'calc(100% + 5px)',
      };
    }
    case 'paddingRight':
    case 'marginRight': {
      return {
        top: '50%',
        transform: 'translateY(-50%)',
        right: 'calc(100% + 5px)',
      };
    }
    default: {
      return {};
    }
  }
};

const splitString = (inputStr?: string) => {
  if (inputStr === 'auto') {
    return ['', 'auto'];
  }
  const match = inputStr?.match(/(-?[0-9.]+)(%|[a-zA-Z]+)/);

  const isOnlyLetters = new RegExp(/[a-zA-Z]+/).test(inputStr || '');

  if (match) {
    const number = match[1];
    const unit = match[2];
    return [number || '0', unit];
  } else if (isOnlyLetters) {
    return ['', inputStr];
  } else {
    return ['', ''];
  }
};

export const UNITS = ['px', '%', 'em', 'rem', 'auto', '-'];

export const ChangeValueInput: FC<ChangeValueProps> = ({
  type,
  value,
  onChange,
  onMouseEnter,
  onMouseLeave,
  dataProperty,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const componentRef = useRef<HTMLDivElement>(null);

  const [defaultInputValue, defaultSelectValue] = splitString(value);

  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputValue, setInputValue] = useState(defaultInputValue);
  const [selectValue, setSelectValue] = useState(defaultSelectValue);

  const setInputFocus = useCallback(() => {
    inputRef.current?.select();
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const [changedInputValue, changedSelectValue] = splitString(value);

    setInputValue(changedInputValue);

    // When we changing value from auto to another one, we should focus on input to improve usability
    if (selectValue === 'auto') {
      setTimeout(setInputFocus, 0);
    }

    setSelectValue(changedSelectValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (showInputModal) {
      setInputFocus();
    }
  }, [showInputModal, setInputFocus]);

  const onClickValue = useCallback(() => {
    setShowInputModal(prev => !prev);
  }, []);

  const handleFocus = useCallback(() => {
    setIsInputFocused(true);
  }, []);

  const closeModal = useCallback(() => {
    if (!showInputModal) return;

    setShowInputModal(false);

    if (!selectValue || ['auto', '-'].includes(selectValue)) return;

    if (!inputValue?.trim()) {
      onChange(type, `0${selectValue}`);
    }
  }, [inputValue, onChange, selectValue, showInputModal, type]);

  const handleBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      setIsInputFocused(false);

      // This should click outside the input modal
      if (!e?.relatedTarget) {
        closeModal();
      }
    },
    [closeModal]
  );

  const onChangeInputValue = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange(type, `${e.target.value}${selectValue}`);
    },
    [onChange, selectValue, type]
  );

  const onInputKeyPress = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      const isEnterPressed = e.key === 'Enter';

      if (isEnterPressed) {
        closeModal();
      }
    },
    [closeModal]
  );

  const onKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (['e', 'E', '+'].includes(e.key)) {
      e.preventDefault();
    }
  }, []);

  const onChangeSelectValue = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const newSelectedValue = e.target.value;

      if (newSelectedValue === 'auto') {
        onChange(type, `${newSelectedValue}`);
        setShowInputModal(false);
      } else if (newSelectedValue === '-') {
        onChange(type, '');
        setShowInputModal(false);
      } else {
        onChange(type, `${inputValue || '0'}${newSelectedValue}`);

        setInputFocus();
      }
    },
    [inputValue, setInputFocus, onChange, type]
  );

  const displayValue = useMemo(() => {
    const trimmedValue = value?.replace(/ /g, '');

    if (!trimmedValue) {
      return '-';
    }

    return trimmedValue;
  }, [value]);

  useOnClickOutside(componentRef, () => {
    closeModal();
  });

  const isStaticOptionSelected = !selectValue || selectValue === 'auto';

  return (
    <button
      tabIndex={-1}
      className="button button-events"
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
      data-property={dataProperty}
    >
      <div ref={componentRef} onClick={onClickValue} className="value" data-property={dataProperty}>
        {displayValue}
      </div>

      <div
        className="modal-container"
        style={{
          ...getPositionBasedOnType(type),
          display: showInputModal ? 'block' : 'none',
        }}
      >
        <div className={`modal-input-wrapper ${isInputFocused ? 'focused' : ''}`}>
          <input
            ref={inputRef}
            id="units-select"
            className="input"
            type="number"
            value={inputValue}
            onChange={onChangeInputValue}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyUp={onInputKeyPress}
            onKeyDown={onKeyDown}
            style={{
              width: isStaticOptionSelected ? 0 : '100%',
            }}
          />
          <select
            className="select"
            name="units"
            id="units-select"
            onChange={onChangeSelectValue}
            value={selectValue || '-'}
            style={{
              width: isStaticOptionSelected ? '100%' : '50px',
            }}
          >
            {UNITS.map(unit => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>
      </div>
    </button>
  );
};
