import { FC, PropsWithChildren, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import ReactSlider from 'react-slider';
import { Icon } from '@uniformdev/design-system';
import { SliderType } from '@/constants';

const SliderContainer: FC<PropsWithChildren> = ({ children }) => (
  <div className="flex min-h-6 flex-col justify-center px-2">{children}</div>
);

type SliderProps = {
  value?: number | string;
  onChange: (value?: number | string) => void;
  minValue?: number;
  maxValue?: number;
  step?: number;
  units?: string;
  type?: SliderType;
  options?: MeshType.Options[];
  hideValue?: boolean;
};

const StepSlider: FC<SliderProps> = ({
  value,
  onChange,
  minValue = 0,
  maxValue = 12,
  step = 2,
  hideValue,
  units = 'px',
}) => {
  const [currentValue, setCurrentValue] = useState<number | undefined>(() => {
    if (!value) return undefined;
    return Number(value?.toString()?.replace?.(units, ''));
  });

  const handleValueChange = (value: number) => {
    setCurrentValue(value);
    onChange(`${value}${units}`);
  };

  const errorText = useMemo(() => {
    if (!currentValue) return '';

    if (currentValue > maxValue) {
      return `Value must be less than or equal to the ${maxValue}`;
    }

    if (currentValue < minValue) {
      return `Value must be greater than or equal to the ${minValue}`;
    }
  }, [currentValue, maxValue, minValue]);

  useEffect(() => {
    if (!value) {
      setCurrentValue(undefined);
      return;
    }
    const formattedValue = Number(value?.toString()?.replace?.(units, ''));

    setCurrentValue(formattedValue);
  }, [units, value]);

  return (
    <SliderContainer>
      <ReactSlider
        className={classNames('w-full h-2.5 rounded-md bg-gray-300 relative cursor-pointer', {
          'bg-action-destructive': errorText,
        })}
        thumbClassName="slider-thumb"
        min={minValue}
        max={maxValue}
        onChange={handleValueChange}
        step={step}
        renderThumb={props => {
          if (errorText) return null;
          const { key, ...restProps } = props;
          if (currentValue === undefined)
            return (
              <div
                key={key}
                {...restProps}
                className="absolute -top-2 flex size-6.5 items-center justify-center rounded-full border border-white bg-gray-500"
                onClick={() => handleValueChange(minValue)}
              >
                <div className="h-0.5 w-2 rounded-sm bg-white" />
              </div>
            );
          return <div key={key} {...restProps} />;
        }}
        value={currentValue || 0}
      />
      {!hideValue && (
        <div className="absolute top-10 flex items-center justify-center text-center text-sm text-brand-secondary-1">
          {currentValue + units}
        </div>
      )}
      {errorText && (
        <div className="my-4.5 flex items-center gap-2 text-action-destructive">
          <Icon size="12" icon="warning" />
          <div className="block text-action-destructive">{errorText}</div>
        </div>
      )}
    </SliderContainer>
  );
};

const CustomSlider: FC<Pick<SliderProps, 'options' | 'onChange' | 'value' | 'hideValue'>> = ({
  options,
  onChange,
  value,
  hideValue,
}) => {
  const [currentValue, setCurrentValue] = useState<number | undefined>(() => {
    if (!options) return 0;
    const savedIndex = options.findIndex(option => String(option.value) === String(value));

    return savedIndex > -1 ? savedIndex : 0;
  });

  const handleValueChange = (value: number) => {
    setCurrentValue(value);
    onChange(options?.[value].value);
  };

  useEffect(() => {
    if (!value || !options) {
      setCurrentValue(undefined);
      return;
    }

    const savedIndex = options?.findIndex(option => String(option.value) === String(value));

    setCurrentValue(savedIndex > -1 ? savedIndex : 0);
  }, [value, options]);

  const errorText = useMemo(() => {
    if (!value) return '';

    const savedOption = options?.findIndex(option => String(option.value) === String(value));

    if (savedOption === -1) return 'Value must be selected from the list';
  }, [options, value]);

  return (
    <SliderContainer>
      <ReactSlider
        className="relative h-2.5 w-full cursor-pointer rounded-md bg-gray-300"
        thumbClassName="slider-thumb"
        min={0}
        renderThumb={props => {
          if (errorText) return null;
          const { key, ...restProps } = props;
          if (currentValue === undefined)
            return (
              <div
                key={key}
                {...restProps}
                className="absolute -top-2 flex size-6.5 items-center justify-center rounded-full border border-white bg-gray-500"
                onClick={() => handleValueChange(0)}
              >
                <div className="h-0.5 w-2 rounded-sm bg-white" />
              </div>
            );
          return <div key={key} {...restProps} />;
        }}
        max={options?.length ? options?.length - 1 : 0}
        onChange={handleValueChange}
        step={1}
        value={currentValue || 0}
      />
      {!hideValue && (
        <div className="absolute top-10 flex items-center justify-center text-center text-sm text-brand-secondary-1">
          {options?.[currentValue || 0].value}
        </div>
      )}
      {errorText && (
        <div className="my-4.5 flex items-center gap-2 text-action-destructive">
          <Icon size="12" icon="warning" />
          <div className="block text-action-destructive">{errorText}</div>
        </div>
      )}
    </SliderContainer>
  );
};
const Slider: FC<SliderProps> = ({
  value,
  onChange,
  minValue = 0,
  maxValue = 10,
  step = 1,
  units = '',
  type,
  options,
  hideValue,
}) =>
  type === SliderType.Steps ? (
    <StepSlider
      value={value}
      onChange={onChange}
      minValue={minValue}
      maxValue={maxValue}
      step={step}
      units={units}
      hideValue={hideValue}
    />
  ) : (
    <CustomSlider options={options} value={value} onChange={onChange} hideValue={hideValue} />
  );

export default Slider;
