import { useCallback } from 'react';
import { useStore, useSelector } from 'react-redux';
import { findById, getScene, PVVideoIsSelected } from '@editor/utils';
import { changeEditor, groupActions, INodeState } from '../project';
import isEqual from 'lodash/isEqual';
import { message } from 'antd';

export function useNodesEditor() {
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  const [hiddenStatus, lockedStatus] = useSelector(
    ({ project }: EditorState): [boolean | undefined, boolean | undefined] => {
      const {
        editor: { selected },
        nodes,
      } = getScene(project);
      const nodeIds = Object.keys(selected).map(Number);
      const selectedNodes = nodeIds.map(nodeId => findById(nodes, nodeId)[0]).filter(node => node);
      if (!selectedNodes.length) {
        return [undefined, undefined];
      }
      return [selectedNodes.every(node => node.editor?.isHidden), selectedNodes.every(node => node.editor?.isLocked)];
    },
    isEqual
  );
  return {
    hiddenStatus,
    lockedStatus,
    onChange: useCallback(
      (partial: Partial<NonNullable<INodeState['editor']>>) => {
        if (PVVideoIsSelected(getState)) {
          message.warning('不允许执行该操作');
          return;
        }
        const {
          editor: { selected },
        } = getScene(getState().project);
        const nodeIds = Object.keys(selected).map(Number);
        dispatch(groupActions(nodeIds.map(id => changeEditor(id, partial))));
      },
      [dispatch, getState]
    ),
  };
}
