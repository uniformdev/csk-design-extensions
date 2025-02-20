import { ChangeEvent, Dispatch, FC, SetStateAction, useCallback, useState } from 'react';
import { Button, Label, Textarea, CheckboxWithInfo } from '@uniformdev/design-system';
import { getFontKey, getFontFamilyName } from '@/utils';

const REGEX_FONT_URL = /https?:\/\/[^\s'">]+/g;
const FONT_FAMILY_PREFIX = 'family';

type AddGoogleFontsModalProps = {
  setFonts: Dispatch<SetStateAction<NonNullable<Type.KVStorage['fonts']>>>;
};

export const AddGoogleFontsModal: FC<AddGoogleFontsModalProps> = ({ setFonts }) => {
  const [embedCode, setEmbedCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [fontValues, setFontValues] = useState<string[]>([]);
  const [extend, setExtend] = useState(false);

  const handleUpdateEmbedCode = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setEmbedCode(e.target.value);
    setErrorMessage('');
  }, []);

  const loadFonts = useCallback(async () => {
    const urlMatches = [...embedCode.matchAll(REGEX_FONT_URL)];

    const links = [
      ...new Set(urlMatches.map(([firstItem]) => new URL(firstItem).searchParams.getAll(FONT_FAMILY_PREFIX)).flat()),
    ];
    if (links.length) {
      setFontValues(links);
    } else {
      setFontValues([]);
      setErrorMessage('Fonts not found');
    }
  }, [embedCode]);

  const addFonts = useCallback(
    async () =>
      setFonts(prevState => [
        ...(extend ? prevState : []),
        ...fontValues.map(fontValue => ({ fontKey: getFontKey(fontValue), value: fontValue })),
      ]),
    [extend, fontValues, setFonts]
  );

  return (
    <div>
      <Label>
        <span>
          Embed code from{' '}
          <a className="underline" href="https://fonts.google.com/" target="_blank">
            Google Fonts
          </a>
        </span>
      </Label>
      <Textarea
        className="!h-36"
        caption={
          <>
            <span>Please visit the </span>
            <a className="underline" href="https://fonts.google.com/" target="_blank">
              Google Fonts
            </a>
            <span> site and collect the fonts you need.</span>
          </>
        }
        placeholder="<style>
@import url('https://fonts.googleapis.com/css2?.........&display=swap');
</style>"
        onChange={handleUpdateEmbedCode}
        value={embedCode}
        errorMessage={errorMessage}
      />
      <div className="my-2 flex gap-1">
        <Button type="button" buttonType="secondary" onClick={loadFonts} disabled={!embedCode.length}>
          Load Fonts
        </Button>
      </div>
      {!!fontValues.length && (
        <div className="mt-7 flex flex-col gap-2">
          <p>The following fonts will be applied to your configuration:</p>
          <div className="flex w-full flex-wrap gap-1 overflow-x-auto">
            {fontValues.map(fontValue => {
              const fontName = getFontFamilyName(fontValue);
              return (
                <div key={fontValue} className="truncate rounded bg-blue-50 p-1" title={fontName}>
                  {fontName}
                </div>
              );
            })}
          </div>
          <Button type="button" buttonType="primary" onClick={addFonts} disabled={!fontValues.length}>
            Add Google Fonts
          </Button>
          <CheckboxWithInfo
            name="name"
            label="Extend the current configuration with new fonts "
            onChange={() => setExtend(prev => !prev)}
            checked={extend}
          />
        </div>
      )}
    </div>
  );
};
