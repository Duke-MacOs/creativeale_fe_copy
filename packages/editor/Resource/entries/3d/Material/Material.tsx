import React from 'react';
import { WithGroupComponentProps } from '../../../common/withGroup';
import { IMaterial } from '@/types/library';
import { ImageItem } from '../../2d/Image/ImageItem';
import { useUserInfo } from '@editor/aStore';
import useReplacing from '../../../common/useReplacing';
import useDelResourceEntry from '../../../common/useDelResourceEntry';
import { css } from 'emotion';

const styles = {
  container: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridAutoRows: 'auto',
    rowGap: '8px',
  }),
};

export default function Material({ groupData, category, provider }: WithGroupComponentProps<IMaterial>) {
  const userinfo = useUserInfo();
  const { replacing } = useReplacing();
  const onDelResourceEntry = useDelResourceEntry();

  return (
    <div className={styles.container}>
      {groupData.list.map(entry => {
        return (
          <ImageItem
            key={entry.id}
            materialId={entry.id}
            provider={provider}
            category={category}
            name={entry.name}
            cover={entry.cover}
            url={entry.previewUrl}
            description={entry.description}
            onDelete={
              !replacing && provider === 'shared' && userinfo?.userId === entry.userId
                ? () => {
                    return onDelResourceEntry(category, provider, entry.id);
                  }
                : undefined
            }
          />
        );
      })}
    </div>
  );
}
