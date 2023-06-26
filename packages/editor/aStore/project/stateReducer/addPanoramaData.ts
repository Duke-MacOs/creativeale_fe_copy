/* eslint-disable @typescript-eslint/no-unused-vars */
import { ICaseState, IPanoramaData } from '../types';

export const ADD_PANORAMA_VIEWER = Symbol('AddPanoramaViewer');

// action 创建函数
export const addPanoramaViewer = (panoramaData: IPanoramaData) => {
  return { type: ADD_PANORAMA_VIEWER, panoramaData };
};

const updateState = (state: ICaseState, panoramaData: IPanoramaData): ICaseState => {
  if (state.panoramaDataList) {
    return {
      ...state,
      panoramaDataList: [panoramaData, ...state.panoramaDataList],
    };
  }
  return {
    ...state,
    editor: {
      ...state.editor,
      prevState: state.editor.prevState ? updateState(state.editor.prevState, panoramaData) : undefined,
    },
  };
};

// action 处理函数
export default function reducer(
  state: ICaseState,
  { type, panoramaData }: ReturnType<typeof addPanoramaViewer>
): ICaseState {
  if (type === ADD_PANORAMA_VIEWER) {
    return updateState(state, panoramaData);
  }
  return state;
}
