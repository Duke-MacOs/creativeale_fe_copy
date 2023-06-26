/* eslint-disable @typescript-eslint/no-unused-vars */
import { getPanoramaDataList, updatePanoramaDataList } from '@editor/utils';
import { ICaseState, IPanoramaData } from '../types';

export const UPDATE_PANORAMA_VIEWER = Symbol('UpdatePanoramaViewer');

// action 创建函数
export const updatePanoramaData = (id: number, props: Record<string, any>) => {
  return { type: UPDATE_PANORAMA_VIEWER, id, props };
};

// action 处理函数
export default function reducer(
  state: ICaseState,
  { type, id, props }: ReturnType<typeof updatePanoramaData>
): ICaseState {
  if (type === UPDATE_PANORAMA_VIEWER) {
    return updatePanoramaDataList(
      state,
      getPanoramaDataList(state).map(p => {
        return p.id === id
          ? {
              ...p,
              ...props,
            }
          : p;
      })
    );
  }
  return state;
}
