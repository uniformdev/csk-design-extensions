import React, { FC, useEffect, useMemo } from 'react';
import { Callout, InputSelect } from '@uniformdev/design-system';
import { SetLocationValueDispatch } from '@uniformdev/mesh-sdk-react';
import ColorConfigItemSection from '@/components/parameters/ColorConfigItemSection';
import { DEFAULT_GROUP_NAME } from '@/constants';
import { capitalizeFirstLetter, getGroupFromKey } from '@/utils';

type ColorsSettingParameterProps = {
  colors: NonNullable<Type.KVStorage['colors']>;
  allowColorGroups: string[];
  withDarkMode?: boolean;
  selectedGroup?: string;
  allowColors: string[];
  setConfig: SetLocationValueDispatch<
    MeshType.MeshDesignExtensionsParametersConfig | undefined,
    MeshType.MeshDesignExtensionsParametersConfig
  >;
};

export const ColorsSettingParameter: FC<ColorsSettingParameterProps> = ({
  colors,
  allowColorGroups,
  withDarkMode = false,
  selectedGroup,
  allowColors,
  setConfig,
}) => {
  const filteredColors = useMemo(
    () =>
      colors.filter(({ colorKey }) =>
        selectedGroup ? colorKey.startsWith(selectedGroup) : !allowColorGroups.includes(getGroupFromKey(colorKey))
      ),
    [allowColorGroups, colors, selectedGroup]
  );

  useEffect(() => {
    const allPossibleColorKeys = filteredColors.map(({ colorKey }) => colorKey);
    const filteredAllowColors = allowColors.filter(key => allPossibleColorKeys.includes(key));
    if (filteredAllowColors.length !== allowColors.length) {
      setConfig(previousValue => {
        const newValue = { ...previousValue, allowTokens: filteredAllowColors };
        return { newValue };
      });
    }
  }, [allowColors, filteredColors, setConfig]);

  const handelSaveValue = (currentValue: string) => {
    setConfig(previousValue => {
      const allowTokens = (() => {
        if (previousValue?.allowTokens?.length) {
          return previousValue?.allowTokens?.find(item => item === currentValue)
            ? previousValue?.allowTokens.filter(item => item !== currentValue)
            : [...(previousValue?.allowTokens || []), currentValue];
        } else {
          return colors.filter(({ colorKey }) => colorKey !== currentValue).map(({ colorKey }) => colorKey);
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
        allowColors: [],
        [name]: value === DEFAULT_GROUP_NAME ? undefined : value,
      },
    }));
  };

  return (
    <>
      {!!allowColorGroups.length && (
        <InputSelect
          name="selectedGroup"
          label="Select color group"
          options={[
            ...allowColorGroups.map(groupName => ({
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
        {!filteredColors.length ? (
          <Callout
            title={`There are no color tokens yet in ${capitalizeFirstLetter(
              selectedGroup || DEFAULT_GROUP_NAME
            )} group`}
            type="info"
          >
            You can add them on the Settings page choosing the Colors Palette Tab.
          </Callout>
        ) : (
          <ColorConfigItemSection
            filteredColors={filteredColors}
            allowColors={allowColors}
            withDarkMode={withDarkMode}
            handelSaveValue={handelSaveValue}
          />
        )}
      </div>
    </>
  );
};
