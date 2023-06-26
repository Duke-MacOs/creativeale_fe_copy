import { IGroupSpark } from '@editor/Editor/Property/cells';
import { merge } from 'lodash';
import { EffectFn } from '../../..';

const DefaultConfig = {
  presetAnchor: {
    hidden: true,
  },
};

export const anchorGroup: EffectFn = (props, envs, specialConfig = {}): IGroupSpark => {
  const config = merge({}, DefaultConfig, specialConfig);
  return {
    spark: 'group',
    label: '锚点',
    content: {
      spark: 'grid',
      content: [
        {
          spark: 'label',
          label: '预设锚点',
          tooltip: '预设锚点',
          hidden: config.presetAnchor.hidden,
          content: {
            spark: 'boolean',
            index: 'presetAnchor',
            defaultValue: true,
          },
        },
        {
          spark: 'check',
          index: 'presetAnchor',
          check: {
            hidden: presetAnchor => (presetAnchor === undefined ? false : !presetAnchor),
          },
          content: {
            spark: 'grid',
            content: [
              {
                spark: 'number',
                index: 'anchorX',
                label: '锚点 X',
                cols: 3,
                defaultValue: 0.5,
                tooltip: '锚点X，会影响旋转缩放的中心',
                min: -10,
                max: 10,
                step: 0.01,
                precision: 0,
                ratio: 100,
                unit: '%',
              },
              {
                spark: 'number',
                index: 'anchorY',
                label: '锚点 Y',
                cols: 3,
                defaultValue: 0.5,
                tooltip: '锚点Y，会影响旋转缩放的中心',
                min: -10,
                max: 10,
                step: 0.01,
                precision: 0,
                ratio: 100,
                unit: '%',
              },
            ],
          },
        },
      ],
    },
  };
};
