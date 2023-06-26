import { getUrlHead } from '@shared/utils';
import { ICaseState, ISceneState } from '../types';
import { STATE_FIXTURE_VERSION } from '@editor/Editor/Header/hooks/compatibles/version';

export * from './newScene';

const setMode = (type: ICaseState['type'] = 'Project', prevState?: ICaseState) => {
  if (['Component', 'Model', 'Particle3D'].includes(type)) return 'Project';
  if (['PanoramaData'].includes(type)) return prevState?.editor.propsMode ?? 'Project';
  return 'Product';
};

export const newCase = (
  scenes: ISceneState[],
  type: ICaseState['type'] = 'Project',
  prevState?: ICaseState
): ICaseState => ({
  id: 0,
  type,
  name: type,
  teamId: '',
  editor: {
    prevState,
    dataVersion: STATE_FIXTURE_VERSION,
    selectedSceneId: scenes[0].id,
    loading: type === 'Project',
    soundVolume: 100,
    canvasScale: 1,
    playRate: 1,
    playing: 0,
    editorTaskStack: [],
    settingsOn: !['Component', 'Model', 'Particle3D', 'PanoramaData'].includes(type),
    sceneMode: setMode(type, prevState),
    propsMode: setMode(type, prevState),
    count: 200,
    readOnly: false,
    panoramaEdit: {
      panoramaDataOrderId: 0,
      panoramaId: 0,
      spaceId: 0,
      panoramaSpaceId: 0,
      mainSceneId: 0,
      type: undefined,
    },
  },
  scenes,
  customScripts: [],
  materials: [],
  cubemaps: [],
  texture2Ds: [],
  settings: {
    basePath: getUrlHead(),
    store: scenes[0]?.editor.store || {},
    typeOfPlay: 0,
    multiTouchEnabled: false,
  },
});
