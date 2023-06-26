import React from 'react';
import { WithGroupComponentProps } from '../../../common/withGroup';
import { ISceneState, useUserInfo } from '@editor/aStore';
import useReplacing from '../../../common/useReplacing';
import useDelResourceEntry from '../../../common/useDelResourceEntry';
import { css } from 'emotion';
import { shallowEqual, useSelector } from 'react-redux';
import ModelItem from './ModelItem';
import { useDeleteSceneResource } from '../Particle3D/hooks';

const styles = {
  container: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridAutoRows: 'auto',
    rowGap: '8px',
  }),
};

export default function Model({ groupData, category, provider }: WithGroupComponentProps<ISceneState>) {
  const { onDeleteSceneResource } = useDeleteSceneResource('Model');

  const userinfo = useUserInfo();
  const { replacing } = useReplacing();
  const onDelResourceEntry = useDelResourceEntry();

  const components = useSelector(({ project }: EditorState) => {
    const components = [] as typeof project.scenes;
    while (project) {
      for (const scene of project.scenes) {
        if (scene.type === 'Model' && !components.some(({ orderId }) => orderId === scene.orderId)) {
          components.push(scene);
        }
      }
      project = project.editor.prevState!;
    }
    console.log('groupData?.list:', groupData);
    return (groupData?.list ? groupData.list : components).map(({ id, orderId, name, editor: { cover } }) => {
      return {
        id,
        previewUrl: orderId,
        name,
        cover,
        userId: 0,
        orderId,
      };
    });
  }, shallowEqual);

  return (
    <div className={styles.container}>
      {components.map((entry: any) => {
        return (
          <ModelItem
            key={entry.id}
            materialId={entry.id}
            category={category}
            provider={provider}
            name={entry.name}
            cover={entry.cover}
            url={entry.previewUrl}
            orderId={entry.orderId}
            onDelete={
              !replacing && (provider === 'project' || (provider === 'shared' && userinfo?.userId === entry.userId))
                ? async () => {
                    if (typeof entry.previewUrl === 'number') {
                      await onDeleteSceneResource(entry.previewUrl);
                    } else {
                      return onDelResourceEntry(category, provider, entry.id);
                    }
                  }
                : undefined
            }
          />
        );
      })}
    </div>
  );
}
