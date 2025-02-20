import { ChangeEvent, Dispatch, FC, SetStateAction, useCallback, useState } from 'react';
import classNames from 'classnames';
import { Button, Input, LoadingOverlay } from '@uniformdev/design-system';
import { Warning } from '@/components/icons';
import { TokenType } from '@/constants';
import { transformDesignTokens } from '@/utils';

type LoadingFromUrlProps = {
  mode: TokenType;
  setTokens: Dispatch<SetStateAction<Type.DesignToken[]>>;
};

export const LoadingFromUrl: FC<LoadingFromUrlProps> = ({ mode, setTokens }) => {
  const [fileUrl, setFileUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleUpdateFileUrl = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFileUrl(e.target.value);
    setErrorMessage('');
  }, []);

  const handleLoadTokens = useCallback(async () => {
    setLoading(true);
    try {
      const designTokens = await fetch(fileUrl).then(r => r.json());
      const tokens = transformDesignTokens(designTokens, mode);
      if (!tokens.length) setErrorMessage(`Cannot find ${mode} tokens`);
      setTokens(tokens);
    } catch {
      setTokens([]);
      setErrorMessage(`Failed to get ${mode} tokens`);
    } finally {
      setLoading(false);
    }
  }, [fileUrl, mode, setTokens]);

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
          Load {mode}
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
