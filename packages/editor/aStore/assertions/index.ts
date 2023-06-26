import { Store } from 'redux';
import selectedSceneId from './selectedSceneId';
import selected from './selected';
import moment from './moment';
const assertions = [moment, selected, selectedSceneId];

export default (store: Store<EditorState>) => {
  const { subscribe, getState } = store;
  return subscribe(() => {
    const state = getState();
    for (const assertion of assertions) {
      assertion(state);
    }
  });
};
