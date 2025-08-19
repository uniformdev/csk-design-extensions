import { ChangeEvent, Dispatch, FC, SetStateAction, useCallback, useState } from 'react';
import classNames from 'classnames';
import { Button, Input, LoadingOverlay } from '@uniformdev/design-system';
import { Warning } from '@/components/icons';
import { TokenType } from '@/constants';
import { transformDesignTokens } from '@/utils';

type LoadingFromUrlProps = {
  initialMode: TokenType;
  setMode: Dispatch<SetStateAction<TokenType>>;
  setTokens: Dispatch<SetStateAction<Type.DesignToken[]>>;
};

export const LoadingFromUrl: FC<LoadingFromUrlProps> = ({ initialMode, setMode, setTokens }) => {
  const [fileUrl, setFileUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleUpdateFileUrl = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFileUrl(e.target.value);
    setErrorMessage('');
  }, []);

  const handleLoadTokens = useCallback(async () => {
    setLoading(true);
    setMode(initialMode);
    setErrorMessage('');
    try {
      const designTokens = await fetch(fileUrl).then(r => r.json());
      const tokens = transformDesignTokens(designTokens, initialMode);
      if (!tokens.length) setErrorMessage(`Cannot find ${initialMode} tokens`);
      setTokens(tokens);
    } catch {
      setTokens([]);
      setErrorMessage(`Failed to get ${initialMode} tokens`);
    } finally {
      setLoading(false);
    }
  }, [fileUrl, initialMode, setMode, setTokens]);

  const handleLoadAllTokens = useCallback(async () => {
    setLoading(true);
    setMode(TokenType.All);
    setErrorMessage('');
    try {
      const designTokens = await fetch(fileUrl).then(r => r.json());
      const colorTokens = transformDesignTokens(designTokens, TokenType.Color);
      const dimensionTokens = transformDesignTokens(designTokens, TokenType.Dimension);
      const borderTokens = transformDesignTokens(designTokens, TokenType.Border);
      const tokens = [...colorTokens, ...dimensionTokens, ...borderTokens];
      if (!tokens.length) setErrorMessage(`Cannot find any tokens`);
      setTokens(tokens);
    } catch {
      setTokens([]);
      setErrorMessage(`Failed to get any tokens`);
    } finally {
      setLoading(false);
    }
  }, [fileUrl, setMode, setTokens]);

  return (
    <div className="py-5">
      <LoadingOverlay isActive={loading} />

      <Input
        label="Design Tokens file url"
        className={classNames({ '!border-brand-secondary-5 !text-brand-secondary-5': !!errorMessage })}
        caption={
          <>
            <span>Please provide file according to the </span>
            <a
              className="underline"
              href="https://second-editors-draft.tr.designtokens.org/format/#file-format"
              target="_blank"
            >
              Design Tokens Format Module.
            </a>
          </>
        }
        placeholder="https://url-to-design-tokens-file"
        onChange={handleUpdateFileUrl}
        value={fileUrl}
      />
      <div className="my-2 flex items-center gap-2">
        <Button type="button" buttonType="secondary" onClick={handleLoadTokens} disabled={!fileUrl.length}>
          Load {initialMode} tokens
        </Button>
        <Button type="button" buttonType="secondaryInvert" onClick={handleLoadAllTokens} disabled={!fileUrl.length}>
          Load all tokens
        </Button>
        {!!errorMessage && (
          <div className="flex items-center gap-1 text-brand-secondary-5">
            <Warning />
            <p className="text-red-500">{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};
