import { ScaleAction, ActionType } from '@byted/riko';
import { ICaseState } from '../types';

export const CHANGE_CANVAS_SCALE = ActionType.Scale;

// action 创建函数
export const changeCanvasScale = (scale: number, setCenter?: boolean): ScaleAction => {
  return { type: CHANGE_CANVAS_SCALE, scale, setCenter, playing: true } as any;
};

// action 处理函数
export default (state: ICaseState, action: ScaleAction) => {
  if (action.type === CHANGE_CANVAS_SCALE) {
    return {
      ...state,
      editor: {
        ...state.editor,
        canvasScale: action.scale,
        editorTaskStack: state.editor.editorTaskStack.concat(action),
      },
    };
  }
  return state;
};
