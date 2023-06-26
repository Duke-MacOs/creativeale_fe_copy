import type { ResourceEntry } from './types';
import { useResourcePreview } from './Preview';
import useAddNode from './useAddNode';
import { Typography } from 'antd';
import { css } from 'emotion';

export const GridContainer = ({ entries }: { entries: ResourceEntry[] }) => {
  return (
    <div
      className={css({
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridAutoRows: 'auto',
        overflow: 'auto',
        maxHeight: '100%',
        rowGap: '8px',
        width: 256,
      })}
    >
      {entries.map(entry => (
        <GridItem key={entry.id} {...entry} />
      ))}
    </div>
  );
};

const GridItem = (entry: ResourceEntry) => {
  const listeners = useResourcePreview(entry);
  const addNodeProps = useAddNode(entry);
  return (
    <div
      {...listeners}
      className={css({
        flexDirection: 'column',
        justifySelf: 'center',
        display: 'flex',
      })}
    >
      <img
        {...addNodeProps}
        src={entry.cover}
        className={css({
          width: 72,
          height: 72,
          objectFit: 'contain',
          borderRadius: '2px',
          border: '1px solid #f0f0f0',
          backgroundColor: '#F5F5F5',
          cursor: 'pointer',
        })}
      />
      <Typography.Text
        type="secondary"
        className={css({
          width: 72,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        })}
      >
        {entry.name}
      </Typography.Text>
    </div>
  );
};
