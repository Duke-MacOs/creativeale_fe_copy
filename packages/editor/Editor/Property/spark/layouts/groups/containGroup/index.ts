import { IGroupSpark } from '../../../../cells';
import type { SparkFn } from '../..';

export const containGroup: SparkFn = (): IGroupSpark => {
  return {
    spark: 'group',
    label: '裁剪与滚动',
    content: {
      spark: 'grid',
      content: [
        {
          spark: 'check',
          index: 'scrollable',
          check: {
            cols: (value = false) => (value ? 2 : 3),
          },
          content: {
            spark: 'block',
            content: {
              spark: 'label',
              label: '裁剪',
              reverse: false,
              tooltip: '如果子对象超出容器设置的宽高，是否进行裁剪显示',
              content: {
                spark: 'boolean',
                index: 'clipable',
                defaultValue: false,
              },
            },
          },
        },
        {
          spark: 'check',
          index: 'scrollable',
          check: {
            cols: (value = false) => (value ? 2 : 3),
          },
          content: {
            spark: 'block',
            indices: ['scrollable', 'smooth'],
            content: {
              spark: 'label',
              label: '可滚动',
              reverse: false,
              tooltip: '如果子对象超出容器设置的宽高，是否可以滚动',
              content: {
                spark: 'boolean',
                index: 'scrollable',
                defaultValue: false,
              },
            },
          },
        },
        {
          spark: 'check',
          index: 'scrollable',
          check: {
            hidden: (value = false) => !value,
            cols: () => 2,
          },
          content: {
            spark: 'block',
            indices: ['scrollable', 'smooth'],
            content: {
              spark: 'label',
              label: '平滑滚动',
              reverse: false,
              tooltip: '是否开启平滑滚动，需要先开启可滚动才有效',
              content: {
                spark: 'boolean',
                index: 'smooth',
                defaultValue: true,
              },
            },
          },
        },
      ],
    },
  };
};
