declare namespace MeshType {
  type SettingsParams = {
    deployHooks?: string[];
  };

  interface MeshDesignExtensionsParametersConfig {
    required?: boolean;
    minValue?: number;
    maxValue?: number;
    step?: number;
    units?: string;
    type?: string;
    withViewPort?: boolean;
    selectedGroup?: string;
    selectedTokenType?: string;
    allowColors?: string[];
    allowDimensions?: string[];
    allowTokens?: string[];
    options?: KeyValueItem[];
    defaultValue?: string | Record<string, string> | Type.ViewPort<string | Record<string, string> | undefined>;
  }

  interface MeshDesignExtensionsParametersDefinition {
    type: string;
  }

  type KeyValueItem<TValue extends string = string> = {
    label?: string;
    key: string;
    value: TValue;
    uniqueId?: string;
  };

  type Options = {
    key: string;
    label: string;
    value: string;
  };
}
