import { ChangeEvent, Dispatch, FC, SetStateAction, useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { Button, Heading, Input, Label } from '@uniformdev/design-system';
import { ModalDialog } from '@uniformdev/design-system';
import { AddDesignTokensModal } from '@/components/AddDesignTokensModal';
import BorderExample from '@/components/BorderExample';
import { ChevronDown, Trash } from '@/components/icons';
import { ColorItemInput } from '@/components/Settings/ColorItemInput';
import { DimensionItemInput } from '@/components/Settings/DimensionItemInput';
import { ColorMode, DEFAULT_BORDER_VALUE, DEFAULT_DIMENSION_VALUE, REGEX_KEY, TokenType } from '@/constants';

type BorderItemProps = {
  withDarkMode: boolean;
  borderKey: string;
  colors?: NonNullable<Type.KVStorage['colors']>;
  value: NonNullable<Type.KVStorage['borders']>[number]['value'];
  isUnique: boolean;
  updateBorder: (borderKey: string, value: NonNullable<Type.KVStorage['borders']>[number]['value']) => void;
  deleteBorder: () => void;
  dimensions: NonNullable<Type.KVStorage['dimensions']>;
};

const BorderItem: FC<BorderItemProps> = ({
  withDarkMode,
  borderKey,
  colors,
  value,
  isUnique,
  updateBorder,
  deleteBorder,
  dimensions,
}) => {
  const { radius: borderRadius, width: borderWidth, color: borderColor, style: borderStyle } = value || {};

  const [isOpen, setIsOpen] = useState(false);
  const handleOpenGroup = useCallback(() => setIsOpen(prevState => !prevState), []);

  const handleSetBorderKey = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { value: key } = e.target;
      updateBorder(key, value);
    },
    [updateBorder, value]
  );

  const handleSetInputValue = useCallback(
    (name: string, currentValue: string) => {
      updateBorder(borderKey, { ...value, [name]: currentValue });
    },
    [borderKey, updateBorder, value]
  );

  const handleSetColorValue = useCallback(
    (name: string, newValue: string) => updateBorder(borderKey, { ...value, [name]: newValue }),
    [borderKey, updateBorder, value]
  );

  const recordColors = useMemo(
    () =>
      colors?.reduce(
        (acc, { colorKey, ...value }) => ({
          ...acc,
          [colorKey]: !withDarkMode ? [value[ColorMode.Light]] : Object.values(value),
        }),
        {}
      ),
    [colors, withDarkMode]
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
      <div className="mx-4 my-2 flex min-h-10 select-none items-center justify-between gap-4" onClick={handleOpenGroup}>
        <div className="flex w-1/2 items-center gap-4">
          {isOpen ? <ChevronDown /> : <ChevronDown className="-rotate-90" />}
          <div className="w-full">
            <Input
              showLabel={false}
              className={classNames({
                '!text-red-500 !border-red-500':
                  !isUnique || !borderKey.length || !new RegExp(REGEX_KEY).test(borderKey),
              })}
              value={borderKey}
              onChange={handleSetBorderKey}
              onClick={e => e.stopPropagation()}
            />
          </div>
          <div className="flex items-center gap-6">
            <BorderExample
              borderRadius={borderRadius}
              borderColor={borderColor}
              borderStyle={borderStyle}
              borderWidth={borderWidth}
            />
            {withDarkMode && (
              <div className="dark">
                <BorderExample
                  borderRadius={borderRadius}
                  borderColor={borderColor}
                  borderStyle={borderStyle}
                  borderWidth={borderWidth}
                />
              </div>
            )}
          </div>
        </div>
        <Trash
          className="size-5 cursor-pointer text-red-400"
          onClick={e => {
            e.stopPropagation();
            deleteBorder();
          }}
        />
      </div>
      {isOpen && (
        <div className="my-3 ml-[25px] flex flex-col gap-2 border-l pl-4">
          <div className="grid grid-cols-7 gap-4 border-b py-3">
            <span className="col-span-3 ml-5">Properties</span>
            <span className="col-span-4 text-start">Value</span>
          </div>
          <div className="grid grid-cols-7 items-center gap-4  py-3">
            <span className="col-span-3 ml-5">Radius</span>
            <span className="col-span-4 text-center">
              <DimensionItemInput
                name="radius"
                value={borderRadius}
                setValue={handleSetInputValue}
                recordDimensions={recordDimensions}
                defaultValue={DEFAULT_DIMENSION_VALUE}
              />
            </span>
            <span className="col-span-3 ml-5">Width</span>
            <span className="col-span-4 text-center">
              <DimensionItemInput
                name="width"
                value={borderWidth}
                setValue={handleSetInputValue}
                recordDimensions={recordDimensions}
                defaultValue={DEFAULT_DIMENSION_VALUE}
              />
            </span>
            <span className="col-span-3 ml-5">Color</span>
            <span className="col-span-4 text-center">
              <ColorItemInput
                name="color"
                value={borderColor}
                defaultValue={DEFAULT_BORDER_VALUE['color']}
                setValue={handleSetColorValue}
                colors={recordColors}
              />
            </span>
            <span className="col-span-3 ml-5">Style</span>
            <span className="col-span-4 text-center">
              <Input
                showLabel={false}
                name="style"
                className={classNames({
                  '!text-red-500 !border-red-500': !borderStyle.length,
                })}
                value={borderStyle}
                onChange={e => handleSetInputValue('style', e.target.value)}
              />
            </span>
          </div>
        </div>
      )}
      <div className="border-b" />
    </>
  );
};

