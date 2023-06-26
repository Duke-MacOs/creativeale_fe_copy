/* eslint-disable @typescript-eslint/no-unused-vars */
import { ICaseState, ISceneState } from '../types';

export const ADD_COMPONENT = Symbol('AddComponent');

// action 创建函数
export const addComponent = (component: ISceneState) => {
  return { type: ADD_COMPONENT, component };
};

const addPanoramaComp = (state: ICaseState, comp: ISceneState, level = 0): ICaseState => {
  if (!state.editor.prevState) {
    return {
      ...state,
      scenes: [comp, ...state.scenes],
    };
  }
  return {
    ...state,
    editor: {
      ...state.editor,
      prevState: addPanoramaComp(state.editor.prevState, comp, level + 1),
    },
    scenes: [comp, ...state.scenes],
  };
};

// action 处理函数
export default function reducer(state: ICaseState, { type, component }: ReturnType<typeof addComponent>): ICaseState {
  if (type === ADD_COMPONENT) {
    if (state.type === 'Project') {
      return {
        ...state,
        scenes: [component, ...state.scenes],
      };
    }
    if (state.type === 'PanoramaData' && component.editor.isOpen === false) {
      return addPanoramaComp(state, component);
    }
    return {
      ...state,
      editor: {
        ...state.editor,
        prevState: reducer(state.editor.prevState!, { type, component }),
      },
    };
  }
  return state;
}
