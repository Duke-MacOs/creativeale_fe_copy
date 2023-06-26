import type { SparkFn } from '../..';
import { colorWithAlpha } from './colorWithAlpha';

export const shapeFilledGroup: SparkFn = () => {
  return {
    spark: 'group',
    label: '填充',
    content: colorWithAlpha({ index: 'fillColor', label: '填充', defaultValue: '#2860ed' }),
  };
};

export const shapeStrokeGroup: SparkFn = () => {
  return {
    spark: 'group',
    label: '图形描边',
    content: {
      spark: 'grid',
      content: [
        colorWithAlpha({ index: 'lineColor', label: '描边', defaultValue: '#ffffff' }),
        {
          spark: 'check',
          index: 'shapeType',
          check: {
            cols: shapeType => (shapeType === 'rectangle' ? 3 : 6),
          },
          content: {
            spark: 'block',
            cols: 3,
            content: {
              spark: 'number',
              index: 'lineWidth',
              label: '描边宽度',
              defaultValue: 0,
              tooltip: '描边宽度',
              min: 0,
            },
          },
        },
        {
          spark: 'check',
          index: 'shapeType',
          check: {
            hidden: shapeType => shapeType !== 'rectangle',
            cols: () => 3,
          },
          content: {
            spark: 'block',
            cols: 3,
            indices: ['shapeType', 'roundedSize'],
            content: {
              index: 'roundedSize',
              spark: 'number',
              label: '圆角',
              defaultValue: 0,
              tooltip: '圆角',
              min: 0,
            },
          },
        },
      ],
    },
  };
};
