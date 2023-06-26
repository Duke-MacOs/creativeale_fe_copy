import { useCallback, useRef } from 'react';
import { ActionFlag, IAction } from '../../types';

export function useRedoStack() {
  const redoStack = useRef<IAction[]>([]);

  const pushRedo = useCallback((action: IAction) => {
    redoStack.current.push(action);
  }, []);

  const popRedo = useCallback((): { action: IAction; flag: ActionFlag } | undefined => {
    if (redoStack.current.length) {
      const action = redoStack.current.pop()!;
      return {
        action,
        flag: 'undo',
      };
    }
  }, []);

  const clearRedoStack = useCallback(() => {
    redoStack.current = [];
  }, []);

  return {
    clearRedoStack,
    pushRedo,
    popRedo,
    length: redoStack.current.length,
  };
}
