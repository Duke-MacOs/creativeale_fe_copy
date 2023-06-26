import React from 'react';
import { css } from 'emotion';
import { IMaterial } from '@/types/library';
import { WithGroupComponentProps } from '../../../common/withGroup';
import { ImageItem } from '../Image/ImageItem';
import useDelResourceEntry from '../../../common/useDelResourceEntry';
import useReplacing from '../../../common/useReplacing';
import { getResourceMime, getResourceName, getResourceNodeType } from '@shared/utils/resource';

const className = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gridAutoRows: 'auto',
  rowGap: '8px',
});

export default function Effect({ groupData, setGroupData, category, provider }: WithGroupComponentProps<IMaterial>) {
  const { replacing } = useReplacing();
  const onDelResourceEntry = useDelResourceEntry();

  return (
    <div className={className}>
      {groupData.list.map(entry => {
        console.log('entry:', entry);
        const resourceVersion = category === 'Spine' ? (entry.extra?.spineVersion ?? 3.8).toFixed(1) : null;
        return (
          <div style={{ position: 'relative' }}>
            <span
              style={{
                position: 'absolute',
                padding: '0 5px',
                fontSize: '11px',
                background: 'orange',
                bottom: 16,
                right: 3,
              }}
            >
              {getResourceName(entry.type?.cid)}
            </span>
            <ImageItem
              key={entry.id}
              materialId={entry.id}
              category={getResourceNodeType(entry.type?.cid) as any}
              provider={provider}
              name={entry.name}
              cover={entry.cover}
              url={entry.previewUrl}
              resourceUrl={entry.url}
              version={resourceVersion}
              description={entry.description}
              extra={entry.extra}
              groupData={groupData}
              setGroupData={setGroupData}
              onDelete={
                !replacing && provider === 'project'
                  ? () => {
                      return onDelResourceEntry(category, provider, entry.id);
                    }
                  : undefined
              }
            />
          </div>
        );
      })}
    </div>
  );
}
