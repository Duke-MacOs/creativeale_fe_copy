import { IGroupSpark, INumberSpark } from '@editor/Editor/Property/cells';
import { merge } from 'lodash';
import { EffectFn } from '../../..';
import { duration_SPARK, time_SPARK } from '../../../Script/Event';
import { formulaSpark } from '../../../../common/formulaSpark';
import { useEnableBlueprint } from '@editor/Editor/Blueprint/hooks';
import { checkSpark } from '@editor/Editor/Property/spark/common/checkSpark';

const DefaultConfig = {
  stayTime: {
    hidden: true,
  },
};

export const timeGroup: EffectFn = (props, envs, specialConfig = {}): IGroupSpark => {
  const config = merge({}, DefaultConfig, specialConfig);
  return {
    spark: 'group',
    label: '时间',
    content: {
      spark: 'grid',
      content: [
        envs.rootType === 'PlayEffect'
          ? {
              spark: 'grid',
              content: [
                checkSpark(formulaSpark({ ...time_SPARK, tooltip: '脚本或者动画的开始时间' } as INumberSpark), {
                  hidden: useEnableBlueprint,
                }),
                formulaSpark(duration_SPARK as INumberSpark),
              ],
            }
          : {
              spark: 'flex',
              content: [
                checkSpark(
                  { ...time_SPARK, ...{ label: '开始时间', tooltip: '开始时间' } },
                  {
                    hidden: useEnableBlueprint,
                  }
                ),
                duration_SPARK,
              ],
            },
        {
          spark: 'label',
          label: '不受场景播放状态影响',
          hidden: envs.rootType === 'PlayEffect',
          tooltip:
            '动画是否受场景播放状态影响，设置为开启后，即使当前场景停止播放，动画依然会继续运行，用来实现场景停止播放，但一些动画依然继续播放的效果',
          content: {
            spark: 'boolean',
            index: 'playBySelf',
            defaultValue: false,
          },
        },
        {
          spark: 'number',
          index: 'stayTime',
          hidden: config.stayTime.hidden,
          label: '停留时间',
          tooltip: '在两端停留的时间',
          min: 0,
          step: 0.01,
          precision: 2,
          defaultValue: 0,
          unit: 's',
          ratio: -1000,
        },
      ],
    },
  };
};
