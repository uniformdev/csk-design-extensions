import { FC, MouseEvent } from 'react';
import { SpaceProperties } from '../SpaceControl';
import { ChangeValueInput } from './ChangeValueInput';
import { ChangeValueSelect } from './ChangeValueSelect';

export type ChangeValueProps = {
  type:
    | 'marginTop'
    | 'marginRight'
    | 'marginBottom'
    | 'marginLeft'
    | 'paddingTop'
    | 'paddingRight'
    | 'paddingBottom'
    | 'paddingLeft';

  value?: string;
  options?: MeshType.Options[];
  onChange: (type: SpaceProperties, value: string) => void;
  dataProperty?: string;
  onMouseEnter?: (e: MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: (e: MouseEvent<HTMLButtonElement>) => void;
};

export const ChangeValue: FC<ChangeValueProps> = props => {
  if (props?.options?.length) {
    return <ChangeValueSelect {...props} />;
  }

  return <ChangeValueInput {...props} />;
};
