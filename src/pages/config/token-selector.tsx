import React, { FC, useCallback, useMemo } from 'react';
import { SegmentedControl as MeshSegmentedControl, LoadingOverlay, InputSelect } from '@uniformdev/design-system';
import { useMeshLocation, SetLocationValueDispatch, SetLocationValueFunction } from '@uniformdev/mesh-sdk-react';
import RequiredConfigToggle from '@/components/atoms/RequiredConfigToggle';
import ViewPortConfigToggle from '@/components/atoms/ViewPortConfigToggle';
import { ClearParameterValue } from '@/components/ClearParameterValue';
import ErrorLoadingContainer from '@/components/ErrorLoadingContainer';
import ParameterPreview from '@/components/ParameterPreview';
import { BordersSettingParameter } from '@/components/parameters/TokenSelector/BordersSettingParameter';
import { ColorsSettingParameter } from '@/components/parameters/TokenSelector/ColorsSettingParameter';
import { DimensionsSettingParameter } from '@/components/parameters/TokenSelector/DimensionsSettingParameter';
import { FontsSettingParameter } from '@/components/parameters/TokenSelector/FontsSettingParameter';
import ResponsiveTabs from '@/components/ResponsiveTabs';
import UpdateDefaultSingle from '@/components/UpdateDefaultSingle';
import WithStylesVariables from '@/components/WithStylesVariables';
import { ALLOW_COLOR_GROUP, ALLOW_DIMENSION_GROUP, DEFAULT_GROUP_NAME, TokenType } from '@/constants';
import { useLoadDataFromKVStore } from '@/hooks/useLoadDataFromKVStore';
import useWithViewPortDefaultValue from '@/hooks/useWithViewPortDefaultValue';
import { capitalizeFirstLetter, getOptionFromToken } from '@/utils';

