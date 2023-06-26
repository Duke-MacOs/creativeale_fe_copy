import { SparkFn } from '../..';
import { callValue, IGroupSpark } from '../../../../cells';
import { optionsSpark } from '../textureGroup/selectButtonSpark';
import { ReactComponent as LeftTopRadius } from './radius/left-top.svg';
import { ReactComponent as LeftBottomRadius } from './radius/left-bottom.svg';
import { ReactComponent as RightBottomRadius } from './radius/right-bottom.svg';
import { ReactComponent as RightTopRadius } from './radius/right-top.svg';

import Icon from '@ant-design/icons';

export const borderGroup: SparkFn = (): IGroupSpark => {
  return {
    spark: 'group',
    label: '边框描边',
    content: {
      spark: 'grid',
      content: [
        {
          spark: 'check',
          index: 'url',
          check: {
            hidden: url => url !== '',
            cols: () => 3,
          },
          content: {
            spark: 'block',
            content: {
              spark: 'color',
              index: 'borderColor',
              label: '描边颜色',
              defaultValue: 'white',
            },
          },
        },
        {
          spark: 'check',
          index: 'url',
          check: {
            hidden: url => url !== '',
            cols: () => 3,
          },
          content: {
            spark: 'block',
            content: {
              spark: 'number',
              index: 'borderWidth',
              label: '描边宽度',
              defaultValue: 0,
              min: 0,
            },
          },
        },

        {
          spark: 'block',
          content: {
            spark: 'value',
            index: ['leftTopRounded', 'rightTopRounded', 'leftBottomRounded', 'rightBottomRounded'],
            content(values: Array<number | undefined>, onChange) {
              const value = values.reduce((a, b) => b ?? a, 0)!;
              return {
                spark: 'grid',
                content: [
                  optionsSpark(
                    (index, checked) => {
                      if (index === 0) {
                        onChange(values.map(() => (checked ? value : undefined)));
                      } else {
                        onChange(values.map((v, i) => (i + 1 === index ? (checked ? value : undefined) : v)));
                      }
                    },
                    [
                      {
                        label: '全部',
                        value: values.every(value => value !== undefined),
                        tooltip: '全部',
                      },
                      {
                        label: <Icon component={LeftTopRadius as any} />,
                        value: values[0] !== undefined,
                        tooltip: '左上圆角',
                      },
                      {
                        label: <Icon component={RightTopRadius as any} />,
                        value: values[1] !== undefined,
                        tooltip: '右上圆角',
                      },
                      {
                        label: <Icon component={LeftBottomRadius as any} />,
                        value: values[2] !== undefined,
                        tooltip: '左下圆角',
                      },
                      {
                        label: <Icon component={RightBottomRadius as any} />,
                        value: values[3] !== undefined,
                        tooltip: '右下圆角',
                      },
                    ]
                  ),
                  {
                    spark: 'element',
                    hidden: values.every(value => value === undefined),
                    content: render =>
                      render({
                        spark: 'slider',
                        label: '圆角',
                        value,
                        precision: 0,
                        max: 100,
                        step: 1,
                        min: 0,
                        onChange(valueOrFn) {
                          onChange(values.map(v => (v === undefined ? v : callValue(valueOrFn, value))));
                        },
                      }),
                  },
                ],
              };
            },
          },
        },
      ],
    },
  };
};
