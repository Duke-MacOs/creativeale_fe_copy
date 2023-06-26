import { ActionType } from '@byted/riko';
import { IEditorPropertyAction } from '..';
import { ICaseState } from '../types';

export default (state: ICaseState, action: IEditorPropertyAction): ICaseState => {
  if (action.type === ActionType.EditorProperty) {
    if (action.nodeId === 0) {
      return {
        ...state,
        editor: {
          ...state.editor,
          ...action.partial,
        },
      };
    }
    if (action.nodeId === state.editor.selectedSceneId) {
      return state;
    }
    const found = state.scenes.find(scene => scene.id === action.nodeId);
    if (found) {
      return {
        ...state,
        scenes: state.scenes.map(scene =>
          scene !== found ? scene : { ...scene, editor: { ...scene.editor, ...action.partial } }
        ),
      };
    }
  }
  return state;
};
