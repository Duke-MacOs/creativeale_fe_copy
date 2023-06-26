import { IGroupSpark } from '@editor/Editor/Property/cells';
import { merge } from 'lodash';
import { EffectFn } from '../../..';

const DefaultConfig = {
  width: {
    defaultValue: 0,
    hidden: false,
  },
  height: {
    defaultValue: 0,
    hidden: false,
  },
};

export const sizeGroup: EffectFn = (props, envs, specialConfig = {}): IGroupSpark => {
  const config = merge({}, DefaultConfig, specialConfig);
  return {
    spark: 'group',
    label: '尺寸',
    content: {
      spark: 'grid',
      content: [
        {
          spark: 'number',
          index: 'width',
          cols: 3,
          hidden: config.width.hidden,
          defaultValue: config.width.defaultValue,
          label: '宽度',
          tooltip: '宽度',
          min: 0,
        },
        {
          spark: 'number',
          index: 'height',
          cols: 3,
          hidden: config.height.hidden,
          defaultValue: config.height.defaultValue,
          label: '高度',
          tooltip: '高度',
          min: 0,
        },
      ],
    },
  };
};
