/* eslint-disable @typescript-eslint/no-unused-vars */
import { ICaseState, ITexture2D } from '../types';

export const ADD_TEXTURE2D = Symbol('AddTexture2D');

// action 创建函数
export const addTexture2D = (texture2D: ITexture2D) => {
  return { type: ADD_TEXTURE2D, texture2D };
};

const add = (state: ICaseState, texture2D: ITexture2D): ICaseState => {
  return {
    ...state,
    editor: {
      ...state.editor,
      prevState: state.editor.prevState ? add(state.editor.prevState, texture2D) : undefined,
    },
    texture2Ds: [texture2D, ...state.texture2Ds],
  };
};

// action 处理函数
export default function reducer(state: ICaseState, { type, texture2D }: ReturnType<typeof addTexture2D>): ICaseState {
  if (type === ADD_TEXTURE2D) {
    return add(state, texture2D);
  }
  return state;
}
