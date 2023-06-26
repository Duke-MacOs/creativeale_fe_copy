import { ICaseState } from '../types';

const DELETE_LAYER_COLLISIONS = Symbol('DeleteLayerCollisions');

// action 创建函数
export const deleteLayerCollisions = (key: number | string) => {
  return { type: DELETE_LAYER_COLLISIONS, key };
};

// action 处理函数
export default function reducer(
  state: ICaseState,
  { type, key }: ReturnType<typeof deleteLayerCollisions>
): ICaseState {
  if (type === DELETE_LAYER_COLLISIONS) {
    const collisions = state.settings.layerCollisions ?? {};
    if (collisions[`${key}`]) delete collisions[`${key}`];
    return {
      ...state,
      settings: {
        ...state.settings,
        layerCollisions: collisions,
      },
    };
  }

  return state;
}
