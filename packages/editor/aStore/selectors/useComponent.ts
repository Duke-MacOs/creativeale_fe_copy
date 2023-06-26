import { useCallback, useState } from 'react';
import { shallowEqual, useSelector, useStore } from 'react-redux';
import { createComp } from '@editor/Editor/Header/headers/Component/createComp';
import { changeProps, joinGroup } from '../project';
import { useOnDelete } from './useOnDelete';
import { useOnCapture } from '@editor/Preview';
import { useAddNode } from './useAddNode';
import { message } from 'antd';
import {
  changeCategory,
  changeEditor,
  newCase,
  newScene,
  restoreState,
  useEmitter,
  selectNode,
  addComponent,
} from '@editor/aStore';
import {
  getSelectedIds,
  popPlayState,
  fromScene,
  intoScene,
  getScene,
  findById,
  newID,
  isAnimation,
  getSceneFromUrl,
} from '@editor/utils';
import { addState } from '@editor/Editor/Header/hooks/useRestore/getFromUrl';
import { isVRCase } from '@editor/Template/Panorama/utils';

export const useOnAddComponent = ({ is3D = false }: { is3D?: boolean }) => {
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  const emit = useEmitter('LoadComponent');
  return useCallback(() => {
    const oldOne = popPlayState(getState().project);
    const loadComponent = async () => {
      const newOne = newCase(
        [newScene('互动组件', { loading: false, type: is3D ? 'Animation3D' : 'Animation', edit3d: is3D })],
        'Component',
        oldOne
      );
      // 保留project id用于更新
      newOne.id = oldOne.id;
      newOne.editor.readOnly = oldOne.editor.readOnly;
      newOne.settings = oldOne.settings;
      dispatch(restoreState(newOne));
      dispatch(changeCategory(''));
    };
    if (['Component', 'PanoramaData'].includes(oldOne.type)) {
      emit({ loadComponent });
    } else {
      loadComponent();
    }
  }, [getState, dispatch, emit]);
};

export const useOnEditComponent = () => {
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  const [loading, setLoading] = useState(false);
  const emit = useEmitter('LoadComponent');

  return {
    loading,
    onEditComponent: useCallback(
      async (url: string | number, skip = false) => {
        let oldOne = popPlayState(getState().project);
        oldOne = { ...oldOne, editor: { ...oldOne.editor, contextMenu: undefined } };
        const loadComponent = async () => {
          // oldOne 与外部的隔离，emit 回调执行 oldOne 可能发生变化;
          let oldOne = popPlayState(getState().project);
          oldOne = { ...oldOne, editor: { ...oldOne.editor, contextMenu: undefined } };
          try {
            setLoading(true);
            const scene = await getSceneFromUrl(oldOne, url);
            const newOne = newCase([scene], 'Component', oldOne);
            newOne.settings = { ...oldOne.settings };
            if (['Animation3D'].includes(scene.type)) {
              scene.editor.edit3d = true;
              newOne.settings.enabled3d = true;
            } else {
              newOne.settings.enabled3d = false;
            }
            newOne.editor.readOnly = typeof url === 'string' || oldOne.editor.readOnly;
            newOne.materials = oldOne.materials;
            // 保留project id用于更新
            newOne.id = oldOne.id;
            dispatch(restoreState(newOne));
            dispatch(changeCategory(''));
            addState(String(url));
          } catch (e) {
            message.error('不能打开互动组件');
            setLoading(false);
          }
        };
        if (['Component', 'PanoramaData'].includes(oldOne.type) && !isVRCase(getState().project)) {
          emit({ loadComponent, skip });
        } else {
          loadComponent();
        }
      },
      [getState, dispatch, emit]
    ),
  };
};

export const useOnIntoComponent = () => {
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  const { onDelete } = useOnDelete();
  const onCapture = useOnCapture();
  const onAddNode = useAddNode();
  const canIntoComponent = useSelector(({ project }: EditorState) => {
    const { editor, props } = getScene(project);
    const { nodeIds, scriptIds } = getSelectedIds(editor.selected);
    if (scriptIds.length || !nodeIds.length) {
      return { can: 'none' } as const;
    }
    if (nodeIds.length > 1 || !isAnimation(props[nodeIds[0]]?.type)) {
      if (project.editor.readOnly) {
        return { can: 'none' } as const;
      }
      return { can: 'into' } as const;
    }
    const { url = '' } = props[nodeIds[0]];
    if ((typeof url === 'string' && url.includes('.json')) || project.editor.readOnly) {
      return { can: 'view', url } as const;
    }
    return { can: 'edit', url } as const;
  }, shallowEqual);
  return {
    canIntoComponent,
    onIntoComponent: useCallback(async () => {
      const {
        editor: { selected, edit3d },
      } = getScene(getState().project);
      const { nodeIds, scriptIds } = getSelectedIds(selected);
      if (scriptIds.length || !nodeIds.length) {
        return;
      }
      const parentId = newID();
      dispatch(joinGroup(parentId, nodeIds));
      dispatch(changeEditor(0, { loading: true }));
      setTimeout(async () => {
        try {
          const { project } = getState();
          const scene = getScene(project);
          const { x, y, position, width, height } = scene.props?.[parentId] ?? {};
          const [{ nodes }] = findById(scene.nodes, parentId);
          const [{ name }] = nodes.slice(-1);

          const newScene = fromScene(
            intoScene({
              ...scene,
              editor: {
                ...scene.editor,
                isOpen: true,
              },
              nodes,
              name,
              id: parentId,
              type: edit3d ? 'Animation3D' : 'Animation',
              props: {
                ...scene.props,
                [parentId]: {
                  type: edit3d ? 'Animation3D' : 'Animation',
                  name,
                  height,
                  width,
                },
              },
              scripts: [],
            })
          );
          const capture = await onCapture(parentId, width, height);
          const component = await createComp(
            project,
            {
              ...newScene,
              editor: {
                ...newScene.editor,
                capture,
              },
            },
            true
          );
          dispatch(addComponent(component));
          const nodeId = await onAddNode({
            dropWhere: 'before',
            targetId: parentId,
            mime: component.type,
            url: component.orderId,
            name: component.name,
          });
          dispatch(changeProps([nodeId], edit3d ? { position } : { x, y }));
          onDelete({ nodeIds: [parentId] });
          dispatch(selectNode([nodeId]));
        } finally {
          dispatch(changeEditor(0, { loading: false }));
        }
      });
    }, [dispatch, getState, onAddNode, onCapture, onDelete]),
  };
};
