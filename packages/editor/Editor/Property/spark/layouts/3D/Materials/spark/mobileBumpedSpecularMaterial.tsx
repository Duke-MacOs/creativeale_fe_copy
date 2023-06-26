import { Spark } from '@editor/Editor/Property/cells';
import { colorSpark } from '@editor/Editor/Property/spark/common/colorSpark';
import headerGroup from './common/headerGroup';
import tilingOffset from './common/tilingOffset';
import texture2D from './common/texture2D';

export const MobileBumpedSpecularMaterial = {
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
            index: 'albedoColor',
            label: '基础颜色',
            defaultValue: [0, 0, 0],
          }),
          {
            spark: 'slider',
            index: 'shininess',
            label: '光泽度',
            tooltip: '光泽度',
            defaultValue: 0.078,
            min: 0,
            max: 1,
            step: 0.03,
            precision: 3,
          },
          texture2D('albedoTextureUrl', '漫反射贴图'),
          texture2D('normalTextureUrl', '法线贴图'),
          tilingOffset,
        ],
      },
    },
  ],
} as Spark;