const getDefaultBorderItem = (index: number) => ({
  borderKey: ['border', index].filter(Boolean).join('-'),
  value: DEFAULT_BORDER_VALUE,
});

type BorderProps = {
  withDarkMode: NonNullable<Type.KVStorage['withDarkMode']>;
  borders: NonNullable<Type.KVStorage['borders']>;
  setBorders: Dispatch<SetStateAction<NonNullable<Type.KVStorage['borders']>>>;
  colors: NonNullable<Type.KVStorage['colors']>;
  dimensions: NonNullable<Type.KVStorage['dimensions']>;
  setColors: Dispatch<SetStateAction<NonNullable<Type.KVStorage['colors']>>>;
  setDimensions: Dispatch<SetStateAction<NonNullable<Type.KVStorage['dimensions']>>>;
};

const Border: FC<BorderProps> = ({
  withDarkMode,
  borders,
  setBorders,
  setColors,
  setDimensions,
  colors,
  dimensions,
}) => {
  const [isShowModal, setIsShowModal] = useState(false);

  const handleAddBorderClick = useCallback(
    () => setBorders(prevState => [...prevState, getDefaultBorderItem(prevState.length + 1)]),
    [setBorders]
  );

  const handleUpdateBorder = useCallback(
    (index: number, borderKey: string, value: NonNullable<Type.KVStorage['borders']>[number]['value']) =>
      setBorders(prevState =>
        prevState.map((item, currentIndex) => {
          if (currentIndex !== index) return item;
          return { borderKey, value };
        })
      ),
    [setBorders]
  );

  const handleDeleteBorderKey = useCallback(
    (index: number) => setBorders(prevState => prevState.filter((_, currentIndex) => index !== currentIndex)),
    [setBorders]
  );

  const handleLoadNewBorders = useCallback(
    (props: SetStateAction<NonNullable<Type.KVStorage['borders']>>) => {
      setBorders(props);
      setIsShowModal(false);
    },
    [setBorders]
  );

  const handleLoadNewColors = useCallback(
    (props: SetStateAction<NonNullable<Type.KVStorage['colors']>>) => {
      setColors(props);
      setIsShowModal(false);
    },
    [setColors]
  );

  const handleLoadNewDimensions = useCallback(
    (props: SetStateAction<NonNullable<Type.KVStorage['dimensions']>>) => {
      setDimensions(props);
      setIsShowModal(false);
    },
    [setDimensions]
  );

  const renderBorders = useCallback(
    () => (
      <div className="mb-4">
        <div className="border-b" />
        {borders.map(({ borderKey: currentBorderKey, value }, currentIndex, array) => {
          return (
            <BorderItem
              key={`font-${currentIndex}`}
              borderKey={currentBorderKey}
              withDarkMode={withDarkMode}
              value={value}
              deleteBorder={() => handleDeleteBorderKey(currentIndex)}
              updateBorder={(name, value) => handleUpdateBorder(currentIndex, name, value)}
              isUnique={array.filter(({ borderKey }) => borderKey === currentBorderKey).length === 1}
              colors={colors}
              dimensions={dimensions}
            />
          );
        })}
      </div>
    ),
    [borders, colors, dimensions, handleDeleteBorderKey, handleUpdateBorder, withDarkMode]
  );

  return (
    <div>
      <div className="my-6 flex justify-between">
        <Label className="!my-0">Configure theme borders manually, or upload a design tokens file.</Label>
        <div>
          <Button buttonType="secondaryInvert" size="md" onClick={() => setIsShowModal(true)} className="m-px">
            Upload design tokens
          </Button>
        </div>
      </div>
      <div>
        <Heading level={6} className="!mb-2 !mt-6 !font-bold uppercase">
          Borders
        </Heading>
        {borders.length > 0 ? renderBorders() : null}
        <Button buttonType="secondaryInvert" size="md" onClick={handleAddBorderClick} className="m-px">
          Add border
        </Button>
      </div>
      {isShowModal && (
        <ModalDialog onRequestClose={() => setIsShowModal(false)} className="custom-modal-wrapper">
          <AddDesignTokensModal
            mode={TokenType.Border}
            setBorders={handleLoadNewBorders}
            setColors={handleLoadNewColors}
            setDimensions={handleLoadNewDimensions}
          />
        </ModalDialog>
      )}
    </div>
  );
};

export default Border;
