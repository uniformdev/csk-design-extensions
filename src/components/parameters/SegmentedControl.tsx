import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { SegmentedControl as MeshSegmentedControl } from '@uniformdev/design-system';
import { SetLocationValueDispatch, ValidationResult } from '@uniformdev/mesh-sdk-react';
import { ClearParameterValue } from '@/components/ClearParameterValue';
import { TRUE_VALIDATION_RESULT, VIEW_PORT_TABS } from '@/constants';
import ResponsiveTabs from '../ResponsiveTabs';
import UpdateDefaultSingle from '../UpdateDefaultSingle';

const validate = (value?: Type.ViewPort<string> | string): ValidationResult => {
  if (typeof value === 'string') {
    if (!value) {
      return {
        isValid: false,
        validationMessage: 'The Segmented Control value must be selected',
      };
    }
    return TRUE_VALIDATION_RESULT;
  } else {
    const tabValue = VIEW_PORT_TABS.find(({ tabKey }) => !value?.[tabKey]);
    if (tabValue) {
      return {
        isValid: false,
        validationMessage: `The Segmented Control value for ${tabValue.tabName} must be selected`,
      };
    }
    return TRUE_VALIDATION_RESULT;
  }
};

type SegmentedControlProps = {
  withViewPort: boolean;
  value?: Type.ViewPort<string> | string;
  setValue: SetLocationValueDispatch<
    Type.ViewPort<string> | string | undefined,
    Type.ViewPort<string> | string | undefined
  >;
  options: MeshType.KeyValueItem[];
  defaultValue?: string;
  required?: boolean;
  isReadOnly?: boolean;
};

