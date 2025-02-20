import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { KeyValueInput, KeyValueItem, InputSelect, LoadingIndicator } from '@uniformdev/design-system';
import { useMeshLocation, ValidationResult, SetLocationValueDispatch } from '@uniformdev/mesh-sdk-react';
import RequiredConfigToggle from '@/components/atoms/RequiredConfigToggle';
import ViewPortConfigToggle from '@/components/atoms/ViewPortConfigToggle';
import { ClearParameterValue } from '@/components/ClearParameterValue';
import ErrorLoadingContainer from '@/components/ErrorLoadingContainer';
import ParameterPreview from '@/components/ParameterPreview';
import PreviewContent from '@/components/PreviewContent';
import ResponsiveTabs from '@/components/ResponsiveTabs';
import SpaceControl from '@/components/SpaceControl';
import { SpaceValueType } from '@/components/SpaceControl/SpaceControl';
import UpdateDefaultSingle from '@/components/UpdateDefaultSingle';
import {
  ALLOW_DIMENSION_GROUP,
  CONTROL_VARIANT,
  DEFAULT_GROUP_NAME,
  SPACE_CONTROL_VARIANTS,
  TRUE_VALIDATION_RESULT,
} from '@/constants';
import { useLoadDataFromKVStore } from '@/hooks/useLoadDataFromKVStore';
import useWithViewPortDefaultValue from '@/hooks/useWithViewPortDefaultValue';
import { addNewOption, capitalizeFirstLetter, getGroupFromKey, getNameFromKey, validateOptions } from '@/utils';

type Configuration = {
  options?: KeyValueItem[];
};

