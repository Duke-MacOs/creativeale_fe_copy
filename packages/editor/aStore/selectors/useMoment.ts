import { useCallback } from 'react';
import { useStore, useSelector } from 'react-redux';
import { getScene } from '@editor/utils';
import { changeMoment } from '../project';

export const useMoment = (max?: number) => {
  const moment = useSelector(({ project }: EditorState) => {
    const { moment } = getScene(project).editor;
    return max ? Math.min(moment ?? 0, max) : moment;
  });
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  return {
    moment,
    onChange: useCallback(
      (moment: number) => {
        const {
          editor: { count },
        } = getState().project;
        const {
          editor: { scale },
        } = getScene(getState().project);
        dispatch(changeMoment(Math.max(Math.min(moment, count * scale), 0)));
      },
      [dispatch, getState]
    ),
  };
};
