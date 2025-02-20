import { FC, MouseEventHandler } from 'react';

type DeleteButtonProps = {
  onClick: MouseEventHandler<HTMLButtonElement> | undefined;
  title?: string;
};

const DeleteButton: FC<DeleteButtonProps> = ({ onClick, title }) => (
  <button
    title={title}
    onClick={onClick}
    className="flex items-center justify-center border border-custom-gray-border bg-custom-gray-light p-4"
  >
    {title}
  </button>
);

export default DeleteButton;
