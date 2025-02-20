import { Dispatch, FC, SetStateAction, useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import { useDropzone } from 'react-dropzone';
import { LoadingOverlay, Button } from '@uniformdev/design-system';
import { Trash, Warning } from '@/components/icons';
import { TokenType } from '@/constants';
import { transformDesignTokens } from '@/utils';

type LoadingFromFileProps = {
  mode: TokenType;
  setTokens: Dispatch<SetStateAction<Type.DesignToken[]>>;
};

export const LoadingFromFile: FC<LoadingFromFileProps> = ({ mode, setTokens }) => {
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    maxFiles: 1,
    disabled,
    accept: {
      '*': ['.json'],
    },
  });

  useEffect(() => {
    if (acceptedFiles.length) {
      setDisabled(true);
    }
  }, [acceptedFiles]);

  const handleDropFile = useCallback(() => {
    setDisabled(false);
    setErrorMessage('');
  }, []);

  const handleLoadTokens = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const reader = new FileReader();
      reader.readAsText(acceptedFiles[0]);
      const result = await new Promise(resolve => {
        reader.onload = function () {
          resolve(reader.result);
        };
      });
      const designTokens = JSON.parse(result as string);
      const tokens = transformDesignTokens(designTokens, mode);
      if (!tokens.length) setErrorMessage(`Cannot find ${mode} tokens`);
      setTokens(tokens);
    } catch {
      setTokens([]);
      setErrorMessage(`Failed to get ${mode} tokens`);
    } finally {
      setLoading(false);
    }
  }, [acceptedFiles, mode, setTokens]);

  return (
    <div className="py-5">
      <LoadingOverlay isActive={loading} />

      <div
        {...getRootProps({ className: 'dropzone' })}
        className={classNames('flex h-[101px] justify-center items-center border-dotted border-2 border-sky-500', {
          'border-brand-secondary-5': !!errorMessage,
        })}
      >
        <input {...getInputProps()} />
        {!disabled ? (
          <div className="flex flex-col justify-center text-center">
            <p>Drag &apos;n&apos; drop file here, or click to select files</p>
            <p className="text-sm text-gray-500">
              <span>Please provide file according to the </span>
              <a
                className="underline"
                href="https://second-editors-draft.tr.designtokens.org/format/#file-format"
                target="_blank"
                onClick={e => e.stopPropagation()}
              >
                Design Tokens Format Module.
              </a>
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <p>{acceptedFiles[0].name}</p>
            <Trash className="size-5 cursor-pointer text-red-400" onClick={handleDropFile} />
          </div>
        )}
      </div>
      <div className="my-2 flex items-center gap-2">
        <Button type="button" buttonType="secondary" disabled={!disabled} onClick={handleLoadTokens}>
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
