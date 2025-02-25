import React, { ChangeEvent, Dispatch, FC, SetStateAction, useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { Button, Heading, Label, Input, ModalDialog } from '@uniformdev/design-system';
import { AddDesignTokensModal } from '@/components/AddDesignTokensModal';
import { GroupManagementModal } from '@/components/GroupManagementModal';
import { SettingIcon, Trash } from '@/components/icons';
import { DimensionItemInput } from '@/components/Settings/DimensionItemInput';
import { GroupItems } from '@/components/Settings/GroupColorItems';
import { ALLOW_DIMENSION_GROUP, DEFAULT_DIMENSION_VALUE, DEFAULT_GROUP_NAME, REGEX_KEY, TokenType } from '@/constants';
import { capitalizeFirstLetter, getGroupFromKey } from '@/utils';

type DimensionItemProps = {
  dimensionKey: string;
  value: string;
  isUnique: boolean;
  updateDimension: (dimensionKey: string, value: string) => void;
  deleteDimension: () => void;
  dimensions: NonNullable<Type.KVStorage['dimensions']>;
};

const DimensionItem: FC<DimensionItemProps> = ({
  dimensionKey,
  value,
  isUnique,
  updateDimension,
  deleteDimension,
  dimensions,
}) => {
  const handleSetDimensionKey = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { value: key } = e.target;
      updateDimension(key, value);
    },
    [updateDimension, value]
  );

  const handleSetDimensions = useCallback(
    (name: string, value: string) => {
      updateDimension(name, value);
    },
    [updateDimension]
  );

  const recordDimensions = useMemo(
    () =>
      dimensions.reduce<Record<string, string>>(
        (acc, { dimensionKey, value }) => ({ ...acc, [dimensionKey]: value }),
        {}
      ),
    [dimensions]
  );

  return (
    <>
      <div className="grid  grid-cols-7 items-center gap-4">
        <div className="col-span-4 ml-5">
          <Input
            showLabel={false}
            className={classNames({
              '!text-red-500 !border-red-500':
                !isUnique || !dimensionKey.length || !new RegExp(REGEX_KEY).test(dimensionKey),
            })}
            value={dimensionKey}
            onChange={handleSetDimensionKey}
          />
        </div>
        <div className="col-span-2">
          <DimensionItemInput
            name={dimensionKey}
            value={value}
            setValue={handleSetDimensions}
            recordDimensions={recordDimensions}
            defaultValue={DEFAULT_DIMENSION_VALUE}
          />
        </div>
        <div className="flex justify-center">
          <Trash className="size-5 cursor-pointer text-red-400" onClick={deleteDimension} />
        </div>
      </div>
      <div className="border-b" />
    </>
  );
};

const getDefaultDimensionItem = (prefix: string, index: number) => ({
  dimensionKey: [prefix, 'dimension', index].filter(Boolean).join('-'),
  value: DEFAULT_DIMENSION_VALUE,
});

type SizeDimensionProps = {
  dimensions: NonNullable<Type.KVStorage['dimensions']>;
  allowGroups?: string[];
  setDimensions: Dispatch<SetStateAction<NonNullable<Type.KVStorage['dimensions']>>>;
  setAllowGroups: Dispatch<SetStateAction<Type.KVStorage['allowedGroup']>>;
};

