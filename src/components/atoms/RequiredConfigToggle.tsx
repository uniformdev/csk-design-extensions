import React, { ChangeEvent, FC, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { InputToggle } from '@uniformdev/design-system';
import { SetLocationValueDispatch } from '@uniformdev/mesh-sdk-react';

type RequiredConfigToggleType = {
  required?: MeshType.MeshDesignExtensionsParametersConfig['required'];
  setRequiredConfig: SetLocationValueDispatch<
    Pick<MeshType.MeshDesignExtensionsParametersConfig, 'required'> | undefined,
    Pick<MeshType.MeshDesignExtensionsParametersConfig, 'required'>
  >;
};

const RequiredConfigToggle: FC<RequiredConfigToggleType> = ({ required, setRequiredConfig }) => {
  const router = useRouter();
  const isShowRequiredToggle = useMemo(
    () => router?.query?.showRequiredToggle === 'true',
    [router?.query?.showRequiredToggle]
  );

  const handleToggle = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { checked } = e.target;
      setRequiredConfig(previousValue => {
        if (checked) {
          return { newValue: { ...previousValue, required: checked } };
        } else {
          const { required: _, ...restValues } = previousValue || {};
          return { newValue: restValues };
        }
      });
    },
    [setRequiredConfig]
  );

  return isShowRequiredToggle ? (
    <InputToggle label="Required" name="required" type="checkbox" checked={Boolean(required)} onChange={handleToggle} />
  ) : null;
};

export default RequiredConfigToggle;
