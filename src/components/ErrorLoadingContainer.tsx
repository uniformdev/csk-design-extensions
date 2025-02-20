import { FC, ReactNode } from 'react';
import { Callout } from '@uniformdev/design-system';

const ERROR_TITLE = 'Error loading data from KV storage, please reload the page';

interface ErrorLoadingContainerProps {
  errorMessage?: string;
  children: ReactNode;
}

const ErrorLoadingContainer: FC<ErrorLoadingContainerProps> = ({ errorMessage, children }) =>
  errorMessage?.length ? (
    <div className="relative">
      <div className="cursor-not-allowed opacity-50 [&>*]:pointer-events-none" title={ERROR_TITLE}>
        {children}
      </div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 shadow-2xl">
        <Callout title={ERROR_TITLE} type="error">
          {errorMessage}
        </Callout>
      </div>
    </div>
  ) : (
    <>{children}</>
  );

export default ErrorLoadingContainer;
