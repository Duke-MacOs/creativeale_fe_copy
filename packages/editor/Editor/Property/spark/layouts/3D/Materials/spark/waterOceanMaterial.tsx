import { Spark } from '@editor/Editor/Property/cells';
import { colorSpark } from '@editor/Editor/Property/spark/common/colorSpark';
import headerGroup from './common/headerGroup';
import texture2D from './common/texture2D';

export const WaterOceanMaterial = {
  spark: 'grid',
  content: [
    headerGroup,
    {
      spark: 'group',
      label: '材质设置',
      content: {
        spark: 'grid',
        content: [
          colorSpark({
            spark: 'color',
            index: 'colorA',
            label: '颜色A',
            defaultValue: [0, 0, 0],
          }),
          colorSpark({
            spark: 'color',
            index: 'colorB',
            label: '颜色B',
            defaultValue: [0, 0, 0],
          }),
          texture2D('normalTextureUrl', '法线贴图'),
          {
            spark: 'number',
            index: 'normalTitling',
            label: '法线重复',
            defaultValue: 1,
            step: 0.03,
            precision: 2,
          },
          {
            spark: 'number',
            index: 'normalStrength',
            label: '法线强度',
            defaultValue: 1,
            min: 0,
            step: 0.03,
            precision: 2,
          },
          {
            spark: 'number',
            index: 'normalSpeed',
            label: '法线速度',
            defaultValue: 1,
            step: 0.03,
            precision: 2,
          },
          {
            spark: 'number',
            index: 'waveTiling',
            label: '波浪重复',
            defaultValue: 1,
            step: 0.03,
            precision: 2,
          },
          {
            spark: 'number',
            index: 'waveScale',
            label: '波浪缩放',
            defaultValue: 1,
          },
          {
            spark: 'number',
            index: 'waveSpeed',
            label: '波浪速度',
            defaultValue: 1,
            step: 0.03,
            precision: 2,
          },
          {
            spark: 'number',
            index: 'waveStrength',
            label: '波浪强度',
            defaultValue: 1,
            min: 0,
            step: 0.03,
            precision: 2,
          },
        ],
      },
    },
  ],
} as Spark;
