import fixSettings from './fixSettings';
import components from './components';
import customScripts from './customScripts';
import { STATE_FIXTURE_VERSION } from '../version';
import { RIKO_VERSION } from '@byted/riko';

export const applyState = async (state: EditorState['project']) => {
  const fixtures = [fixSettings, components, customScripts];
  for (const fixture of fixtures.slice(location.search.includes('update=force') ? 0 : state.editor.dataVersion)) {
    state = await fixture(state);
  }
  return {
    ...state,
    extra: { ...state.extra, version: RIKO_VERSION },
    editor: {
      ...state.editor,
      dataVersion: STATE_FIXTURE_VERSION,
    },
  };
};
