import { IGroupSpark } from '@editor/Editor/Property/cells';
import { merge } from 'lodash';
import { EffectFn } from '../../..';

const DefaultConfig = {
  from: { defaultValue: 100, hidden: false },
  to: {
    defaultValue: 0,
    hidden: false,
  },
};

export const brightGroup: EffectFn = (props, envs, specialConfig = {}): IGroupSpark => {
  const config = merge({}, DefaultConfig, specialConfig);

  return {
    spark: 'group',
    label: '亮度',
    content: {
      spark: 'grid',
      content: [
        {
          spark: 'slider',
          index: 'from',
          hidden: config.from.hidden,
          label: '开始值',
          tooltip: '开始值',
          defaultValue: config.from.defaultValue,
          min: -100,
          max: 100,
          precision: 0,
          step: 1,
        },
        {
          spark: 'slider',
          index: 'to',
          hidden: config.to.hidden,
          label: '结束值',
          tooltip: '结束值',
          defaultValue: config.to.defaultValue,
          min: -100,
          max: 100,
          precision: 0,
          step: 1,
        },
      ],
    },
  };
};
