import { Dispatch, FC, SetStateAction, useCallback, useEffect, useState } from 'react';
import { Tabs, TabButtonGroup, TabButton, TabContent, Button, LoadingOverlay, toast } from '@uniformdev/design-system';
import { useMeshLocation } from '@uniformdev/mesh-sdk-react';
import ErrorLoadingContainer from '@/components/ErrorLoadingContainer';
import { Color, SizeDimension, Font, Border, Webhook } from '@/components/Settings/Tabs';
import WithStylesVariables from '@/components/WithStylesVariables';
import { ColorMode, RESERVED_FONT_KEYS, TABS } from '@/constants';
import { useLoadDataFromKVStore } from '@/hooks/useLoadDataFromKVStore';
import { checkColorValueKeys, checkTokenKeys, getFontNameByIndex, isAliasValue, isValidUrl } from '@/utils';

const SettingsPage: FC = () => {
  const {
    value,
    setValue,
    metadata: { projectId, dashboardOrigin },
  } = useMeshLocation<'settings', MeshType.SettingsParams>();

  const {
    data: { withDarkMode, colors, dimensions, fonts, defaultFontIndex, borders, allowedGroup },
    isLoading: isKVStoreLoading,
    errorMessage: errorKVStoreLoadingMessage,
    setWithDarkMode,
    setColors,
    setDimensions,
    setFonts,
    setDefaultFontIndex,
    setBorders,
    setAllowedGroup,
  } = useLoadDataFromKVStore(projectId);

  const [webhooks, setWebhooks] = useState<NonNullable<MeshType.SettingsParams['deployHooks']>>(
    value.deployHooks || []
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isNeedToSave, setIsNeedToSave] = useState(false);
  const [currentTabKey, setCurrentTabKey] = useState<Type.TabKey>('color');

  // Handler for saving data to KV storage
  const saveDataToKVStore = useCallback(
    async (
      withDarkMode: NonNullable<Type.KVStorage['withDarkMode']>,
      newColors: NonNullable<Type.KVStorage['colors']>,
      newDimensions: NonNullable<Type.KVStorage['dimensions']>,
      newFonts: NonNullable<Type.KVStorage['fonts']>,
      newDefaultFontIndex: number,
      newBorders: NonNullable<Type.KVStorage['borders']>,
      newAllowedGroup: Type.KVStorage['allowedGroup']
    ) => {
      if (!checkTokenKeys(newColors.map(({ colorKey }) => colorKey))) {
        setCurrentTabKey('color');
        throw new Error('Please make sure all color keys are unique and match the key format.');
      }

      if (
        !checkColorValueKeys(
          newColors
            .map(({ colorKey: _, ...value }) =>
              Object.entries(value).reduce<string[]>(
                (acc, [key, value]) =>
                  (key === ColorMode.Dark && !withDarkMode) || isAliasValue(value) ? acc : [...acc, value],
                []
              )
            )
            .flat()
        )
      ) {
        setCurrentTabKey('color');
        throw new Error('Please make sure all color values have the correct format.');
      }

      if (!checkTokenKeys(newDimensions.map(({ dimensionKey }) => dimensionKey))) {
        setCurrentTabKey('size-dimension');
        throw new Error('Please make sure all dimension keys are unique and match the key format.');
      }

      const fontKeys = newFonts.map(({ fontKey }) => fontKey);
      if (!checkTokenKeys(fontKeys)) {
        setCurrentTabKey('font');
        throw new Error('Please make sure all font keys are unique and match the key format.');
      }
      if (fontKeys.some(fontKey => RESERVED_FONT_KEYS.includes(fontKey))) {
        setCurrentTabKey('font');
        throw new Error(
          `Please do not use ${RESERVED_FONT_KEYS.join(', ')} as the fort key — ${
            RESERVED_FONT_KEYS.length > 1 ? 'these are reserved names' : 'this is a reserved name'
          }`
        );
      }

      if (!checkTokenKeys(newBorders.map(({ borderKey }) => borderKey))) {
        setCurrentTabKey('border');
        throw new Error('Please make sure all border keys are unique.');
      }

      const defaultFont = getFontNameByIndex(newDefaultFontIndex, newFonts);

      return fetch(`/api/setThemeData?projectId=${projectId}&baseUrl=${dashboardOrigin}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'custom-origin': window.location.origin,
        },
        body: JSON.stringify({
          withDarkMode,
          colors: newColors,
          dimensions: newDimensions,
          fonts: newFonts,
          defaultFont,
          borders: newBorders,
          allowedGroup: newAllowedGroup,
        }),
        redirect: 'follow',
      }).then(response => {
        if (!response.ok) throw response.statusText;
      });
    },
    [projectId, dashboardOrigin]
  );

  // Handler for saving data to canvas storage
  const saveDataToCanvasStore = useCallback(
    async (newWebhooks: string[]) => {
      if (newWebhooks.some(value => !value || !isValidUrl(value))) {
        setCurrentTabKey('webhooks');
        throw new Error('Please make sure all webhook links are valid.');
      }
      await setValue(previousValue => ({ newValue: { ...previousValue, deployHooks: newWebhooks } }));
    },
    [setValue]
  );

  const handleSaveClick = useCallback(() => {
    setIsLoading(true);
    Promise.all([
      saveDataToKVStore(withDarkMode, colors, dimensions, fonts, defaultFontIndex, borders, allowedGroup),
      saveDataToCanvasStore(webhooks),
    ])
      .then(() => {
        Promise.allSettled(webhooks.map(link => fetch(link, { method: 'POST' })));
        toast.success('Configuration saved.', {});
        setIsNeedToSave(false);
      })
      .catch(e => {
        toast.error('Unable to save configuration. ' + e);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [
    allowedGroup,
    borders,
    colors,
    defaultFontIndex,
    dimensions,
    fonts,
    saveDataToCanvasStore,
    saveDataToKVStore,
    webhooks,
    withDarkMode,
  ]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        if (isNeedToSave) {
          handleSaveClick();
        } else {
          toast.info('No changes to save.', { autoClose: 500 });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSaveClick, isNeedToSave]);

  const renderTabs = useCallback(
    (tabKey: Type.TabKey) => {
      const handleUpdateData =
        <T,>(setCallBack: Dispatch<SetStateAction<T>>) =>
        (props: SetStateAction<T>) => {
          setCallBack(props);
          setIsNeedToSave(true);
        };

      switch (tabKey) {
        case 'color':
          return (
            <Color
              colors={colors}
              allowGroups={allowedGroup?.color}
              withDarkMode={withDarkMode}
              setColors={handleUpdateData(setColors)}
              setWithDarkMode={handleUpdateData(setWithDarkMode)}
              setAllowGroups={handleUpdateData(setAllowedGroup)}
            />
          );
        case 'size-dimension':
          return (
            <SizeDimension
              allowGroups={allowedGroup?.dimension}
              dimensions={dimensions}
              setDimensions={handleUpdateData(setDimensions)}
              setAllowGroups={handleUpdateData(setAllowedGroup)}
            />
          );
        case 'font':
          return (
            <Font
              fonts={fonts}
              defaultFontIndex={defaultFontIndex}
              setFonts={handleUpdateData(setFonts)}
              setDefaultFontIndex={handleUpdateData(setDefaultFontIndex)}
            />
          );
        case 'border':
          return (
            <Border
              borders={borders}
              withDarkMode={withDarkMode}
              setBorders={handleUpdateData(setBorders)}
              colors={colors}
              dimensions={dimensions}
            />
          );
        case 'webhooks':
          return <Webhook webhooks={webhooks} setWebhooks={handleUpdateData(setWebhooks)} />;
        default:
          return null;
      }
    },
    [
      webhooks,
      borders,
      withDarkMode,
      colors,
      dimensions,
      setBorders,
      setWebhooks,
      defaultFontIndex,
      fonts,
      setFonts,
      setDefaultFontIndex,
      allowedGroup,
      setAllowedGroup,
      setColors,
      setDimensions,
      setWithDarkMode,
    ]
  );

  const isDataLoading = isLoading || isKVStoreLoading;

  return (
    <ErrorLoadingContainer errorMessage={errorKVStoreLoadingMessage}>
      <WithStylesVariables colors={colors} dimensions={dimensions} />
      <LoadingOverlay isActive={isDataLoading} />
      <div className="min-h-[700px] bg-white">
        {!isDataLoading && (
          <div className="mb-3">
            <Tabs selectedId={currentTabKey} onSelectedIdChange={tabKey => setCurrentTabKey(tabKey || 'color')}>
              <TabButtonGroup aria-label="Token system settings page for the project" className="mb-6">
                {TABS.map(({ label: tabName, key: tabKey }) => (
                  <TabButton key={tabKey} id={tabKey}>
                    {tabName}
                  </TabButton>
                ))}
              </TabButtonGroup>
              {TABS.map(({ key: tabKey }) => (
                <TabContent key={tabKey} id={tabKey}>
                  {renderTabs(tabKey)}
                </TabContent>
              ))}
            </Tabs>
            <div className="mt-12">
              <Button
                buttonType="secondary"
                size="lg"
                className="m-px"
                onClick={handleSaveClick}
                disabled={!isNeedToSave}
              >
                Save configuration
              </Button>
            </div>
          </div>
        )}
      </div>
    </ErrorLoadingContainer>
  );
};

export default SettingsPage;
