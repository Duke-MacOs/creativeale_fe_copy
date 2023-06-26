import { useCallback } from 'react';
import { shallowEqual, useStore, useSelector } from 'react-redux';
import { changeProps, joinGroup } from '../project';
import { getScene, getSelectedIds, newID, sortedNodes } from '../../utils';
const asMaskDisabled = ({ project }: EditorState): { disabled?: boolean; asMask?: boolean; canApplyMask?: boolean } => {
  const {
    editor: { selected },
    props,
  } = getScene(project);
  const { nodeIds, scriptIds } = getSelectedIds(selected);
  if (nodeIds.length === 1) {
    return {
      disabled: false,
      asMask: Boolean(props[nodeIds[0]]?.asMask),
      canApplyMask: false,
    };
  }
  const disabled = scriptIds.length > 0 || nodeIds.length === 0 || nodeIds.some(id => props[id].asMask);
  return {
    disabled,
    asMask: false, // 是否为蒙版
    canApplyMask: !disabled && nodeIds.length > 1, // 能够应用蒙版
  };
};
export const useOnMask = () => {
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  return {
    ...useSelector(asMaskDisabled, shallowEqual),
    onMask: useCallback(() => {
      const {
        editor: { selected },
        nodes,
      } = getScene(getState().project);
      const nodeIds = Object.keys(selected).map(Number);
      const { disabled, asMask, canApplyMask } = asMaskDisabled(getState());
      if (!canApplyMask) {
        dispatch(changeProps(nodeIds, { asMask: !asMask }));
      } else if (!disabled) {
        const [{ id }] = sortedNodes(nodes, nodeIds).slice(-1);
        dispatch(changeProps([id], { asMask: true }));
        dispatch(joinGroup(newID(), nodeIds));
      }
    }, [dispatch, getState]),
  };
};
