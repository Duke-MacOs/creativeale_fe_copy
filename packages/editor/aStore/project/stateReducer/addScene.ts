import { ICaseState, ISceneState } from '../types';

export const ADD_SCENE = Symbol('AddScene');

// action 创建函数
export const addScene = (scene: ISceneState, index: number) => {
  return { type: ADD_SCENE, scene, index };
};

// action 处理函数
export default (state: ICaseState, { type, scene, index }: ReturnType<typeof addScene>): ICaseState => {
  if (type === ADD_SCENE) {
    return {
      ...state,
      editor:
        scene.type !== 'Animation'
          ? {
              ...state.editor,
              selectedSceneId: scene.id,
            }
          : state.editor,
      scenes: [...state.scenes.slice(0, index), scene, ...state.scenes.slice(index)],
    };
  }
  return state;
};
