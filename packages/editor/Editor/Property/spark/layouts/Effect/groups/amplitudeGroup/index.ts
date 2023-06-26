import { IGroupSpark } from '@editor/Editor/Property/cells';
import { EffectFn } from '../../..';

export * from './amplitudeVector';
export const amplitudeGroup: EffectFn = (): IGroupSpark => {
  return {
    spark: 'group',
    label: '振动',
    content: {
      spark: 'grid',
      content: [
        {
          spark: 'number',
          index: 'amplitudeX',
          label: '水平振幅',
          cols: 3,
          defaultValue: 0.2,
          tooltip: '水平振幅',
          step: 0.01,
          precision: 0,
          unit: '%',
          ratio: 100,
        },
        {
          spark: 'number',
          index: 'amplitudeY',
          label: '垂直振幅',
          cols: 3,
          defaultValue: -0.2,
          tooltip: '垂直振幅',
          step: 0.01,
          precision: 0,
          unit: '%',
          ratio: 100,
        },
      ],
    },
  };
};
