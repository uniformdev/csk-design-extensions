import React, { FC, ChangeEvent, useState, useMemo, useEffect } from 'react';
import { KeyValueInput, KeyValueItem, Input, InputSelect } from '@uniformdev/design-system';
import { useMeshLocation, ValidationResult } from '@uniformdev/mesh-sdk-react';
import RequiredConfigToggle from '@/components/atoms/RequiredConfigToggle';
import ViewPortConfigToggle from '@/components/atoms/ViewPortConfigToggle';
import ParameterPreview from '@/components/ParameterPreview';
import PreviewContent from '@/components/PreviewContent';
import ResponsiveTabs from '@/components/ResponsiveTabs';
import Slider from '@/components/Slider';
import UpdateDefaultSingle from '@/components/UpdateDefaultSingle';
import { SliderType, TRUE_VALIDATION_RESULT } from '@/constants';
import useWithViewPortDefaultValue from '@/hooks/useWithViewPortDefaultValue';
import { addNewOption, cleanUpCanvasValue, validateOptions } from '@/utils';

type Configuration = {
  minValue?: number;
  maxValue?: number;
  step?: number;
  type?: SliderType;
  options?: MeshType.Options[];
};

const validate = ({ minValue, maxValue, step, type, options }: Configuration): ValidationResult => {
  if (type === SliderType.Custom && !options?.length) {
    return {
      isValid: false,
      validationMessage: `The options is required for custom slider type`,
    };
  }

  if (type !== SliderType.Steps) {
    return TRUE_VALIDATION_RESULT;
  }

  const validations = [];

  if (minValue === null || minValue === undefined || minValue < 0) {
    validations.push('min value should be positive numbers');
  }

  if (!maxValue || maxValue < 0) {
    validations.push('max value should be positive numbers');
  }

  if (!step || step < 0) {
    validations.push('step should be positive numbers');
  }

  if (step && maxValue && step > maxValue) {
    validations.push('step should not be more than max value');
  }

  if (minValue && maxValue && minValue > maxValue) {
    validations.push('min value should not be more than max value');
  }

  if (validations.length > 0) {
    return {
      isValid: false,
      validationMessage: `The ${validations.join(', ')}`,
    };
  }
  return TRUE_VALIDATION_RESULT;
};

const SLIDER_TYPES = [
  { label: 'Custom Options', value: SliderType.Custom },
  { label: 'Steps', value: SliderType.Steps },
];

const POSSIBLE_UNITS = [
  { value: '', label: 'optional' },
  { value: 'px', label: 'px' },
  { value: '%', label: '%' },
  { value: 'em', label: 'em' },
  { value: 'rem', label: 'rem' },
  { value: 'vw', label: 'vw' },
  { value: 'vh', label: 'vh' },
];

const StepTypeDefaultOptions = {
  minValue: 0,
  maxValue: 10,
  step: 1,
  units: 'px',
};

const CustomTypeDefaultOptions = {
  options: [addNewOption(0)],
};

