import React, { FC, useCallback, useEffect, useMemo } from 'react';
import { LoadingOverlay, InputSelect } from '@uniformdev/design-system';
import { useMeshLocation } from '@uniformdev/mesh-sdk-react';
import RequiredConfigToggle from '@/components/atoms/RequiredConfigToggle';
import ViewPortConfigToggle from '@/components/atoms/ViewPortConfigToggle';
import { ClearParameterValue } from '@/components/ClearParameterValue';
import ErrorLoadingContainer from '@/components/ErrorLoadingContainer';
import ColorConfigItemSection from '@/components/parameters/ColorConfigItemSection';
import WithStylesVariables from '@/components/WithStylesVariables';
import { ALLOW_COLOR_GROUP, DEFAULT_GROUP_NAME } from '@/constants';
import { useLoadDataFromKVStore } from '@/hooks/useLoadDataFromKVStore';
import { capitalizeFirstLetter, getGroupFromKey } from '@/utils';

const DesignExtensionsParametersConfig: FC = () => {
  const {
    value: config,
    setValue: setConfig,
    metadata: { projectId },
  } = useMeshLocation<'paramTypeConfig', MeshType.MeshDesignExtensionsParametersConfig>();

  const {
    data: { withDarkMode, colors, allowedGroup },
    isLoading,
    errorMessage: errorKVStoreLoadingMessage,
  } = useLoadDataFromKVStore(projectId);

  const { allowColors = [], selectedGroup } = config || {};

  const allowedColorGroups = allowedGroup?.color || ALLOW_COLOR_GROUP;

  const filteredColors = useMemo(
    () =>
      colors.filter(({ colorKey }) =>
        selectedGroup ? colorKey.startsWith(selectedGroup) : !allowedColorGroups.includes(getGroupFromKey(colorKey))
      ),
    [allowedColorGroups, colors, selectedGroup]
  );

  useEffect(() => {
    if (isLoading || errorKVStoreLoadingMessage) return;
    const allPossibleColorKeys = filteredColors.map(({ colorKey }) => colorKey);
    const filteredAllowColors = allowColors.filter(key => allPossibleColorKeys.includes(key));
    if (filteredAllowColors.length !== allowColors.length) {
      setConfig(previousValue => {
        const newValue = { ...previousValue, allowColors: filteredAllowColors };
        return { newValue };
      });
    }
  }, [allowColors, errorKVStoreLoadingMessage, filteredColors, isLoading, setConfig]);

  const handelSaveValue = useCallback(
    (currentValue: string) => {
      setConfig(previousValue => {
        const allowColors = (() => {
          if (previousValue?.allowColors?.length) {
            return previousValue?.allowColors?.find(item => item === currentValue)
              ? previousValue?.allowColors.filter(item => item !== currentValue)
              : [...(previousValue?.allowColors || []), currentValue];
          } else {
            return colors.filter(({ colorKey }) => colorKey !== currentValue).map(({ colorKey }) => colorKey);
          }
        })();
        const newValue = { ...previousValue, allowColors };
        return { newValue };
      });
    },
    [colors, setConfig]
  );

  const handelSelectGroup = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const { name, value } = e.target;
      setConfig(previousValue => ({
        newValue: {
          ...previousValue,
          allowColors: [],
          [name]: value === DEFAULT_GROUP_NAME ? undefined : value,
        },
      }));
    },
    [setConfig]
  );

  const onClearValue = useCallback(() => setConfig(() => ({ newValue: {} })), [setConfig]);

  if (selectedGroup && !allowedColorGroups.includes(selectedGroup)) {
    return (
      <ClearParameterValue
        title="Unexpected configuration"
        buttonTitle="Reset parameter configuration"
        onClick={onClearValue}
      >
        <p className="mb-4">Please reset this parameter and configure it again</p>
        <p className="mb-4 font-bold">Selected Group: {selectedGroup}</p>
      </ClearParameterValue>
    );
  }

  return (
    <ErrorLoadingContainer errorMessage={errorKVStoreLoadingMessage}>
      <WithStylesVariables colors={colors} />
      <div className="flex flex-col gap-1 overflow-x-hidden">
        <LoadingOverlay isActive={isLoading} />
        {!!allowedColorGroups.length && (
          <InputSelect
            name="selectedGroup"
            label="Select color group"
            options={[
              ...allowedColorGroups.map(groupName => ({
                label: capitalizeFirstLetter(groupName),
                value: groupName,
              })),
              { label: capitalizeFirstLetter(DEFAULT_GROUP_NAME), value: DEFAULT_GROUP_NAME },
            ]}
            onChange={handelSelectGroup}
            defaultValue={selectedGroup ?? DEFAULT_GROUP_NAME}
          />
        )}
        <ViewPortConfigToggle withViewPort={config?.withViewPort} setViewPortConfig={setConfig} changeDefaultValue />
        <RequiredConfigToggle required={config?.required} setRequiredConfig={setConfig} />
        <ColorConfigItemSection
          filteredColors={filteredColors}
          allowColors={allowColors}
          withDarkMode={withDarkMode}
          handelSaveValue={handelSaveValue}
        />
      </div>
    </ErrorLoadingContainer>
  );
};

export default DesignExtensionsParametersConfig;
