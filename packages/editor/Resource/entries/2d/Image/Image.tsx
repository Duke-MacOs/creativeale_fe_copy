import { ImageItem } from './ImageItem';
import { WithGroupComponentProps } from '../../../common/withGroup';
import { IMaterial } from '@/types/library';
import useDelResourceEntry from '../../../common/useDelResourceEntry';
import { css } from 'emotion';

const styles = {
  'image-container': css({
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridAutoRows: 'auto',
    rowGap: '8px',
  }),
};

export default function Image({ groupData, setGroupData, provider, category }: WithGroupComponentProps<IMaterial>) {
  const onDelResourceEntry = useDelResourceEntry();
  return (
    <div className={styles['image-container']}>
      {groupData.list.map(entry => (
        <ImageItem
          key={entry.id}
          materialId={entry.id}
          category={category}
          provider={provider}
          name={entry.name}
          url={entry.previewUrl || entry.url}
          cover={entry.previewUrl || entry.url}
          description={entry.description}
          extra={entry.extra}
          groupData={groupData}
          setGroupData={setGroupData}
          onDelete={() => {
            return onDelResourceEntry(category, provider, entry.id);
          }}
        />
      ))}
    </div>
  );
}
