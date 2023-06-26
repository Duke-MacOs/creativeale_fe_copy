import { IGroupSpark } from '@editor/Editor/Property/cells';
import { formulaSpark } from '@editor/Editor/Property/spark/common/formulaSpark';
import { merge } from 'lodash';
import { EffectFn } from '../../..';

const DefaultConfig = {
  x: { defaultValue: 0, hidden: false },
  y: {
    defaultValue: 0,
    hidden: false,
  },
};

export const positionGroup: EffectFn = (props, envs, specialConfig = {}): IGroupSpark => {
  const config = merge({}, DefaultConfig, specialConfig);

  return {
    spark: 'group',
    label: '位移',
    content: {
      spark: 'flex',
      content: [
        formulaSpark({
          width: 32,
          spark: 'number',
          index: 'x',
          hidden: config.x.hidden,
          label: 'X',
          tooltip: 'X 轴坐标',
          defaultValue: config.x.defaultValue,
          step: 1,
          precision: 0,
        }),
        formulaSpark({
          width: 32,
          spark: 'number',
          index: 'y',
          hidden: config.y.hidden,
          label: 'Y',
          tooltip: 'Y 轴坐标',
          defaultValue: config.y.defaultValue,
          step: 1,
          precision: 0,
        }),
      ],
    },
  };
};

export const offsetPosGroup: EffectFn = (): IGroupSpark => {
  return {
    spark: 'group',
    label: '位移',
    content: {
      spark: 'grid',
      content: [
        {
          spark: 'label',
          label: '位置',
          content: {
            spark: 'enter',
            index: 'offsetPos',
            content: {
              spark: 'grid',
              content: [
                {
                  spark: 'number',
                  index: 0,
                  cols: 2,
                  width: 16,
                  label: 'X',
                  tooltip: 'X',
                  defaultValue: 0,
                  precision: 2,
                },
                {
                  spark: 'number',
                  index: 1,
                  cols: 2,
                  width: 16,
                  label: 'Y',
                  tooltip: 'Y',
                  defaultValue: 0,
                  precision: 2,
                },
                {
                  spark: 'number',
                  index: 2,
                  cols: 2,
                  width: 16,
                  label: 'Z',
                  tooltip: 'Z',
                  defaultValue: 0,
                  precision: 2,
                },
              ],
            },
          },
        },
      ],
    },
  };
};

export const destPosGroup: EffectFn = (): IGroupSpark => {
  return {
    spark: 'group',
    label: '位移到',
    content: {
      spark: 'grid',
      content: [
        {
          spark: 'label',
          label: '目标位置',
          tooltip: '目标位置',
          content: {
            spark: 'enter',
            index: 'destPos',
            content: {
              spark: 'grid',
              content: [
                {
                  spark: 'number',
                  index: 0,
                  cols: 2,
                  width: 16,
                  label: 'X',
                  tooltip: 'X',
                  defaultValue: 0,
                  precision: 2,
                },
                {
                  spark: 'number',
                  index: 1,
                  cols: 2,
                  width: 16,
                  label: 'Y',
                  tooltip: 'Y',
                  defaultValue: 0,
                  precision: 2,
                },
                {
                  spark: 'number',
                  index: 2,
                  cols: 2,
                  width: 16,
                  label: 'Z',
                  tooltip: 'Z',
                  defaultValue: 0,
                  precision: 2,
                },
              ],
            },
          },
        },
      ],
    },
  };
};
