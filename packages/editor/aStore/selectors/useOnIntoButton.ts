import { useCallback } from 'react';
import { useStore, useSelector } from 'react-redux';
import { groupActions, delNode, addFromNode, selectNode } from '../project';
import { findById, getScene, getSelectedIds, intoNodes, newID } from '../../utils';
import { createNode } from '@byted/riko';

const canIntoButton = ({ project }: EditorState): boolean => {
  if (project.settings.typeOfPlay !== 0) {
    return false;
  }
  const {
    editor: { selected },
    props,
  } = getScene(project);
  const { nodeIds } = getSelectedIds(selected);
  return nodeIds.length === 1 && props[nodeIds[0]].type === 'Sprite';
};
export const useOnIntoButton = () => {
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  return {
    canIntoButton: useSelector(canIntoButton),
    onIntoButton: useCallback(async () => {
      if (canIntoButton(getState())) {
        const {
          id,
          editor: { selected },
          nodes,
          props,
        } = getScene(getState().project);
        const [nodeId] = Object.keys(selected).map(Number);
        const [{ nodes: children }, { id: parentId, nodes: siblings } = { id, nodes }] = findById(nodes, nodeId);
        const newNode = await createNode(props[nodeId].name!, 'Button', newID, props[nodeId].url as string);

        dispatch(
          groupActions([
            delNode(nodeId),
            addFromNode(
              parentId,
              siblings.findIndex(({ id }) => id === nodeId),
              { ...newNode, props: { ...newNode.props, ...props[nodeId] }, nodes: intoNodes(children, props) }
            ),
          ])
        );
        dispatch(selectNode([newNode.id]));
      }
    }, [dispatch, getState]),
  };
};
