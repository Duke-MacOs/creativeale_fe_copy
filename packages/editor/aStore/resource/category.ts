import { NodeType } from '@byted/riko';

const ACTION = Symbol('ChangeCategory');
export type Category =
  | Extract<
      NodeType,
      | 'DragonBones'
      | 'FrameAnime'
      | 'Sound'
      | 'Model'
      | 'Animation3D'
      | 'Video'
      | 'Sprite'
      | 'Animation'
      | 'Particle'
      | 'Spine'
      | 'Live2d'
      | 'Lottie'
    >
  | 'CustomScript'
  | 'Effect'
  // 直出互动原生播放加载视频
  | 'NativeLoadingVideo'
  | 'NativeVideo'
  | 'PVAlphaVideo'
  | 'AlphaVideo'
  | 'VRVideo'
  | 'Font'
  | 'Material'
  | 'Cubemaps'
  | 'Model'
  | 'PSD'
  | 'Animation3D'
  | 'Particle3D'
  | 'Texture2D';

export const changeCategory = (category: Category | Extract<NodeType, 'Shape' | 'Button'> | 'Logging' | '') => ({
  type: ACTION,
  playing: ['Logging', ''].includes(category),
  category,
});
export default (
  category: Category | Extract<NodeType, 'Shape'> | 'Logging' | '' = '',
  action: ReturnType<typeof changeCategory>
): Category | Extract<NodeType, 'Shape' | 'Button'> | 'Logging' | '' => {
  if (action.type === ACTION) {
    return action.category;
  }
  return category;
};
