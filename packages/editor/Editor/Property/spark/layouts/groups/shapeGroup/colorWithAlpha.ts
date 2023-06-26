import { callValue, IBlockSpark, IColorSpark } from '../../../../cells';
import tinycolor2 from 'tinycolor2';

type Partial = Pick<IColorSpark, 'label' | 'defaultValue' | 'index'>;

export const colorWithAlpha = ({ index, label, defaultValue }: Partial): IBlockSpark => {
  return {
    spark: 'block',
    content: {
      spark: 'flex',
      content: [
        {
          spark: 'color',
          label: `${label}颜色`,
          tooltip: `${label}颜色`,
          defaultValue,
          index,
        },
        {
          spark: 'value',
          index,
          content(rgba, onChange) {
            const color = tinycolor2(rgba);
            const value = (color.getAlpha() * 100) as number;
            return {
              spark: 'element',
              content: render =>
                render({
                  spark: 'number',
                  label: `${label}透明度`,
                  tooltip: `${label}透明度`,
                  precision: 0,
                  // 上层已做 100 换算
                  unit: '%',
                  width: 80,
                  step: 1,
                  max: 100,
                  min: 0,
                  value,
                  onChange(valueOrFn, options) {
                    onChange(color.setAlpha(callValue(valueOrFn, value) / 100).toRgbString() as any, options);
                  },
                }),
            };
          },
        },
      ],
    },
  };
};
