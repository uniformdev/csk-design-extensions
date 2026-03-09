import React, { ChangeEvent, FC, useCallback } from 'react';
import { InputToggle } from '@uniformdev/design-system';
import { SetLocationValueDispatch } from '@uniformdev/mesh-sdk-react';

type CustomHexConfigToggleType = {
  allowCustomHex?: MeshType.MeshDesignExtensionsParametersConfig['allowCustomHex'];
  setCustomHexConfig: SetLocationValueDispatch<
    Pick<MeshType.MeshDesignExtensionsParametersConfig, 'allowCustomHex'> | undefined,
    Pick<MeshType.MeshDesignExtensionsParametersConfig, 'allowCustomHex'>
  >;
};

const CustomHexConfigToggle: FC<CustomHexConfigToggleType> = ({ allowCustomHex, setCustomHexConfig }) => {
  const handleToggle = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { checked } = e.target;
      setCustomHexConfig(previousValue => {
        if (checked) {
          return { newValue: { ...previousValue, allowCustomHex: checked } };
        } else {
          const { allowCustomHex: _, ...restValues } = previousValue || {};
          return { newValue: restValues };
        }
      });
    },
    [setCustomHexConfig]
  );

  return (
    <InputToggle
      label="Allow custom hex value"
      caption="Allow users to specify a custom hex color value as an override."
      name="allowCustomHex"
      type="checkbox"
      checked={Boolean(allowCustomHex)}
      onChange={handleToggle}
    />
  );
};

export default CustomHexConfigToggle;
