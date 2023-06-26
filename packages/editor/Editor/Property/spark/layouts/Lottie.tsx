import { SparkFn } from '.';
import { IElementSpark, ICheckSpark } from '../../cells';
import { ResourceBox } from './groups/resourceSpark/ResourceBox';
import { extraSpark, headerGroup, layerGroup, layoutGroup, othersGroup, transformGroup } from './groups';

const assetsGroup: SparkFn = (): ICheckSpark => {
  return {
    spark: 'check',
    index: 'assets',
    check: {
      hidden: assets => !assets?.length,
    },
    content: {
      spark: 'group',
      label: 'Lottie 图片素材',
      content: {
        spark: 'block',
        content: {
          spark: 'value',
          index: 'assets',
          content(assets, onChange) {
            return {
              spark: 'value',
              index: 'name',
              content(name = '') {
                return {
                  spark: 'grid',
                  content: assets.map((asset: any, index: number): IElementSpark => {
                    return {
                      spark: 'element',
                      content() {
                        return (
                          <ResourceBox
                            type="Sprite"
                            baseType="Lottie"
                            url={asset.src}
                            name={`${name} ${index + 1}`}
                            onChange={({ url: src }) => {
                              const newAssets = assets.slice();
                              newAssets[index] = { ...newAssets[index], src };
                              onChange(newAssets);
                            }}
                          />
                        );
                      },
                    };
                  }),
                };
              },
            };
          },
        },
      },
    },
  };
};

export const Lottie: SparkFn = (props, envs) => {
  return {
    spark: 'grid',
    content: [extraSpark, headerGroup, assetsGroup, transformGroup, layoutGroup, layerGroup, othersGroup].map(fn =>
      fn(props, envs)
    ),
  };
};
