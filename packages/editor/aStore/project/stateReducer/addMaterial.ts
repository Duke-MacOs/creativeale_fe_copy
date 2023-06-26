import { ICaseState, IMaterialState } from '../types';

export const ADD_MATERIAL = Symbol('AddMaterial');

// action 创建函数
export const addMaterial = (material: IMaterialState) => {
  return { type: ADD_MATERIAL, material };
};

// action 处理函数
export default function reducer(state: ICaseState, { type, material }: ReturnType<typeof addMaterial>): ICaseState {
  if (type === ADD_MATERIAL) {
    if (state.type === 'Project') {
      return {
        ...state,
        materials: [material, ...state.materials],
      };
    }
    return {
      ...state,
      materials: [material, ...state.materials],
      editor: {
        ...state.editor,
        prevState: reducer(state.editor.prevState!, { type, material }),
      },
    };
  }
  return state;
}
