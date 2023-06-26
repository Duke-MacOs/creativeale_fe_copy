import { ICaseState } from '../types';

const UPDATE_LAYER_NAME = Symbol('UpdateLayerName');

// action 创建函数
export const updateLayerName = (idx: number, value: { key: string; name: string }) => {
  return { type: UPDATE_LAYER_NAME, idx, value };
};

// action 处理函数
export default function reducer(
  state: ICaseState,
  { type, idx, value }: ReturnType<typeof updateLayerName>
): ICaseState {
  if (type === UPDATE_LAYER_NAME) {
    const nameList = [...(state.settings.layerCollisionName ?? [])];
    nameList.splice(idx, 1, value);
    return {
      ...state,
      settings: {
        ...state.settings,
        layerCollisionName: nameList,
      },
    };
  }

  return state;
}
