import { ActionType, ActionFlag, JoinGroupAction, SplitGroupAction, AlignMode } from '@byted/riko';
import sceneReducer, { SceneAction as Action } from './reducers';
import { ISceneState } from '../types';
export * from './reducers';

const FullActions = Array.from(Object.values(ActionType));
const UNDO_ACTION = Symbol('UndoAction');
const REDO_ACTION = Symbol('RedoAction');
export const undoAction = () => ({ type: UNDO_ACTION });
export const redoAction = () => ({ type: REDO_ACTION });
export const alignAction = (align: AlignMode) => ({ type: ActionType.Align as const, align });
export const joinGroup = (parentId: number, childIds: number[]): JoinGroupAction => {
  return {
    type: ActionType.JoinGroup,
    parentId,
    childIds,
  };
};
export const splitGroup = (parentId: number): SplitGroupAction => {
  return {
    type: ActionType.SplitGroup,
    parentId,
  };
};
export type SceneReducerAction =
  | ReturnType<typeof alignAction>
  | ReturnType<typeof undoAction>
  | ReturnType<typeof redoAction>
  | SplitGroupAction
  | JoinGroupAction
  | Action;
export default (scene: ISceneState, action: any): ISceneState => {
  const { redoStack, undoStack } = scene.history;
  if (action.type === UNDO_ACTION) {
    const redoStack = scene.history.redoStack.slice();
    let lastIndex = undoStack.length;
    let newScene = scene;
    let found = false;
    while (lastIndex--) {
      const action = undoStack[lastIndex] as any;
      if (action.undo && action.flag !== ActionFlag.SideEffect) {
        if (found && action.flag !== ActionFlag.Continuous) {
          break;
        } else {
          newScene = sceneReducer(newScene, action.undo);
          redoStack.push(action);
          if (!found && action.flag === ActionFlag.Continuous) {
            break;
          }
          found = true;
        }
      }
    }
    return {
      ...newScene,
      history: {
        undoStack: undoStack.slice(0, lastIndex + 1),
        redoStack,
      },
    };
  }
  if (action.type === REDO_ACTION) {
    let lastIndex = redoStack.length;
    if (!lastIndex) {
      return scene;
    }
    const undoStack = scene.history.undoStack.slice();
    let newScene = scene;
    while (lastIndex) {
      const action = redoStack[--lastIndex] as any;
      newScene = sceneReducer(newScene, action);
      undoStack.push(action);
      if (action.flag !== ActionFlag.Continuous) {
        break;
      }
    }
    return {
      ...newScene,
      history: {
        undoStack,
        redoStack: redoStack.slice(0, lastIndex),
      },
    };
  }
  if ([ActionType.Align, ActionType.SplitGroup, ActionType.JoinGroup].includes(action.type)) {
    return {
      ...scene,
      history: {
        ...scene.history,
        undoStack: undoStack.concat(action),
      },
    };
  }
  const newScene = sceneReducer(scene, action);
  if (newScene !== scene && FullActions.includes(action.type)) {
    if (action.flag === ActionFlag.SideEffect) {
      delete action.undo;
    }
    return {
      ...newScene,
      history: {
        undoStack: action.flag === ActionFlag.EditorOnly ? undoStack : undoStack.concat(action),
        redoStack: action.undo ? [] : redoStack,
      },
    };
  }
  return newScene;
};
