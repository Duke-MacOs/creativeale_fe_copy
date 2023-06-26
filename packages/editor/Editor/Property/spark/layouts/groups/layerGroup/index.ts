import { IGroupSpark, ISliderSpark, Spark } from '../../../../cells';
import type { SparkFn } from '../..';
import { colorSpark } from '../../../common/colorSpark';

export const layerGroup: SparkFn = ({ type }): IGroupSpark => {
  return {
    spark: 'group',
    label: '图层',
    hidden: type === 'Sound' || type === 'Button' || type === 'Particle',
    content: {
      spark: 'grid',
      content: [
        {
          spark: 'block',
          hidden: type === 'Button',
          content: {
            spark: 'select',
            index: 'blendMode',
            label: '混合模式',
            tooltip: '混合模式',
            defaultValue: 'normal',
            options: [
              { label: '正常模式', value: 'normal' },
              { label: '正片叠底', value: 'multiply' },
              { label: '滤色', value: 'screen' },
              { label: '叠加', value: 'overlay' },
              { label: '增加', value: 'add' },
              { label: '反向遮罩', value: 'destination-out' },
            ],
          },
        },
        {
          spark: 'block',
          hidden: type === 'Live2d',
          content: {
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
          },
        },
        {
          spark: 'grid',
          hidden: type !== 'Sprite',
          content: [
            {
              spark: 'block',
              content: colorSpark({
                spark: 'color',
                index: 'color',
                label: '滤镜颜色',
                defaultValue: '#fff',
              }),
            },
            withResetColor({
              spark: 'slider',
              index: 'brightness',
              label: '亮度',
              min: -100,
              max: 100,
              defaultValue: 0,
            }),
            withResetColor({
              spark: 'slider',
              index: 'contrast',
              label: '对比度',
              min: -100,
              max: 100,
              defaultValue: 0,
            }),
            withResetColor({
              spark: 'slider',
              index: 'saturation',
              label: '饱和度',
              min: -100,
              max: 100,
              defaultValue: 0,
            }),
            withResetColor({
              spark: 'slider',
              index: 'hue',
              label: '色调',
              min: -180,
              max: 180,
              defaultValue: 0,
            }),
            withResetColor({
              spark: 'slider',
              index: 'blur',
              label: '模糊滤镜',
              min: 0,
              max: 10,
              defaultValue: 0,
            }),
          ],
        },
      ],
    },
  };
};

const withResetColor = ({ index, hidden, ...spark }: ISliderSpark): Spark => {
  return {
    spark: 'block',
    indices: [index as string],
    content: {
      spark: 'value',
      hidden,
      index: [index as string, 'color'],
      content([brightness], onChange) {
        return {
          spark: 'element',
          content: render =>
            render({
              ...spark,
              value: brightness,
              onChange(value: any, options?: any) {
                onChange([value, undefined], options);
              },
            }),
        };
      },
    },
  };
};
