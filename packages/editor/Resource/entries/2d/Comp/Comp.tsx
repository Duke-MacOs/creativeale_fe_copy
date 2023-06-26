import { memo } from 'react';
import { shallowEqual, useSelector, useStore } from 'react-redux';
import { WithGroupComponentProps } from '../../../common/withGroup';
import { IMaterial } from '@/types/library';
import { ImageItem } from '../Image/ImageItem';
import { deleteScene, useOnEditComponent, useEditor, ISceneState } from '@editor/aStore';
import useDelResourceEntry from '../../../common/useDelResourceEntry';
import { getSceneByOrderId, componentInUsed } from '@editor/utils';
import useReplacing from '../../../common/useReplacing';
import * as http from '@shared/api/project';
import { css } from 'emotion';
import { ComponentAdder } from './CompItem';

const className = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gridAutoRows: 'auto',
  rowGap: '8px',
});

const Comp = ({ groupData, provider, category }: WithGroupComponentProps<ISceneState>) => {
  const onDelResourceEntry = useDelResourceEntry();
  const { onEditComponent } = useOnEditComponent();
  const { getState, dispatch } = useStore<EditorState, EditorAction>();
  const { replacing } = useReplacing();
  const { readOnly } = useEditor(0, 'readOnly');
  const components = useSelector(({ project }: EditorState) => {
    const components = [] as typeof project.scenes;
    while (project) {
      for (const scene of project.scenes) {
        if (scene.type === 'Animation' && !components.some(({ orderId }) => orderId === scene.orderId)) {
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
    <div className={className}>
      <ComponentAdder />
      {components.map(entry => (
        <ImageItem
          key={entry.id}
          materialId={entry.id}
          provider={provider}
          category={category}
          url={entry.previewUrl}
          name={entry.name}
          cover={entry.cover}
          extra={(entry as any).extra}
          description={(entry as any).description || ''} // 场景化的互动组件没有description字段
          onEdit={
            !readOnly && !replacing
              ? () => {
                  onEditComponent(entry.previewUrl);
                }
              : undefined
          }
          onDelete={
            !readOnly && !replacing
              ? async () => {
                  if (category === 'Animation' && typeof entry.previewUrl === 'number') {
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
};

export default memo(Comp);