const DesignExtensionsParametersConfig: FC = () => {
  const {
    value: config,
    setValue: setConfig,
    metadata: { projectId },
  } = useMeshLocation<'paramTypeConfig', MeshType.MeshDesignExtensionsParametersConfig>();

  const {
    selectedTokenType,
    allowTokens = [],
    selectedGroup,
    withViewPort = false,
    required,
    defaultValue,
  } = config || {};

  const {
    data: { colors, withDarkMode, dimensions, fonts, borders, allowedGroup },
    isLoading,
    errorMessage: errorKVStoreLoadingMessage,
  } = useLoadDataFromKVStore(projectId);

  const allowedColorGroups = allowedGroup?.color || ALLOW_COLOR_GROUP;
  const allowedDimensionGroups = allowedGroup?.dimension || ALLOW_DIMENSION_GROUP;

  const handelSelectTokenType = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const { name, value } = e.target;
      setConfig(() => ({
        newValue: { [name]: value || undefined },
        options: value ? { isValid: true } : { isValid: false, validationMessage: 'Please select token type' },
      }));
    },
    [setConfig]
  );

  const {
    previewDefaultValue,
    onChangeDefaultValue,
    onResetAllValues,
    onResetToDefault,
    onUnsetValue,
    isSaveAsDefaultEnabled,
  } = useWithViewPortDefaultValue({ defaultValue, withViewPort });

  const handleSetDefaultValue = () => {
    setConfig(previousValue => {
      const newValue = { ...previousValue, defaultValue: previewDefaultValue ?? undefined };
      return { newValue };
    });
  };

  const optionsToRender = useMemo(() => {
    switch (selectedTokenType) {
      case TokenType.Color:
        return getOptionFromToken(
          colors.map(({ colorKey }) => colorKey),
          allowTokens,
          selectedGroup || DEFAULT_GROUP_NAME
        );
      case TokenType.Dimension:
        return getOptionFromToken(
          dimensions.map(({ dimensionKey }) => dimensionKey),
          allowTokens,
          selectedGroup || DEFAULT_GROUP_NAME,
          allowedDimensionGroups
        );
      case TokenType.Font:
        return getOptionFromToken(
          fonts.map(({ fontKey }) => fontKey),
          allowTokens,
          DEFAULT_GROUP_NAME
        );
      case TokenType.Border:
        return getOptionFromToken(
          borders.map(({ borderKey }) => borderKey),
          allowTokens,
          DEFAULT_GROUP_NAME
        );
      default:
        return [];
    }
  }, [allowTokens, borders, colors, dimensions, fonts, selectedGroup, selectedTokenType, allowedDimensionGroups]);

  const renderMeshSegmentedControl = useCallback(
    (viewport: Type.ViewPortKeyType) => (
      <MeshSegmentedControl
        name={`segmentedControl${viewport.charAt(0).toUpperCase() + viewport.slice(1)}`}
        options={optionsToRender}
        orientation="horizontal"
        size="sm"
        onChange={value => onChangeDefaultValue(value, viewport)}
        value={(previewDefaultValue as Type.ViewPort<string>)?.[viewport]}
        noCheckmark
      />
    ),
    [onChangeDefaultValue, optionsToRender, previewDefaultValue]
  );

  const renderTokenSettingParameter = useCallback(() => {
    const handleResetData =
      (
        setCallBack: SetLocationValueDispatch<
          MeshType.MeshDesignExtensionsParametersConfig | undefined,
          MeshType.MeshDesignExtensionsParametersConfig
        >
      ) =>
      (
        dispatch: SetLocationValueFunction<
          MeshType.MeshDesignExtensionsParametersConfig | undefined,
          MeshType.MeshDesignExtensionsParametersConfig
        >
      ) => {
        setCallBack(dispatch);
        onUnsetValue();
        onResetAllValues();
      };
    switch (selectedTokenType) {
      case TokenType.Color:
        return (
          <ColorsSettingParameter
            colors={colors}
            allowColorGroups={allowedColorGroups}
            withDarkMode={withDarkMode}
            selectedGroup={selectedGroup}
            allowColors={allowTokens}
            setConfig={handleResetData(setConfig)}
          />
        );
      case TokenType.Dimension:
        return (
          <DimensionsSettingParameter
            dimensions={dimensions}
            allowDimensionsGroups={allowedDimensionGroups}
            selectedGroup={selectedGroup}
            allowDimensions={allowTokens}
            setConfig={handleResetData(setConfig)}
          />
        );
      case TokenType.Font:
        return <FontsSettingParameter fonts={fonts} allowFonts={allowTokens} setConfig={handleResetData(setConfig)} />;
      case TokenType.Border:
        return (
          <BordersSettingParameter
            borders={borders}
            allowBorders={allowTokens}
            withDarkMode={withDarkMode}
            setConfig={handleResetData(setConfig)}
          />
        );
      default:
        return null;
    }
  }, [
    allowedColorGroups,
    allowedDimensionGroups,
    allowTokens,
    borders,
    colors,
    dimensions,
    fonts,
    onResetAllValues,
    onUnsetValue,
    selectedGroup,
    selectedTokenType,
    setConfig,
    withDarkMode,
  ]);

  const onClearValue = useCallback(
    () => setConfig(() => ({ newValue: { selectedTokenType } })),
    [selectedTokenType, setConfig]
  );

  const isInvalidGroup = useMemo(
    () =>
      selectedGroup &&
      ((selectedTokenType === TokenType.Color && !allowedColorGroups.includes(selectedGroup)) ||
        (selectedTokenType === TokenType.Dimension && !allowedDimensionGroups.includes(selectedGroup))),
    [selectedGroup, selectedTokenType, allowedColorGroups, allowedDimensionGroups]
  );

  const defaultValues = useMemo(
    () => (typeof defaultValue === 'string' ? [defaultValue] : Object.values(defaultValue || {})),
    [defaultValue]
  );

  const isInvalidDefaultValue = useMemo(
    () =>
      !defaultValues
        .filter(Boolean)
        .every(selectedValue => optionsToRender.find(({ value: initValue }) => initValue === selectedValue)),
    [defaultValues, optionsToRender]
  );

  if (!isLoading && (isInvalidGroup || isInvalidDefaultValue)) {
    return (
      <ClearParameterValue
        title="Unexpected configuration"
        buttonTitle="Reset parameter configuration"
        onClick={onClearValue}
      >
        <p className="mb-4">Please reset this parameter and configure it again</p>
        {isInvalidDefaultValue && <p className="mb-4 font-bold">Default Value: {defaultValues.join(', ')}</p>}
        {isInvalidGroup && <p className="mb-4 font-bold">Selected Group: {selectedGroup}</p>}
      </ClearParameterValue>
    );
  }

  return (
    <ErrorLoadingContainer errorMessage={errorKVStoreLoadingMessage}>
      <WithStylesVariables colors={colors} dimensions={dimensions} />
      <div className="flex flex-col gap-4 overflow-x-hidden">
        <LoadingOverlay isActive={isLoading} />
        <InputSelect
          name="selectedTokenType"
          label="Select Token Type"
          options={[
            { label: 'Select Type', value: undefined },
            ...Object.values(TokenType).map(tokenType => ({
              label: capitalizeFirstLetter(tokenType),
              value: tokenType,
            })),
          ]}
          onChange={handelSelectTokenType}
          value={selectedTokenType}
        />
        {!!selectedTokenType && !isLoading && (
          <>
            {renderTokenSettingParameter()}
            <ViewPortConfigToggle withViewPort={withViewPort} setViewPortConfig={setConfig} changeDefaultValue />
            <RequiredConfigToggle required={required} setRequiredConfig={setConfig} />
            {!!optionsToRender.length && (
              <div className="scroll-x-container">
                <ParameterPreview
                  onSaveDefault={handleSetDefaultValue}
                  showUpdateLabel={!!defaultValue && defaultValue !== previewDefaultValue}
                  disabled={!isSaveAsDefaultEnabled}
                >
                  {withViewPort ? (
                    <ResponsiveTabs
                      value={previewDefaultValue as Type.ViewPort<string>}
                      onResetAllValues={onResetAllValues}
                      onResetToDefault={onResetToDefault}
                      onUnsetValue={onUnsetValue}
                      hideValue
                      resetButtonsPosition="bottom"
                      responsiveComponents={{
                        desktop: renderMeshSegmentedControl('desktop'),
                        mobile: renderMeshSegmentedControl('mobile'),
                        tablet: renderMeshSegmentedControl('tablet'),
                      }}
                    />
                  ) : (
                    <div>
                      <MeshSegmentedControl
                        name="segmentedControl"
                        onChange={value => onChangeDefaultValue(value)}
                        options={optionsToRender}
                        orientation="horizontal"
                        size="sm"
                        value={previewDefaultValue as string}
                        noCheckmark
                      />
                      <div className="flex w-full justify-end">
                        <UpdateDefaultSingle
                          hideValue
                          value={previewDefaultValue as string}
                          onResetToDefault={() => onResetToDefault()}
                          onUnsetValue={() => onUnsetValue()}
                        />
                      </div>
                    </div>
                  )}
                </ParameterPreview>
              </div>
            )}
          </>
        )}
      </div>
    </ErrorLoadingContainer>
  );
};

export default DesignExtensionsParametersConfig;
