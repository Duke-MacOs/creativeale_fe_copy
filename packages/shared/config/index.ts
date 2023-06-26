// 素材类型枚举
export enum Categories {
  case = 1, // 互动广告
  otherCase, // 第三方互动广告
  creative, // 创意探索
  component = 4, // 互动组件
  image = 5, // 图片
  video = 6, // 视频
  audio = 8, // 音频
  font, // 字体
  lottie = 12, // Lottie
  particles2D = 13, // 2D 粒子
  particles3D = 14, // 3D 粒子
  frameAni = 18, // 序列帧
  photoshop = 21, // Photoshop
  dragonBones = 23, //龙骨动画
  spine = 24, //spin动画
  customScript = 25, //自定义脚本
  editor, // 编辑器
  scene = 26, // 场景
  live2d = 30, // Live2d
  Skybox = 31, // VR 全景图
  other, // 其他
}

// 播放器类型枚举
export enum PlayerType {
  Editor = 1,
  Cocos,
}

// 素材类型对应编辑器的播放器 type 类型枚举
export enum Category2PlayType {
  'lottie' = Categories.lottie,
  'frame' = Categories.frameAni,
  'proj' = Categories.editor,
  'component' = Categories.component,
  'scene' = Categories.scene,
  'particle' = Categories.particles2D,
  'dragonBones' = Categories.dragonBones,
  'spine' = Categories.spine,
  'image' = Categories.image,
  'live2d' = Categories.live2d,
}
