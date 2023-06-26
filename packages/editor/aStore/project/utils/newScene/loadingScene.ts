import { SCENE_FIXTURE_VERSION } from '@editor/Editor/Header/hooks/compatibles/version';
import w686h386 from './load_scene_cover_w686h386.png';
import w750h1334 from './load_scene_cover.png';

const COVERS: Record<string, string> = {
  w750h1334,
  w686h386,
};

export default (id: number, width: number, height: number) => ({
  name: '加载场景',
  id,
  sceneId: 916,
  orderId: 1,
  type: 'Scene',
  editor: {
    selected: {},
    scale: 50,
    count: 140,
    moment: 0,
    loading: true,
    capture: COVERS[`w${width}h${height}`],
    dataVersion: SCENE_FIXTURE_VERSION,
  },
  props: {
    [id]: { type: 'Scene', name: '加载场景', width, height, x: 0, y: 0 },
    '1624850268102': {
      name: 'rectangle',
      shapeType: 'rectangle',
      x: (width - 460) / 2,
      y: height - 98 - 67 - 18 * 2,
      width: 460,
      height: 18,
      rotation: 0,
      anchorX: 0.5,
      anchorY: 0.5,
      scaleX: 1,
      scaleY: 1,
      fillColor: 'rgba(57,85,246,1)',
    },
    '1614087902139': {
      name: '文本节点',
      x: (width - 196) / 2,
      y: height - 98 - 67,
      width: 196,
      height: 98,
      text: 'loading',
      fontSize: 48,
      color: 'rgba(51,51,51,1)',
      rotation: 0,
      anchorX: 0.5,
      anchorY: 0.5,
      scaleX: 1,
      scaleY: 1,
      align: 'center',
      top: false,
      bottom: true,
      left: false,
      right: false,
      center: false,
      middle: false,
    },
  },
  nodes: [
    {
      id: 1624850268102,
      name: 'rectangle',
      type: 'Shape',
      editor: {
        isLocked: false,
        isHidden: false,
      },
      scripts: [],
      nodes: [],
    },
    {
      id: 1614087902139,
      name: '文本节点',
      type: 'Text',
      editor: {
        isLocked: false,
        isHidden: false,
      },
      scripts: [],
      nodes: [],
    },
  ],
  history: { undoStack: [], redoStack: [] },
});
