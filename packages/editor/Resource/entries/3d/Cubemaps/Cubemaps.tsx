import React from 'react';
import { WithGroupComponentProps } from '../../../common/withGroup';
import { ImageItem } from '../../2d/Image/ImageItem';
import { css } from 'emotion';
import { ICubemap } from '@editor/aStore';
import { shallowEqual, useSelector } from 'react-redux';
import useCubemap from './useCubemap';
const styles = {
  container: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridAutoRows: 'auto',
    rowGap: '8px',
  }),
};
export default function Cubemaps({ groupData, category, provider }: WithGroupComponentProps<ICubemap>) {
  const { deleteCubemap } = useCubemap();
  const components = useSelector(({ project }: EditorState) => {
    const components = [] as typeof project.cubemaps;
    while (project) {
      for (const cubemap of project.cubemaps) {
        if (!components.some(({ orderId }) => orderId === cubemap.orderId)) {
          components.push(cubemap);
        }
      }
      project = project.editor.prevState!;
    }
    return (groupData?.list ? groupData.list : components).map(({ id, orderId, cover, props }) => {
      return {
        id,
        orderId,
        previewUrl: cover,
        name: (props as any)?.name ?? '全景图',
        cover: cover,
        userId: 0,
      };
    });
  }, shallowEqual);

  return (
    <div className={styles.container}>
      {components.map(entry => (
        <ImageItem
          key={entry.id}
          materialId={entry.id}
          category={category}
          provider={provider}
          name={entry.name}
          url={entry.orderId}
          cover={entry.cover}
          orderId={entry.orderId}
          onDelete={async () => {
            return deleteCubemap((entry as any).id);
          }}
        />
      ))}
    </div>
  );
}
