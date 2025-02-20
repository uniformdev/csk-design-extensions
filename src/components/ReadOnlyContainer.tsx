import { FC, PropsWithChildren } from 'react';

type ReadOnlyContainerProps = PropsWithChildren<{
  isReadOnly?: boolean;
}>;

const ReadOnlyContainer: FC<ReadOnlyContainerProps> = ({ isReadOnly = false, children }) =>
  isReadOnly ? (
    <div className="cursor-not-allowed opacity-50 [&>*]:pointer-events-none" title="Read-only parameter">
      {children}
    </div>
  ) : (
    <>{children}</>
  );

export default ReadOnlyContainer;
