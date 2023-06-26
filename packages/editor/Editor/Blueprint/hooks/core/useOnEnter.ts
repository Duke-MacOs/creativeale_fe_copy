import { usePersistCallback } from '@byted/hooks';
import { changeEditor, selectNode, useOnEditComponent } from '@editor/aStore';
import { getScene, isAnimation } from '@editor/utils';
import { useMemo } from 'react';
import { Node } from 'react-flow-renderer';
import { useStore } from 'react-redux';
import { useOnInit, useOnSave } from '..';
import { IState } from '../../types';
import { getParentOfRootBlueprint } from '../../utils';

/**
 * 用于进入场景蓝图｜节点蓝图｜复合蓝图
 * @param param0
 * @returns
 */
export function useOnEnter({
  save,
  init,
  state,
  nodes,
  selectedIds,
}: {
  nodes: Node<RikoScript>[];
  selectedIds: string[];
  init: ReturnType<typeof useOnInit>;
  save: ReturnType<typeof useOnSave>;
  state: IState;
}) {
  const { getState, dispatch } = useStore<EditorState>();
  const { onEditComponent } = useOnEditComponent();

  const node = nodes.find(node => node.id === selectedIds[0]);
  const canOnEnter = useMemo(() => {
    return (
      selectedIds.length === 1 &&
      node &&
      node.type !== 'root' &&
      (node.data.editor?.nodeType === 'scene' ||
        node.data.editor?.nodeType === 'node' ||
        node.data.editor?.nodeType === 'component')
    );
  }, [node, selectedIds.length]);

  const onEnter = usePersistCallback(() => {
    const { data: script } = node!;
    switch (script.editor?.nodeType) {
      case 'node': {
        const node = getParentOfRootBlueprint(script, getState);
        if (node) {
          if (isAnimation(node.type)) {
            const { props } = getScene(getState().project);
            const url = props[node.id].url;
            if (url) {
              save();
              init(null);
              onEditComponent(url, true).then(() => {
                const scene = getScene(getState().project);
                init({ type: 'Scene', id: scene.id });
              });
              return;
            }
          }
          dispatch(selectNode([node.id]));
          save();
          init({ type: 'Node', id: node.id });
        }
        break;
      }

      case 'scene': {
        const scene = getParentOfRootBlueprint(script, getState);
        if (scene) {
          dispatch(changeEditor(0, { selectedSceneId: scene.id }));
          save();
          init({ type: 'Scene', id: scene.id });
        }
        break;
      }

      case 'component': {
        save();
        /**
         * 复合蓝图节点的修改通过parent字段来复用节点和场景的修改逻辑
         */
        init({ type: 'Script', id: script.id, parent: getParentState(state) });
        break;
      }
    }
  });
  return {
    canOnEnter,
    onEnter,
  };
}

function getParentState(state: IState): IState {
  while (state?.parent) {
    state = getParentState(state.parent);
  }
  return state;
}
