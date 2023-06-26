import React from 'react';
import { shallowEqual, useSelector, useStore } from 'react-redux';
import { WithGroupComponentProps } from '../../../common/withGroup';
import { IMaterial } from '@/types/library';
import { css } from 'emotion';
import useDelResourceEntry from '../../../common/useDelResourceEntry';
import Icon from '@ant-design/icons';
import { Plus } from '@icon-park/react';
import { useOnAddComponent, useEditor, useOnEditComponent, deleteScene, ISceneState } from '@editor/aStore';
import { getSceneByOrderId, componentInUsed } from '@editor/utils';
import * as http from '@shared/api/project';
import useReplacing from '../../../common/useReplacing';
import Comp3DItem from './Comp3DItem';

const styles = {
  container: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridAutoRows: 'auto',
    rowGap: '8px',
  }),
};

const ComponentAdder = () => {
  const onAddComponent = useOnAddComponent({ is3D: true });
  return (
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
      onClick={onAddComponent}
    >
      <Icon component={Plus as any} />
    </div>
  );
};

export default function Comp3D({ groupData, category, provider }: WithGroupComponentProps<ISceneState>) {
  const onDelResourceEntry = useDelResourceEntry();
  const { getState, dispatch } = useStore<EditorState, EditorAction>();
  const { readOnly } = useEditor(0, 'readOnly');
  const { replacing } = useReplacing();
  const { onEditComponent } = useOnEditComponent();

  const components = useSelector(({ project }: EditorState) => {
    const components = [] as typeof project.scenes;
    while (project) {
      for (const scene of project.scenes) {
        if (
          scene.type === 'Animation3D' &&
          scene.editor.isOpen !== false &&
          !components.some(({ orderId }) => orderId === scene.orderId)
        ) {
          components.push(scene);
        }
      }
      project = project.editor.prevState!;
    }
    return (groupData?.list ? groupData.list : components).map(({ id, orderId, name, editor: { capture } }) => ({
      id,
      previewUrl: orderId,
      name,
      cover: capture,
    }));
  }, shallowEqual);
  return (
    <div className={styles.container}>
      <ComponentAdder />
      {components?.map(entry => (
        <Comp3DItem
          key={entry.id}
          materialId={entry.id}
          provider={provider}
          category={category}
          url={entry.previewUrl}
          name={entry.name}
          previewUrl={entry.previewUrl}
          cover={entry.cover}
          extra={(entry as any).extra}
          description={(entry as any).description || ''}
          onEdit={
            !readOnly && !replacing && provider !== 'public' && category === 'Animation3D'
              ? () => {
                  onEditComponent(entry.previewUrl);
                }
              : undefined
          }
          onDelete={
            !readOnly && !replacing && provider !== 'public'
              ? async () => {
                  if (category === 'Animation3D' && typeof entry.previewUrl === 'number') {
                    const { project } = getState();
                    if (project.type === 'Component' && entry.previewUrl === project.scenes[0].orderId) {
                      throw new Error('组件正在编辑，不能删除');
                    }
                    if (componentInUsed(project, entry.previewUrl)) {
                      throw new Error('组件正在使用，不能删除');
                    }
                    const { sceneId, id } = getSceneByOrderId(project, entry.previewUrl);
                    await http.deleteScene(sceneId).then(() => {
                      dispatch(deleteScene(id));
                    });
                  } else {
                    await onDelResourceEntry(category, provider, entry.id);
                  }
                }
              : undefined
          }
        />
      ))}
    </div>
  );
}
