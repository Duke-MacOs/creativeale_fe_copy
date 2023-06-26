/* eslint-disable @typescript-eslint/no-unused-vars */
import { ICaseState, ICubemap } from '../types';

export const ADD_CUBEMAP = Symbol('AddCubemap');

// action 创建函数
export const addCubeMap = (cubemap: ICubemap) => {
  return { type: ADD_CUBEMAP, cubemap };
};

const update = (state: ICaseState, cubemap: ICubemap): ICaseState => {
  if (state.editor.prevState) {
    return {
      ...state,
      editor: {
        ...state.editor,
        prevState: update(state.editor.prevState, cubemap),
      },
    };
  }
  return {
    ...state,
    cubemaps: [cubemap, ...state.cubemaps],
  };
};

// action 处理函数
export default function reducer(state: ICaseState, { type, cubemap }: ReturnType<typeof addCubeMap>): ICaseState {
  if (type === ADD_CUBEMAP) {
    return update(state, cubemap);
  }
  return state;
}
