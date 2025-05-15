import {
  ChangeEvent,
  ChangeEventHandler,
  Dispatch,
  FC,
  MouseEventHandler,
  SetStateAction,
  useCallback,
  useState,
} from 'react';
import classNames from 'classnames';
import { ButtonWithMenu, Input, Link, MenuItem, Chip, ModalDialog, Heading, Label } from '@uniformdev/design-system';
import { AddGoogleFontsModal } from '@/components/AddGoogleFontsModal';
import { ArrowTopRightOnSquare, CheckCircle, Trash } from '@/components/icons';
import { REGEX_KEY, RESERVED_FONT_KEYS } from '@/constants';
import { getFontFamilyName, getFontURL } from '@/utils';

type FontItemProps = {
  fontKey: string;
  fontValue: string;
  isUniqueKey: boolean;
  onChangeLabel: ChangeEventHandler<HTMLInputElement>;
  onClick: MouseEventHandler<HTMLDivElement>;
  onDelete: () => void;
  isSelectedFont: boolean;
};

const FontItem: FC<FontItemProps> = ({
  fontKey,
  fontValue,
  isUniqueKey,
  onChangeLabel,
  onClick,
  onDelete,
  isSelectedFont,
}) => {
  const fontUrl = fontValue?.length ? getFontURL(fontValue) : '';
  return (
    <>
      <div className="my-2 grid cursor-pointer grid-cols-7 items-center gap-4" onClick={onClick}>
        <div className="col-span-2 flex items-center">
          <div title={isSelectedFont ? 'Default font' : 'Click to select default font'}>
            <CheckCircle
              className={classNames({ 'opacity-25': !isSelectedFont })}
              color={isSelectedFont ? 'green' : 'grey'}
            />
          </div>
          <Input
            showLabel={false}
            className={classNames('ml-5', {
              '!text-red-500 !border-red-500':
                !isUniqueKey ||
                !fontKey?.length ||
                !new RegExp(REGEX_KEY).test(fontKey) ||
                RESERVED_FONT_KEYS.includes(fontKey),
            })}
            value={fontKey}
            onChange={onChangeLabel}
            onClick={e => e.stopPropagation()}
          />
          )
        </div>
        <div className={classNames('flex flex-col col-span-4 justify-center')}>
          {fontUrl ? (
            <>
              <style> @import {`url('${fontUrl}');`} </style>
              <p className="truncate" style={{ fontFamily: getFontFamilyName(fontValue) }}>
                ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789
              </p>
            </>
          ) : (
            <div className="flex items-center justify-center">
              <p>Not Available</p>
            </div>
          )}
        </div>

        <div className={classNames('flex justify-end', { 'justify-between': fontUrl })}>
          {fontUrl && (
            <a className="flex justify-center" href={fontUrl} target="_blank" onClick={e => e.stopPropagation()}>
              <div className="flex flex-col justify-center">
                <ArrowTopRightOnSquare className="size-[15px]" />
              </div>
            </a>
          )}
          <div className="flex items-center justify-center gap-4">
            {isSelectedFont && <Chip text="Default" theme="neutral-light" size="md" />}
            <button
              className="flex justify-center"
              onClick={e => {
                onDelete();
                e.stopPropagation();
              }}
            >
              <Trash className="size-5 text-red-400" />
            </button>
          </div>
        </div>
      </div>
      <div className="border-b" />
    </>
  );
};

type FontProps = {
  fonts: NonNullable<Type.KVStorage['fonts']>;
  defaultFontIndex: number;
  setFonts: Dispatch<SetStateAction<NonNullable<Type.KVStorage['fonts']>>>;
  setDefaultFontIndex: Dispatch<SetStateAction<number>>;
};

const Font: FC<FontProps> = ({ fonts, defaultFontIndex, setFonts, setDefaultFontIndex }) => {
  const [isShowModal, setIsShowModal] = useState(false);

  const handleAddCustomFontKeyClick = useCallback(
    () => setFonts(prevState => [...prevState, { fontKey: `font-${prevState.length + 1}`, value: '' }]),
    [setFonts]
  );

  const handleUpdateFont = useCallback(
    (e: ChangeEvent<HTMLInputElement>, index: number) => {
      const { value } = e.target;
      setFonts(prevState =>
        prevState.map((item, currentIndex) => {
          if (currentIndex !== index) return item;
          return { ...item, fontKey: value };
        })
      );
    },
    [setFonts]
  );

  const handleDeleteFont = useCallback(
    (index: number) => setFonts(prevState => prevState.filter((_, currentIndex) => index !== currentIndex)),
    [setFonts]
  );

  const handleSelectDefaultFontClick = useCallback(
    (index: number) => () => setDefaultFontIndex(prevState => (prevState === index ? -1 : index)),
    [setDefaultFontIndex]
  );

  const handleLoadNewFonts = useCallback(
    (props: SetStateAction<NonNullable<Type.KVStorage['fonts']>>) => {
      setIsShowModal(false);
      setFonts(props);
    },
    [setFonts]
  );

  const renderFonts = useCallback(
    () => (
      <div className="mb-4">
        <div className="grid grid-cols-7 gap-4 border-b py-3">
          <Label className="col-span-2 !ml-11">Key</Label>
          <Label className="col-span-4 !mx-auto">Preview</Label>
        </div>
        {fonts.map(({ fontKey, value }, currentIndex, array) => {
          return (
            <FontItem
              key={`font-${currentIndex}`}
              fontKey={fontKey}
              fontValue={value}
              isSelectedFont={defaultFontIndex === currentIndex}
              onClick={handleSelectDefaultFontClick(currentIndex)}
              isUniqueKey={array.map(({ fontKey }) => fontKey).filter(key => key === fontKey).length === 1}
              onChangeLabel={e => handleUpdateFont(e, currentIndex)}
              onDelete={() => handleDeleteFont(currentIndex)}
            />
          );
        })}
      </div>
    ),
    [defaultFontIndex, fonts, handleDeleteFont, handleSelectDefaultFontClick, handleUpdateFont]
  );

  const isDisableAdding = fonts.some(({ fontKey }) => !fontKey);

  return (
    <div>
      <p className="!my-6">
        Specify custom font keys using&nbsp;
        <Link
          text="this example"
          href="https://nextjs.org/docs/pages/building-your-application/optimizing/fonts#with-tailwind-css"
          external
        />
        , or automatically download from&nbsp;
        <Link text="Google Fonts" href="https://fonts.google.com" external />. Select a default font by selecting it in
        the font list.
      </p>
      <Heading level={6} className="!mb-2 !mt-6 !font-bold uppercase">
        Fonts
      </Heading>
      {fonts.length > 0 ? renderFonts() : null}
      <ButtonWithMenu buttonType="secondaryOutline" buttonText="Add font" className="m-px" disabled={isDisableAdding}>
        <MenuItem onClick={handleAddCustomFontKeyClick}>Custom font</MenuItem>
        <MenuItem onClick={() => setIsShowModal(true)}>Google font</MenuItem>
      </ButtonWithMenu>
      {isShowModal && (
        <ModalDialog onRequestClose={() => setIsShowModal(false)} className="custom-modal-wrapper">
          <AddGoogleFontsModal setFonts={handleLoadNewFonts} />
        </ModalDialog>
      )}
    </div>
  );
};

export default Font;
