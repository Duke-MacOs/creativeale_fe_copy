import produce from 'immer';
import { IWebIdeState, ITabState, ITag } from './types';
import TabManager from '@webIde/Ide/TabManager';

export const UPDATE_TABS = Symbol('UpdateTabs');
export const SWITCH_TAB = Symbol('SwitchTab');
export const DELETE_TAB = Symbol('DeleteTab');
export const SWITCH_HISTORY = Symbol('SwitchHistory');
export const SWITCH_TAG = Symbol('SwitchTag');

export const updateTabs = (tabs: Record<number, ITabState | null>) => ({ type: UPDATE_TABS, tabs } as const);
export const switchTab = (
  tabId: number,
  range?: { startColumn: number; endColumn: number; startLineNumber: number; endLineNumber: number }
) => ({ type: SWITCH_TAB, tabId, range } as const);
export const deleteTab = (tabId: number) => ({ type: DELETE_TAB, tabId } as const);
export const switchHistory = (historyId: number | null) => ({ type: SWITCH_HISTORY, historyId } as const);
export const switchTag = (data: ITag | null) => ({ type: SWITCH_TAG, data } as const);

export default (state: IWebIdeState, action: any): IWebIdeState =>
  produce(state, draft => {
    switch (action.type) {
      case UPDATE_TABS:
        draft.tabs = {
          ...draft.tabs,
          ...action.tabs,
        };
        TabManager.setTabs(draft.tabs);
        break;
      case DELETE_TAB:
        delete draft.tabs[action.tabId];
        TabManager.setTabs(draft.tabs);
        break;
      case SWITCH_TAB:
        draft.workspace.initialRange = action.range;
        draft.workspace.currentTab = action.tabId;
        draft.workspace.selectedHistoryId = null;
        draft.workspace.selectedTag = null;
        break;
      case SWITCH_HISTORY:
        draft.workspace.selectedTag = null;
        draft.workspace.selectedHistoryId = action.historyId;
        break;
      case SWITCH_TAG:
        draft.workspace.selectedHistoryId = null;
        draft.workspace.selectedTag = action.data;
        break;
    }
  });
