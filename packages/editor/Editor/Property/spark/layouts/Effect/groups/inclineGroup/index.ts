import { IGroupSpark } from '@editor/Editor/Property/cells';
import { EffectFn } from '../../..';

export const inclineGroup: EffectFn = (): IGroupSpark => {
  return {
    spark: 'group',
    label: '倾斜',
    content: {
      spark: 'grid',
      content: [
        {
          spark: 'slider',
          index: 'scaleRange',
          label: '斜切幅度',
          tooltip: '斜切幅度',
          defaultValue: 0,
          step: 0.01,
          min: -1,
          max: 1,
          precision: 0,
          unit: '%',
          ratio: 100,
        },
        {
          spark: 'label',
          label: '水平倾斜',
          tooltip: '水平轴是否倾斜',
          cols: 3,
          content: {
            spark: 'boolean',
            index: 'enableX',
            defaultValue: false,
          },
        },
        {
          spark: 'label',
          label: '垂直倾斜',
          tooltip: '垂直轴是否倾斜',
          cols: 3,
          content: {
            spark: 'boolean',
            index: 'enableY',
            defaultValue: false,
          },
        },
      ],
    },
  };
};
