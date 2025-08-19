import React, { Dispatch, FC, SetStateAction, useCallback, useMemo, useState } from 'react';
import { Button, Popover, Switch, Link, Heading, ModalDialog } from '@uniformdev/design-system';
import { AddDesignTokensModal } from '@/components/AddDesignTokensModal';
import { GroupManagementModal } from '@/components/GroupManagementModal';
import { SettingIcon } from '@/components/icons';
import { ColorItem } from '@/components/Settings/ColorItem';
import { GroupItems } from '@/components/Settings/GroupColorItems';
import { ALLOW_COLOR_GROUP, ColorMode, DEFAULT_COLOR_VALUE, DEFAULT_GROUP_NAME, TokenType } from '@/constants';
import { capitalizeFirstLetter, getGroupFromKey } from '@/utils';

const getDefaultColorItem = (prefix: string, index: number, withDarkMode = false) => ({
  colorKey: [prefix, 'color', index].filter(Boolean).join('-'),
  [ColorMode.Light]: DEFAULT_COLOR_VALUE[ColorMode.Light],
  ...(withDarkMode ? { [ColorMode.Dark]: DEFAULT_COLOR_VALUE[ColorMode.Dark] } : {}),
});

type ColorProps = {
  colors: NonNullable<Type.KVStorage['colors']>;
  allowGroups?: string[];
  withDarkMode: NonNullable<Type.KVStorage['withDarkMode']>;
  setColors: Dispatch<SetStateAction<NonNullable<Type.KVStorage['colors']>>>;
  setWithDarkMode: Dispatch<SetStateAction<NonNullable<Type.KVStorage['withDarkMode']>>>;
  setAllowGroups: Dispatch<SetStateAction<Type.KVStorage['allowedGroup']>>;
  setDimensions: Dispatch<SetStateAction<NonNullable<Type.KVStorage['dimensions']>>>;
  setBorders: Dispatch<SetStateAction<NonNullable<Type.KVStorage['borders']>>>;
};