const SegmentedControl: FC<SegmentedControlProps> = ({
  withViewPort,
  value,
  setValue,
  options,
  defaultValue,
  required = false,
}) => {
  const [selectedTab, setSelectedTab] = useState(VIEW_PORT_TABS[0].tabKey);

  useEffect(
    () => {
      if (withViewPort) {
        setValue(previousValue => {
          const newValue =
            typeof previousValue === 'string'
              ? VIEW_PORT_TABS.reduce<Type.ViewPort<string>>(
                  (acc, { tabKey }) => ({
                    ...acc,
                    [tabKey]: previousValue ?? (defaultValue as Type.ViewPort<string>)?.[tabKey],
                  }),
                  {}
                )
              : previousValue ||
                VIEW_PORT_TABS.reduce<Type.ViewPort<string>>(
                  (acc, { tabKey }) => ({
                    ...acc,
                    [tabKey]: (defaultValue as Type.ViewPort<string>)?.[tabKey],
                  }),
                  {}
                );
          return {
            newValue,
            options: required ? validate(newValue) : undefined,
          };
        });
      } else {
        setValue(previousValue => {
          const newValue =
            typeof previousValue === 'string'
              ? (previousValue ?? defaultValue)
              : (previousValue?.[VIEW_PORT_TABS[0].tabKey] ?? defaultValue);
          return {
            newValue,
            options: required ? validate(newValue) : undefined,
          };
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const scrollToSelectedItem = useCallback(
    (event?: Event) => {
      if (!event && !document.hasFocus()) return;

      const currentValue = typeof value === 'string' ? value : value?.[selectedTab];
      const selectedIndex = options.findIndex(option => option.value === currentValue);
      const nodes = document.querySelectorAll(
        `#segmented-control-${selectedTab} [data-testid='container-segmented-control']`
      );
      nodes[selectedIndex]?.scrollIntoView({
        inline: 'center',
        block: 'nearest',
        behavior: 'smooth',
      });
    },
    [options, value, selectedTab]
  );

  useEffect(() => {
    scrollToSelectedItem();
    window.addEventListener('resize', scrollToSelectedItem);
    return () => window.removeEventListener('resize', scrollToSelectedItem);
  }, [scrollToSelectedItem]);

  const handelSetValue = (value: string, tabKey?: Type.ViewPortKeyType) =>
    tabKey
      ? setValue(previousValue => {
          const newValue = {
            ...(previousValue as Type.ViewPort<string>),
            [tabKey]: value,
          };
          return {
            newValue,
            options: required ? validate(newValue) : undefined,
          };
        })
      : setValue(() => ({
          newValue: value,
          options: required ? validate(value) : undefined,
        }));

  const onResetAllValues = () => {
    setValue(() => {
      const newValue = {
        desktop: (defaultValue as Type.ViewPort<string>)?.['desktop'],
        tablet: (defaultValue as Type.ViewPort<string>)?.['tablet'],
        mobile: (defaultValue as Type.ViewPort<string>)?.['mobile'],
      };
      return {
        newValue: newValue,
        options: required ? validate(newValue) : undefined,
      };
    });
  };

  const onResetToDefault = (tabKey?: Type.ViewPortKeyType) => {
    if (tabKey) {
      setValue(previousValue => {
        const newValue = {
          ...(previousValue as Type.ViewPort<string>),
          [tabKey]: (defaultValue as Type.ViewPort<string>)?.[tabKey],
        };
        return {
          newValue,
          options: required ? validate(newValue) : undefined,
        };
      });
    } else {
      setValue(() => {
        const newValue = defaultValue;
        return {
          newValue,
          options: required ? validate(newValue) : undefined,
        };
      });
    }
  };

  const onUnsetValue = (tabKey?: Type.ViewPortKeyType) => {
    if (tabKey) {
      setValue(previousValue => {
        const newValue = {
          ...(previousValue as Type.ViewPort<string>),
          [tabKey]: '',
        };
        return {
          newValue,
          options: required ? validate(newValue) : undefined,
        };
      });
    } else {
      setValue(() => {
        const newValue = '';
        return {
          newValue,
          options: required ? validate(newValue) : undefined,
        };
      });
    }
  };

  const optionsToRender = useMemo(
    () =>
      options.map(({ label, key, value }, index) => ({
        label: label || key,
        value,
        key: `${key}-${index}`,
      })),
    [options]
  );

  const renderMeshSegmentedControl = (viewport: Type.ViewPortKeyType) => (
    <div id={`segmented-control-${viewport}`}>
      <MeshSegmentedControl
        name={`segmented-control-${viewport}`}
        className="mt-2"
        onChange={value => handelSetValue(value, viewport)}
        value={(value as Type.ViewPort<string>)?.[viewport]}
        options={optionsToRender}
        orientation="horizontal"
        size="sm"
        noCheckmark
      />
    </div>
  );

  const selectedValues = useMemo(
    () => (typeof value === 'string' ? [value] : Object.values(value || {})).filter(Boolean),
    [value]
  );

  const onClearValue = useCallback(
    () =>
      setValue(() => ({
        newValue: undefined,
        options: required ? validate(undefined) : undefined,
      })),
    [required, setValue]
  );

  if (
    selectedValues.length &&
    !selectedValues.every(selectedValue => options.find(({ value: initValue }) => initValue === selectedValue))
  ) {
    return (
      <ClearParameterValue
        title="Unexpected parameter value"
        buttonTitle="Reset parameter value"
        onClick={onClearValue}
      >
        <p className="mb-4">
          It looks like the current value is no longer valid based on the new parameter configuration. Please visit the
          parameter configuration page to update it or reset the parameter value.
        </p>
        <p className="mb-4 font-bold">
          {selectedValues
            .filter(selectedValue => !options.find(({ value: initValue }) => initValue === selectedValue))
            .join(', ')}
        </p>
      </ClearParameterValue>
    );
  }

  return withViewPort ? (
    <ResponsiveTabs
      value={value as Type.ViewPort<string>}
      setSelectedTab={setSelectedTab}
      onResetAllValues={onResetAllValues}
      onResetToDefault={onResetToDefault}
      hideValue
      resetButtonsPosition="bottom"
      onUnsetValue={onUnsetValue}
      responsiveComponents={{
        desktop: renderMeshSegmentedControl('desktop'),
        tablet: renderMeshSegmentedControl('tablet'),
        mobile: renderMeshSegmentedControl('mobile'),
      }}
    />
  ) : (
    <div id={`segmented-control-${selectedTab}`}>
      <MeshSegmentedControl
        name={`segmented-control-${selectedTab}`}
        className="mt-2"
        onChange={handelSetValue}
        options={optionsToRender}
        orientation="horizontal"
        size="sm"
        value={value as string}
        noCheckmark
      />
      <div className="flex w-full justify-end">
        <UpdateDefaultSingle
          value={value as string}
          hideValue
          onResetToDefault={() => onResetToDefault()}
          onUnsetValue={() => onUnsetValue()}
        />
      </div>
    </div>
  );
};

export default SegmentedControl;
