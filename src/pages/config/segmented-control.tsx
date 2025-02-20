import React, { FC, useState, useEffect, useMemo } from 'react';
import { SegmentedControl as MeshSegmentedControl, KeyValueInput, KeyValueItem } from '@uniformdev/design-system';
import { useMeshLocation, ValidationResult } from '@uniformdev/mesh-sdk-react';
import RequiredConfigToggle from '@/components/atoms/RequiredConfigToggle';
import ViewPortConfigToggle from '@/components/atoms/ViewPortConfigToggle';
import ParameterPreview from '@/components/ParameterPreview';
import ResponsiveTabs from '@/components/ResponsiveTabs';
import UpdateDefaultSingle from '@/components/UpdateDefaultSingle';
import { TRUE_VALIDATION_RESULT } from '@/constants';
import useWithViewPortDefaultValue from '@/hooks/useWithViewPortDefaultValue';
import { addNewOption, validateOptions } from '@/utils';

type Configuration = {
  options?: KeyValueItem[];
};

const validate = ({ options }: Configuration): ValidationResult => {
  if (!options?.length) {
    return {
      isValid: false,
      validationMessage: 'Must provide at least one option',
    };
  }

  const errors = validateOptions(options).filter(Boolean);
  if (errors.length) {
    return {
      isValid: false,
      validationMessage: 'Please fix errors above',
    };
  }

  return TRUE_VALIDATION_RESULT;
};

const DesignExtensionsParametersConfig: FC = () => {
  const { value: config, setValue: setConfig } = useMeshLocation<
    'paramTypeConfig',
    MeshType.MeshDesignExtensionsParametersConfig
  >();

  const { options: savedOptions = [], withViewPort = false, defaultValue, required = false } = config || {};
  const [options, setOptions] = useState<KeyValueItem[]>(() =>
    savedOptions.length ? savedOptions : [addNewOption(0)]
  );
  const [errors, setErrors] = useState<(Record<keyof Omit<KeyValueItem, 'uniqueId'>, string> | null)[]>([]);

  const optionsToRender = useMemo(
    () =>
      options.map(({ key, value }, index) => ({
        label: key,
        value,
        key: `${key}-${index}`,
      })),
    [options]
  );

  const {
    previewDefaultValue,
    onChangeDefaultValue,
    onResetAllValues,
    onResetToDefault,
    onUnsetValue,
    isSaveAsDefaultEnabled,
  } = useWithViewPortDefaultValue({ defaultValue, withViewPort });

  const handleSetValue = () => {
    setConfig(previousValue => {
      const newValue = {
        ...previousValue,
        defaultValue: (previewDefaultValue as string | Type.ViewPort<string>) ?? undefined,
      };
      return { newValue };
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

  useEffect(() => {
    const selectedIndex = savedOptions.findIndex(option => option.value === defaultValue);
    if (selectedIndex < 1) return;

    const nodes = document.querySelectorAll("div[data-testid='container-segmented-control']");
    nodes[selectedIndex].scrollIntoView({
      inline: 'center',
      behavior: 'smooth',
    });
  }, [savedOptions, defaultValue]);

  useEffect(() => {
    const initialErrors = validateOptions(options).filter(Boolean);
    if (initialErrors.length) {
      setConfig(previousValue => {
        const newValue = { ...previousValue };
        return { newValue, options: validate(newValue as Configuration) };
      });
    }
  }, [options, setConfig]);

  const renderMeshSegmentedControl = (viewport: Type.ViewPortKeyType) => (
    <MeshSegmentedControl
      name={`segmentedControl${viewport.charAt(0).toUpperCase() + viewport.slice(1)}`}
      options={optionsToRender}
      orientation="horizontal"
      size="sm"
      onChange={value => onChangeDefaultValue(value, viewport)}
      value={(previewDefaultValue as Type.ViewPort<string>)?.[viewport]}
      noCheckmark
    />
  );

  return (
    <div className="flex flex-col gap-4 overflow-x-hidden">
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
      <ViewPortConfigToggle withViewPort={withViewPort} setViewPortConfig={setConfig} changeDefaultValue />
      <RequiredConfigToggle required={required} setRequiredConfig={setConfig} />
      <div className="scroll-x-container">
        <ParameterPreview
          onSaveDefault={handleSetValue}
          showUpdateLabel={!!defaultValue && defaultValue !== previewDefaultValue}
          disabled={!isSaveAsDefaultEnabled}
        >
          {withViewPort ? (
            <ResponsiveTabs
              value={previewDefaultValue as Type.ViewPort<string>}
              onResetAllValues={onResetAllValues}
              onResetToDefault={onResetToDefault}
              onUnsetValue={onUnsetValue}
              hideValue
              resetButtonsPosition="bottom"
              responsiveComponents={{
                desktop: renderMeshSegmentedControl('desktop'),
                mobile: renderMeshSegmentedControl('mobile'),
                tablet: renderMeshSegmentedControl('tablet'),
              }}
            />
          ) : (
            <div>
              <MeshSegmentedControl
                name="segmentedControl"
                onChange={value => onChangeDefaultValue(value)}
                options={optionsToRender}
                orientation="horizontal"
                size="sm"
                value={previewDefaultValue as string}
                noCheckmark
              />
              <div className="flex w-full justify-end">
                <UpdateDefaultSingle
                  hideValue
                  value={previewDefaultValue as string}
                  onResetToDefault={() => onResetToDefault()}
                  onUnsetValue={() => onUnsetValue()}
                />
              </div>
            </div>
          )}
        </ParameterPreview>
      </div>
    </div>
  );
};

export default DesignExtensionsParametersConfig;
