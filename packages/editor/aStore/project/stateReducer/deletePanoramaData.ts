import { getPanoramaDataList, updatePanoramaDataList } from '@editor/utils';
import { ICaseState } from '../types';

export const DELETE_PANORAMA_VIEWER = Symbol('DeletePanoramaViewer');

// action 创建函数
export const deletePanoramaViewer = (id?: number) => {
  return { type: DELETE_PANORAMA_VIEWER, id };
};

// action 处理函数
export default function reducer(
  state: ICaseState,
  { type, id: deleteId }: ReturnType<typeof deletePanoramaViewer>
): ICaseState {
  if (type === DELETE_PANORAMA_VIEWER) {
    const panoramaDataList = deleteId ? getPanoramaDataList(state).filter(({ id }) => id !== deleteId) : [];
    return updatePanoramaDataList(state, panoramaDataList);
  }
  return state;
}
