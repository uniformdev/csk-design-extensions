import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Callout } from '@uniformdev/design-system';
import { SetLocationValueDispatch, ValidationResult } from '@uniformdev/mesh-sdk-react';
import ResponsiveTabs from '@/components/ResponsiveTabs';
import { SpaceValueType } from '@/components/SpaceControl/SpaceControl';
import UpdateDefaultSingle from '@/components/UpdateDefaultSingle';
import {
  ALLOW_DIMENSION_GROUP,
  CONTROL_VARIANT,
  SPACE_CONTROL_VARIANTS,
  TRUE_VALIDATION_RESULT,
  VIEW_PORT_TABS,
} from '@/constants';
import { getGroupFromKey, getNameFromKey } from '@/utils';
import SpaceControl from '../SpaceControl';
import { UNITS } from '../SpaceControl/components/ChangeValueInput';

const validate = (value?: SpaceValueType | Type.ViewPort<SpaceValueType | undefined>): ValidationResult => {
  if (!value || Object.values(value).every(item => typeof item === 'string')) {
    if (!Object.values(value || {}).filter(Boolean).length) {
      return {
        isValid: false,
        validationMessage: 'The Space Control value must be selected',
      };
    }
    return TRUE_VALIDATION_RESULT;
  } else {
    const tabValue = VIEW_PORT_TABS.find(
      ({ tabKey }) => !Object.values((value as Type.ViewPort<Record<SpaceProperties, string>>)?.[tabKey] || {}).length
    );
    if (tabValue) {
      return {
        isValid: false,
        validationMessage: `The Space Control value for ${tabValue.tabName} must be selected`,
      };
    }
    return TRUE_VALIDATION_RESULT;
  }
};

export type SpaceProperties =
  | 'marginTop'
  | 'marginRight'
  | 'marginBottom'
  | 'marginLeft'
  | 'paddingTop'
  | 'paddingRight'
  | 'paddingBottom'
  | 'paddingLeft';

type SpaceControlProps = {
  withViewPort: boolean;
  value?: SpaceValueType | Type.ViewPort<SpaceValueType>;
  defaultValue?: SpaceValueType | Type.ViewPort<SpaceValueType | undefined>;
  options?: MeshType.KeyValueItem[];
  setValue: SetLocationValueDispatch<
    SpaceValueType | Type.ViewPort<SpaceValueType | undefined> | undefined,
    SpaceValueType | Type.ViewPort<SpaceValueType | undefined> | undefined
  >;
  dimensions: NonNullable<Type.KVStorage['dimensions']>;
  type?: string;
  selectedGroup?: string;
  allowDimensions?: string[];
  required?: boolean;
};

