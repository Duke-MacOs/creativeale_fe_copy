import { callValue, IGroupSpark, NULL_SPARK } from '../../../../cells';
import type { SparkFn } from '../..';
import { fontSpark } from './fontSpark';
import { selectSpark, optionsSpark } from './selectButtonSpark';
import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  BoldOutlined,
  ItalicOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignMiddleOutlined,
  VerticalAlignTopOutlined,
} from '@ant-design/icons';

export const textureGroup: SparkFn = ({ type }, { typeOfPlay }): IGroupSpark => {
  return {
    spark: 'group',
    label: '文本内容及样式',
    tooltip: typeOfPlay !== 4 && type === 'Button' ? '转化目标为 APP 下载按钮时，按钮文案必须包含“下载”字样' : '',
    content: {
      spark: 'grid',
      content: [
        {
          spark: 'block',
          status: 'recommended',
          content:
            type === 'Text'
              ? {
                  spark: 'string',
                  type: 'area',
                  index: 'text',
                  label: '文本',
                  align: 'top',
                  max: 600,
                }
              : {
                  spark: 'string',
                  index: 'text',
                  label: '文本',
                },
        },
        {
          spark: 'check',
          check: { hidden: () => true },
          index: [],
          content: {
            spark: 'block',
            status: 'required',
            indices: ['bitMap'],
            content: NULL_SPARK,
          },
        },
        {
          spark: 'block',
          hidden: typeOfPlay === 4,
          content: fontSpark(),
        },
        {
          spark: 'check',
          index: 'font',
          check: { hidden: font => !font },
          content: {
            spark: 'string',
            type: 'area',
            index: 'fontSet',
            label: '字符集',
            required: true,
            placeholder: '需要动态修改艺术字体的文本时，请提前输入可能被用到的文本，以方便对艺术字体进行自动裁剪',
          },
        },
        {
          spark: 'block',
          cols: 3,
          content: {
            spark: 'number',
            index: 'fontSize',
            label: '字号',
            precision: 0,
            max: 160,
            min: 8,
            step: 1,
          },
        },
        {
          spark: 'block',
          cols: 3,
          content: {
            defaultValue: 'black',
            spark: 'color',
            index: 'color',
            label: '颜色',
          },
        },
        {
          spark: 'block',
          hidden: type === 'Button' || typeOfPlay === 4,
          cols: 3,
          content: selectSpark('align', 'left', [
            {
              label: <AlignLeftOutlined />,
              tooltip: '左对齐',
              value: 'left',
            },
            {
              label: <AlignCenterOutlined />,
              tooltip: '水平居中对齐',
              value: 'center',
            },
            {
              label: <AlignRightOutlined />,
              tooltip: '右对齐',
              value: 'right',
            },
          ]),
        },
        {
          spark: 'block',
          hidden: type === 'Button' || typeOfPlay === 4,
          cols: 3,
          content: selectSpark('valign', 'top', [
            {
              label: <VerticalAlignTopOutlined />,
              tooltip: '顶对齐',
              value: 'top',
            },
            {
              label: <VerticalAlignMiddleOutlined />,
              tooltip: '垂直居中对齐',
              value: 'middle',
            },
            {
              label: <VerticalAlignBottomOutlined />,
              tooltip: '底对齐',
              value: 'bottom',
            },
          ]),
        },
        {
          spark: 'block',
          cols: 3,
          hidden: typeOfPlay === 4,
          content: {
            spark: 'value',
            index: ['bold', 'italic'],
            content([bold = false, italic = false], onChange) {
              return optionsSpark(
                (index, value) => {
                  const values = [bold, italic];
                  values[index] = value;
                  onChange(values);
                },
                [
                  {
                    label: <BoldOutlined />,
                    tooltip: '加粗',
                    value: bold,
                  },
                  {
                    label: <ItalicOutlined />,
                    tooltip: '斜体',
                    value: italic,
                  },
                ]
              );
            },
          },
        },
        {
          spark: 'block',
          hidden: type === 'Button' || typeOfPlay === 4,
          cols: 3,
          content: {
            spark: 'select',
            index: 'overflow',
            label: '溢出方式',
            defaultValue: 'visible',
            tooltip: '内容超出宽高限制的处理方式',
            options: [
              { label: 'visible', value: 'visible' },
              { label: 'hidden', value: 'hidden' },
              { label: 'scroll', value: 'scroll' },
            ],
          },
        },
        {
          spark: 'block',
          hidden: type === 'Button' || typeOfPlay === 4,
          cols: 3,
          content: {
            spark: 'number',
            index: 'leading',
            label: '行间距',
            defaultValue: 0,
            precision: 0,
            max: 160,
            min: 0,
            step: 1,
          },
        },
        {
          spark: 'block',
          hidden: type === 'Button' || typeOfPlay === 4,
          cols: 3,
          content: {
            spark: 'label',
            label: '自动换行',
            tooltip: '自动换行',
            content: {
              spark: 'boolean',
              index: 'wordWrap',
              defaultValue: true,
            },
          },
        },
        {
          spark: 'block',
          hidden: type === 'Button' || typeOfPlay === 4,
          content: {
            spark: 'label',
            label: '内边距',
            content: {
              spark: 'value',
              index: 'padding',
              content(values: number[] = [], onChange) {
                return {
                  spark: 'grid',
                  content: (
                    [
                      ['上', 0],
                      ['下', 2],
                      ['左', 3],
                      ['右', 1],
                    ] as const
                  ).map(([label, index]) => ({
                    spark: 'element',
                    cols: 3,
                    content: render =>
                      render({
                        spark: 'number',
                        label,
                        value: values[index] ?? 0,
                        onChange(valueOrFn, options) {
                          onChange(
                            Array.from({ length: 4 }).map((_, i) =>
                              i === index ? callValue(valueOrFn, values[index] ?? 0) : values[i] ?? 0
                            ),
                            options
                          );
                        },
                      }),
                  })),
                };
              },
            },
          },
        },
      ],
    },
  };
};
