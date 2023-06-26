import type { SparkFn } from '../..';

export const strokeGroup: SparkFn = () => {
  return {
    spark: 'group',
    label: '文字描边',
    content: {
      spark: 'flex',
      content: [
        {
          spark: 'block',
          content: {
            spark: 'number',
            index: 'stroke',
            label: '描边宽度',
            defaultValue: 0,
            tooltip: '描边宽度',
            min: 0,
            max: 160,
          },
        },
        {
          spark: 'block',
          content: {
            spark: 'color',
            index: 'strokeColor',
            label: '描边颜色',
            defaultValue: 'black',
            tooltip: '描边颜色',
          },
        },
      ],
    },
  };
};
