import { FC } from 'react';
import { Callout, LoadingIndicator } from '@uniformdev/design-system';
import { SetLocationValueDispatch, SetLocationValueFunction, useMeshLocation } from '@uniformdev/mesh-sdk-react';
import ColorPaletteParam from '@/components/parameters/ColorPaletteParam';
import ConfigurableSliderParam from '@/components/parameters/ConfigurableSliderParam';
import SegmentedControl from '@/components/parameters/SegmentedControl';
import SpacerControl from '@/components/parameters/SpaceControl';
import { SpaceProperties } from '@/components/parameters/SpaceControl';
import ReadOnlyContainer from '@/components/ReadOnlyContainer';
import { SpaceValueType } from '@/components/SpaceControl/SpaceControl';
import { ALLOW_DIMENSION_GROUP, DEFAULT_GROUP_NAME, DesignExtensionsParameters, TokenType } from '@/constants';
import { useLoadDataFromKVStore } from '@/hooks/useLoadDataFromKVStore';
import { getOptionFromToken } from '@/utils';

type ValueType = string | Record<SpaceProperties, string> | undefined;

const DesignExtensionsParametersEditor: FC = () => {
  const {
    value,
    setValue: saveValue,
    metadata: { projectId, parameterDefinition, parameterConfiguration },
    isReadOnly,
  } = useMeshLocation<'paramType', ValueType>();

  const setValue = (dispatch: SetLocationValueFunction<ValueType, ValueType>) => {
    if (isReadOnly) {
      console.warn(`Cannot change the value of the ${parameterDefinition.name} parameter because it is read-only.`);
      return;
    }
    return saveValue(dispatch);
  };

  const {
    data: { withDarkMode, colors, dimensions, fonts, borders, allowedGroup },
    isLoading: isKVStoreLoading,
    errorMessage: errorKVStoreLoadingMessage,
  } = useLoadDataFromKVStore(projectId);
  const allowedDimensionGroups = allowedGroup?.dimension || ALLOW_DIMENSION_GROUP;

  const { type: selectedParameterType } = parameterDefinition;

  const {
    required = false,
    withViewPort = false,
    allowColors = [],
    selectedTokenType,
    allowTokens = [],
    allowDimensions = [],
    minValue,
    maxValue,
    units,
    step,
    type,
    options,
    defaultValue,
    selectedGroup,
  } = (parameterConfiguration as MeshType.MeshDesignExtensionsParametersConfig) || {};

  if (isKVStoreLoading) return <LoadingIndicator />;

  if (errorKVStoreLoadingMessage) return <Callout type="error">{errorKVStoreLoadingMessage}</Callout>;

  switch (selectedParameterType) {
    case DesignExtensionsParameters.colorPalette:
      return (
        <ReadOnlyContainer isReadOnly={isReadOnly}>
          <ColorPaletteParam
            value={value as string | undefined}
            withDarkMode={withDarkMode}
            colors={colors}
            selectedGroup={selectedGroup}
            setValue={setValue as SetLocationValueDispatch<string | undefined | null, string | undefined | null>}
            allowColors={allowColors}
          />
        </ReadOnlyContainer>
      );
    case DesignExtensionsParameters.spacerControl:
      return (
        <ReadOnlyContainer isReadOnly={isReadOnly}>
          <SpacerControl
            required={required}
            withViewPort={withViewPort}
            options={options}
            dimensions={dimensions}
            type={type}
            selectedGroup={selectedGroup}
            allowDimensions={allowDimensions}
            value={value as SpaceValueType | Type.ViewPort<SpaceValueType> | undefined}
            defaultValue={defaultValue as SpaceValueType | Type.ViewPort<SpaceValueType> | undefined}
            setValue={
              setValue as SetLocationValueDispatch<
                SpaceValueType | Type.ViewPort<SpaceValueType | undefined> | undefined,
                SpaceValueType | Type.ViewPort<SpaceValueType | undefined> | undefined
              >
            }
          />
        </ReadOnlyContainer>
      );
    case DesignExtensionsParameters.slider:
      return (
        <ReadOnlyContainer isReadOnly={isReadOnly}>
          <ConfigurableSliderParam
            withViewPort={withViewPort}
            value={value as Type.ViewPort<string | number> | string | number | undefined}
            units={units}
            minValue={minValue}
            maxValue={maxValue}
            step={step}
            type={type}
            options={options}
            setValue={
              setValue as SetLocationValueDispatch<Type.ViewPort<number | string> | number | string | undefined>
            }
            defaultValue={defaultValue as string}
          />
        </ReadOnlyContainer>
      );
    case DesignExtensionsParameters.segmentedControl:
      return (
        <ReadOnlyContainer isReadOnly={isReadOnly}>
          <SegmentedControl
            withViewPort={withViewPort}
            value={value as Type.ViewPort<string> | string | undefined}
            setValue={
              setValue as SetLocationValueDispatch<
                Type.ViewPort<string> | string | undefined,
                Type.ViewPort<string> | string | undefined
              >
            }
            options={options || []}
            defaultValue={defaultValue as string}
            required={required}
          />
        </ReadOnlyContainer>
      );
    case DesignExtensionsParameters.tokenSelector: {
      const tokensToRender = (() => {
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
      })();
      return (
        <ReadOnlyContainer isReadOnly={isReadOnly}>
          <SegmentedControl
            withViewPort={withViewPort}
            value={value as Type.ViewPort<string> | string | undefined}
            setValue={
              setValue as SetLocationValueDispatch<
                Type.ViewPort<string> | string | undefined,
                Type.ViewPort<string> | string | undefined
              >
            }
            options={tokensToRender}
            defaultValue={defaultValue as string}
            required={required}
          />
        </ReadOnlyContainer>
      );
    }
    default:
      return (
        <Callout type="error">
          <p>{`It looks like parameter ${selectedParameterType} was not found`}</p>
        </Callout>
      );
  }
};

export default DesignExtensionsParametersEditor;
