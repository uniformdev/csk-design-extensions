import React, { FC, useEffect } from 'react';
import classNames from 'classnames';
import { Callout, Label } from '@uniformdev/design-system';
import { SetLocationValueDispatch } from '@uniformdev/mesh-sdk-react';
import { getFontFamilyName, getFontURL } from '@/utils';

type FontsSettingParameterProps = {
  fonts: NonNullable<Type.KVStorage['fonts']>;
  allowFonts: string[];
  setConfig: SetLocationValueDispatch<
    MeshType.MeshDesignExtensionsParametersConfig | undefined,
    MeshType.MeshDesignExtensionsParametersConfig
  >;
};

export const FontsSettingParameter: FC<FontsSettingParameterProps> = ({ fonts, allowFonts, setConfig }) => {
  useEffect(() => {
    const allPossibleFontKeys = fonts.map(({ fontKey }) => fontKey);
    const filteredAllowFonts = allowFonts.filter(key => allPossibleFontKeys.includes(key));
    if (filteredAllowFonts.length !== allowFonts.length) {
      setConfig(previousValue => {
        const newValue = { ...previousValue, allowTokens: filteredAllowFonts };
        return { newValue };
      });
    }
  }, [allowFonts, fonts, setConfig]);

  const handelSaveValue = (currentValue: string) => {
    setConfig(previousValue => {
      const allowTokens = (() => {
        if (previousValue?.allowTokens?.length) {
          return previousValue?.allowTokens?.find(item => item === currentValue)
            ? previousValue?.allowTokens.filter(item => item !== currentValue)
            : [...(previousValue?.allowTokens || []), currentValue];
        } else {
          return fonts.filter(({ fontKey }) => fontKey !== currentValue).map(({ fontKey }) => fontKey);
        }
      })();
      const newValue = { ...previousValue, allowTokens };
      return { newValue };
    });
  };

  if (!fonts.length) {
    return (
      <Callout title="There are no fonts yet" type="info">
        You can add them on the Settings page choosing the Font Tab.
      </Callout>
    );
  }

  return (
    <div>
      <Label>Limit the parameter to the following fonts:</Label>
      <div className="flex flex-row flex-wrap gap-2">
        {fonts.map(({ fontKey, value }) => {
          const isSelected = !allowFonts.length || !!allowFonts.find(allowFontKey => allowFontKey === fontKey);
          const fontFamilyName = value ? getFontFamilyName(value) : 'Custom font';
          return (
            <button
              key={fontKey}
              className={classNames(
                'flex items-center w-[calc(50%-4px)]  justify-between p-2 bg-gray-50 rounded-md border border-brand-secondary-3',
                { 'text-gray-500 border-gray-50 opacity-65': !isSelected }
              )}
              title={fontFamilyName}
              style={{ fontFamily: fontFamilyName }}
              onClick={() => handelSaveValue(fontKey)}
            >
              <style> @import {`url('${getFontURL(value)}');`} </style>
              {fontKey}
            </button>
          );
        })}
      </div>
    </div>
  );
};
