import { SCENE_FIXTURE_VERSION } from '@editor/Editor/Header/hooks/compatibles/version';
import { ISceneState } from '../..';
import cover from './video_cover.png';

export default (id: number, width: number, height: number): ISceneState => ({
  name: '开始视频',
  id,
  sceneId: 185686,
  orderId: 4,
  type: 'Scene',
  scripts: [],
  editor: {
    scale: 50,
    moment: 0,
    edit3d: false,
    capture: cover,
    dataVersion: SCENE_FIXTURE_VERSION,
    selected: {},
  },
  props: {
    [id]: {
      name: '开始视频',
      width,
      height,
      type: 'Scene',
    },
    '1656240908150': {
      x: 0,
      y: 0.33333333333337123,
      width: 750,
      height: 1333.3333333333333,
      rotation: 0,
      anchorX: 0.5,
      anchorY: 0.5,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      enabled: true,
      name: '开始视频',
      url: 'material/private/debdbcc2c6e5da31ab7a766c54994412.mov?mid=7112727092634140680',
      _editor: {
        name: 'loading',
        originWidth: 1080,
        originHeight: 1920,
        size: 4655650,
      },
      type: 'PVVideo',
    },
    '1656240908151': {
      script: 'Controller',
      name: '开始视频',
      time: 0,
      duration: 2400,
      loop: true,
      type: 'Controller',
    },
  },
  nodes: [
    {
      id: 1656240908150,
      type: 'PVVideo',
      editor: {
        isLocked: true,
        isHidden: false,
      },
      name: '开始视频',
      enabled: true,
      scripts: [
        {
          id: 1656240908151,
          type: 'Controller',
          name: '开始视频',
          time: 0,
          duration: 2400,
          script: 'Controller',
          loop: true,
        },
      ],
      nodes: [],
    },
  ],
  history: {
    undoStack: [],
    redoStack: [],
  },
});
