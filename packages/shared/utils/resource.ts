export const mapEffectToCid = {
  Particle: 13,
  Lottie: 12,
  DragonBones: 23,
  FrameAnime: 18,
  Spine: 24,
  Live2d: 30,
};
export const getResourceName = (id: number) => {
  switch (id) {
    case 4:
      return '2D 组件';
    case 5:
      return '图片';
    case 6:
      return '视频';
    case 8:
      return '音频';
    case 99:
      return '特效';
    case 13:
      return '2D 粒子';
    case 12:
      return 'Lottie';
    case 23:
      return '龙骨';
    case 18:
      return '序列帧';
    case 24:
      return 'spine';
    case 30:
      return 'Live2D';
    case 29:
      return '文字';
    case 7:
      return '图形';
    case 32:
      return '3D 组件';
    case 27:
      return '模型';
    case 14:
      return '3D 粒子';
    case 31:
      return '天空盒';
  }
  return '未知';
};

// 场景化类型 id
const SceneResourceId = [4, 32, 27, 14, 31];
export const isNormalResource = (id: number) => {
  return !SceneResourceId.includes(id);
};

export const isSceneResource = (id: number) => {
  return SceneResourceId.includes(id);
};

const Resource3DId = [32, 27, 14, 31];
const Resource3DMime = ['Animation3D', 'Model', 'Particle3D', 'Skybox6SidedMaterial'];
export const isResource3D = ({ id = 0, mime = 'Null' }: { id?: number; mime?: string }) => {
  return Resource3DId.includes(id) || Resource3DMime.includes(mime);
};

const node3DMime = [...Resource3DMime, 'MeshSprite3D', 'Light'];
export const isNode3DMime = (mime = 'Null') => {
  return node3DMime.includes(mime);
};

const EffectId = [13, 12, 23, 18, 24, 30];
const EffectMime = ['Particle', 'Lottie', 'DragonBones', 'FrameAnime', 'spine', 'Live2D'];
export const isResourceEffect = ({ id = 0, mime = 'Null' }: { id?: number; mime?: string }) => {
  return EffectId.includes(id) || EffectMime.includes(mime);
};

const ComponentId = [4, 32];
const ComponentMime = ['Animation', 'Animation3D'];
export const isResourceComponent = ({ id = 0, mime = 'Null' }: { id?: number; mime?: string }) => {
  return ComponentId.includes(id) || ComponentMime.includes(mime);
};

export const getResourceNodeType = (id: number) => {
  if (id === 24) return 'Spine';
  if (id === 30) return 'Live2d';
  return getResourceMime(id);
};

export const getResourceMime = (id: number) => {
  switch (id) {
    case 4:
      return 'Animation';
    case 5:
      return 'Sprite';
    case 6:
      return 'Video';
    case 8:
      return 'Sound';
    case 99:
      return 'Effect';
    case 13:
      return 'Particle';
    case 12:
      return 'Lottie';
    case 23:
      return 'DragonBones';
    case 18:
      return 'FrameAnime';
    case 24:
      return 'spine';
    case 30:
      return 'Live2D';
    case 29:
      return 'Text';
    case 7:
      return 'Shape';
    case 32:
      return 'Animation3D';
    case 27:
      return 'Model';
    case 14:
      return 'Particle3D';
    case 31:
      return 'Skybox6SidedMaterial';
  }
  return '未知';
};

// 使用 riko 预览时，需要传递的 type
export const convertRikoPreviewCategory = (category: string) => {
  if (category === 'FrameAnime') {
    category = 'frame';
  }
  if (category === 'Sprite') {
    category = 'image';
  }
  if (category === 'Animation' || category === 'Animation3D') {
    category = 'component';
  }
  if (category === 'PSD') {
    category = 'psd';
  }
  if (category === 'DragonBones') {
    return 'dragonBones';
  }
  return category.toLowerCase();
};
