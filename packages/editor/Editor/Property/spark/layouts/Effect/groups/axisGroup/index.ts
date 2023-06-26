import { IGroupSpark } from '@editor/Editor/Property/cells';
import { merge } from 'lodash';
import { EffectFn } from '../../..';

const DefaultConfig = {
  axisX: {
    defaultValue: 1,
    hidden: false,
  },
  axisY: {
    defaultValue: 0,
    hidden: false,
  },
};

export const axisGroup: EffectFn = (props, envs, specialConfig = {}): IGroupSpark => {
  const config = merge({}, DefaultConfig, specialConfig);
  return {
    spark: 'group',
    label: '锚点位移',
    content: {
      spark: 'grid',
      content: [
        {
          spark: 'number',
          index: 'axisX',
          cols: 3,
          hidden: config.axisX.hidden,
          defaultValue: config.axisX.defaultValue,
          label: '锚点 X 位移',
          tooltip: '锚点 X 位移',
        },
        {
          spark: 'number',
          index: 'axisY',
          cols: 3,
          hidden: config.axisY.hidden,
          defaultValue: config.axisY.defaultValue,
          label: '锚点 Y 位移',
          tooltip: '锚点 Y 位移',
        },
      ],
    },
  };
};
