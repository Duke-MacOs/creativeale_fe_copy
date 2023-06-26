/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Category } from '@editor/aStore';
import { formatBytes } from '@editor/utils';
import { xor, omit, pick } from 'lodash';
import { message } from 'antd';
import { amIHere } from '@shared/utils';

export const ResourceName: Record<Category, string> = {
  Animation: '互动组件',
  Sprite: '图片文件',
  Sound: '音频文件',
  Video: '视频文件',
  NativeLoadingVideo: '加载视频',
  NativeVideo: '交互视频',
  VRVideo: 'VR视频',
  PVAlphaVideo: '出框视频',
  AlphaVideo: '出框视频',
  Lottie: 'Lottie文件',
  Particle: '粒子文件',
  FrameAnime: '序列帧文件',
  PSD: 'Photoshop文件',
  DragonBones: '龙骨文件',
  Spine: 'Spine文件',
  Live2d: 'Live2D文件',
  CustomScript: '脚本文件',
  Font: '字体文件',
  Material: '材质文件',
  Cubemaps: '全景图片',
  Model: '模型文件',
  Animation3D: '3D互动组件',
  Particle3D: '3D粒子',
};
export const ResourceType: Record<Category, number> = {
  Animation: 4,
  Sprite: 5,
  Sound: 8,
  Video: 6,
  Lottie: 12,
  Particle: 13,
  FrameAnime: 18,
  PSD: 21,
  DragonBones: 23,
  NativeLoadingVideo: 34,
  NativeVideo: 35,
  PVAlphaVideo: 36,
  Spine: 24,
  Live2d: 30,
  CustomScript: 25,
  AlphaVideo: 36,
  Font: 29,
  Material: 28,
  Cubemaps: 31,
  Model: 27,
  Animation3D: 32,
  Particle3D: 14,
  VRVideo: 37,
};
/**
 * 历史原因fetchMaterialTag接口的parentName为category对应的中文名
 */
export const ResourceMap: Partial<Record<Category, string>> = {
  Sprite: '图片',
  Sound: '音频',
  Animation: '互动组件',
  CustomScript: '脚本',
  FrameAnime: '序列帧',
  Particle: '2D粒子',
};
const isRelease = amIHere({ release: true });

export const AcceptedType: Record<Category, string> = {
  Sprite: isRelease
    ? 'image/png,image/jpeg,image/*'
    : 'image/png,image/jpeg,image/webp,image/gif,image/heic,image/tiff,image/svg,image/ico,image/*',
  Sound: isRelease ? '.mp3' : '.mp3,.ogg,.wav,.aac.,m4a.,wma.,amr',
  Video: isRelease
    ? '.mp4'
    : '.mp4,.webm,.wmv,.ogg,.mov,.flv,.asf,.mpeg,.rm,.rmvb,.mkv,.3gp,.hevc,.m2ts,.m2v,.m4v,.mjpeg,.mpg,.mts,.mxf,.ogv,.swf,.ts,.vob,.wtv',
  NativeLoadingVideo: '.mp4,.mov',
  NativeVideo: '.mp4,.mov',
  VRVideo: '.mp4',
  PVAlphaVideo: '.zip',
  AlphaVideo: '.zip',
  FrameAnime: 'image/png,image/jpeg',
  PSD: 'image/vnd.adobe.photoshop',
  Lottie: 'application/json,.zip',
  Particle: '.plist,.zip,.particle',
  DragonBones: '.zip,image/png,application/json',
  Spine: '.zip,.atlas,.txt,.skel,image/png,application/json',
  Live2d: '.zip',
  CustomScript: '.js,.ts',
  Animation: '.json,.zip',
  Animation3D: '.json',
  Font: '.ttf',
  Material: '.rmat',
  Cubemaps: '.zip,image/png,image/jpeg,.hdr',
  Model: '.zip,.gltf,.obj,.fbx,.glb',
  Particle3D: '.json',
  Texture2D: 'image/png,image/jpeg',
};

const omitted = omit(AcceptedType, [
  'NativeLoadingVideo',
  'NativeVideo',
  'AlphaVideo',
  'FrameAnime',
  'DragonBones',
  'Animation',
  'Skybox',
  'Spine',
  'Model',
  'PSD',
]);
export const accepted = xor(...Object.values(omitted).map(value => value.split(',')))
  .concat(AcceptedType['Video'].split(','))
  .filter(Boolean)
  .join(',');

const basisType = pick(AcceptedType, ['Sprite', 'Sound', 'Video']);

export const acceptedBasisMaterial = xor(...Object.values(basisType).map(value => value.split(',')))
  .filter(Boolean)
  .join(',');

