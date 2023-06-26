import { useStore } from 'react-redux';
import { restoreState } from '@editor/aStore';
import { useForceSceneReload } from '@editor/Preview';
import { usePropsMode } from '@editor/Editor/Header/views/SceneModeSelect';

export const useReplaceAll = (targetUrl: string | number) => {
  const { propsMode } = usePropsMode();
  const loadScene = useForceSceneReload();
  const { dispatch, getState } = useStore<EditorState>();

  return (sourceUrl: string | number) => {
    const excludeMid = targetUrl.toString().split('?').shift();
    if (propsMode === 'Product') {
      const project = getState().project;
      dispatch(
        restoreState({
          ...project,
          scenes: project.scenes.map(scene => (scene.type === 'Scene' ? replace(scene) : scene)),
        })
      );
    } else {
      dispatch(restoreState(replace(getState().project)));
      // 强制画布更新
    }
    loadScene();

    function replace(state: any) {
      return JSON.parse(
        JSON.stringify(state).replaceAll(`${targetUrl}`, `${sourceUrl}`).replaceAll(`${excludeMid}`, `${sourceUrl}`)
      );
    }
  };
};
