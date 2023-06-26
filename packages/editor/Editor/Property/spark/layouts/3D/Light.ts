import { SparkFn } from '../';
import { colorSpark } from '../../common/colorSpark';
import { headerGroup } from '../groups';

const LIGHT_TYPE = [
  {
    label: '方向光',
    value: 'directional',
  },
  {
    label: '聚光灯',
    value: 'spot',
  },
  {
    label: '点光源',
    value: 'point',
  },
];

const SHADOW_TYPE = [
  {
    label: 'none',
    value: 0,
  },
  {
    label: 'hard',
    value: 1,
  },
  {
    label: 'softLow',
    value: 2,
  },
  {
    label: 'softHigh',
    value: 3,
  },
];

const SHADOW_RESOLUTION = [
  {
    label: '16 x 16',
    value: 16,
  },
  {
    label: '32 x 32',
    value: 32,
  },
  {
    label: '64 x 64',
    value: 64,
  },
  {
    label: '128 x 128',
    value: 128,
  },
  {
    label: '256 x 256',
    value: 256,
  },
  {
    label: '512 x 512',
    value: 512,
  },
  {
    label: '1024 x 1024',
    value: 1024,
  },
  {
    label: '2048 x 2048',
    value: 2048,
  },
];

export const Light: SparkFn = (props, envs) => {
  return {
    spark: 'grid',
    content: [headerGroup]
      .map(fn => fn(props, envs))
      .concat([
        {
          spark: 'group',
          label: '光源',
          content: {
            spark: 'grid',
            content: [
              {
                spark: 'block',
                content: {
                  spark: 'select',
                  index: 'lightType',
                  label: '光源类型',
                  defaultValue: 'directional',
                  options: LIGHT_TYPE,
                },
              },
              {
                spark: 'check',
                index: 'lightType',
                check: {
                  hidden: value => !['spot', 'point'].includes(value),
                },
                content: {
                  spark: 'block',
                  content: {
                    spark: 'number',
                    index: 'range',
                    label: '范围',
                    tooltip: '光的范围',
                    min: 0,
                    defaultValue: 8,
                    step: 0.03,
                    precision: 2,
                  },
                },
              },
              {
                spark: 'check',
                index: 'lightType',
                check: {
                  hidden: value => !['spot'].includes(value),
                },
                content: {
                  spark: 'block',
                  content: {
                    spark: 'number',
                    index: 'spotAngle',
                    label: '角度',
                    tooltip: '聚光灯角度',
                    min: 1,
                    max: 179,
                    defaultValue: 45,
                    step: 0.03,
                    precision: 2,
                  },
                },
              },
              colorSpark({
                spark: 'color',
                index: 'color',
                label: '光颜色',
                defaultValue: [51, 51, 51],
              }),
              {
                spark: 'block',
                content: {
                  spark: 'number',
                  label: '光照强度',
                  tooltip: '光照强度',
                  index: 'intensity',
                  defaultValue: 1,
                  step: 0.03,
                  min: 0,
                  precision: 2,
                },
              },
              {
                spark: 'block',
                content: {
                  spark: 'select',
                  label: '阴影类型',
                  index: 'shadowType',
                  tooltip: '阴影类型',
                  defaultValue: 0,
                  options: SHADOW_TYPE,
                },
              },
              {
                spark: 'check',
                index: 'shadowType',
                check: {
                  hidden: value => value === 0,
                },
                content: {
                  spark: 'grid',
                  content: [
                    {
                      spark: 'block',
                      content: {
                        spark: 'number',
                        label: '阴影距离',
                        index: 'shadowDistance',
                        tooltip: '阴影距离',
                        defaultValue: 35,
                        step: 0.03,
                        precision: 2,
                        min: 0,
                      },
                    },
                    {
                      spark: 'block',
                      content: {
                        spark: 'select',
                        label: '阴影分辨率',
                        index: 'shadowResolution',
                        tooltip: '阴影分辨率',
                        defaultValue: 2048,
                        options: SHADOW_RESOLUTION,
                      },
                    },
                    {
                      spark: 'block',
                      content: {
                        spark: 'slider',
                        index: 'shadowBias',
                        label: '阴影偏移',
                        tooltip: '阴影偏移',
                        defaultValue: 1,
                        min: 0,
                        max: 2,
                        step: 0.03,
                        precision: 2,
                      },
                    },
                    {
                      spark: 'block',
                      content: {
                        spark: 'slider',
                        index: 'shadowNormalBias',
                        label: '阴影法线偏移',
                        tooltip: '阴影法线偏移',
                        defaultValue: 1,
                        min: 0,
                        max: 3,
                        step: 0.03,
                        precision: 2,
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ]),
  };
};
