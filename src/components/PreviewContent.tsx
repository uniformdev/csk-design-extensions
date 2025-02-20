import { FC, ReactNode } from 'react';
import { Icon } from '@uniformdev/design-system';

const PreviewContent: FC<{ error?: boolean; content: ReactNode }> = ({ error = false, content }) => {
  if (!error) {
    return <>{content}</>;
  }

  return (
    <div className="my-4.5 flex items-center gap-2 text-action-destructive">
      <Icon size="12" icon="warning" />
      <div className="block text-action-destructive">Preview not available until errors are resolved</div>
    </div>
  );
};

export default PreviewContent;