export const SizeDimension: FC<SizeDimensionProps> = ({ dimensions, allowGroups, setDimensions, setAllowGroups }) => {
  const [isShowAddDesignTokensModal, setIsShowAddDesignTokensModal] = useState(false);
  const [isShowGroupManagementModal, setIsShowGroupManagementModal] = useState(false);

  const handleAddDimensionClick = useCallback(
    (prefix = '') => setDimensions(prevState => [...prevState, getDefaultDimensionItem(prefix, prevState.length + 1)]),
    [setDimensions]
  );

  const handleUpdateDimension = useCallback(
    (index: string, dimensionKey: string, value: string) =>
      setDimensions(prevState =>
        prevState.map((item, currentIndex) => {
          if (String(currentIndex) !== index) return item;
          return { dimensionKey, value };
        })
      ),
    [setDimensions]
  );

  const handleDeleteDimensionKey = useCallback(
    (index: string) =>
      setDimensions(prevState => prevState.filter((_, currentIndex) => index !== String(currentIndex))),
    [setDimensions]
  );

  const handleLoadNewDimensions = useCallback(
    (props: SetStateAction<NonNullable<Type.KVStorage['dimensions']>>) => {
      setIsShowAddDesignTokensModal(false);
      setDimensions(props);
    },
    [setDimensions]
  );

  const groupedDimensions = useMemo(
    () =>
      dimensions.reduce<{
        [key: string]: NonNullable<Type.KVStorage['dimensions']>;
      }>((acc, item, currentIndex) => {
        const group = (allowGroups || ALLOW_DIMENSION_GROUP).find(
          groupName => groupName === getGroupFromKey(item.dimensionKey)
        );
        return group
          ? {
              ...acc,
              [group]: [...(acc[group] ? acc[group] : []), { ...item, id: String(currentIndex) }],
            }
          : {
              ...acc,
              [DEFAULT_GROUP_NAME]: [
                ...(acc[DEFAULT_GROUP_NAME] ? acc[DEFAULT_GROUP_NAME] : []),
                { ...item, id: String(currentIndex) },
              ],
            };
      }, {}),
    [allowGroups, dimensions]
  );

  const renderDimensions = useCallback(
    (currentDimension: NonNullable<Type.KVStorage['dimensions']>, group?: string) =>
      currentDimension.map(({ id, dimensionKey, value }) => (
        <DimensionItem
          key={`dimension-${id}`}
          dimensionKey={dimensionKey}
          isUnique={dimensions.filter(({ dimensionKey: key }) => key === dimensionKey).length === 1}
          value={value}
          updateDimension={(name, value) =>
            !group || name.startsWith(`${group}-`) ? handleUpdateDimension(id, name, value) : null
          }
          deleteDimension={() => handleDeleteDimensionKey(id)}
          dimensions={dimensions}
        />
      )),
    [dimensions, handleDeleteDimensionKey, handleUpdateDimension]
  );

  const handleSaveDimensionAllowedGroups = useCallback(
    (newGroup: string[] | undefined) => {
      setIsShowGroupManagementModal(false);
      setAllowGroups(prevState => ({ ...prevState, dimension: newGroup }));
    },
    [setAllowGroups]
  );

  const isOpenByDefault = useMemo(
    () =>
      Object.keys(groupedDimensions).every(key => key === DEFAULT_GROUP_NAME) ||
      Object.keys(groupedDimensions).length === 0,
    [groupedDimensions]
  );

  return (
    <div>
      <div className="my-6 flex justify-between">
        <Label className="!my-0">
          Configure size/dimension for various theme elements manually, or upload a design tokens file.
        </Label>
        <div>
          <Button
            buttonType="secondaryInvert"
            size="md"
            onClick={() => setIsShowAddDesignTokensModal(true)}
            className="m-px"
          >
            Upload design tokens
          </Button>
        </div>
      </div>
      <div className="!mb-2 !mt-6 flex justify-between">
        <Heading level={6} className="!mb-0 !font-bold uppercase">
          Size/Dimension groups
        </Heading>
        <Button buttonType="ghost" size="sm" className="h-5" onClick={() => setIsShowGroupManagementModal(true)}>
          <SettingIcon className="size-3" /> Manage groups
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        {(allowGroups || ALLOW_DIMENSION_GROUP)
          .filter(groupName => groupedDimensions[groupName]?.length)
          .map(group => (
            <GroupItems key={group} title={capitalizeFirstLetter(group)}>
              <>
                {renderDimensions(groupedDimensions[group], group)}
                <Button
                  type="button"
                  title={`Add size/dimension to ${capitalizeFirstLetter(group)} group`}
                  buttonType="secondaryInvert"
                  className="mt-4"
                  size="md"
                  onClick={() => handleAddDimensionClick(group)}
                >
                  Add size/dimension
                </Button>
              </>
            </GroupItems>
          ))}
        <GroupItems
          title={capitalizeFirstLetter(DEFAULT_GROUP_NAME)}
          showTableHeader={!!groupedDimensions[DEFAULT_GROUP_NAME]?.length}
          isOpenByDefault={isOpenByDefault}
        >
          <>
            {renderDimensions(groupedDimensions[DEFAULT_GROUP_NAME] || [])}
            <Button
              type="button"
              title={`Add size/dimension to ${capitalizeFirstLetter(DEFAULT_GROUP_NAME)} group`}
              buttonType="secondaryInvert"
              size="md"
              className="mt-4"
              onClick={() => handleAddDimensionClick(DEFAULT_GROUP_NAME)}
            >
              Add size/dimension
            </Button>
          </>
        </GroupItems>
      </div>
      {isShowAddDesignTokensModal && (
        <ModalDialog
          onRequestClose={() => setIsShowAddDesignTokensModal(false)}
          title="Upload design tokens"
          className="custom-modal-wrapper"
        >
          <AddDesignTokensModal mode={TokenType.Dimension} setDimensions={handleLoadNewDimensions} />
        </ModalDialog>
      )}
      {isShowGroupManagementModal && (
        <ModalDialog onRequestClose={() => setIsShowGroupManagementModal(false)} className="custom-modal-wrapper">
          <GroupManagementModal
            name={TokenType.Dimension}
            allowGroups={allowGroups}
            defaultAllowGroups={ALLOW_DIMENSION_GROUP}
            possibleGroups={dimensions
              .map(({ dimensionKey }) => getGroupFromKey(dimensionKey))
              .filter(value => value !== DEFAULT_GROUP_NAME)}
            setAllowGroups={handleSaveDimensionAllowedGroups}
          />
        </ModalDialog>
      )}
    </div>
  );
};

export default SizeDimension;
