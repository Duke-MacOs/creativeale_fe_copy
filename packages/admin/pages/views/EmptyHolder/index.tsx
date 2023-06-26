import { css } from 'emotion';
import emptyHolder from './emptyHolder.svg';

export interface EmptyHolderProps {
  message: React.ReactNode;
}

export const EmptyHolder = ({ message }: EmptyHolderProps) => {
  return (
    <div
      className={css({
        textAlign: 'center',
        height: '428px',
        padding: '32px',
        width: '100%',
      })}
    >
      <img src={emptyHolder} />
      <p style={{ color: '#999' }}>{message}</p>
    </div>
  );
};
