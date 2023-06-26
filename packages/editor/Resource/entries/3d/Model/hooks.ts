import { addFromNode, changeCategory, newCase, restoreState, useEmitter } from '@editor/aStore';
import { getScene, getSceneFromUrl, getSelectedIds, newID, popPlayState } from '@editor/utils';
import { message } from 'antd';
import { useCallback, useState } from 'react';
import { shallowEqual, useSelector, useStore } from 'react-redux';

export const useOnEditModel = () => {
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  const [loading, setLoading] = useState(false);
  const emit = useEmitter('LoadComponent');
  return {
    loading,
    onEditModel: useCallback(
      async (url: string | number) => {
        let oldOne = popPlayState(getState().project);
        oldOne = { ...oldOne, editor: { ...oldOne.editor, contextMenu: undefined } };
        const loadModel = async () => {
          try {
            setLoading(true);
            const scene = await getSceneFromUrl(oldOne, url);
            scene.editor.edit3d = true;
            const newOne = newCase([scene], 'Model', oldOne);
            newOne.editor.readOnly = typeof url === 'string' || oldOne.editor.readOnly;
            newOne.settings.store = oldOne.settings.store;
            newOne.settings.layerCollisions = oldOne.settings.layerCollisions;
            newOne.settings.layerCollisionName = oldOne.settings.layerCollisionName;
            newOne.materials = oldOne.materials;
            // 保留project id用于更新
            newOne.id = oldOne.id;
            dispatch(restoreState(newOne));
            dispatch(changeCategory(''));
          } catch (e) {
            message.error('不能打开模型');
            setLoading(false);
          }
        };
        if (['Component', 'PanoramaData'].includes(oldOne.type)) {
          emit({ loadComponent: loadModel });
        } else {
          loadModel();
        }
      },
      [getState, dispatch, emit]
    ),
  };
};

export const useOnIntoModel = () => {
  const { canIntoModel, url: modelUrl } = useSelector(({ project }: EditorState) => {
    const { editor, props } = getScene(project);
    const { nodeIds } = getSelectedIds(editor.selected);
    const { url = '' } = props[nodeIds[0]] ?? {};
    return {
      canIntoModel: props[nodeIds[0]]?.type === 'Model' ? (typeof url === 'string' ? 'view' : 'edit') : 'None',
      url,
    };
  }, shallowEqual);

  return { canIntoModel, modelUrl };
};

export const useModel = () => {
  const { dispatch, getState } = useStore<EditorState, EditorAction>();

  const addModelInEdit = async (url: string | number) => {
    const data = await getSceneFromUrl(getState().project, url);
    if (data) {
      const parentId = getScene(getState().project, undefined, false)?.id;
      let index = data.nodes.length;
      data.nodes?.forEach(node => {
        dispatch(
          addFromNode(
            parentId,
            index,
            {
              ...node,
              id: newID(),
            },
            undefined,
            undefined
          )
        );
        index++;
      });
    }
  };

  return {
    addModelInEdit,
  };
};
