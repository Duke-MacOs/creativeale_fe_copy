import { IElementSpark, IValueSpark, Spark } from '../../../../cells';
import { LayoutBox } from './LayoutBox';

export const layoutSpark = (): Spark => {
  return {
    spark: 'grid',
    content: [
      {
        spark: 'block',
        content: {
          spark: 'flex',
          content: [
            {
              spark: 'value',
              basis: 'auto',
              index: ['top', 'middle', 'bottom', 'left', 'center', 'right'],
              content,
            },
            {
              spark: 'grid',
              content: [
                valueSpark(
                  '水平位置',
                  ['left', 'center', 'right'],
                  [
                    { label: '无适配', value: 0b000 },
                    { label: '左端对齐', value: 0b001 },
                    { label: '右端对齐', value: 0b100 },
                    { label: '左右对齐', value: 0b101 },
                    { label: '水平居中', value: 0b010 },
                  ]
                ),
                valueSpark(
                  '垂直位置',
                  ['top', 'middle', 'bottom'],
                  [
                    { label: '无适配', value: 0b000 },
                    { label: '顶部对齐', value: 0b001 },
                    { label: '底部对齐', value: 0b100 },
                    { label: '上下对齐', value: 0b101 },
                    { label: '垂直居中', value: 0b010 },
                  ]
                ),
              ],
            },
          ],
        },
      },
      {
        spark: 'block',
        content: {
          spark: 'label',
          label: '启用百分比适配',
          content: {
            spark: 'boolean',
            index: 'layoutByPercent',
            defaultValue: false,
          },
        },
      },
    ],
  };
};

const content = (values: any, onChange: any): IElementSpark => {
  return {
    spark: 'element',
    content() {
      return (
        <LayoutBox
          values={values}
          onChange={(index, checked) => {
            const newValues = values.slice();
            newValues[index] = checked;
            switch (index) {
              case 0:
              case 2:
                newValues[1] = false;
                break;
              case 1:
                newValues[0] = false;
                newValues[2] = false;
                break;
              case 3:
              case 5:
                newValues[4] = false;
                break;
              case 4:
                newValues[3] = false;
                newValues[5] = false;
                break;
            }
            onChange(newValues);
          }}
        />
      );
    },
  };
};

const valueSpark = (label: string, index: string[], options: Array<{ label: string; value: number }>): IValueSpark => {
  return {
    spark: 'value',
    index,
    content(values: boolean[], onChange) {
      return {
        spark: 'element',
        content: render =>
          render({
            spark: 'select',
            label,
            options,
            value: values.reduce((flags, flag, index) => (flag ? flags | (1 << index) : flags), 0),
            onChange(flags) {
              onChange(values.map((_, i) => Boolean((flags as any) & (1 << i))));
            },
          }),
      };
    },
  };
};
