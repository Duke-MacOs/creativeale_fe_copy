import { IGroupSpark } from '@editor/Editor/Property/cells';
import { merge } from 'lodash';
import { EffectFn } from '../../..';

const DefaultConfig = {
  flipX: {
    defaultValue: true,
    hidden: false,
  },
  flipY: {
    defaultValue: false,
    hidden: false,
  },
};

export const flipGroup: EffectFn = (props, envs, specialConfig = {}): IGroupSpark => {
  const config = merge({}, DefaultConfig, specialConfig);
  return {
    spark: 'group',
    label: '翻转动画',
    content: {
      spark: 'grid',
      content: [
        {
          spark: 'label',
          label: '水平翻转',
          tooltip: '水平翻转',
          cols: 3,
          hidden: config.flipX.hidden,
          content: {
            spark: 'boolean',
            index: 'flipX',
            defaultValue: config.flipX.defaultValue,
          },
        },
        {
          spark: 'label',
          label: '垂直翻转',
          tooltip: '垂直翻转',
          cols: 3,
          hidden: config.flipY.hidden,
          content: {
            spark: 'boolean',
            index: 'flipY',
            defaultValue: config.flipY.defaultValue,
          },
        },
      ],
    },
  };
};
