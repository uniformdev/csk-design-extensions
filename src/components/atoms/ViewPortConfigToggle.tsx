import React, { ChangeEvent, FC, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { InputToggle } from '@uniformdev/design-system';
import { SetLocationValueDispatch } from '@uniformdev/mesh-sdk-react';
import { VIEW_PORT_TABS } from '@/constants';

type ViewPortConfigToggleType = {
  withViewPort?: MeshType.MeshDesignExtensionsParametersConfig['withViewPort'];
  setViewPortConfig: SetLocationValueDispatch<
    Pick<MeshType.MeshDesignExtensionsParametersConfig, 'withViewPort' | 'defaultValue'> | undefined,
    Pick<MeshType.MeshDesignExtensionsParametersConfig, 'withViewPort' | 'defaultValue'>
  >;
  changeDefaultValue?: boolean;
};

const moveDefaultValue = (
  defaultValue: MeshType.MeshDesignExtensionsParametersConfig['defaultValue'],
  withViewPort?: boolean
) => {
  if (!defaultValue) return undefined;

  if (withViewPort) {
    if (typeof defaultValue !== 'string' && VIEW_PORT_TABS.some(({ tabKey }) => tabKey in defaultValue)) {
      return defaultValue;
    } else {
      return VIEW_PORT_TABS.reduce((acc, { tabKey }) => ({ ...acc, [tabKey]: defaultValue }), {});
    }
  } else {
    if (typeof defaultValue !== 'string' && VIEW_PORT_TABS.some(({ tabKey }) => tabKey in defaultValue)) {
      return defaultValue?.desktop || defaultValue?.tablet || defaultValue?.mobile;
    } else {
      return defaultValue;
    }
  }
};

const ViewPortConfigToggle: FC<ViewPortConfigToggleType> = ({
  withViewPort,
  setViewPortConfig,
  changeDefaultValue,
}) => {
  const router = useRouter();
  const isShowViewPortToggle = useMemo(
    () => router?.query?.showViewPortToggle === 'true',
    [router?.query?.showViewPortToggle]
  );

  const handleToggle = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { checked } = e.target;
      setViewPortConfig(previousValue => {
        const { withViewPort: _, defaultValue, ...restValues } = previousValue || {};
        const newDefaultValue = changeDefaultValue ? moveDefaultValue(defaultValue, checked) : defaultValue;

        return {
          newValue: {
            ...restValues,
            ...(checked ? { withViewPort: checked } : undefined),
            ...(newDefaultValue ? { defaultValue: newDefaultValue } : undefined),
          },
        };
      });
    },
    [changeDefaultValue, setViewPortConfig]
  );

  return isShowViewPortToggle ? (
    <InputToggle
      label="Vary by view port"
      caption="Ability to specify a different value based on a specific view port."
      name="withViewPort"
      type="checkbox"
      checked={Boolean(withViewPort)}
      onChange={handleToggle}
    />
  ) : null;
};

export default ViewPortConfigToggle;
