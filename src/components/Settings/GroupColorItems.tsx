import { FC, ReactElement } from 'react';
import { Details } from '@uniformdev/design-system';

type GroupColorItemsProps = {
  title: string;
  withDarkMode?: boolean;
  children: ReactElement;
  isOpenByDefault?: boolean;
  showTableHeader?: boolean;
};

export const GroupItems: FC<GroupColorItemsProps> = ({
  title,
  withDarkMode = false,
  children,
  showTableHeader = true,
  isOpenByDefault = false,
}) => (
  <Details summary={title} isIndented isOpenByDefault={isOpenByDefault}>
    <div className="flex flex-col gap-2">
      {showTableHeader && (
        <div className="grid grid-cols-7 gap-4 border-b py-3 text-start">
          <span className="col-span-4 ml-5">Key</span>
          {withDarkMode ? (
            <>
              <span className="col-span-1">Light</span>
              <span className="col-span-1">Dark</span>
            </>
          ) : (
            <span className="col-span-2">Value</span>
          )}
        </div>
      )}
      {children}
    </div>
  </Details>
);
