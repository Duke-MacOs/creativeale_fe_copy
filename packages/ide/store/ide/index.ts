import settingReducer from './setting';
import tabReducer from './tab';
import editorReducer from './workspace';
import { IWebIdeState } from './types';

export * from './setting';
export * from './tab';
export * from './workspace';
export * from './types';

const RESTORE_ACTION = Symbol('RestoreState');
export const restoreState = (state: IWebIdeState) => ({ type: RESTORE_ACTION, state });

const reducers = [settingReducer, tabReducer, editorReducer];

const cachedSettingStr = localStorage.getItem('webIde._setting');
const cachedSettingObj = cachedSettingStr ? JSON.parse(cachedSettingStr) : {};
if (cachedSettingObj.theme === 'Katzenmilch') {
  cachedSettingObj.theme = 'Light';
} else if (!['Dark', 'Light'].includes(cachedSettingObj.theme)) {
  cachedSettingObj.theme = 'Dark';
}

export const initialWebIdeState: IWebIdeState = {
  setting: { fontSize: 14, theme: 'Dark', ...cachedSettingObj },
  workspace: {
    readOnly: true,
    loading: false,
    currentTab: null,
    selectedHistoryId: null,
    selectedTag: null,
    resourceNav: [],
    markers: [],
  },
  tabs: {},
};

export default function reducer(state: IWebIdeState = initialWebIdeState, action: any): IWebIdeState {
  if (action.type === RESTORE_ACTION) {
    return action.state;
  }

  let nextState = state;
  for (const reducer of reducers) {
    nextState = reducer(nextState, action);
  }
  return nextState;
}
