import React from 'react';
import { WithGroupComponentProps } from '../../../common/withGroup';
import { css } from 'emotion';
import Particle3DItem from './Particle3DItem';
import { shallowEqual, useSelector } from 'react-redux';
import { useDeleteSceneResource } from './hooks';
import Icon from '@ant-design/icons';
import { Plus } from '@icon-park/react';
import useDraggable from '@editor/Resource/common/useDraggable';
import { ISceneState } from '@editor/aStore';

const styles = {
  container: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridAutoRows: 'auto',
    rowGap: '8px',
  }),
};

export default function Particle3D({ groupData, category, provider }: WithGroupComponentProps<ISceneState>) {
  const { onDeleteSceneResource } = useDeleteSceneResource('Particle3D');
  const dragProps = useDraggable({ mime: 'ParticleSystem3D', name: 'ParticleSystem3D', url: '' });
  const components = useSelector(({ project }: EditorState) => {
    const components = [] as typeof project.scenes;
    while (project) {
      for (const scene of project.scenes) {
        if (scene.type === 'Particle3D' && !components.some(({ orderId }) => orderId === scene.orderId)) {
          components.push(scene);
        }
      }
      project = project.editor.prevState!;
    }
    return (groupData?.list ? groupData.list : components).map(({ id, orderId, name }) => {
      return {
        id,
        previewUrl: orderId,
        name,
        cover: `${orderId}`,
        userId: 0,
      };
    });
  }, shallowEqual);

  const editorType = useSelector(({ project }: EditorState) => {
    return project.type;
  });

  const visibleAddParticleSystem = provider === 'project' && editorType === 'Particle3D';

  return (
    <div className={styles.container}>
      {visibleAddParticleSystem && (
        <div style={{ fontSize: 11, textAlign: 'center', color: 'gray' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              cursor: 'pointer',
              border: '1px solid #f0f0f0',
              borderRadius: '2px',
              justifySelf: 'center',
              background: '#eef3fe',
              display: 'flex',
              justifyContent: 'center',
              color: '#3955f6',
              alignItems: 'center',
              fontSize: '1.62em',
            }}
            {...dragProps}
          >
            <Icon component={Plus as any} />
          </div>
          空白粒子
        </div>
      )}
      {components.map(entry => {
        return (
          <Particle3DItem
            key={entry.id}
            materialId={entry.id}
            category={category}
            provider={provider}
            name={entry.name}
            cover={entry.previewUrl}
            url={entry.previewUrl}
            onDelete={
              provider === 'project'
                ? async () => {
                    if (typeof entry.previewUrl === 'number') {
                      await onDeleteSceneResource(entry.previewUrl);
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
