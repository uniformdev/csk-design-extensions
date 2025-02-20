import React, { FC, useEffect } from 'react';
import classNames from 'classnames';
import { Callout, Label } from '@uniformdev/design-system';
import { SetLocationValueDispatch } from '@uniformdev/mesh-sdk-react';
import BorderExample from '@/components/BorderExample';

type BordersSettingParameterProps = {
  borders: NonNullable<Type.KVStorage['borders']>;
  withDarkMode: Type.KVStorage['withDarkMode'];
  allowBorders: string[];
  setConfig: SetLocationValueDispatch<
    MeshType.MeshDesignExtensionsParametersConfig | undefined,
    MeshType.MeshDesignExtensionsParametersConfig
  >;
};

export const BordersSettingParameter: FC<BordersSettingParameterProps> = ({
  borders,
  withDarkMode,
  allowBorders,
  setConfig,
}) => {
  useEffect(() => {
    const allPossibleBorderKeys = borders.map(({ borderKey }) => borderKey);
    const filteredAllowBorders = allowBorders.filter(key => allPossibleBorderKeys.includes(key));
    if (filteredAllowBorders.length !== allowBorders.length) {
      setConfig(previousValue => {
        const newValue = { ...previousValue, allowTokens: filteredAllowBorders };
        return { newValue };
      });
    }
  }, [allowBorders, borders, setConfig]);

  const handelSaveValue = (currentValue: string) => {
    setConfig(previousValue => {
      const allowTokens = (() => {
        if (previousValue?.allowTokens?.length) {
          return previousValue?.allowTokens?.find(item => item === currentValue)
            ? previousValue?.allowTokens.filter(item => item !== currentValue)
            : [...(previousValue?.allowTokens || []), currentValue];
        } else {
          return borders.filter(({ borderKey }) => borderKey !== currentValue).map(({ borderKey }) => borderKey);
        }
      })();
      const newValue = { ...previousValue, allowTokens };
      return { newValue };
    });
  };

  if (!borders.length) {
    return (
      <Callout title="There are no border tokens yet" type="info">
        You can add them on the Settings page choosing the Border Tab.
      </Callout>
    );
  }

  return (
    <div>
      <Label>Limit the parameter to the following borders:</Label>
      <div className="flex flex-row flex-wrap gap-2">
        {borders.map(({ borderKey, value }) => {
          const isSelected = !allowBorders.length || !!allowBorders.find(key => key === borderKey);
          const { radius, color, width, style } = value || {};
          return (
            <button
              key={borderKey}
              className={classNames(
                'flex items-center w-[calc(50%-4px)] justify-between p-2 bg-gray-50 rounded-md border border-brand-secondary-3',
                { 'text-gray-500 border-gray-50 opacity-65': !isSelected }
              )}
              title={borderKey}
              onClick={() => handelSaveValue(borderKey)}
            >
              {borderKey}
              <div className="flex gap-2">
                <BorderExample borderRadius={radius} borderColor={color} borderStyle={style} borderWidth={width} />
                {withDarkMode && (
                  <div className="dark">
                    <BorderExample borderRadius={radius} borderColor={color} borderStyle={style} borderWidth={width} />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