const DesignExtensionsParametersConfig: FC = () => {
  const { value: config, setValue: setConfig } = useMeshLocation<
    'paramTypeConfig',
    MeshType.MeshDesignExtensionsParametersConfig
  >();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const isFirstRender = useMemo(() => !config?.type, []);

  const { options: savedOptions = [], defaultValue } = config || {};

  const withViewPort = Boolean(config?.withViewPort);

  const [options, setOptions] = useState<KeyValueItem[]>(() =>
    savedOptions.length ? savedOptions : [addNewOption(0)]
  );

  const optionsToRender = useMemo(
    () =>
      options.map(({ key, value }, index) => ({
        label: key,
        value,
        key: `${key}-${index}`,
      })),
    [options]
  );

  const [errors, setErrors] = useState<(Record<keyof Omit<KeyValueItem, 'uniqueId'>, string> | null)[]>([]);

  const {
    previewDefaultValue,
    onChangeDefaultValue,
    onResetAllValues,
    onResetToDefault,
    onUnsetValue,
    isSaveAsDefaultEnabled,
  } = useWithViewPortDefaultValue({ defaultValue, withViewPort });

  useEffect(() => {
    if (!config?.type) {
      setConfig(() => {
        const newValue: Configuration = {
          type: SliderType.Steps,
          ...StepTypeDefaultOptions,
        };
        return { newValue, options: validate(newValue) };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, valueAsNumber, value } = e.target;
    const valueToSet = isNaN(valueAsNumber) ? value : valueAsNumber;

    setConfig(previousValue => {
      const newValue = { ...previousValue, [name]: valueToSet };
      return { newValue, options: validate(newValue as Configuration) };
    });
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig(previousValue => {
      const newValue = { ...previousValue, [name]: value };
      return { newValue, options: validate(newValue as Configuration) };
    });
  };

  const handleTypeChanged = (e: ChangeEvent<HTMLSelectElement>) => {
    const { value, name } = e.target;

    const newType = value as SliderType;

    //onChangeDefaultValue(undefined);

    // reset all params to default when slider type changed
    setOptions([addNewOption(0)]);
    setConfig(() => {
      const newValue = {
        [name]: newType,
        ...(newType === 'custom' ? CustomTypeDefaultOptions : {}),
        ...(newType === 'steps' ? StepTypeDefaultOptions : {}),
      };
      return { newValue, options: validate(newValue as Configuration) };
    });
  };

  const onChange = (data: KeyValueItem<string>[]) => {
    setOptions(data);
    const errors = validateOptions(data);
    setErrors(errors);

    setConfig(previousValue => {
      const newValue = {
        ...previousValue,
        options: data,
      };

      return { newValue, options: validate(newValue as Configuration) };
    });
  };

  const minValueError = useMemo(() => {
    if (config?.type === SliderType.Steps) {
      if (config?.minValue !== undefined && config?.maxValue !== undefined && config?.minValue >= config?.maxValue) {
        return 'Minimum value should be less than maximum value';
      }
    }
    return '';
  }, [config]);

  const maxValueError = useMemo(() => {
    if (config?.type === SliderType.Steps) {
      if (config?.minValue !== undefined && config?.maxValue !== undefined && config?.maxValue <= config?.minValue) {
        return 'Maximum value should be greater than minimum value';
      }
    }
    return '';
  }, [config]);

  const stepError = useMemo(() => {
    if (config?.type === SliderType.Steps) {
      if (config?.step !== undefined && config?.maxValue !== undefined && config?.step >= config?.maxValue) {
        return 'Step should be less than maximum value';
      }
    }
    return '';
  }, [config]);

  const isErrorExist = !!minValueError || !!maxValueError || !!stepError;

  const renderConfigurationFields = () => {
    if (config?.type === SliderType.Custom) {
      return (
        <div className="px-2">
          <KeyValueInput
            value={options}
            onChange={onChange}
            errors={errors}
            newItemDefault={addNewOption(options.length)}
            valueInfoPopover="Required value to be used in code or data resources. If Text is not specified, Value will be used for display."
            keyInfoPopover="Shown to editors in the dropdown list. Value will be shown if no specific display text is supplied."
          />
        </div>
      );
    } else {
      return (
        // eslint-disable-next-line tailwindcss/no-custom-classname
        <div className="slider-configuration-steps-container">
          <Input
            name="minValue"
            value={config?.minValue}
            label="Minimum"
            defaultValue={StepTypeDefaultOptions.minValue}
            min={0}
            type="number"
            errorMessage={minValueError}
            onChange={handleValueChange}
          />
          <Input
            name="maxValue"
            value={config?.maxValue}
            label="Maximum"
            defaultValue={StepTypeDefaultOptions.maxValue}
            min={1}
            type="number"
            errorMessage={maxValueError}
            onChange={handleValueChange}
          />
          <Input
            name="step"
            value={config?.step}
            label="Steps"
            defaultValue={StepTypeDefaultOptions.step}
            min={1}
            type="number"
            errorMessage={stepError}
            onChange={handleValueChange}
          />
          <InputSelect
            label="Units"
            name="units"
            options={POSSIBLE_UNITS}
            onChange={handleSelectChange}
            value={config?.units}
          />
        </div>
      );
    }
  };

  const handleSetValue = () => {
    setConfig(previousValue => {
      const newValue = {
        ...previousValue,
        defaultValue: cleanUpCanvasValue(previewDefaultValue) ?? undefined,
      };
      return { newValue };
    });
  };

  const renderSliderControl = (viewport: Type.ViewPortKeyType) => (
    <Slider
      onChange={value => onChangeDefaultValue(value as string, viewport)}
      minValue={config?.minValue}
      maxValue={config?.maxValue}
      step={config?.step}
      units={config?.units}
      type={config?.type === SliderType.Custom ? SliderType.Custom : SliderType.Steps}
      options={optionsToRender}
      hideValue
      value={(previewDefaultValue as Type.ViewPort<string>)?.[viewport]}
    />
  );

  return (
    <div className="flex flex-col gap-4 overflow-x-hidden">
      <InputSelect
        label="Slider Type"
        name="type"
        options={SLIDER_TYPES}
        disabled={!isFirstRender}
        onChange={handleTypeChanged}
        value={config?.type}
        caption='Please select type of your slider. If you select "Steps" you will be able to select min and max value and step. If you select "Custom Options" you will be able to configure custom options.'
      />
      {renderConfigurationFields()}
      <ViewPortConfigToggle withViewPort={config?.withViewPort} setViewPortConfig={setConfig} changeDefaultValue />
      <RequiredConfigToggle required={config?.required} setRequiredConfig={setConfig} />
      <div className="scroll-x-container">
        <ParameterPreview
          onSaveDefault={handleSetValue}
          showUpdateLabel={!!defaultValue && defaultValue !== previewDefaultValue}
          disabled={!isSaveAsDefaultEnabled || isErrorExist}
        >
          <PreviewContent
            error={isErrorExist}
            content={
              withViewPort ? (
                <ResponsiveTabs
                  value={previewDefaultValue as Type.ViewPort<string>}
                  onResetAllValues={onResetAllValues}
                  onResetToDefault={onResetToDefault}
                  onUnsetValue={onUnsetValue}
                  options={optionsToRender}
                  responsiveComponents={{
                    desktop: renderSliderControl('desktop'),
                    mobile: renderSliderControl('mobile'),
                    tablet: renderSliderControl('tablet'),
                  }}
                />
              ) : (
                <div>
                  {(typeof previewDefaultValue === 'string' || !previewDefaultValue) && (
                    <UpdateDefaultSingle
                      value={previewDefaultValue as string}
                      options={optionsToRender}
                      onResetToDefault={() => onResetToDefault()}
                      onUnsetValue={() => onUnsetValue()}
                    />
                  )}
                  <Slider
                    onChange={value => onChangeDefaultValue(value as string)}
                    minValue={config?.minValue}
                    maxValue={config?.maxValue}
                    step={config?.step}
                    units={config?.units}
                    type={config?.type === SliderType.Custom ? SliderType.Custom : SliderType.Steps}
                    options={optionsToRender}
                    hideValue
                    value={previewDefaultValue as string | number}
                  />
                </div>
              )
            }
          />
        </ParameterPreview>
      </div>
    </div>
  );
};

export default DesignExtensionsParametersConfig;
