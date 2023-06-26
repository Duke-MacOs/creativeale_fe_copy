import { useCallback } from 'react';
import { useStore, useSelector } from 'react-redux';
import { joinGroup, splitGroup } from '@editor/aStore';
import { findById, getScene, newID } from '@editor/utils';
export { ReactComponent as SplitGroupIcon } from './split.svg';
export { ReactComponent as JoinGroupIcon } from './join.svg';
const canJoinGroup = (state: EditorState) => {
  const {
    editor: { selected },
  } = getScene(state.project);
  const nodeIds = Object.keys(selected).map(Number);
  return nodeIds.length > 0;
};
const canSplitGroup = (state: EditorState) => {
  const {
    editor: { selected },
    nodes,
  } = getScene(state.project);
  const nodeIds = Object.keys(selected).map(Number);
  const selectedNode = findById(nodes, nodeIds[0])[0];
  return nodeIds.length === 1 && !selected[nodeIds[0]].length && selectedNode?.nodes.length > 0;
};
export const useGrouping = () => {
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  return {
    canSplitGroup: useSelector(canSplitGroup),
    canJoinGroup: useSelector(canJoinGroup),
    onJoinGroup: useCallback(() => {
      if (canJoinGroup(getState())) {
        const {
          editor: { selected },
        } = getScene(getState().project);
        dispatch(joinGroup(newID(), Object.keys(selected).map(Number)));
        return true;
      }
      return false;
    }, [dispatch, getState]),
    onSplitGroup: useCallback(() => {
      if (canSplitGroup(getState())) {
        const {
          editor: { selected },
        } = getScene(getState().project);
        dispatch(splitGroup(Object.keys(selected).map(Number)[0]));
        return true;
      }
      return false;
    }, [dispatch, getState]),
  };
};
