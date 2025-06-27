import { FC, MouseEventHandler, ReactNode, useCallback } from 'react';
import classNames from 'classnames';
import { TabButton, TabButtonGroup, TabContent, Tabs } from '@uniformdev/design-system';
import { VIEW_PORT_TABS } from '@/constants';
import UpdateDefaultAll from './UpdateDefaultAll';
import UpdateDefaultSingle from './UpdateDefaultSingle';

type ViewPortKey = Type.ViewPortKeyType;

type ResponsiveTabsProps = {
  onResetAllValues?: MouseEventHandler<HTMLButtonElement>;
  onResetToDefault: (tabKey: ViewPortKey) => void;
  onUnsetValue: (tabKey: ViewPortKey) => void;
  setSelectedTab?: (tabKey: ViewPortKey) => void;
  responsiveComponents: Record<ViewPortKey, ReactNode>;
  value?: Type.ViewPort<string | Record<string, string>>;
  hideValue?: boolean;
  resetButtonsPosition?: 'top' | 'bottom';
  options?: MeshType.Options[];
};

const ResponsiveTabs: FC<ResponsiveTabsProps> = ({
  onResetAllValues,
  onResetToDefault,
  onUnsetValue,
  setSelectedTab,
  responsiveComponents,
  value = {} as ResponsiveTabsProps['value'],
  hideValue = false,
  resetButtonsPosition = 'top',
  options = [],
}) => {
  const renderResetButton = useCallback(
    (position: 'top' | 'bottom', tabKey: ViewPortKey) => {
      if (position !== resetButtonsPosition) return null;

      const wrapperClass = position === 'bottom' ? 'flex w-full justify-end' : '';
      const commonProps = {
        viewport: tabKey,
        value: value?.[tabKey] as string | Record<string, string>,
        options,
        hideValue,
        onResetToDefault: () => onResetToDefault(tabKey),
        onUnsetValue: () => onUnsetValue(tabKey),
      };

      return (
        <div className={wrapperClass}>
          <UpdateDefaultSingle {...commonProps} />
        </div>
      );
    },
    [resetButtonsPosition, value, options, hideValue, onResetToDefault, onUnsetValue]
  );

  return (
    <div>
      <Tabs>
        <TabButtonGroup>
          {VIEW_PORT_TABS.map(({ tabName, tabKey }) => (
            <TabButton key={tabKey} id={tabKey} onClick={() => setSelectedTab?.(tabKey as ViewPortKey)}>
              {tabName}
            </TabButton>
          ))}
          <UpdateDefaultAll onResetAllValues={onResetAllValues} />
        </TabButtonGroup>

        {VIEW_PORT_TABS.map(({ tabKey }) => (
          <TabContent key={tabKey} tabId={tabKey} className="scroll-x-container">
            <div className={classNames({ 'mt-4': resetButtonsPosition !== 'top' })}>
              {renderResetButton('top', tabKey as ViewPortKey)}

              {responsiveComponents[tabKey as ViewPortKey]}

              {renderResetButton('bottom', tabKey as ViewPortKey)}
            </div>
          </TabContent>
        ))}
      </Tabs>

      <a
        href="https://tailwindcss.com/docs/responsive-design#working-mobile-first"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 text-xs text-gray-500 underline"
      >
        Based on Tailwind CSS’s mobile-first principles
      </a>
    </div>
  );
};

export default ResponsiveTabs;
