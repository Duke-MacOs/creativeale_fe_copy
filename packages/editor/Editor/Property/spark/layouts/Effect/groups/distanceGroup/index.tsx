import { IGroupSpark } from '@editor/Editor/Property/cells';
import { formulaSpark } from '@editor/Editor/Property/spark/common/formulaSpark';
import { merge } from 'lodash';
import { EffectFn } from '../../..';

const DefaultConfig = {
  distanceX: { defaultValue: 0, hidden: false },
  distanceY: {
    defaultValue: 0,
    hidden: false,
  },
};

export const distanceGroup: EffectFn = (props, envs, specialConfig = {}): IGroupSpark => {
  const config = merge({}, DefaultConfig, specialConfig);

  return {
    spark: 'group',
    label: '位移',
    content: {
      spark: 'flex',
      content: [
        formulaSpark({
          spark: 'number',
          index: 'distanceX',
          hidden: config.distanceX.hidden,
          label: '水平位移',
          tooltip: '水平位移',
          defaultValue: config.distanceX.defaultValue,
          step: 1,
          precision: 2,
        }),
        formulaSpark({
          spark: 'number',
          index: 'distanceY',
          hidden: config.distanceY.hidden,
          label: '垂直位移',
          tooltip: '垂直位移',
          defaultValue: config.distanceY.defaultValue,
          step: 1,
          precision: 2,
        }),
      ],
    },
  };
};