const validate = ({ options }: Configuration): ValidationResult => {
  if (!options?.length) {
    return TRUE_VALIDATION_RESULT;
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

type DesignExtensionsParametersConfigProps = {
  config: MeshType.MeshDesignExtensionsParametersConfig | undefined;
  setConfig: SetLocationValueDispatch<
    MeshType.MeshDesignExtensionsParametersConfig | undefined,
    MeshType.MeshDesignExtensionsParametersConfig
  >;
  dimensions: NonNullable<Type.KVStorage['dimensions']>;
  allowedDimensionGroups: string[];
};

const SpaceParametersConfig: FC<DesignExtensionsParametersConfigProps> = ({
  config,
  setConfig,
  dimensions,
  allowedDimensionGroups,
}) => {
  const {
    options: savedOptions = [],
    defaultValue,
    withViewPort = false,
    selectedGroup,
    allowDimensions = [],
  } = config || {};

  const [errors, setErrors] = useState<(Record<keyof Omit<KeyValueItem, 'uniqueId'>, string> | null)[]>([]);
  const [options, setOptions] = useState<KeyValueItem[]>(() => (savedOptions.length ? savedOptions : []));
  const [spaceControlVariant, setSpaceControlVariant] = useState<string>(
    config?.type ?? SPACE_CONTROL_VARIANTS[0].value
  );

  const {
    previewDefaultValue,
    onChangeDefaultValue,
    onResetAllValues,
    onResetToDefault,
    onUnsetValue,
    isSaveAsDefaultEnabled,
  } = useWithViewPortDefaultValue({ defaultValue, withViewPort });

  const filteredDimensions = useMemo(
    () =>
      dimensions.filter(({ dimensionKey }) =>
        selectedGroup
          ? dimensionKey.startsWith(selectedGroup)
          : !allowedDimensionGroups.includes(getGroupFromKey(dimensionKey))
      ),
    [allowedDimensionGroups, dimensions, selectedGroup]
  );

  useEffect(() => {
    const initialErrors = validateOptions(options).filter(Boolean);
    if (initialErrors.length) {
      setConfig(previousValue => {
        const newValue = { ...previousValue };
        return { newValue, options: validate(newValue as Configuration) };
      });
    }
  }, [options, setConfig]);

  const onChange = useCallback(
    (data: KeyValueItem<string>[]) => {
      setOptions(data);
      const errors = validateOptions(data);
      setErrors(errors);
      setConfig(previousValue => {
        const newValue = {
          ...previousValue,
          defaultValue: undefined,
          options: data,
        };

        return { newValue, options: validate(newValue as Configuration) };
      });
    },
    [setConfig]
  );

  const handleSetValue = useCallback(
    () =>
      setConfig(previousValue => ({
        newValue: {
          ...previousValue,
          defaultValue: previewDefaultValue ?? undefined,
        },
      })),
    [previewDefaultValue, setConfig]
  );

  const optionsToRender = useMemo(() => {
    switch (spaceControlVariant) {
      case CONTROL_VARIANT.DIMENSIONS:
        return filteredDimensions
          .filter(({ dimensionKey }) => !allowDimensions.length || allowDimensions.includes(dimensionKey))
          .map(({ dimensionKey }, index) => ({
            label: getNameFromKey(dimensionKey, selectedGroup),
            value: dimensionKey,
            key: `${dimensionKey}-${index}`,
          }));
      case CONTROL_VARIANT.CUSTOM:
        return options?.map(({ key, value }, index) => ({
          label: key,
          value,
          key: `${key}-${index}`,
        }));
      case CONTROL_VARIANT.UNITS:
      default:
        return [];
    }
  }, [allowDimensions, filteredDimensions, options, spaceControlVariant, selectedGroup]);

  const handelSelectSpaceVariant = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const { name, value } = e.target;
      setSpaceControlVariant(value);
      switch (value) {
        case CONTROL_VARIANT.DIMENSIONS:
          setOptions([]);
          break;
        case CONTROL_VARIANT.CUSTOM:
          setOptions([addNewOption(0)]);
          break;
        case CONTROL_VARIANT.UNITS:
        default:
          setOptions([]);
      }
      setErrors([]);
      setConfig(() => ({
        newValue: { [name]: value, defaultValue: undefined },
        options: TRUE_VALIDATION_RESULT,
      }));
    },
    [setConfig]
  );

  const handelSelectGroup = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const { name, value } = e.target;
      setConfig(previousValue => ({
        newValue: {
          ...previousValue,
          allowDimensions: undefined,
          defaultValue: undefined,
          [name]: value === DEFAULT_GROUP_NAME ? undefined : value,
        },
      }));
    },
    [setConfig]
  );

  useEffect(() => {
    const allPossibleDimensionKeys = filteredDimensions.map(({ dimensionKey }) => dimensionKey);
    const filteredAllowDimensions = allowDimensions.filter(key => allPossibleDimensionKeys.includes(key));
    if (filteredAllowDimensions.length !== allowDimensions.length) {
      setConfig(previousValue => {
        const newValue = {
          ...previousValue,
          allowDimensions: filteredAllowDimensions,
          defaultValue: undefined,
        };
        return { newValue };
      });
    }
  }, [allowDimensions, filteredDimensions, setConfig]);

  const handelSaveValue = useCallback(
    (currentValue: string) => {
      setConfig(previousValue => {
        const allowDimensions = (() => {
          if (previousValue?.allowDimensions?.length) {
            return previousValue?.allowDimensions?.find(item => item === currentValue)
              ? previousValue?.allowDimensions.filter(item => item !== currentValue)
              : [...(previousValue?.allowDimensions || []), currentValue];
          } else {
            return dimensions
              .filter(({ dimensionKey }) => dimensionKey !== currentValue)
              .map(({ dimensionKey }) => dimensionKey);
          }
        })();
        const newValue = { ...previousValue, allowDimensions, defaultValue: undefined };
        return { newValue };
      });
    },
    [dimensions, setConfig]
  );

  const renderSpaceControlControl = useCallback(
    (viewport: Type.ViewPortKeyType) => (
      <SpaceControl
        name={viewport}
        options={optionsToRender}
        value={(previewDefaultValue as Type.ViewPort<SpaceValueType> | undefined)?.[viewport]}
        onChange={(type, value) => onChangeDefaultValue({ [type]: value } as SpaceValueType, viewport)}
      />
    ),
    [onChangeDefaultValue, optionsToRender, previewDefaultValue]
  );

  return (
    <div className="flex flex-col gap-4 overflow-x-hidden">
      <InputSelect
        name="type"
        label="Select Space variant"
        options={SPACE_CONTROL_VARIANTS}
        onChange={handelSelectSpaceVariant}
        defaultValue={spaceControlVariant}
      />
      {spaceControlVariant === CONTROL_VARIANT.DIMENSIONS && (
        <>
          {!!allowedDimensionGroups.length && (
            <InputSelect
              name="selectedGroup"
              label="Select dimension group"
              options={[
                ...allowedDimensionGroups.map(groupName => ({
                  label: capitalizeFirstLetter(groupName),
                  value: groupName,
                })),
                { label: capitalizeFirstLetter(DEFAULT_GROUP_NAME), value: DEFAULT_GROUP_NAME },
              ]}
              onChange={handelSelectGroup}
              defaultValue={selectedGroup ?? DEFAULT_GROUP_NAME}
            />
          )}
          <div className="flex flex-row flex-wrap gap-2">
            {filteredDimensions.map(({ dimensionKey, value }) => {
              const isSelected = !allowDimensions.length || !!allowDimensions.find(key => key === dimensionKey);
              return (
                <button
                  key={dimensionKey}
                  className={classNames(
                    'flex items-center w-[calc(50%-4px)]  justify-between p-2 bg-gray-50 rounded-md border border-brand-secondary-3',
                    { 'text-gray-500 border-gray-50 opacity-65': !isSelected }
                  )}
                  title={value}
                  onClick={() => handelSaveValue(dimensionKey)}
                >
                  {getNameFromKey(dimensionKey, selectedGroup)}
                  <div className="flex">{value}</div>
                </button>
              );
            })}
          </div>
        </>
      )}
      {spaceControlVariant === CONTROL_VARIANT.CUSTOM && (
        <div className="px-2">
          <KeyValueInput
            value={options}
            onChange={onChange}
            newItemDefault={addNewOption(options.length)}
            errors={errors}
            valueInfoPopover="Required value to be used in code or data resources. If Text is not specified, Value will be used for display."
            keyInfoPopover="Shown to editors in the dropdown list. Value will be shown if no specific display text is supplied."
          />
        </div>
      )}
      {spaceControlVariant === CONTROL_VARIANT.DIMENSIONS && (
        <ViewPortConfigToggle withViewPort={config?.withViewPort} setViewPortConfig={setConfig} changeDefaultValue />
      )}
      <RequiredConfigToggle required={config?.required} setRequiredConfig={setConfig} />
      <div>
        <ParameterPreview
          onSaveDefault={handleSetValue}
          showUpdateLabel={!!defaultValue && defaultValue !== previewDefaultValue}
          disabled={!isSaveAsDefaultEnabled}
        >
          <PreviewContent
            content={
              withViewPort ? (
                <ResponsiveTabs
                  value={previewDefaultValue as Type.ViewPort<string>}
                  onResetAllValues={onResetAllValues}
                  onResetToDefault={onResetToDefault}
                  onUnsetValue={onUnsetValue}
                  responsiveComponents={{
                    desktop: renderSpaceControlControl('desktop'),
                    mobile: renderSpaceControlControl('mobile'),
                    tablet: renderSpaceControlControl('tablet'),
                  }}
                />
              ) : (
                <div>
                  <div className="flex w-full justify-end">
                    <UpdateDefaultSingle
                      value={previewDefaultValue as SpaceValueType | undefined}
                      onResetToDefault={() => onResetToDefault()}
                      onUnsetValue={() => onUnsetValue()}
                      hideValue
                    />
                  </div>
                  <SpaceControl
                    options={optionsToRender}
                    value={previewDefaultValue as SpaceValueType | undefined}
                    onChange={(type, value) => onChangeDefaultValue({ [type]: value } as SpaceValueType)}
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

const DesignExtensionsParameterConfigPage: FC = () => {
  const {
    value: config,
    setValue: setConfig,
    metadata: { projectId },
  } = useMeshLocation<'paramTypeConfig', MeshType.MeshDesignExtensionsParametersConfig | undefined>();

  const {
    data: { dimensions, allowedGroup },
    isLoading,
    errorMessage: errorKVStoreLoadingMessage,
  } = useLoadDataFromKVStore(projectId);

  const onClearValue = useCallback(() => setConfig(() => ({ newValue: undefined })), [setConfig]);

  const allowedDimensionGroups = useMemo(
    () => allowedGroup?.dimension || ALLOW_DIMENSION_GROUP,
    [allowedGroup?.dimension]
  );

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (config?.selectedGroup && !allowedDimensionGroups.includes(config.selectedGroup)) {
    return (
      <ClearParameterValue
        title="Unexpected configuration"
        buttonTitle="Reset parameter configuration"
        onClick={onClearValue}
      >
        <p className="mb-4">Please reset this parameter and configure it again</p>
        <p className="mb-4 font-bold">Selected Group: {config.selectedGroup}</p>
      </ClearParameterValue>
    );
  }

  return (
    <ErrorLoadingContainer errorMessage={errorKVStoreLoadingMessage}>
      <SpaceParametersConfig
        config={config}
        setConfig={setConfig}
        dimensions={dimensions}
        allowedDimensionGroups={allowedDimensionGroups}
      />
    </ErrorLoadingContainer>
  );
};

export default DesignExtensionsParameterConfigPage;
