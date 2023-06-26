import { ICaseState } from '../types';

export const Update_CUBEMAP = Symbol('UpdateCubeMap');

// action 创建函数
export const updateCubemap = (orderId: number, props: Record<string, any>) => {
  return { type: Update_CUBEMAP, orderId, props };
};

// action 处理函数
export default function reducer(
  state: ICaseState,
  { type, orderId, props }: ReturnType<typeof updateCubemap>
): ICaseState {
  if (type === Update_CUBEMAP) {
    if (state.type === 'Project') {
      const cubemap = state.cubemaps.find(i => i.orderId === orderId);
      console.log('!:', cubemap, props);
      if (cubemap) {
        cubemap.props = {
          ...cubemap.props,
          ...props,
        };
      }
      return {
        ...state,
        cubemaps: state.cubemaps,
      };
    }
  }
  return state;
}
