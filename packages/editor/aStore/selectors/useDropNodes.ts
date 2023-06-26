import { useCallback } from 'react';
import { useStore } from 'react-redux';
import { groupActions, moveNode } from '../project';
import { findById, getScene, sortedNodes } from '../../utils';

export const useOnDropNodes = () => {
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  return {
    isDroppable: useCallback(
      (targetId: number, position: 'inside' | 'after' | 'before', type: 'node' | 'resource' | 'undefined') => {
        const {
          editor: { selected },
          id: sceneId,
          nodes,
        } = getScene(getState().project);
        if (type === 'node') {
          if (findById(nodes, targetId).some(({ id }) => id in selected)) {
            return false;
          }
          for (const id of Object.keys(selected)) {
            for (const node of findById(nodes, Number(id))) {
              if (node.id === sceneId) {
                if (node.id === targetId) {
                  return position === 'inside';
                }
                if (!findById(node.nodes, targetId).length) {
                  return false;
                }
                break;
              }
            }
            break;
          }
        } else if (findById(nodes, targetId)[0]?.id === sceneId) {
          return position === 'inside';
        }
        return true;
      },
      [getState]
    ),
    onDropNodes: useCallback(
      (targetId: number, dropWhere: 'inside' | 'before' | 'after', ids?: number[]) => {
        const scene = getScene(getState().project);
        const nodeIds = sortedNodes(scene.nodes, ids ?? Object.keys(scene.editor.selected).map(Number)).map(
          ({ id }) => id
        );
        const parents = findById(scene.nodes, targetId);
        if (parents.some(({ id }) => nodeIds.includes(id))) {
          throw new Error('Should not drop parent into children.');
        }
        const [node, parent = scene] = parents;
        if (dropWhere === 'inside') {
          if (!node.nodes.some(({ id }) => nodeIds.includes(id))) {
            dispatch(groupActions(nodeIds.map((id, index) => moveNode(id, targetId, node.nodes.length + index))));
          } else {
            dispatch(groupActions(nodeIds.map(id => moveNode(id, targetId, node.nodes.length - 1))));
          }
        } else {
          const { id: parentId, nodes } = parent;
          const startIndex = nodes.findIndex(({ id }) => id === targetId) + Number(dropWhere === 'after');
          const startIds = nodes.slice(0, startIndex).map(({ id }) => id);
          let offset = 0;
          dispatch(
            groupActions(
              nodeIds.map((id, index) =>
                moveNode(id, parentId, startIndex + index - (startIds.includes(id) ? ++offset : offset))
              )
            )
          );
        }
      },
      [dispatch, getState]
    ),
  };
};
