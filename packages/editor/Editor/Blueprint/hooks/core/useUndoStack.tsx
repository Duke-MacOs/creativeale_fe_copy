import { useCallback, useRef } from 'react';
import { ActionFlag, IAction } from '../../types';

export function useUndoStack() {
  const undoStack = useRef<IAction[]>([]);

  const pushUndo = useCallback((action: IAction) => {
    undoStack.current.push(action);
  }, []);

  const popUndo = useCallback((): { action: IAction; flag: ActionFlag } | undefined => {
    if (undoStack.current.length) {
      const action = undoStack.current.pop()!;
      return { action, flag: 'redo' };
    }
  }, []);

  const clearUndoStack = useCallback(() => {
    undoStack.current = [];
  }, []);

  return {
    clearUndoStack,
    pushUndo,
    popUndo,
    length: undoStack.current.length,
  };
}
