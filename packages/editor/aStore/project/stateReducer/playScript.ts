import { PlayScriptAction, ActionType } from '@byted/riko';
import { ICaseState } from '../types';

export const PLAY_SCRIPT = ActionType.PlayScript;

// action 创建函数
export const playScript = (data: {
  scriptId?: number;
  script?: { nodeId: number; scriptData: RikoScript };
}): PlayScriptAction => {
  return { type: PLAY_SCRIPT, ...data } as any;
};

// action 处理函数
export default (state: ICaseState, action: PlayScriptAction) => {
  if (action.type === PLAY_SCRIPT) {
    return {
      ...state,
      editor: {
        ...state.editor,
        editorTaskStack: state.editor.editorTaskStack.concat(action),
      },
    };
  }
  return state;
};
