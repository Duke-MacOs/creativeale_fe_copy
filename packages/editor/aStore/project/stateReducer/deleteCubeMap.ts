/* eslint-disable @typescript-eslint/no-unused-vars */
import { getCubemaps } from '@editor/utils';
import { ICaseState } from '../types';

export const Delete_CUBEMAP = Symbol('DeleteCubeMap');

// action 创建函数
export const deleteCubemap = (id?: number) => {
  return { type: Delete_CUBEMAP, id };
};

const update = (state: ICaseState, id?: number): ICaseState => {
  if (state.editor.prevState) {
    return {
      ...state,
      editor: {
        ...state.editor,
        prevState: update(state.editor.prevState, id),
      },
    };
  }
  return {
    ...state,
    cubemaps: id ? state.cubemaps.filter(cube => cube.id !== id) : [],
  };
};

// action 处理函数
export default function reducer(
  state: ICaseState,
  { type, id: deleteId }: ReturnType<typeof deleteCubemap>
): ICaseState {
  if (type === Delete_CUBEMAP) {
    return update(state, deleteId);
  }
  return state;
}
