import { ICaseState } from '../types';

const DELETE_LAYER_NAME = Symbol('UpdateLayerName');

// action 创建函数
export const deleteLayerName = (key: string) => {
  return { type: DELETE_LAYER_NAME, key };
};

// action 处理函数
export default function reducer(
  state: ICaseState,
  { type, key: deleteKey }: ReturnType<typeof deleteLayerName>
): ICaseState {
  if (type === DELETE_LAYER_NAME) {
    const nameList = state.settings.layerCollisionName ?? [];

    return {
      ...state,
      settings: {
        ...state.settings,
        layerCollisionName: nameList.filter(({ key }) => {
          return key !== deleteKey;
        }),
      },
    };
  }

  return state;
}
