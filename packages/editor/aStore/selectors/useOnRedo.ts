import { ActionFlag } from '@byted/riko';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { redoAction } from '../project';
import { getScene, onMacOS } from '../../utils';
import { useEditorHotkeys } from './useHotKeys';
export const useOnRedo = () => {
  const dispatch = useDispatch<EditorDispatch>();
  const redoSteps = useSelector(
    ({ project }: EditorState) =>
      getScene(project).history.redoStack.filter(({ flag }: any) => flag !== ActionFlag.Continuous).length
  );
  const onRedo = useCallback(() => {
    dispatch(redoAction());
  }, [dispatch]);

  useEditorHotkeys(`${onMacOS('command', 'control')}+shift+z`, onRedo);
  return {
    redoSteps,
    onRedo,
  };
};
