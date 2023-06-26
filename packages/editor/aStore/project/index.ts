import { ActionType, Action } from '@byted/riko';
import sceneReducer, { SceneReducerAction } from './sceneReducer';
import stateReducer, { StateReducerAction } from './stateReducer';
import { ICaseState, ISceneState } from './types';
import { newCase, newScene } from './utils';
import { getScene } from '@editor/utils';
export * from './sceneReducer';
export * from './stateReducer';
export * from './utils';
export * from './types';
const RESTORE_ACTION = 'RestoreState' as const;
const caseState = newCase([newScene('加载场景', { loading: true }), newScene('主场景')], 'Project');
export const restoreState = (state: ICaseState) => ({ type: RESTORE_ACTION, state });
export type EditorAction = SceneReducerAction | StateReducerAction | ReturnType<typeof restoreState>;

const getPrevState = (
  { selectedSceneId, prevState, canvasScale, playRate, soundVolume, count }: ICaseState['editor'],
  { selected, scale, moment }: ISceneState['editor']
) => {
  if (!prevState || prevState.editor.playing) {
    throw new Error("Project's preState is corrupted!");
  }
  return {
    ...prevState,
    editor: {
      ...prevState.editor,
      selectedSceneId,
      canvasScale,
      soundVolume,
      playRate,
      count,
    },
    scenes: prevState.scenes.map(scene => {
      if (scene.id !== selectedSceneId) {
        return scene;
      }
      return {
        ...scene,
        editor: {
          ...scene.editor,
          selected,
          moment,
          scale,
        },
      };
    }),
  };
};
export default function reducer(state = caseState, action: EditorAction): ICaseState {
  if (action.type === RESTORE_ACTION) {
    return action.state;
  }
  if (state.editor.playing && !(action as Action).playing) {
    return reducer(getPrevState(state.editor, getScene(state).editor), action);
  }
  const newCase = stateReducer(state, action);
  if (newCase !== state) {
    return newCase;
  }
  const {
    editor: { selectedSceneId },
    scenes: { length },
  } = state;
  const index = state.scenes.findIndex(({ id }) => id === selectedSceneId);
  for (let i = 0; i < length; i++) {
    const oldScene = state.scenes[(i + index + length) % length];
    const newScene = sceneReducer(oldScene, action);
    if (newScene !== oldScene) {
      const newState = {
        ...state,
        scenes: state.scenes.map(scene => (scene.id === oldScene.id ? newScene : scene)),
      };
      if (action.type === ActionType.Select && state.editor.settingsOn) {
        newState.editor = {
          ...newState.editor,
          settingsOn: false,
        };
      }
      if (action.type === ActionType.Select && state.editor.panoramaEdit.type) {
        newState.editor = {
          ...newState.editor,
          panoramaEdit: {
            ...state.editor.panoramaEdit,
            type: undefined,
          },
        };
      }
      return newState;
    }
  }
  return state;
}
