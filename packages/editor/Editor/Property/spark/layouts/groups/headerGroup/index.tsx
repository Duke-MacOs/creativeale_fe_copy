import type { IGroupSpark, Spark } from '../../../../cells';
import { panoramaHotSpotVectorContent, SparkFn } from '../..';
import { particleTextureSpark } from '../resourceSpark/typeSpark';
import { layerTypeSpark3D } from './layerTypeSpark3D';
import { resourceSpark } from '../resourceSpark';
import { vectorSpark3D } from './vectorSpark3D';
import { fillTypeSpark } from './fillTypeSpark';
import { enabledSpark } from './enabledSpark';
import { volumeSpark } from './volumeSpark';
import { nameSpark } from './nameSpark';
import { ambientModeScene3D } from './ambientModeScene3D';

export const headerGroup: SparkFn = (props, envs): IGroupSpark => {
  return {
    spark: 'group',
    label: '素材名称与内容',
    extra: enabledSpark(envs.isRoot || envs.typeOfPlay === 4),
    content: {
      spark: 'grid',
      content: content(props, envs),
    },
  };
};

const content: (...args: Parameters<SparkFn>) => Spark[] = (props, envs) => {
  switch (props.type) {
    case 'Sprite':
      return [nameSpark(props, envs), resourceSpark(props, envs), fillTypeSpark(props, envs)];
    case 'PVAlphaVideo':
    case 'AlphaVideo':
    case 'VRVideo':
    case 'Video':
      return [nameSpark(props, envs), resourceSpark(props, envs), volumeSpark(props, envs), fillTypeSpark(props, envs)];
    case 'Sound':
      return [nameSpark(props, envs), resourceSpark(props, envs), volumeSpark(props, envs)];
    case 'Particle':
      return [
        nameSpark(props, envs),
        resourceSpark(props, envs),
        {
          spark: 'block',
          status: 'required',
          content: particleTextureSpark({ type: props.type as any }),
        },
      ];
    case 'FrameAnime':
    case 'PVDragger':
    case 'PVButton':
    case 'VRButton':
    case 'Lottie':
      return [nameSpark(props, envs), resourceSpark(props, envs)];
    case 'Animation':
      return [
        nameSpark(props, envs),
        {
          spark: 'check',
          index: 'compProps',
          check: {
            hidden: (compProps: any[] = []) => compProps.every(({ type }) => type.startsWith('Script_')),
          },
          content: resourceSpark(props, envs),
        },
      ];
    case 'Button':
      return [
        nameSpark(props, envs),
        {
          spark: 'check',
          index: 'url',
          check: {
            hidden: url => !url,
          },
          content: resourceSpark(props, envs),
        },
      ];
    case 'Scene3D':
      return [nameSpark(props, envs), ambientModeScene3D()];
    case 'Light':
    case 'Camera':
    case 'Model':
    case 'Sprite3D':
    case 'Particle3D':
    case 'ParticleSystem3D':
    case 'MeshSprite3D':
    case 'SkinnedMeshSprite3D':
      return [nameSpark(props, envs), layerTypeSpark3D(envs.isRoot), vectorSpark3D(envs.isRoot)];
    case 'PanoramaSpace':
    case 'Trail3D':
    case 'Water':
      return [nameSpark(props, envs), vectorSpark3D(envs.isRoot)];
    case 'PanoramaHotSpot':
      return [nameSpark(props, envs), panoramaHotSpotVectorContent(props, envs)];
    case 'Animation3D':
      return [
        nameSpark(props, envs),
        layerTypeSpark3D(envs.isRoot),
        vectorSpark3D(envs.isRoot),
        {
          spark: 'check',
          index: 'compProps',
          check: {
            hidden: (compProps: any[] = []) => !compProps.length,
          },
          content: resourceSpark(props, envs),
        },
      ];
    default:
      return [nameSpark(props, envs)];
  }
};