const Color: FC<ColorProps> = ({
  colors,
  allowGroups,
  withDarkMode,
  setColors,
  setWithDarkMode,
  setAllowGroups,
  setDimensions,
  setBorders,
}) => {
  const [isShowAddDesignTokensModal, setIsShowAddDesignTokensModal] = useState(false);
  const [isShowGroupManagementModal, setIsShowGroupManagementModal] = useState(false);

  const handleAddColorClick = useCallback(
    (prefix = '') =>
      setColors(prevState => [...prevState, getDefaultColorItem(prefix, prevState.length + 1, withDarkMode)]),
    [setColors, withDarkMode]
  );

  const handleUpdateColor = useCallback(
    (index: string, colorKey: string, value: Record<string, string>) =>
      setColors(prevState =>
        prevState.map((item, currentIndex) => {
          if (String(currentIndex) !== index) return item;
          return { colorKey, ...value };
        })
      ),
    [setColors]
  );

  const handleDeleteColorKey = useCallback(
    (index: string) => setColors(prevState => prevState.filter((_, currentIndex) => index !== String(currentIndex))),
    [setColors]
  );

  const handleLoadNewColors = useCallback(
    (props: SetStateAction<NonNullable<Type.KVStorage['colors']>>) => {
      setColors(props);
      setIsShowAddDesignTokensModal(false);
    },
    [setColors]
  );

  const handleLoadNewDimensions = useCallback(
    (props: SetStateAction<NonNullable<Type.KVStorage['dimensions']>>) => {
      setDimensions(props);
      setIsShowAddDesignTokensModal(false);
    },
    [setDimensions]
  );

  const handleLoadNewBorders = useCallback(
    (props: SetStateAction<NonNullable<Type.KVStorage['borders']>>) => {
      setBorders(props);
      setIsShowAddDesignTokensModal(false);
    },
    [setBorders]
  );

  const handleDarkModeClick = useCallback(() => setWithDarkMode(prevState => !prevState), [setWithDarkMode]);

  const groupedColors = useMemo(
    () =>
      colors.reduce<{
        [key: string]: NonNullable<Type.KVStorage['colors']>;
      }>((acc, item, currentIndex) => {
        const group = (allowGroups || ALLOW_COLOR_GROUP).find(
          groupName => groupName === getGroupFromKey(item.colorKey)
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
    [allowGroups, colors]
  );

  const renderColors = useCallback(
    (currentColor: NonNullable<Type.KVStorage['colors']>, group?: string) =>
      currentColor.map(({ id, colorKey, ...colorValues }) => (
        <ColorItem
          key={`color-${id}`}
          colors={colors}
          withDarkMode={withDarkMode}
          colorKey={colorKey}
          isUnique={colors.filter(({ colorKey: key }) => key === colorKey).length === 1}
          value={colorValues}
          updateColor={(name, value) =>
            !group || name.startsWith(`${group}-`) ? handleUpdateColor(id, name, value) : null
          }
          deleteColor={() => handleDeleteColorKey(id)}
        />
      )),
    [colors, handleDeleteColorKey, handleUpdateColor, withDarkMode]
  );

  const handleSaveColorAllowedGroups = useCallback(
    (newGroup: string[] | undefined) => {
      setIsShowGroupManagementModal(false);
      setAllowGroups(prevState => ({ ...prevState, color: newGroup }));
    },
    [setAllowGroups]
  );

  const isOpenByDefault = useMemo(
    () =>
      Object.keys(groupedColors).every(key => key === DEFAULT_GROUP_NAME) || Object.keys(groupedColors).length === 0,
    [groupedColors]
  );

  return (
    <div>
      <div className="my-6 flex justify-between gap-4">
        <p className="!my-0 w-2/3">
          Configure theme colors manually, or upload a design tokens file. For a quick start, feel free to use these
          example files for&nbsp;
          <Link text="light" href="/api/getBaseDesignTokensFile" external />
          &nbsp;and&nbsp;
          <Link text="dark" href="/api/getBaseDesignTokensFile?mode=dark" external />
          &nbsp;modes.
        </p>
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
      <div className="flex flex-col gap-2">
        <Heading level={6} className="!mb-0 !font-bold uppercase">
          Settings
        </Heading>
        <div className="ml-1 flex">
          <Switch label="Configure dark mode" checked={withDarkMode} onChange={handleDarkModeClick} />
          <Popover buttonText="Configure dark mode">
            <p>Adds a second color profile to allow you to manage separate colors for light and dark mode.</p>
          </Popover>
        </div>
      </div>
      <div className="!mb-2 !mt-6 flex justify-between">
        <Heading level={6} className="!mb-0 !font-bold uppercase">
          Color groups
        </Heading>
        <Button buttonType="ghost" size="sm" className="h-5" onClick={() => setIsShowGroupManagementModal(true)}>
          <SettingIcon className="size-3" /> Manage groups
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        {(allowGroups || ALLOW_COLOR_GROUP)
          .filter(groupName => groupedColors[groupName]?.length)
          .map(group => (
            <GroupItems key={group} withDarkMode={withDarkMode} title={capitalizeFirstLetter(group)}>
              <>
                {renderColors(groupedColors[group], group)}
                <Button
                  type="button"
                  title={`Add Color to ${capitalizeFirstLetter(group)} group`}
                  buttonType="secondaryInvert"
                  className="mt-4"
                  size="md"
                  onClick={() => handleAddColorClick(group)}
                >
                  Add Color
                </Button>
              </>
            </GroupItems>
          ))}
        <GroupItems
          withDarkMode={withDarkMode}
          title={capitalizeFirstLetter(DEFAULT_GROUP_NAME)}
          showTableHeader={!!groupedColors[DEFAULT_GROUP_NAME]?.length}
          isOpenByDefault={isOpenByDefault}
        >
          <>
            {renderColors(groupedColors[DEFAULT_GROUP_NAME] || [])}
            <Button
              type="button"
              title={`Add Color to ${capitalizeFirstLetter(DEFAULT_GROUP_NAME)} group`}
              buttonType="secondaryInvert"
              className="mt-4"
              size="md"
              onClick={() => handleAddColorClick(DEFAULT_GROUP_NAME)}
            >
              Add Color
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
          <AddDesignTokensModal
            mode={TokenType.Color}
            setColors={handleLoadNewColors}
            isDarkEnable={withDarkMode}
            setDimensions={handleLoadNewDimensions}
            setBorders={handleLoadNewBorders}
          />
        </ModalDialog>
      )}
      {isShowGroupManagementModal && (
        <ModalDialog onRequestClose={() => setIsShowGroupManagementModal(false)} className="custom-modal-wrapper">
          <GroupManagementModal
            name={TokenType.Color}
            allowGroups={allowGroups}
            defaultAllowGroups={ALLOW_COLOR_GROUP}
            possibleGroups={colors
              .map(({ colorKey }) => getGroupFromKey(colorKey))
              .filter(value => value !== DEFAULT_GROUP_NAME)}
            setAllowGroups={handleSaveColorAllowedGroups}
          />
        </ModalDialog>
      )}
    </div>
  );
};

export default Color;
