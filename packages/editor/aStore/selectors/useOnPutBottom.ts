import { useCallback } from 'react';
import { shallowEqual, useSelector, useStore } from 'react-redux';
import { findById, getScene, getSelectedIds } from '../../utils';
import { useOnDropNodes } from './useDropNodes';

const canPutWhere = (state: EditorState, oneStep = false) => {
  const {
    editor: { selected },
    nodes,
  } = getScene(state.project);
  const { scriptIds, nodeIds } = getSelectedIds(selected);
  if (scriptIds.length || !nodeIds.length) {
    return { canPutBottom: 0, canPutTop: 0 };
  }
  const siblings = findById(nodes, nodeIds[0])[1]?.nodes || nodes;
  const afterId = () => {
    let canPutTop = siblings.length - 1;
    while (canPutTop && nodeIds.includes(siblings[canPutTop].id)) {
      canPutTop--;
    }
    if (!siblings.slice(0, canPutTop).some(({ id }) => nodeIds.includes(id))) {
      return 0;
    }
    if (canPutTop === siblings.length - 1) {
      while (oneStep && !nodeIds.includes(siblings[canPutTop - 1].id)) {
        canPutTop--;
      }
    }
    return siblings[canPutTop].id;
  };
  const beforeId = () => {
    let canPutBottom = 0;
    while (canPutBottom < siblings.length && nodeIds.includes(siblings[canPutBottom].id)) {
      canPutBottom++;
    }
    if (!siblings.slice(canPutBottom).some(({ id }) => nodeIds.includes(id))) {
      return 0;
    }
    if (canPutBottom === 0) {
      while (oneStep && !nodeIds.includes(siblings[canPutBottom + 1].id)) {
        canPutBottom++;
      }
    }
    return siblings[canPutBottom].id;
  };
  return { canPutTop: afterId(), canPutBottom: beforeId() };
};

export const useOnPutBottom = () => {
  const { getState } = useStore<EditorState, EditorAction>();
  const { onDropNodes } = useOnDropNodes();
  return {
    ...useSelector(canPutWhere, shallowEqual),
    onPutBottom: useCallback(
      (oneStep = false) => {
        const { canPutBottom } = canPutWhere(getState(), oneStep);
        if (canPutBottom) {
          onDropNodes(canPutBottom, 'before');
        }
      },
      [getState, onDropNodes]
    ),
    onPutTop: useCallback(
      (oneStep = false) => {
        const { canPutTop } = canPutWhere(getState(), oneStep);
        if (canPutTop) {
          onDropNodes(canPutTop, 'after');
        }
      },
      [getState, onDropNodes]
    ),
  };
};
