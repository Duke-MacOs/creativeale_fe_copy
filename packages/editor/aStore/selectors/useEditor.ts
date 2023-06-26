import { useCallback } from 'react';
import { shallowEqual, useDispatch, useSelector, useStore } from 'react-redux';
import { findById, getScene } from '@editor/utils';
import { changeEditor, ICaseState, INodeState, ISceneState } from '../project';

export type UseEditor<E, K extends keyof E> = Pick<E, K> & { onChange(value: E[K], playing?: boolean): void };

export function useEditor<K extends keyof ISceneState['editor']>(key: K): UseEditor<ISceneState['editor'], K>;
export function useEditor<K extends keyof ICaseState['editor']>(id: 0, key: K): UseEditor<ICaseState['editor'], K>;
export function useEditor<K extends keyof Required<INodeState>['editor']>(
  id: number,
  key: K
): UseEditor<Required<INodeState>['editor'], K>;
export function useEditor(idOrKey: any, orKey?: any): any {
  const key = orKey || idOrKey;
  const value = useSelector(({ project }: EditorState) => {
    if (idOrKey === 0) {
      return (project.editor as any)[key];
    }
    const { nodes, editor } = getScene(project);
    if (idOrKey === key) {
      return (editor as any)[key];
    }
    return ((findById(nodes, idOrKey)[0].editor as any) || {})[key];
  }, shallowEqual);
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  return {
    [key]: value,
    onChange: useCallback(
      (value: any, playing = false) => {
        const {
          editor: { selectedSceneId },
        } = getState().project;
        dispatch(changeEditor(orKey ? idOrKey : selectedSceneId, { [key]: value }, playing));
      },
      [dispatch, getState, idOrKey, key, orKey]
    ),
  };
}
export const useOnChangeEditor = () => {
  const dispatch = useDispatch<EditorDispatch>();
  return useCallback(
    (id: number, partial: Record<string, unknown>, playing = false) => {
      dispatch(changeEditor(id, partial, playing));
    },
    [dispatch]
  );
};
export const useEditorCount = () => {
  const count = useSelector(({ project }: EditorState) => project.editor.count);
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  return {
    count,
    onChangeCount: useCallback(
      (timeMin: number, spaceMin: number) => {
        const {
          editor: { count },
        } = getState().project;
        if (count < spaceMin || count > timeMin + spaceMin + 20 || count < timeMin + spaceMin * 0.382) {
          const nextCount = Math.ceil(Math.max(timeMin + spaceMin * 0.618, spaceMin) / 10) * 10;
          dispatch(changeEditor(0, { count: Math.min(nextCount, 1200) }, true));
        }
      },
      [dispatch, getState]
    ),
  };
};
