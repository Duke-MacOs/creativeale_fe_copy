import produce from 'immer';
import { IWebIdeState } from './types';

export const UPDATE_SETTING = Symbol('UpdateSetting');

export const updateSetting = (setting: Record<string, unknown>) => ({ type: UPDATE_SETTING, setting } as const);

export default (state: IWebIdeState, action: ReturnType<typeof updateSetting>): IWebIdeState =>
  produce(state, draft => {
    switch (action.type) {
      case UPDATE_SETTING:
        draft.setting = {
          ...draft.setting,
          ...action.setting,
        };
        localStorage.setItem('webIde._setting', JSON.stringify(draft.setting));
        break;
    }
  });
