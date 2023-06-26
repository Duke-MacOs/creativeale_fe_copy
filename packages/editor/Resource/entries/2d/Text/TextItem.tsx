import React from 'react';
import useDraggable from '../../../common/useDraggable';
import { css } from 'emotion';

export default ({ title, content, props }: { title: string; content: string; props: Record<string, any> }) => {
  const dragProps = useDraggable({ mime: 'Text', url: content, name: title, props });
  return (
    <div
      className={css({
        fontSize: props.fontSize / 2,
        fontWeight: props.bold ? 'bold' : undefined,
        background: '#F5F5F5',
        padding: 12,
        color: props.color,
        borderRadius: '2px',
        cursor: 'pointer',
        marginBottom: '8px',
        textAlign: 'center',
        ':hover': {
          background: '#EBEBEB',
        },
        ':active': {
          background: '#D6D6D6',
        },
      })}
      {...dragProps}
    >
      {content}
    </div>
  );
};
