import { useState, useEffect, useMemo } from 'react';
import { VIEW_PORT_TABS } from '@/constants';
import ViewPortKeyType = Type.ViewPortKeyType;

type PossibleDefaultValue =
  | undefined
  | string
  | Record<string, string>
  | Type.ViewPort<string | Record<string, string> | undefined>;

type UseWithViewPortDefaultValueParams = {
  withViewPort: boolean;
  defaultValue: PossibleDefaultValue;
};

const useWithViewPortDefaultValue = ({ withViewPort, defaultValue }: UseWithViewPortDefaultValueParams) => {
  const [previewDefaultValue, setPreviewDefaultValue] = useState<PossibleDefaultValue>(defaultValue);

  useEffect(() => {
    setPreviewDefaultValue(defaultValue);
  }, [defaultValue]);

  const onResetAllValues = () => {
    setPreviewDefaultValue(() =>
      VIEW_PORT_TABS.reduce(
        (acc, { tabKey }) => ({
          ...acc,
          [tabKey]: (defaultValue as Type.ViewPort<string | Record<string, string>>)?.[tabKey],
        }),
        {}
      )
    );
  };

  const onResetToDefault = (tabKey?: Type.ViewPortKeyType) => {
    if (tabKey) {
      setPreviewDefaultValue(prevState => ({
        ...(prevState as Type.ViewPort<string | Record<string, string>>),
        [tabKey]: (defaultValue as Type.ViewPort<string | Record<string, string>>)?.[tabKey],
      }));
    } else {
      setPreviewDefaultValue(defaultValue);
    }
  };

  const onUnsetValue = (tabKey?: Type.ViewPortKeyType) => {
    if (tabKey) {
      setPreviewDefaultValue({
        ...(previewDefaultValue as Type.ViewPort<string | Record<string, string>>),
        [tabKey]: undefined,
      });
    } else {
      setPreviewDefaultValue(undefined);
    }
  };

  const onChangeDefaultValue = (value: string | Record<string, string> | undefined, tabKey?: ViewPortKeyType) => {
    if (tabKey) {
      setPreviewDefaultValue(prevState => {
        if (!prevState || !value || typeof value === 'string') {
          return {
            ...(prevState as Type.ViewPort<string | Record<string, string>>),
            ...(value ? { [tabKey]: value } : undefined),
          };
        }

        const newKeys = Object.keys(value || {});
        const currentTabValues = (prevState as Type.ViewPort<Record<string, string> | undefined> | undefined)?.[tabKey];

        const prevTabValue = Object.keys(currentTabValues || {})
          .filter(key => !newKeys.includes(key) && currentTabValues?.[key])
          .reduce((acc, key) => ({ ...acc, [key]: currentTabValues?.[key] }), {});

        const newTabValue = newKeys.filter(key => value[key]).reduce((acc, key) => ({ ...acc, [key]: value[key] }), {});

        return {
          ...(typeof prevState === 'string' ? undefined : prevState),
          [tabKey]: { ...prevTabValue, ...newTabValue },
        };
      });
    } else {
      setPreviewDefaultValue(prevState => {
        if (!prevState || typeof prevState === 'string') {
          return value;
        }

        if (value && typeof value !== 'string') {
          const newKeys = Object.keys(value || {});
          const prevValue = Object.keys(prevState)
            .filter(key => !newKeys.includes(key) && (prevState as Record<string, string>)[key])
            .reduce((acc, key) => ({ ...acc, [key]: (prevState as Record<string, string>)[key] }), {});

          const newValue = newKeys.filter(key => value[key]).reduce((acc, key) => ({ ...acc, [key]: value[key] }), {});

          return { ...prevValue, ...newValue };
        }

        return prevState;
      });
    }
  };

  const isSaveAsDefaultEnabled = useMemo(() => {
    if (withViewPort) {
      if (!defaultValue && !previewDefaultValue) {
        return false;
      }

      if (JSON.stringify(defaultValue) === JSON.stringify(previewDefaultValue)) {
        return false;
      }

      return true;
    } else {
      if (!defaultValue && !previewDefaultValue) {
        return false;
      }

      if (defaultValue === previewDefaultValue) {
        return false;
      }

      return true;
    }
  }, [defaultValue, previewDefaultValue, withViewPort]);

  return {
    previewDefaultValue,
    onResetAllValues,
    onResetToDefault,
    onUnsetValue,
    onChangeDefaultValue,
    isSaveAsDefaultEnabled,
  };
};

export default useWithViewPortDefaultValue;
