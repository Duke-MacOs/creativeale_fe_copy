import { css } from 'emotion';

export const GroupContainer = ({ children, title }: { children: React.ReactNode; title: React.ReactNode }) => {
  return (
    <div className={css({ padding: '8px 12px' })}>
      <h4 className={css({ paddingBottom: 12, margin: 0 })}>{title}</h4>
      {children}
    </div>
  );
};
