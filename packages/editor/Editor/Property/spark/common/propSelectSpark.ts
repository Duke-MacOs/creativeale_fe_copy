import { NodeType } from '@byted/riko';
import { ICheckSpark, ISelectSpark } from '@editor/Editor/Property/cells';
import { findById, getNodes, getScene, getSelectedIds } from '@editor/utils';
import { shallowEqual, useSelector } from 'react-redux';

// 属性选择器
export function propSelectSpark(
  content: ISelectSpark,
  options: {
    targetId: number;
    includeTypes?: string[];
    excludeTypes?: string[];
  }
): ICheckSpark {
  return {
    spark: 'check',
    index: [],
    check: { options: () => usePropOptions(options) },
    content,
  };
}

export function usePropOptions(options: { targetId: number; includeTypes?: string[]; excludeTypes?: string[] }) {
  const { targetId } = options;
  return useSelector(({ project }: EditorState) => {
    const scene = getScene(project);
    const sceneNodes = getNodes(scene);
    const {
      editor: { selected },
    } = scene;
    const { nodeIds } = getSelectedIds(selected);
    const [node] = findById(sceneNodes, targetId === -1 ? nodeIds?.[0] : targetId);
    if (!node) return [];
    return getPropertyOptionsByType(node.type);
  }, shallowEqual);
}

export function getPropertyOptionsByType(type: keyof typeof PropertiesMap): { value: string; label: string }[] {
  return (PropertiesMap[type] || commonProp).map(key =>
    typeof key === 'string' ? { value: key, label: valueLabelMap[key as keyof typeof valueLabelMap] } : key
  );
}

export const valueLabelMap = {
  name: '名称',
  url: '链接地址',
  x: 'X坐标',
  y: 'Y坐标',
  width: '宽度',
  height: '高度',
  rotation: '旋转角度',
  alpha: '透明度',
  visible: '是否可见',
  mouseEnabled: '是否可点击',
  anchorX: '锚点X',
  anchorY: '锚点Y',
  scaleX: '水平缩放比',
  scaleY: '垂直缩放比',
  data: '自定数据',
  enabled: '是否启用',
  animName: '动画片段',
  fillColor: '填充颜色',
  lineColor: '描边颜色',
  strokeColor: '描边颜色',
  color: '颜色',
  text: '文本',
  fontSize: '字号',
  volume: '音量',

  // 3D
  position: '位置',
  scale: '缩放',
  castShadows: '开启模型阴影',
  receiveShadows: '接收阴影',
  meshType: '模型类型',

  clearFlag: '清除模式',
  clearColor: '背景颜色',
  projection: '投影类型',
  fieldOfView: '垂直角度',
  nearClip: '正切面',
  farClip: '远切面',
  normalizedViewport: '视口',

  lightType: '光照类型',
  range: '范围',
  spotAngle: '角度',
  intensity: '光照强度',
  shadowType: '阴影类型',
  shadowDistance: '阴影距离',
  shadowResolution: '阴影分辨率',
  shadowBias: '阴影偏移',
  shadowNormalBias: '阴影法线偏移',

  ambientMode: '环境模式',
  ambientColor: '环境光颜色',
  flogMode: '雾模式',
  flogStart: '开始距离',
  flogEnd: '结束距离',
  flogColor: '雾颜色',
};

const commonProp: Array<keyof typeof valueLabelMap | { value: keyof typeof valueLabelMap; label: string }> = [
  'name',
  'url',
  'x',
  'y',
  'width',
  'height',
  'rotation',
  'alpha',
  'visible',
  'mouseEnabled',
  'anchorX',
  'anchorY',
  'scaleX',
  'scaleY',
  'data',
  'enabled',
];

const common3DProp = ['enabled', 'position', 'rotation', 'scale'];

const PropertiesMap: Partial<Record<NodeType, any[]>> = {
  Container: commonProp,
  Sprite: commonProp,
  Shape: [
    'name',
    'fillColor',
    'lineColor',
    'x',
    'y',
    'width',
    'height',
    'rotation',
    'alpha',
    'visible',
    'mouseEnabled',
    'anchorX',
    'anchorY',
    'scaleX',
    'scaleY',
    'data',
    'enabled',
  ],
  Button: ['name', 'text', 'fontSize', 'color', 'x', 'y', 'width', 'height', 'rotation', 'enabled'],
  Text: [
    'name',
    'text',
    'fontSize',
    'color',
    'strokeColor',
    'x',
    'y',
    'width',
    'height',
    'rotation',
    'alpha',
    'visible',
    'mouseEnabled',
    'anchorX',
    'anchorY',
    'scaleX',
    'scaleY',
    'data',
    'enabled',
  ],
  Sound: ['name', { value: 'url', label: '背景音乐' }, 'volume', 'enabled'],
  Video: [
    'name',
    'volume',
    'x',
    'y',
    'width',
    'height',
    'rotation',
    'alpha',
    'visible',
    'mouseEnabled',
    'anchorX',
    'anchorY',
    'scaleX',
    'scaleY',
    'data',
    'enabled',
  ],
  Animation: commonProp,
  Particle: ['name', 'x', 'y', 'scaleX', 'scaleY', 'enabled'],
  FrameAnime: commonProp,
  Lottie: commonProp,
  DragonBones: [
    'name',
    'x',
    'y',
    'width',
    'height',
    'rotation',
    'alpha',
    'visible',
    'mouseEnabled',
    'anchorX',
    'anchorY',
    'scaleX',
    'scaleY',
    'data',
    'animName',
    'enabled',
  ],
  Spine: [
    'name',
    'x',
    'y',
    'width',
    'height',
    'rotation',
    'alpha',
    'visible',
    'mouseEnabled',
    'anchorX',
    'anchorY',
    'scaleX',
    'scaleY',
    'data',
    'animName',
    'enabled',
  ],
  Live2d: [
    'name',
    'x',
    'y',
    'width',
    'height',
    'rotation',
    'alpha',
    'visible',
    'mouseEnabled',
    'anchorX',
    'anchorY',
    'scaleX',
    'scaleY',
    'data',
    'animName',
    'enabled',
  ],

  // 3D
  Light: [
    'lightType',
    { value: 'color', label: '光颜色' },
    'range',
    'spotAngle',
    'intensity',
    'shadowType',
    'shadowDistance',
    'shadowResolution',
    'shadowBias',
  ],

  Camera: [
    'enabled',
    'position',
    'rotation',
    'scale',
    // 'enableHDR',
    'clearFlag',
    'clearColor',
    'projection',
    'fieldOfView',
    'nearClip',
    'farClip',
    'normalizedViewport',
  ],

  MeshSprite3D: ['enabled', 'position', 'rotation', 'scale', 'meshType', 'castShadows', 'receiveShadows'],
  Scene3D: ['enabled', 'ambientMode', 'ambientColor', 'flogMode', 'flogStart', 'flogEnd', 'flogColor'],
  Model: common3DProp,
  Particle3D: common3DProp,
};
