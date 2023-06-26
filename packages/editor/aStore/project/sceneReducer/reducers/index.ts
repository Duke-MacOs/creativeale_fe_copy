import { ActionFlag, ActionType, GroupAction } from '@byted/riko';
import { ISceneState } from '../../types';
import changeMoment from './changeMoment';
import changeEditor from './changeEditor';
import selectByIds from './selectByIds';
import changeProps from './changeProps';
import setOpenKeys from './setOpenKeys';
import deleteById from './deleteById';
import addScript from './addScript';
import moveNode from './moveNode';
import addState from './addState';
import deleteState from './deleteState';
import addNode from './addNode';
import { isAnimation } from '@editor/utils';

export * from './changeEditor';
export * from './changeMoment';
export * from './setOpenKeys';
export * from './selectByIds';
export * from './changeProps';
export * from './deleteById';
export * from './addScript';
export * from './moveNode';
export * from './addState';
export * from './deleteState';
export * from './addNode';
export * from './utils';

const reducers = [
  changeMoment,
  changeEditor,
  selectByIds,
  changeProps,
  addState,
  deleteState,
  addScript,
  moveNode,
  addNode,
  deleteById,
  setOpenKeys,
];

export type SceneAction = Parameters<(typeof reducers)[number]>[1] | GroupAction;

export const groupActions = (actions: SceneAction[], flag?: ActionFlag): GroupAction => ({
  type: ActionType.Group,
  actions: actions as any,
  flag,
});

export default function sceneReducer(scene: ISceneState, action: any): ISceneState {
  if (action.type === ActionType.Group) {
    const acts = action.actions as any[];
    const newScene = acts.reduce((scene, action) => sceneReducer(scene, action), scene);
    action.undo = {
      type: ActionType.Group,
      actions: acts
        .map(action => action.undo)
        .filter(Boolean)
        .reverse(),
    };
    return newScene;
  }
  for (const reducer of reducers) {
    if (isAnimation(scene.type)) {
      const mockScene = { ...scene, nodes: [scene], scripts: [] };
      const newMockScene = reducer(mockScene as ISceneState, action);
      if (newMockScene !== mockScene) {
        const { scripts, nodes } = newMockScene.nodes[0];
        return { ...newMockScene, scripts, nodes };
      }
    }
    const newScene = reducer(scene, action);
    if (newScene !== scene) {
      return newScene;
    }
  }
  return scene;
}
