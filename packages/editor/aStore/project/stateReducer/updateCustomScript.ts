import { ICaseState } from '../types';

export const UPDATE_CUSTOM_SCRIPT = Symbol('UpdateCustomScript');

// action 创建函数
export const updateCustomScript = (id: number, partial: Record<string, any>) => {
  return { type: UPDATE_CUSTOM_SCRIPT, id, partial };
};

// action 处理函数
export default function reducer(
  state: ICaseState,
  { type, id: updateId, partial }: ReturnType<typeof updateCustomScript>
): ICaseState {
  if (type === UPDATE_CUSTOM_SCRIPT) {
    if (state.type === 'Project') {
      const customScripts = state.customScripts.map(script =>
        script.id === updateId ? { ...script, ...partial } : script
      );
      return { ...state, customScripts };
    }
    return {
      ...state,
      editor: {
        ...state.editor,
        prevState: reducer(state.editor.prevState!, { type, id: updateId, partial }),
      },
    };
  }
  return state;
}
