import { FC, MouseEventHandler, useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { Caption, InputComboBox, Button, Label } from '@uniformdev/design-system';
import type { ActionMeta, MultiValue } from '@uniformdev/design-system';
import { DEFAULT_GROUP_NAME, REGEX_GROUP_NAME, TokenType } from '@/constants';
import { capitalizeFirstLetter, toOption } from '@/utils';

const SEPARATOR = ' ';

type GroupManagementModalProps = {
  name: TokenType;
  allowGroups?: string[];
  possibleGroups?: string[];
  defaultAllowGroups: string[];
  setAllowGroups: (newGroup: string[] | undefined) => void;
};

export const GroupManagementModal: FC<GroupManagementModalProps> = ({
  name,
  allowGroups,
  possibleGroups = [],
  defaultAllowGroups,
  setAllowGroups,
}) => {
  const [isDefaultState, setIsDefaultState] = useState(!allowGroups);
  const [isNeedToSave, setIsNeedToSave] = useState(false);

  const [groups, setGroups] = useState<string[]>(allowGroups || defaultAllowGroups);
  const [input, setInput] = useState<string>('');

  const handleSaveGroups: MouseEventHandler<HTMLButtonElement> = () =>
    isDefaultState ? setAllowGroups(undefined) : setAllowGroups(groups);

  const handleResetGroupToDefault: MouseEventHandler<HTMLButtonElement> = () => {
    setGroups(defaultAllowGroups);
    setInput('');
    setIsDefaultState(true);
    setIsNeedToSave(true);
  };

  const handleChangeGroups = useCallback(
    (newValue: MultiValue<MeshType.Options>, actionMeta: ActionMeta<MeshType.Options>) => {
      if (['select-option', 'pop-value'].includes(actionMeta.action)) {
        setGroups(newValue.map(({ value }) => value));
      } else if (actionMeta.action === 'remove-value') {
        setGroups(prevState => prevState.filter(value => value !== actionMeta.removedValue.value));
      }
      setIsDefaultState(false);
      setIsNeedToSave(true);
    },
    []
  );

  const handleInputChange = useCallback(
    (value: string) => {
      if (!value || new RegExp(REGEX_GROUP_NAME).test(value)) {
        if (value.endsWith(SEPARATOR)) {
          setGroups(prevState =>
            [...new Set([...prevState, value.replace(SEPARATOR, '')])].filter(value => value !== DEFAULT_GROUP_NAME)
          );
          setInput('');
        } else {
          setInput(value);
        }
        if (value) {
          setIsDefaultState(false);
          setIsNeedToSave(true);
        }
      }
    },
    [setInput]
  );

  const options: string[] = useMemo(
    () => [...new Set([...defaultAllowGroups, ...possibleGroups])],
    [defaultAllowGroups, possibleGroups]
  );

  const isShouldShowMenu = useMemo(
    () => (options.some(value => !groups.includes(value)) ? undefined : false),
    [groups, options]
  );

  return (
    <div>
      <Label className="!mb-4">Manage groups</Label>
      <div className="flex flex-col gap-4">
        <div>
          <p>{capitalizeFirstLetter(name)} group</p>
          <InputComboBox
            name={name}
            className={classNames('w-full', {
              'opacity-50 active:opacity-100 hover:opacity-100 focus-within:opacity-100': isDefaultState,
            })}
            options={options.map(toOption)}
            onChange={handleChangeGroups}
            value={groups.map(toOption)}
            onInputChange={handleInputChange}
            isMulti
            inputValue={input}
            menuIsOpen={isShouldShowMenu}
            formatOptionLabel={data => <span>{capitalizeFirstLetter(data.label)}</span>}
          />
          <Caption>Select recommended groups, or add custom groups by entering a space and typing</Caption>
        </div>
        <div className="flex flex-row gap-2">
          <Button type="button" buttonType="secondary" onClick={handleSaveGroups} disabled={!isNeedToSave}>
            Save
          </Button>
          <Button
            type="button"
            buttonType="ghostDestructive"
            onClick={handleResetGroupToDefault}
            disabled={isDefaultState}
          >
            reset to default
          </Button>
        </div>
      </div>
    </div>
  );
};
