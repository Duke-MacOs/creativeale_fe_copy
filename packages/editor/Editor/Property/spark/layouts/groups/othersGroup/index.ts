import type { IGroupSpark } from '../../../../cells';
import type { SparkFn } from '../..';

export const othersGroup: SparkFn = ({ type }, { typeOfPlay }): IGroupSpark => {
  if (typeOfPlay === 4) {
    return {
      spark: 'group',
      label: '其他',
      content: {
        spark: 'grid',
        content: [
          {
            index: 'alpha',
            spark: 'slider',
            label: '透明度',
            defaultValue: 1,
            tooltip: '透明度',
            ratio: 100,
            precision: 0,
            step: 0.01,
            unit: '%',
            min: 0,
            max: 1,
            inputNumber: true,
            hidden: type === 'PVClickArea',
          },
          {
            spark: 'flex',
            content: [
              {
                spark: 'block',
                content: {
                  index: 'scaleX',
                  spark: 'number',
                  label: '水平缩放',
                  defaultValue: 1,
                  ratio: 100,
                  step: 0.01,
                  unit: '%',
                  precision: 0,
                  tooltip: '水平缩放的倍数',
                },
              },
              {
                spark: 'block',
                content: {
                  index: 'scaleY',
                  spark: 'number',
                  label: '垂直缩放',
                  ratio: 100,
                  defaultValue: 1,
                  unit: '%',
                  step: 0.01,
                  precision: 0,
                  tooltip: '垂直缩放的倍数',
                },
              },
            ],
          },
        ],
      },
    };
  }
  return {
    spark: 'group',
    label: '其他',
    hidden: type === 'Button',
    content: {
      spark: 'grid',
      content: [
        {
          spark: 'block',
          hidden: type === 'Particle',
          content: {
            spark: 'flex',
            content: [
              {
                index: 'anchorX',
                spark: 'number',
                label: '锚点 X',
                defaultValue: 0.5,
                unit: '%',
                ratio: 100,
                tooltip: '锚点X，会影响旋转缩放的中心',
                step: 0.01,
                precision: 0,
                min: -10,
                max: 10,
              },
              {
                index: 'anchorY',
                spark: 'number',
                label: '锚点 Y',
                unit: '%',
                ratio: 100,
                defaultValue: 0.5,
                tooltip: '锚点Y，会影响旋转缩放的中心',
                precision: 0,
                step: 0.01,
                min: -10,
                max: 10,
              },
            ],
          },
        },
        {
          spark: 'flex',
          content: [
            {
              spark: 'block',
              content: {
                index: 'scaleX',
                spark: 'number',
                label: '水平缩放',
                defaultValue: 1,
                ratio: 100,
                step: 0.01,
                unit: '%',
                precision: 0,
                tooltip: '水平缩放的倍数',
              },
            },
            {
              spark: 'block',
              content: {
                index: 'scaleY',
                spark: 'number',
                label: '垂直缩放',
                ratio: 100,
                defaultValue: 1,
                unit: '%',
                step: 0.01,
                precision: 0,
                tooltip: '垂直缩放的倍数',
              },
            },
          ],
        },
        {
          spark: 'block',
          cols: 3,
          hidden: type === 'Particle',
          content: {
            spark: 'label',
            label: '可见',
            tooltip: '运行时是否可见，设置为false，则看不到此元素',
            content: {
              spark: 'boolean',
              index: 'visible',
              defaultValue: true,
            },
          },
        },
        {
          spark: 'block',
          cols: 3,
          hidden: type !== 'Spine',
          content: {
            spark: 'label',
            label: '预乘alpha',
            tooltip: '是否开启预乘alpha',
            content: {
              spark: 'boolean',
              index: 'premultipliedAlpha',
              defaultValue: true,
            },
          },
        },
        {
          spark: 'block',
          cols: 3,
          hidden: type === 'Particle',
          content: {
            index: 'data',
            spark: 'number',
            label: '自定数据',
            defaultValue: 0,
            tooltip: '用户自定义数据，可以记录一些额外的值',
            precision: 0,
          },
        },
      ],
    },
  };
};
