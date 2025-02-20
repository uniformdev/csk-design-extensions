import React, { FC, MouseEventHandler, PropsWithChildren } from 'react';
import { Callout, Button } from '@uniformdev/design-system';

type ClearValueProps = PropsWithChildren & {
  title: string;
  buttonTitle: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

export const ClearParameterValue: FC<ClearValueProps> = ({ title, buttonTitle, onClick, children }) => (
  <Callout title={title} type="danger" compact>
    {children}
    <div className="flex flex-wrap gap-2">
      <Button title="Reset parameter value" buttonType="secondary" onClick={onClick}>
        {buttonTitle}
      </Button>
    </div>
  </Callout>
);
