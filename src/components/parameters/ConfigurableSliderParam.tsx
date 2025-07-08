import { FC, useEffect, useMemo, useState } from 'react';
import { Callout } from '@uniformdev/design-system';
import { SetLocationValueDispatch } from '@uniformdev/mesh-sdk-react';
import { SliderType, VIEW_PORT_TABS } from '@/constants';
import DeleteButton from '../DeleteButton';
import ResponsiveTabs from '../ResponsiveTabs';
import Slider from '../Slider';
import UpdateDefaultSingle from '../UpdateDefaultSingle';

type ConfigurableSliderParamProps = {
  withViewPort: boolean;
  value?: Type.ViewPort<string | number> | string | number;
  setValue: SetLocationValueDispatch<Type.ViewPort<number | string> | number | string | undefined>;
  minValue?: number;
  maxValue?: number;
  step?: number;
  units?: string;
  type?: string;
  options?: MeshType.KeyValueItem[];
  isReadOnly?: boolean;
  defaultValue?: string;
};

const ConfigurableSliderParam: FC<ConfigurableSliderParamProps> = ({
  withViewPort,
  value,
  setValue,
  minValue = 0,
  maxValue = 10,
  step = 1,
  type = SliderType.Steps,
  options = [],
  units = 'px',
  isReadOnly,
  defaultValue,
}) => {
  const [selectedTab, setSelectedTab] = useState(VIEW_PORT_TABS[0].tabKey);
  useEffect(
    () => {
      if (isReadOnly) return;
      if (withViewPort) {
        setValue(previousValue => ({
          newValue:
            typeof previousValue === 'string' || typeof previousValue === 'number'
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
                ),
        }));
      } else {
        setValue(previousValue => ({
          newValue:
            typeof previousValue === 'string' || typeof previousValue === 'number'
              ? (previousValue ?? defaultValue)
              : (previousValue?.[VIEW_PORT_TABS[0].tabKey] ?? defaultValue),
        }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handelSaveValue = (value?: number | string, tabKey?: Type.ViewPortKeyType) =>
    tabKey
      ? setValue(previousValue => ({
          newValue: {
            ...(previousValue as Type.ViewPort<string | number>),
            [tabKey]: value,
          },
        }))
      : setValue(() => ({ newValue: value }));

  const isValidValue = useMemo(() => {
    const currentValue = typeof value === 'string' || typeof value === 'number' ? value : value?.[selectedTab];

    if (typeof value === 'string' && value.indexOf('NaN') !== -1) {
      return false;
    }

    if (!currentValue) return true;

    if (type === SliderType.Steps) {
      return currentValue.toString().includes(units);
    } else {
      return options?.some(option => option.value === currentValue);
    }
  }, [type, value, options, units, selectedTab]);

  const onResetAllValues = () => {
    setValue(() => {
      const newValue = {
        desktop: (defaultValue as Type.ViewPort<string>)?.['desktop'],
        tablet: (defaultValue as Type.ViewPort<string>)?.['tablet'],
        mobile: (defaultValue as Type.ViewPort<string>)?.['mobile'],
      };
      return {
        newValue: newValue,
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
        };
      });
    } else {
      setValue(() => {
        const newValue = defaultValue;
        return {
          newValue,
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
        };
      });
    } else {
      setValue(() => {
        const newValue = '';
        return {
          newValue,
        };
      });
    }
  };

  const optionsToRender = useMemo(
    () =>
      options?.map(({ key, value }, index) => ({
        label: key,
        value,
        key: `${key}-${index}`,
      })) || [],
    [options]
  );

  if (!isValidValue) {
    return (
      <Callout type="danger">
        <div className="flex flex-row items-center justify-center gap-4">
          The parameter configuration changed. Clear data and save new.
          <DeleteButton onClick={() => setValue(() => ({ newValue: options?.[0]?.value }))} title="Clear" />
        </div>
      </Callout>
    );
  }

  const renderSliderControl = (viewport: Type.ViewPortKeyType) => (
    <Slider
      onChange={value => handelSaveValue(value, viewport)}
      minValue={minValue}
      maxValue={maxValue}
      step={step}
      units={units}
      hideValue
      type={type === SliderType.Steps ? SliderType.Steps : SliderType.Custom}
      options={optionsToRender}
      value={(value as Type.ViewPort<string | number>)?.[viewport]}
    />
  );

  return withViewPort ? (
    <ResponsiveTabs
      value={value as Type.ViewPort<string>}
      setSelectedTab={setSelectedTab}
      selectedTab={selectedTab}
      onResetAllValues={onResetAllValues}
      onResetToDefault={onResetToDefault}
      onUnsetValue={onUnsetValue}
      options={optionsToRender}
      responsiveComponents={{
        desktop: renderSliderControl('desktop'),
        tablet: renderSliderControl('tablet'),
        mobile: renderSliderControl('mobile'),
      }}
    />
  ) : (
    <>
      <UpdateDefaultSingle
        value={value as string}
        options={optionsToRender}
        onResetToDefault={() => onResetToDefault()}
        onUnsetValue={() => onUnsetValue()}
      />
      <Slider
        onChange={handelSaveValue}
        minValue={minValue}
        maxValue={maxValue}
        step={step}
        units={units}
        type={type === SliderType.Steps ? SliderType.Steps : SliderType.Custom}
        hideValue
        options={optionsToRender}
        value={value as string | number}
      />
    </>
  );
};

export default ConfigurableSliderParam;
