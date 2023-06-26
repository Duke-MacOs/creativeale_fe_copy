import { Spark } from '@editor/Editor/Property/cells';
import headerGroup from './common/headerGroup';
import tilingOffset from './common/tilingOffset';
import renderMode from './common/renderMode';
import { colorSpark } from '@editor/Editor/Property/spark/common/colorSpark';
import texture2D from './common/texture2D';

export const PBRStandardMaterial = {
  spark: 'grid',
  content: [
    headerGroup,
    {
      spark: 'group',
      label: '材质设置',
      content: {
        spark: 'grid',
        content: [
          renderMode([
            {
              label: '不透明',
              value: 0,
            },
            {
              label: '镂空',
              value: 1,
            },
            {
              label: '淡入淡出',
              value: 2,
            },
            {
              label: '透明',
              value: 3,
            },
          ]),
          {
            spark: 'check',
            index: 'renderMode',
            check: {
              hidden: mode => mode !== 1,
            },
            content: {
              spark: 'number',
              index: 'alphaTestValue',
              label: '镂空值',
              tooltip: '镂空透明度',
              step: 0.03,
              precision: 2,
              min: 0,
              max: 1,
              defaultValue: 0.5,
            },
          },
          texture2D('albedoTextureUrl', '漫反射贴图'),
          colorSpark({
            spark: 'color',
            index: 'albedoColor',
            label: '反照颜色',
            defaultValue: [0, 0, 0],
          }),
          texture2D('metallicGlossTextureUrl', '金属平滑贴图'),
          {
            spark: 'check',
            index: 'metallicGlossTextureUrl',
            check: {
              hidden: texture => texture?.url,
            },
            content: {
              spark: 'number',
              index: 'metallic',
              label: '金属值',
              tooltip: '金属值',
              min: 0,
              max: 1,
              defaultValue: 0.5,
              step: 0.03,
              precision: 3,
            },
          },
          {
            spark: 'select',
            index: 'smoothnessSource',
            label: '平滑来源',
            tooltip: '来源对应贴图的Alpha通道',
            options: [
              {
                label: '金属平滑贴图',
                value: 0,
              },
              {
                label: '反照率贴图',
                value: 1,
              },
            ],
            defaultValue: 0,
          },
          {
            spark: 'check',
            index: ['smoothnessSource', 'metallicGlossTextureUrl'],
            check: {
              hidden: ([type, mTexture]) => {
                return (type === 0 && mTexture?.url) || type === 1;
              },
            },
            content: {
              spark: 'number',
              index: 'smoothness',
              label: '平滑值',
              tooltip: '平滑值',
              defaultValue: 0.5,
              min: 0,
              max: 1,
              step: 0.03,
              precision: 3,
            },
          },
          {
            spark: 'check',
            index: ['smoothnessSource', 'metallicGlossTextureUrl'],
            check: {
              hidden: ([type, mTexture]) => {
                return type === 0 && !mTexture?.url;
              },
            },
            content: {
              spark: 'number',
              index: 'smoothnessTextureScale',
              label: '平滑强度',
              tooltip: '平滑强度',
              defaultValue: 0.5,
              min: 0,
              max: 1,
              step: 0.03,
              precision: 3,
            },
          },
          texture2D('normalTextureUrl', '法线贴图'),
          {
            spark: 'check',
            index: 'normalTextureUrl',
            check: {
              hidden: texture => !texture?.url,
            },
            content: {
              spark: 'number',
              index: 'normalTextureScale',
              label: '法线强度',
              tooltip: '法线强度',
              defaultValue: 1,
              step: 0.03,
              precision: 2,
            },
          },
          texture2D('occlusionTextureUrl', '遮挡贴图'),
          {
            spark: 'check',
            index: 'occlusionTextureUrl',
            check: {
              hidden: texture => !texture?.url,
            },
            content: {
              spark: 'number',
              index: 'occlusionTextureStrength',
              label: '遮挡强度',
              tooltip: '遮挡强度',
              defaultValue: 1,
              min: 0,
              max: 1,
              step: 0.03,
              precision: 3,
            },
          },
          texture2D('parallaxTextureUrl', '高度贴图'),
          {
            spark: 'check',
            index: 'parallaxTextureUrl',
            check: {
              hidden: texture => !texture?.url,
            },
            content: {
              spark: 'number',
              index: 'parallaxTextureScale',
              label: '高度强度',
              tooltip: '高度强度',
              defaultValue: 0.02,
              min: 0.005,
              max: 0.08,
              step: 0.001,
              precision: 3,
            },
          },

          {
            spark: 'label',
            label: '开启发光',
            tooltip: '开启发光',
            content: {
              spark: 'boolean',
              index: 'enableEmission',
              defaultValue: true,
            },
          },
          {
            spark: 'check',
            index: 'enableEmission',
            check: {
              hidden: enableEmission => !enableEmission,
            },
            content: {
              spark: 'grid',
              content: [
                texture2D('emissionTextureUrl', '发光贴图'),
                colorSpark({
                  spark: 'color',
                  index: 'emissionColor',
                  label: '反光颜色',
                  defaultValue: [0, 0, 0],
                }),
              ],
            },
          },
          tilingOffset,
        ],
      },
    },
  ],
} as Spark;
