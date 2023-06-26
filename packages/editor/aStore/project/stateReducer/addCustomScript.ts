import { ICaseState, ICustomScriptState } from '../types';

export const ADD_CUSTOM_SCRIPT = Symbol('AddCustomScript');

// action 创建函数
export const addCustomScript = (script: ICustomScriptState) => {
  return { type: ADD_CUSTOM_SCRIPT, script };
};

// action 处理函数
export default function reducer(state: ICaseState, { type, script }: ReturnType<typeof addCustomScript>): ICaseState {
  if (type === ADD_CUSTOM_SCRIPT) {
    if (state.type === 'Project') {
      return {
        ...state,
        customScripts: [script, ...state.customScripts],
      };
    }
    return {
      ...state,
      editor: {
        ...state.editor,
        prevState: reducer(state.editor.prevState!, { type, script }),
      },
    };
  }
  return state;
}
