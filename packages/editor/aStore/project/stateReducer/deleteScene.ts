import { ICaseState } from '../types';

export const DELETE_SCENE = Symbol('DeleteScene');

// action 创建函数
export const deleteScene = (id: number) => {
  return { type: DELETE_SCENE, id };
};

// action 处理函数
export default function reducer(state: ICaseState, { type, id: deleteId }: ReturnType<typeof deleteScene>): ICaseState {
  if (type === DELETE_SCENE) {
    if (state.scenes.some(({ id }) => id === deleteId)) {
      const scenes_ = state.scenes.filter(({ type }) => type === 'Scene');
      const scenes = state.scenes.filter(({ id }) => id !== deleteId);
      if (state.editor.selectedSceneId !== deleteId || scenes_.every(({ id }) => id !== deleteId)) {
        return { ...state, scenes };
      }
      const index = scenes_.findIndex(({ id }) => id === deleteId);
      return {
        ...state,
        editor: { ...state.editor, selectedSceneId: scenes_[index === scenes_.length - 1 ? index - 1 : index + 1].id },
        scenes,
      };
    } else if (state.editor.prevState) {
      return {
        ...state,
        editor: { ...state.editor, prevState: reducer(state.editor.prevState, { type, id: deleteId }) },
      };
    }
  }
  return state;
}
