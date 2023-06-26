import { ICaseState } from '../types';

export const DELETE_CUSTOM_SCRIPT = Symbol('DeleteCustomScript');

// action 创建函数
export const deleteCustomScript = (id: number) => {
  return { type: DELETE_CUSTOM_SCRIPT, id };
};

// action 处理函数
export default function reducer(
  state: ICaseState,
  { type, id: deleteId }: ReturnType<typeof deleteCustomScript>
): ICaseState {
  if (type === DELETE_CUSTOM_SCRIPT) {
    if (state.customScripts.some(({ id }) => id === deleteId)) {
      const customScripts = state.customScripts.filter(({ id }) => id !== deleteId);
      return { ...state, customScripts };
    } else if (state.editor.prevState) {
      return {
        ...state,
        editor: { ...state.editor, prevState: reducer(state.editor.prevState, { type, id: deleteId }) },
      };
    }
  }
  return state;
}
