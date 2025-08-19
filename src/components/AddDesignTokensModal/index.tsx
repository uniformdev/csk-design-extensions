import { Dispatch, FC, SetStateAction, useCallback, useMemo, useState } from 'react';
import { CheckboxWithInfo, TabButton, TabButtonGroup, TabContent, Tabs, Button } from '@uniformdev/design-system';
import { TokenType } from '@/constants';
import { transformToEntityValue } from '@/utils';
import { LoadingFromFile } from './LoadingFromFile';
import { LoadingFromUrl } from './LoadingFromUrl';

type AddDesignTokensModalProps = {
  mode: TokenType;
  setColors?: Dispatch<SetStateAction<NonNullable<Type.KVStorage['colors']>>>;
  setDimensions?: Dispatch<SetStateAction<NonNullable<Type.KVStorage['dimensions']>>>;
  setBorders?: Dispatch<SetStateAction<NonNullable<Type.KVStorage['borders']>>>;
  isDarkEnable?: boolean;
};

export const AddDesignTokensModal: FC<AddDesignTokensModalProps> = ({
  mode: initialMode,
  setColors,
  setDimensions,
  setBorders,
  isDarkEnable = false,
}) => {
  const [mode, setMode] = useState<TokenType>(initialMode);
  const [tokens, setTokens] = useState<NonNullable<Type.DesignToken[]>>([]);
  const [extend, setExtend] = useState(false);

  const handleAddColors = useCallback(
    (isDark = false) => {
      setColors?.(prevState => [
        ...(extend ? prevState : []),
        ...tokens
          .filter(({ type }) => type === TokenType.Color)
          .map(({ key: colorKey, value }) => ({
            colorKey,
            ...prevState.find(({ colorKey: storedColorKey }) => storedColorKey == colorKey),
            [isDark ? 'dark' : 'light']: transformToEntityValue(value, TokenType.Color),
          })),
      ]);
    },
    [extend, setColors, tokens]
  );

  const handleAddDimensions = useCallback(async () => {
    setDimensions?.(prevState => [
      ...(extend ? prevState : []),
      ...tokens
        .filter(({ type }) => type === TokenType.Dimension)
        .map(({ key: dimensionKey, value }) => ({
          dimensionKey,
          value: transformToEntityValue(value, TokenType.Dimension) as string,
        })),
    ]);
  }, [extend, setDimensions, tokens]);

  const handleAddBorders = useCallback(async () => {
    setBorders?.(prevState => [
      ...(extend ? prevState : []),
      ...tokens
        .filter(({ type }) => type === TokenType.Border)
        .map(({ key: borderKey, value }) => ({
          borderKey,
          value: transformToEntityValue(value, TokenType.Border) as {
            color: string;
            width: string;
            radius: string;
            style: string;
          },
        })),
    ]);
  }, [extend, setBorders, tokens]);

  const renderSaveActions = useMemo(() => {
    switch (mode) {
      case TokenType.Color:
        return (
          <div className="flex gap-2">
            <Button type="button" buttonType="primaryInvert" onClick={() => handleAddColors(false)}>
              Add Colors {isDarkEnable && 'for light mode'}
            </Button>
            {isDarkEnable && (
              <Button type="button" buttonType="primary" onClick={() => handleAddColors(isDarkEnable)}>
                Add {mode} for dark mode
              </Button>
            )}
          </div>
        );
      case TokenType.Dimension:
        return (
          <Button type="button" buttonType="primaryInvert" onClick={handleAddDimensions}>
            Add Dimensions
          </Button>
        );
      case TokenType.Border:
        return (
          <Button type="button" buttonType="primaryInvert" onClick={handleAddBorders}>
            Add Borders
          </Button>
        );
      case TokenType.All:
        return (
          <Button
            type="button"
            buttonType="primaryInvert"
            onClick={() => {
              handleAddColors(false);
              handleAddDimensions();
              handleAddBorders();
            }}
          >
            Add all tokens
          </Button>
        );
      default:
        return null;
    }
  }, [handleAddBorders, handleAddColors, handleAddDimensions, isDarkEnable, mode]);

  return (
    <>
      <Tabs>
        <TabButtonGroup>
          <TabButton id="url">From URL</TabButton>
          <TabButton id="file">From file</TabButton>
        </TabButtonGroup>
        <TabContent id="url">
          <LoadingFromUrl initialMode={initialMode} setMode={setMode} setTokens={setTokens} />
        </TabContent>
        <TabContent id="file">
          <LoadingFromFile initialMode={initialMode} setMode={setMode} setTokens={setTokens} />
        </TabContent>
      </Tabs>
      {!!tokens.length && (
        <div className="flex flex-col gap-2">
          <p>The following {mode === TokenType.All ? 'tokens' : mode} will be applied to your configuration:</p>
          <div className="flex w-full flex-wrap gap-1 overflow-x-auto">
            {tokens.map(({ key }) => {
              return (
                <div key={key} className="truncate rounded bg-blue-50 p-1" title={key}>
                  {key}
                </div>
              );
            })}
          </div>
          {renderSaveActions}
          <CheckboxWithInfo
            name="name"
            label={`Extend the current configuration with new ${mode === TokenType.All ? 'tokens' : mode}`}
            onChange={() => setExtend(prev => !prev)}
            checked={extend}
          />
        </div>
      )}
    </>
  );
};
