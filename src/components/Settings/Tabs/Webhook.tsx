import { ChangeEvent, ChangeEventHandler, Dispatch, FC, SetStateAction, useCallback, useState } from 'react';
import classNames from 'classnames';
import { Label, Heading, Button, Input } from '@uniformdev/design-system';
import { Trash } from '@/components/icons';
import { isValidUrl } from '@/utils';

type WebhookItemProps = {
  value: string;
  index: number;
  onChangeWebhook: ChangeEventHandler<HTMLInputElement>;
  onDelete: (index: number) => void;
};

const WebhookItem: FC<WebhookItemProps> = ({ value, index, onChangeWebhook, onDelete }) => {
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const handleOnChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChangeWebhook(e);
      if (showErrorMessage) {
        setShowErrorMessage(!isValidUrl(e.target.value));
      }
    },
    [onChangeWebhook, showErrorMessage]
  );

  return (
    <>
      <div className="my-2 grid grid-cols-7 items-center gap-4">
        <div className="col-span-6 ml-5 items-center">
          <Input
            showLabel={false}
            name={String(index)}
            placeholder="e.g. https://www.example.com/webhook"
            value={value}
            onChange={handleOnChange}
            onBlur={() => setShowErrorMessage(!isValidUrl(value))}
            errorMessage={showErrorMessage ? 'Please enter a valid webhook URL' : undefined}
          />
        </div>
        <div className="flex justify-center">
          <Trash
            className={classNames('size-5 text-red-400 cursor-pointer', {
              '!mb-6': showErrorMessage,
            })}
            onClick={() => onDelete(index)}
          />
        </div>
      </div>
      <div className="border-b" />
    </>
  );
};

type WebhookSettingsProps = {
  webhooks: NonNullable<MeshType.SettingsParams['deployHooks']>;
  setWebhooks: Dispatch<SetStateAction<NonNullable<MeshType.SettingsParams['deployHooks']>>>;
};

const WebhookSettings: FC<WebhookSettingsProps> = ({ webhooks, setWebhooks }) => {
  const handleAddWebhookClick = useCallback(() => setWebhooks(prevState => [...prevState, '']), [setWebhooks]);

  const handleUpdateWebhook = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { value, name: index } = e.target;
      setWebhooks(prevState =>
        prevState.map((item, currentIndex) => {
          if (currentIndex !== Number(index)) return item;
          return value;
        })
      );
    },
    [setWebhooks]
  );

  const handleDeleteWebhook = useCallback(
    (index: number) => setWebhooks(prevState => prevState.filter((_, currentIndex) => index !== currentIndex)),
    [setWebhooks]
  );

  const renderWebhooks = useCallback(
    () => (
      <div className="mb-4">
        <div className="border-b py-3">
          <Label className="!ml-5">Endpoint URL</Label>
        </div>
        {webhooks.map((value, index) => (
          <WebhookItem
            key={`webhook-${index}`}
            value={value}
            index={index}
            onChangeWebhook={handleUpdateWebhook}
            onDelete={handleDeleteWebhook}
          />
        ))}
      </div>
    ),
    [handleDeleteWebhook, handleUpdateWebhook, webhooks]
  );

  return (
    <div>
      <Label className="!my-6">
        You can specify a webhook for the rebuild that will be triggered automatically when you update the
        configuration.
      </Label>
      <Heading level={6} className="!mb-2 !mt-6 !font-bold uppercase">
        Webhooks
      </Heading>
      {webhooks.length > 0 ? renderWebhooks() : null}
      <Button
        buttonType="secondaryInvert"
        size="md"
        className="m-px"
        onClick={handleAddWebhookClick}
        disabled={webhooks.some(value => !isValidUrl(value))}
      >
        Add webhook
      </Button>
    </div>
  );
};

export default WebhookSettings;
