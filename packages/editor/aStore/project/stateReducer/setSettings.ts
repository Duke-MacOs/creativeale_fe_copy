import { omit } from 'lodash';
import { ActionType, SetSettingsAction } from '@byted/riko';
import { ICaseState, IGlobalSettings } from '../types';
export const SET_SETTINGS = ActionType.SetSettings;

export const setSettings = (settings: Partial<IGlobalSettings>, global = false): SetSettingsAction =>
  ({
    type: SET_SETTINGS,
    settings,
    global, // 该字段类型需要riko那边定义
  } as any);

export default (state: ICaseState, action: SetSettingsAction): ICaseState => {
  if (action.type === SET_SETTINGS) {
    if ((action as any).global && state.editor.prevState) {
      return replaceState(state, state => ({
        ...state,
        settings: {
          ...state.settings,
          ...(action.settings as any),
        },
      }));
    }
    const newSettings = { ...state.settings, ...(action.settings as any) };
    return {
      ...state,
      editor: {
        ...state.editor,
        editorTaskStack: state.editor.editorTaskStack.concat({
          ...action,
          settings: omit(newSettings, ['active', 'taskStack']),
        }),
      },
      settings: newSettings,
    };
  }
  return state;
};

/**
 * 替换最深层的state
 * @param state
 * @param map
 * @returns
 */
function replaceState(state: ICaseState, map: (state: ICaseState) => ICaseState): ICaseState {
  const newState = map(state);
  if (newState.editor.prevState) {
    return {
      ...newState,
      editor: {
        ...newState.editor,
        prevState: replaceState(newState.editor.prevState, map),
      },
    };
  }
  return newState;
}
