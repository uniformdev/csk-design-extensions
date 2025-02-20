import React, { FC, useEffect, useMemo } from 'react';
import classNames from 'classnames';
import { Callout, InputSelect, Label } from '@uniformdev/design-system';
import { SetLocationValueDispatch } from '@uniformdev/mesh-sdk-react';
import { DEFAULT_GROUP_NAME } from '@/constants';
import { capitalizeFirstLetter, getGroupFromKey, getNameFromKey } from '@/utils';

type DimensionsSettingParameterProps = {
  dimensions: NonNullable<Type.KVStorage['dimensions']>;
  allowDimensionsGroups: string[];
  selectedGroup?: string;
  allowDimensions: string[];
  setConfig: SetLocationValueDispatch<
    MeshType.MeshDesignExtensionsParametersConfig | undefined,
    MeshType.MeshDesignExtensionsParametersConfig
  >;
};

export const DimensionsSettingParameter: FC<DimensionsSettingParameterProps> = ({
  dimensions,
  allowDimensionsGroups,
  selectedGroup,
  allowDimensions,
  setConfig,
}) => {
  const filteredDimensions = useMemo(
    () =>
      dimensions.filter(({ dimensionKey }) =>
        selectedGroup
          ? dimensionKey.startsWith(selectedGroup)
          : !allowDimensionsGroups.includes(getGroupFromKey(dimensionKey))
      ),
    [allowDimensionsGroups, dimensions, selectedGroup]
  );

  useEffect(() => {
    const allPossibleDimensionKeys = filteredDimensions.map(({ dimensionKey }) => dimensionKey);
    const filteredAllowDimensions = allowDimensions.filter(key => allPossibleDimensionKeys.includes(key));
    if (filteredAllowDimensions.length !== allowDimensions.length) {
      setConfig(previousValue => {
        const newValue = { ...previousValue, allowTokens: filteredAllowDimensions };
        return { newValue };
      });
    }
  }, [allowDimensions, filteredDimensions, setConfig]);

  const handelSaveValue = (currentValue: string) => {
    setConfig(previousValue => {
      const allowTokens = (() => {
        if (previousValue?.allowTokens?.length) {
          return previousValue?.allowTokens?.find(item => item === currentValue)
            ? previousValue?.allowTokens.filter(item => item !== currentValue)
            : [...(previousValue?.allowTokens || []), currentValue];
        } else {
          return dimensions
            .filter(({ dimensionKey }) => dimensionKey !== currentValue)
            .map(({ dimensionKey }) => dimensionKey);
        }
      })();
      const newValue = { ...previousValue, allowTokens };
      return { newValue };
    });
  };

  const handelSelectGroup = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig(previousValue => ({
      newValue: {
        ...previousValue,
        allowDimensions: [],
        [name]: value === DEFAULT_GROUP_NAME ? undefined : value,
      },
    }));
  };

  return (
    <>
      {!!allowDimensionsGroups.length && (
        <InputSelect
          name="selectedGroup"
          label="Select dimension group"
          options={[
            ...allowDimensionsGroups.map(groupName => ({
              label: capitalizeFirstLetter(groupName),
              value: groupName,
            })),
            { label: capitalizeFirstLetter(DEFAULT_GROUP_NAME), value: DEFAULT_GROUP_NAME },
          ]}
          onChange={handelSelectGroup}
          defaultValue={selectedGroup ?? DEFAULT_GROUP_NAME}
        />
      )}
      <div>
        {!filteredDimensions.length ? (
          <Callout
            title={`There are no dimension tokens yet in ${capitalizeFirstLetter(
              selectedGroup || DEFAULT_GROUP_NAME
            )} group`}
            type="info"
          >
            You can add them on the Settings page choosing the Dimension Tab.
          </Callout>
        ) : (
          <>
            <Label>Limit the parameter to the following dimensions:</Label>
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
      </div>
    </>
  );
};
