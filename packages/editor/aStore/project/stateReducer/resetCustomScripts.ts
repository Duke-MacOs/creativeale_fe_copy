import { ICaseState, ICustomScriptState } from '../types';

export const RESET_CUSTOM_SCRIPTS = Symbol('ResetCustomScripts');

// action 创建函数
export const resetCustomScripts = (scripts: ICustomScriptState[]) => {
  return { type: RESET_CUSTOM_SCRIPTS, scripts };
};

// action 处理函数
export default function reducer(
  state: ICaseState,
  { type, scripts }: ReturnType<typeof resetCustomScripts>
): ICaseState {
  if (type === RESET_CUSTOM_SCRIPTS) {
    if (state.type === 'Project') {
      return { ...state, customScripts: scripts };
    }
    return {
      ...state,
      editor: {
        ...state.editor,
        prevState: reducer(state.editor.prevState!, { type, scripts }),
      },
    };
  }
  return state;
}
