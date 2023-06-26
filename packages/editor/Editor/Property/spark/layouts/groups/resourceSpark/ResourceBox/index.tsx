import { NodeType } from '@byted/riko';
import { typeLabel } from '../../headerGroup/typeLabel';
import { formatBytes } from '@editor/utils';
import { ConciseBox } from './ConciseBox';
import { SoundBox } from './SoundBox';
import { ImageBox } from './ImageBox';
import { CoverBox } from './CoverBox';
import { TextBox } from './TextBox';
import { SparkFn } from '../../..';

export interface ResourceBoxProps {
  envs?: Parameters<SparkFn>[1];
  type: NodeType | 'Cubemaps' | 'NativeVideo' | 'NativeLoadingVideo' | 'PVAlphaVideo' | 'Texture2D';
  baseType?: NodeType | 'Cubemaps' | 'NativeVideo' | 'NativeLoadingVideo' | 'PVAlphaVideo' | 'Texture2D';
  cover?: string;
  size?: number;
  required?: boolean;
  orderId?: number;
  originWidth?: number;
  originHeight?: number;
  poster?: Blob | string;
  label?: string;
  name?: string;
  text?: string;
  url?: string;
  extra?: any;
  tips?: string[];
  defaultValue?: string;
  deletable?: boolean;
  hoverable?: boolean;
  visitable?: boolean;
  playable?: boolean;
  concise?: boolean;
  domRef?: any;
  onChange({}: Partial<
    Pick<
      ResourceBoxProps,
      'orderId' | 'url' | 'name' | 'cover' | 'text' | 'extra' | 'size' | 'originWidth' | 'originHeight' | 'poster'
    >
  >): void;
  onAction?: (action: 'visit' | 'play') => void;
  onReplaceAll?({}: Partial<
    Pick<
      ResourceBoxProps,
      'orderId' | 'url' | 'name' | 'cover' | 'text' | 'extra' | 'size' | 'originWidth' | 'originHeight' | 'poster'
    >
  >): void;
}

export const ResourceBox = (props: ResourceBoxProps) => {
  if (props.concise) {
    return <ConciseBox {...props} />;
  }
  switch (props.type) {
    case 'NativeLoadingVideo':
    case 'PVAlphaVideo':
    case 'AlphaVideo':
    case 'NativeVideo':
    case 'FrameAnime':
    case 'Particle':
    case 'Lottie':
    case 'Sprite':
    case 'Video':
    case 'VRVideo':
    case 'Cubemaps':
    case 'Model':
    case 'Texture2D':
      const baseTips: Record<typeof props.type, string[]> = {
        NativeLoadingVideo: ['格式：MP4, MOV', '尺寸：9:16, 720*1280px'],
        NativeVideo: ['格式：MP4, MOV', '尺寸：9:16, 720*1280px'],
        PVAlphaVideo: ['格式：zip', '尺寸：9:16, 720*1280px'],
        AlphaVideo: ['格式：zip', '尺寸：9:16, 720*1280px'],
        Particle: ['格式要求：plist或zip(图片+plist)'],
        FrameAnime: ['格式要求：需上传多张图片素材'],
        Lottie: ['格式要求：json或zip(图片+json)'],
        Sprite: props.url
          ? [`图片格式：${/png|jpe?g/.exec(props.url)?.[0].toUpperCase() ?? '未知'}`]
          : ['建议格式：JPG, PNG'],
        Video: ['建议尺寸：最佳为 750*1334'],
        Cubemaps: ['建议格式：JPG, PNG'],
        Texture2D: ['建议格式：JPG, PNG'],
        Model: ['建议格式：无'],
      };
      const tips = [...baseTips[props.type], ...(props.tips ?? [])];
      if (props.originWidth && props.originHeight) {
        tips.push(`原始尺寸：${[props.originWidth, props.originHeight].join('*')}`);
      } else if (props.extra?.width && props.extra?.height) {
        tips.push(`资源尺寸：${[props.extra?.width, props.extra?.height].join('*')}`);
      }

      if (props.size) {
        tips.push(`${typeLabel(props.type)}大小：${formatBytes(props.size)}`);
      }
      return <ImageBox {...props} tips={tips} />;
    case 'Sound':
      return <SoundBox {...props} />;
    case 'Text':
      if (props.text !== undefined) {
        return <TextBox {...props} />;
      }
  }
  return <CoverBox {...props} />;
};
