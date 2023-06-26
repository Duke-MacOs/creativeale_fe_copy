import React from 'react';
import useDraggable from '../../../common/useDraggable';
import { css } from 'emotion';

export default ({ name, Comp }: { name: string; Comp: React.FC }) => {
  const dragProps = useDraggable({ mime: 'Shape', name, url: name });
  return (
    <div
      className={css({
        width: '72px',
        height: '72px',
        borderRadius: '2px',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        cursor: 'pointer',
        marginRight: '8px',
        marginBottom: '8px',
        ':nth-child(3n+3)': {
          marginRight: 0, //每行第三个
        },
      })}
      {...dragProps}
    >
      <Comp />
    </div>
  );
};