const SpaceControlParameter: FC<SpaceControlProps> = ({
  withViewPort,
  value,
  dimensions,
  allowDimensions,
  selectedGroup,
  type = SPACE_CONTROL_VARIANTS[0].value,
  defaultValue,
  setValue,
  options,
  required = false,
}) => {
  const [selectedTab, setSelectedTab] = useState(VIEW_PORT_TABS[0].tabKey);

  const onResetAllValues = () => {
    setValue(() => {
      const newValue = {
        desktop: (defaultValue as Type.ViewPort<SpaceValueType | undefined> | undefined)?.['desktop'],
        tablet: (defaultValue as Type.ViewPort<SpaceValueType | undefined> | undefined)?.['tablet'],
        mobile: (defaultValue as Type.ViewPort<SpaceValueType | undefined> | undefined)?.['mobile'],
      };
      return {
        newValue: newValue,
        options: required ? validate(newValue) : undefined,
      };
    });
  };

  const optionsToRender = useMemo(() => {
    switch (type) {
      case CONTROL_VARIANT.DIMENSIONS:
        return (() => {
          if (allowDimensions?.length) {
            return dimensions.filter(({ dimensionKey }) => allowDimensions.includes(dimensionKey));
          }
          return dimensions.filter(({ dimensionKey }) =>
            selectedGroup
              ? dimensionKey.startsWith(selectedGroup)
              : !ALLOW_DIMENSION_GROUP.includes(getGroupFromKey(dimensionKey))
          );
        })().map(({ dimensionKey }, index) => ({
          label: getNameFromKey(dimensionKey, selectedGroup),
          value: dimensionKey,
          key: `${dimensionKey}-${index}`,
        }));
      case CONTROL_VARIANT.CUSTOM:
        return (
          options?.map(({ key, value }, index) => ({
            label: key,
            value,
            key: `${key}-${index}`,
          })) || []
        );
      case CONTROL_VARIANT.UNITS:
      default:
        return [];
    }
  }, [allowDimensions, dimensions, options, selectedGroup, type]);

  const checkWrongValue = useCallback(
    (value?: SpaceValueType) => {
      return Object.values(value || {})
        .filter(Boolean)
        .some(val => {
          const isCustomOptionsVariants = optionsToRender?.length;

          if (!isCustomOptionsVariants) {
            const isUnitPresentInValue = UNITS.some(unit => val.endsWith(unit));

            return !isUnitPresentInValue;
          } else {
            return !optionsToRender?.find(({ value }) => value === val);
          }
        });
    },
    [optionsToRender]
  );

  useEffect(() => {
    if (withViewPort) {
      setValue(previousValue => {
        const newValue: Type.ViewPort<SpaceValueType | undefined> =
          !previousValue || Object.values(previousValue).every(item => typeof item === 'string')
            ? VIEW_PORT_TABS.reduce<Type.ViewPort<SpaceValueType>>(
                (acc, { tabKey }) => ({
                  ...acc,
                  [tabKey]:
                    previousValue ?? (defaultValue as Type.ViewPort<SpaceValueType | undefined> | undefined)?.[tabKey],
                }),
                {}
              )
            : (previousValue as Type.ViewPort<SpaceValueType | undefined>);

        const isWrongValueSet = Object.values(newValue).some(checkWrongValue);

        const validValue = isWrongValueSet ? defaultValue : newValue;
        return {
          newValue: validValue,
          options: required ? validate(validValue) : undefined,
        };
      });
    } else {
      setValue(previousValue => {
        const newValue =
          !previousValue || Object.values(previousValue).every(item => typeof item === 'string')
            ? (previousValue as SpaceValueType | undefined)
            : (previousValue as Type.ViewPort<SpaceValueType | undefined> | undefined)?.[VIEW_PORT_TABS[0].tabKey];

        const validValue = checkWrongValue(newValue) ? defaultValue : newValue;

        return {
          newValue: validValue,
          options: required ? validate(validValue) : undefined,
        };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onResetToDefault = (tabKey?: Type.ViewPortKeyType) => {
    if (tabKey) {
      setValue(previousValue => {
        const newValue = {
          ...(previousValue as Type.ViewPort<SpaceValueType | undefined> | undefined),
          [tabKey]: (defaultValue as Type.ViewPort<SpaceValueType | undefined> | undefined)?.[tabKey],
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
          ...(previousValue as Type.ViewPort<SpaceValueType | undefined> | undefined),
          [tabKey]: {},
        };
        return {
          newValue,
          options: required ? validate(newValue) : undefined,
        };
      });
    } else {
      setValue(() => {
        const newValue = {};
        return {
          newValue,
          options: required ? validate(newValue) : undefined,
        };
      });
    }
  };

  const onChange = useCallback(
    (value: SpaceValueType, tabKey?: Type.ViewPortKeyType) => {
      if (tabKey) {
        setValue(prevState => {
          const newKeys = Object.keys(value || {});
          const currentTabValues = (prevState as Type.ViewPort<SpaceValueType | undefined> | undefined)?.[tabKey] || {};

          const prevTabValue = Object.keys(currentTabValues)
            .filter(key => !newKeys.includes(key) && (currentTabValues as Record<string, string>)[key])
            .reduce((acc, key) => ({ ...acc, [key]: (currentTabValues as Record<string, string>)[key] }), {});

          const newTabValue = newKeys
            .filter(key => value[key as SpaceProperties])
            .reduce((acc, key) => ({ ...acc, [key]: value[key as SpaceProperties] }), {});

          const newValue = {
            ...prevState,
            [tabKey]: {
              ...prevTabValue,
              ...newTabValue,
            },
          };
          return { newValue, options: required ? validate(newValue) : undefined };
        });
      } else {
        setValue(prevState => {
          const newKeys = Object.keys(value || {});
          const prevValue = Object.keys(prevState || {})
            .filter(key => !newKeys.includes(key) && (prevState as Record<string, string> | undefined)?.[key])
            .reduce((acc, key) => ({ ...acc, [key]: (prevState as Record<string, string>)[key] }), {});

          const newValue = newKeys
            .filter(key => value[key as SpaceProperties])
            .reduce((acc, key) => ({ ...acc, [key]: value[key as SpaceProperties] }), {});

          const newState = { ...prevValue, ...newValue };
          return { newValue: newState, options: required ? validate(newValue) : undefined };
        });
      }
    },
    [required, setValue]
  );

  const renderSpaceControl = useCallback(
    (viewport: Type.ViewPortKeyType) => (
      <SpaceControl
        name={viewport}
        options={optionsToRender}
        value={(value as Type.ViewPort<SpaceValueType | undefined> | undefined)?.[viewport]}
        onChange={(type, value) => onChange({ [type]: value } as SpaceValueType, viewport)}
      />
    ),
    [onChange, optionsToRender, value]
  );

  if (type === CONTROL_VARIANT.DIMENSIONS && !dimensions.length)
    return (
      <Callout type="info">
        <p>No available dimensions to select.</p>
      </Callout>
    );

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
        desktop: renderSpaceControl('desktop'),
        tablet: renderSpaceControl('tablet'),
        mobile: renderSpaceControl('mobile'),
      }}
    />
  ) : (
    <div id={`segmented-control-${selectedTab}`}>
      <SpaceControl
        options={optionsToRender}
        value={value as SpaceValueType | undefined}
        onChange={(type, value) => onChange({ [type]: value } as SpaceValueType)}
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

export default SpaceControlParameter;
