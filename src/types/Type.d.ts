declare namespace Type {
  type KVStorage = {
    withDarkMode?: boolean;
    colors?: { colorKey: string; [mode: string]: string }[];
    dimensions?: { dimensionKey: string; [mode: string]: string }[];
    fonts?: { fontKey: string; [mode: string]: string }[];
    defaultFont?: string;
    borders?: {
      borderKey: string;
      value: { color: string; width: string; radius: string; style: string };
    }[];
    allowedGroup?: {
      color?: string[];
      dimension?: string[];
    };
  };

  type KVMetaData = { metaData?: { environment: string; lastUpdated: string } };

  type DesignToken = { key: string; value: string | object };

  type Callout = {
    type: 'caution' | 'danger' | 'info' | 'note' | 'success' | 'tip' | 'error';
    title?: string;
    text: string;
  };

  type TabKey = 'color' | 'size-dimension' | 'font' | 'border' | 'webhooks';

  type ViewPort<T> = {
    desktop?: T;
    tablet?: T;
    mobile?: T;
  };

  type ViewPortKeyType = keyof ViewPort<unknown>;
}
