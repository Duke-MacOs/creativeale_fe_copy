import { IGroupSpark } from '@editor/Editor/Property/cells';
import { merge } from 'lodash';
import { EffectFn } from '../..';

const DefaultConfig = {
  alpha: {
    defaultValue: 1,
    hidden: false,
  },
};

export const alphaGroup: EffectFn = (props, envs, specialConfig): IGroupSpark => {
  const config = merge({}, DefaultConfig, specialConfig);
  return {
    spark: 'group',
    label: '目标透明度',
    content: {
      spark: 'grid',
      content: [
        {
          spark: 'slider',
          index: 'alpha',
          label: '透明度',
          hidden: config.alpha.hidden,
          defaultValue: config.alpha.defaultValue,
          tooltip: '透明度',
          min: 0,
          max: 1,
          step: 0.01,
          precision: 0,
          ratio: 100,
          unit: '%',
        },
      ],
    },
  };
};