export const categoryOf = (file: File): Category => {
  for (const [key, value] of Object.entries(omitted)) {
    const acceptable = value.split(',');
    for (const accept of acceptable) {
      if (accept.startsWith('.')) {
        if (file.name?.toLowerCase().endsWith(accept)) {
          return key as Category;
        }
      } else if (accept.endsWith('/*')) {
        if (file.type.startsWith(accept.slice(0, -1))) {
          return key as Category;
        }
      } else if (file.type === accept) {
        return key as Category;
      }
    }
  }
  throw new Error();
};
/**
 * Reference: https://bytedance.feishu.cn/docs/doccnd4DdqZKJ4qwXuQL38rMZQh
 */
export const AcceptedSize: Record<Category, number> = {
  Sprite: 1024 * 1024,
  Sound: 2 * 1024 * 1024,
  Video: 10 * 1024 * 1024,
  VRVideo: 50 * 1024 * 1024,
  NativeLoadingVideo: 5 * 1024 * 1024,
  NativeVideo: 50 * 1024 * 1024,
  PVAlphaVideo: 50 * 1024 * 1024,
  AlphaVideo: 50 * 1024 * 1024,
  FrameAnime: 2 * 1024 * 1024,
  PSD: 50 * 1024 * 1024,
  Lottie: 2 * 1024 * 1024,
  Particle: 2 * 1024 * 1024,
  DragonBones: 2 * 1024 * 1024,
  Spine: 2 * 1024 * 1024,
  Live2d: 20 * 1024 * 1024,
  CustomScript: 1024 * 1024,
  Font: 20 * 1024 * 1024,
  Material: 2 * 1024 * 1024,
  Model: 2 * 1024 * 1024,
  Animation: 50 * 1024 * 1024,
  Animation3D: 0,
  Cubemaps: 1024 * 1024,
  Particle3D: 0,
};
export const AcceptedDims: Partial<Record<Category, [number, number]>> = {
  Sprite: [2048, 2048],
  FrameAnime: [512, 512],
};

export const acceptedType = (fileList: File[], category?: Category) => {
  const accepts = [] as File[];
  const refuses = [] as [File, string][];
  for (const file of fileList) {
    try {
      accepts.push(checkFileType(file, category));
    } catch (e) {
      refuses.push([file, e.message]);
    }
  }
  if (refuses.length) {
    const [{ name }, error] = refuses[0];
    message.error(`${name}${refuses.length > 1 ? `${name ? '等' : ''}${refuses.length}个` : ''}${error}`);
  }
  return accepts;
};

export const checkFileType = (file: File, category?: Category) => {
  const acceptable = (category ? AcceptedType[category] : accepted).split(',');
  const a = acceptable.some(accept => {
    if (accept.startsWith('.')) {
      return file.name?.toLowerCase().endsWith(accept);
    }
    if (accept.endsWith('/*')) {
      return file.type.startsWith(accept.slice(0, -1));
    }
    return file.type === accept;
  });
  if (!a) {
    throw new Error(`${category ? ResourceName[category] : ''}格式错误`);
  }
  return file;
};

export const acceptedSize = (fileList: File[], category?: Category | number) => {
  const accepts = [] as File[];
  const refuses = [] as [File, number][];
  for (const file of fileList) {
    try {
      accepts.push(checkFileSize(file, category));
    } catch (e) {
      refuses.push([file, e.message]);
    }
  }
  if (refuses.length) {
    const [{ name }, error] = refuses[0];
    message.error(`${name || ''}${refuses.length > 1 ? `${name ? '等' : ''}${refuses.length}个` : ''}${error}`);
  }
  return accepts;
};

export const checkFileSize = (file: File, category?: Category | number) => {
  const size = typeof category === 'number' ? category : AcceptedSize[category || categoryOf(file)];
  if (file.size > size) {
    const name = typeof category === 'number' ? '' : ResourceName[category || categoryOf(file)];
    throw new Error(`${name}超过了${formatBytes(size)}`);
  }
  return file;
};

export const acceptedDims = async (fileList: File[], category?: Category) => {
  const accepts = [] as File[];
  const refuses = [] as [File, string][];
  for (const file of fileList) {
    try {
      accepts.push(await checkFileDims(file, category));
    } catch (e) {
      refuses.push([file, e.message]);
    }
  }
  if (refuses.length) {
    const [{ name }, error] = refuses[0];
    message.error(`${name}${refuses.length > 1 ? `${name ? '等' : ''}${refuses.length}个` : ''}${error}`);
  }
  return accepts;
};

export const checkFileDims = async (file: File, category?: Category) => {
  if (!category) {
    category = categoryOf(file);
  }
  if (AcceptedDims[category]) {
    const [maxWidth, maxHeight] = AcceptedDims[category]!;
    const { width, height } = await getDims(file);
    if (width > maxWidth || height > maxHeight) {
      throw new Error(`${ResourceName[category]}尺寸超过了${maxWidth}×${maxHeight}`);
    }
  }
  return file;
};

export const getDims = (file: File): Promise<HTMLImageElement> => {
  return new Promise(resolve => {
    const fileUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve(image);
    };
    image.src = fileUrl;
  });
};
