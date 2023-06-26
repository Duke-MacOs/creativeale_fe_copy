import { neverThrow } from '@editor/utils';
import { useCallback } from 'react';
import { ActionFlag, IAction } from '../../types';

/**
 * 取出undoStack或redoStack内的action并执行
 * @param param0
 * @returns
 */
export function useOnDispatch({
  addEdges,
  addNodes,
  removeEdges,
  removeNodes,
  addSignal,
  removeSignal,
  popUndo,
  popRedo,
}: any) {
  return useCallback(
    (flag: ActionFlag) => {
      const payload = (flag === 'undo' ? popUndo() : popRedo()) as { action: IAction; flag: ActionFlag } | undefined;
      if (payload) {
        const { action, flag } = payload;
        switch (action.type) {
          case 'addNodes': {
            return addNodes(action.data, false, flag);
          }

          case 'removeNodes': {
            return removeNodes(action.data, flag);
          }

          case 'addEdges': {
            return addEdges(action.data, flag);
          }

          case 'removeEdges': {
            return removeEdges(action.data, flag);
          }

          case 'addSignal': {
            return addSignal(action.data, flag);
          }

          case 'removeSignal': {
            return removeSignal(action.data, flag);
          }
          default: {
            return neverThrow(action);
          }
        }
      }
    },
    [addEdges, addNodes, addSignal, popRedo, popUndo, removeEdges, removeNodes, removeSignal]
  );
}
