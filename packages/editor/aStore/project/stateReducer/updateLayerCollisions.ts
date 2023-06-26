import { ICaseState } from '../types';

const UPDATE_LAYER_COLLISIONS = Symbol('UpdateLayerCollisions');

// action 创建函数
export const updateLayerCollisions = (key: number | string, value: number[]) => {
  return { type: UPDATE_LAYER_COLLISIONS, key, value };
};

// action 处理函数
export default function reducer(
  state: ICaseState,
  { type, key, value }: ReturnType<typeof updateLayerCollisions>
): ICaseState {
  if (type === UPDATE_LAYER_COLLISIONS) {
    const collisions = { ...(state.settings.layerCollisions ?? {}) };
    collisions[`${key}`] = value;
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
