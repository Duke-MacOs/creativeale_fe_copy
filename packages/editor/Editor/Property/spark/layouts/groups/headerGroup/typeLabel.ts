import { SparkType } from '../..';

export const typeLabel = (type: SparkType | 'NativeLoadingVideo' | 'NativeVideo' | 'Texture2D') => {
  switch (type) {
    case 'Text':
      return '文字';
    case 'Shape':
      return '图形';
    case 'Container':
      return '容器';
    case 'PVButton':
    case 'Button':
      return '按钮';
    case 'Camera':
      return '摄像机';
    case 'Sprite3D':
      return '3D容器';
    case 'MeshSprite3D':
      return '3D图形';
    case 'Scene3D':
      return '3D场景';
    case 'Light':
      return '灯光';
    case 'Animation3D':
      return '3D组件';
    case 'Scene':
      return '场景';
    case 'Script':
      return '事件';
    case 'Effect':
      return '动画';
    case 'Blueprint':
      return '蓝图';
    case 'Controller':
      return '控制器';
    case 'Sound':
      return '声音';
    case 'NativeLoadingVideo':
    case 'PVAlphaVideo':
    case 'AlphaVideo':
    case 'NativeVideo':
    case 'Video':
      return '视频';
    case 'Lottie':
      return 'Lottie';
    case 'Particle':
      return '粒子';
    case 'ShurikenParticle3D':
      return '3D粒子';
    case 'Sprite':
      return '图片';
    case 'Animation':
      return '组件';
    case 'PVFrameAnime':
    case 'FrameAnime':
      return '序列帧';
    case 'Spine':
      return 'Spine';
    case 'DragonBones':
      return '龙骨';
    case 'Live2d':
      return 'Live2D';
    case 'Model':
      return '模型';
    case 'Trail3D':
      return '拖尾';
    case 'Particle3D':
      return '3D粒子容器';
    case 'ParticleSystem3D':
      return '3D粒子';
    case 'Cubemaps':
      return '天空盒';
    case 'PanoramaSpace':
      return '全景';
    case 'PanoramaHotSpot':
      return '热点';
    case 'PVClickArea':
      return '热区';
    case 'PVSlider':
      return '滑条';
    case 'PVDragger':
      return '拖拽';
    default:
      return type;
  }
};
