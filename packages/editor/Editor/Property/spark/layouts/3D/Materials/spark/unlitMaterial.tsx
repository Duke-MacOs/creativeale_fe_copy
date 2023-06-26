import { Spark } from '@editor/Editor/Property/cells';
import headerGroup from './common/headerGroup';
import tilingOffset from './common/tilingOffset';
import renderMode from './common/renderMode';
import { colorSpark } from '@editor/Editor/Property/spark/common/colorSpark';
import texture2D from './common/texture2D';

export const UnlitMaterial = {
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
              label: '透明',
              value: 2,
            },
          ]),
          colorSpark({
            spark: 'color',
            index: 'albedoColor',
            label: '颜色',
            defaultValue: [0, 0, 0],
          }),
          texture2D('albedoTextureUrl', '漫反射贴图'),
          tilingOffset,
        ],
      },
    },
  ],
} as Spark;
