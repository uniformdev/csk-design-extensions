import { FC, MouseEventHandler, PropsWithChildren, ReactNode } from 'react';
import classNames from 'classnames';
import { TabButton, TabButtonGroup, TabContent, Tabs } from '@uniformdev/design-system';
import { VIEW_PORT_TABS } from '@/constants';
import UpdateDefaultAll from './UpdateDefaultAll';
import UpdateDefaultSingle from './UpdateDefaultSingle';

type ResponsiveTabsProps = PropsWithChildren<{
  onResetAllValues?: MouseEventHandler<HTMLButtonElement> | undefined;
  onResetToDefault: (tabKey: Type.ViewPortKeyType) => void;
  onUnsetValue: (tabKey: Type.ViewPortKeyType) => void;
  setSelectedTab?: (tabKey: Type.ViewPortKeyType) => void;
  responsiveComponents: {
    desktop: ReactNode;
    mobile: ReactNode;
    tablet: ReactNode;
  };
  value?: Type.ViewPort<string | Record<string, string>>;
  hideValue?: boolean;
  resetButtonsPosition?: 'top' | 'bottom';
}>;

const ResponsiveTabs: FC<ResponsiveTabsProps> = ({
  onResetAllValues,
  onResetToDefault,
  onUnsetValue,
  responsiveComponents,
  setSelectedTab,
  value,
  hideValue,
  resetButtonsPosition = 'top',
}) => (
  <div>
    <Tabs>
      <TabButtonGroup>
        {VIEW_PORT_TABS.map(({ tabName, tabKey }) => (
          <TabButton key={`tab-${tabKey}`} id={tabKey} onClick={() => setSelectedTab?.(tabKey)}>
            {tabName}
          </TabButton>
        ))}
        <UpdateDefaultAll onResetAllValues={onResetAllValues} />
      </TabButtonGroup>
      {VIEW_PORT_TABS.map(({ tabKey }) => (
        <TabContent key={`tab-content-${tabKey}`} className="scroll-x-container" tabId={tabKey}>
          <div className={classNames({ 'mt-4': resetButtonsPosition !== 'top' })}>
            {resetButtonsPosition === 'top' && (
              <UpdateDefaultSingle
                hideValue={hideValue}
                viewport={tabKey}
                value={value?.[tabKey] as string | Record<string, string>}
                onResetToDefault={() => onResetToDefault(tabKey)}
                onUnsetValue={() => onUnsetValue(tabKey)}
              />
            )}
            {responsiveComponents[tabKey]}
            {resetButtonsPosition === 'bottom' && (
              <div className="flex w-full justify-end">
                <UpdateDefaultSingle
                  viewport={tabKey}
                  hideValue={hideValue}
                  value={value?.[tabKey] as string | Record<string, string>}
                  onResetToDefault={() => onResetToDefault(tabKey)}
                  onUnsetValue={() => onUnsetValue(tabKey)}
                />
              </div>
            )}
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

export default ResponsiveTabs;
