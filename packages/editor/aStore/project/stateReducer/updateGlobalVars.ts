import { PlayerActionType, PlayerGlobalVariableAction } from '@byted/riko';
import { ICaseState, IGlobalSettings } from '../types';

const UPDATE_GLOBAL_VARS = Symbol('UpdateGlobalVars');

export const updateGlobalVars = (store: Pick<IGlobalSettings, 'store'>) => {
  return { type: UPDATE_GLOBAL_VARS, store };
};

// action 处理函数
export default function reducer(state: ICaseState, action: PlayerGlobalVariableAction): ICaseState {
  if (action.type === PlayerActionType.GlobalVariable || action.type === UPDATE_GLOBAL_VARS) {
    return {
      ...state,
      settings: {
        ...state.settings,
        store: { ...action.store },
      },
      editor: {
        ...state.editor,
        prevState: state.editor.prevState && reducer(state.editor.prevState, action),
      },
    };
  }
  return state;
}
