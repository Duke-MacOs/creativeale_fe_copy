import { ActionFlag } from '@byted/riko';
import { useCallback } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { undoAction } from '../project';
import { getScene, onMacOS } from '../../utils';
import { useEditorHotkeys } from './useHotKeys';

export const useOnUndo = () => {
  const dispatch = useDispatch<EditorDispatch>();
  const canUndo = useSelector(
    ({ project }: EditorState) =>
      getScene(project).history.undoStack.some(({ undo, flag }: any) => undo && flag !== ActionFlag.SideEffect),
    shallowEqual
  );
  const onUndo = useCallback(() => {
    dispatch(undoAction());
  }, [dispatch]);

  useEditorHotkeys(`${onMacOS('command', 'control')}+z`, onUndo);
  return {
    canUndo,
    onUndo,
  };
};
