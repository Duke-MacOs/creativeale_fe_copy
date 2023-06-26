import { IEnterSpark, IGridSpark } from '../../../../cells';

export const vectorSpark3D = (hidden = false): IGridSpark => {
  return {
    spark: 'grid',
    content: [
      {
        spark: 'block',
        content: {
          spark: 'label',
          label: '位置',
          hidden,
          tooltip: '节点的本地位置坐标',
          content: enterVector('position'),
        },
      },
      {
        spark: 'block',
        content: {
          spark: 'label',
          label: '旋转',
          tooltip: '节点的本地旋转角度',
          content: enterVector('rotation'),
        },
      },
      {
        spark: 'block',
        content: {
          spark: 'label',
          label: '缩放',
          tooltip: '节点的本地缩放比例',
          content: enterVector('scale', undefined, undefined, [1, 1, 1]),
        },
      },
    ],
  };
};

export const enterVector = (
  index: string,
  label = ['X', 'Y', 'Z'],
  disabled = false,
  defaultValue = [0, 0, 0]
): IEnterSpark => {
  return {
    spark: 'enter',
    index,
    content: {
      spark: 'flex',
      content: [
        {
          spark: 'number',
          label: label[0],
          width: 16,
          index: 0,
          defaultValue: defaultValue[0],
          step: 0.1,
          precision: 2,
          disabled,
        },
        {
          spark: 'number',
          label: label[1],
          width: 16,
          index: 1,
          defaultValue: defaultValue[1],
          step: 0.1,
          precision: 2,
          disabled,
        },
        {
          spark: 'number',
          label: label[2],
          width: 16,
          index: 2,
          defaultValue: defaultValue[2],
          step: 0.1,
          precision: 2,
          disabled,
        },
      ],
    },
  };
};
