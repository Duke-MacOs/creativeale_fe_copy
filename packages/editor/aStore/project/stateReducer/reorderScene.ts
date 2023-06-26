import { ICaseState } from '../types';
import { arrayMoveImmutable } from 'array-move';

export const REORDER_SCENE = Symbol('ReorderScene');

// action 创建函数
export const reorderScene = (startIndex: number, endIndex: number) => {
  return { type: REORDER_SCENE, startIndex, endIndex };
};

// action 处理函数
export default (state: ICaseState, { type, startIndex, endIndex }: ReturnType<typeof reorderScene>): ICaseState => {
  if (type === REORDER_SCENE) {
    const newScenes = arrayMoveImmutable(state.scenes, startIndex, endIndex);
    return {
      ...state,
      scenes: newScenes,
    };
  }
  return state;
};
