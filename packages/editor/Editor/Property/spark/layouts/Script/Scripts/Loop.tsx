import { formulaSpark } from '../../../common/formulaSpark';
import { HelpTooltip, IScriptDesc } from '../common';

export const Loop: IScriptDesc = {
  name: '定时循环',
  tooltip: <HelpTooltip title="定时循环" />,
  content: () => ({
    spark: 'grid',
    content: [
      formulaSpark({
        spark: 'number',
        index: 'interval',
        label: '触发间隔',
        defaultValue: 1000,
        precision: 2,
        ratio: -1000,
        step: 10,
        unit: 's',
        tooltip: '每次定时的间隔时间',
        min: 0,
      }),
      {
        spark: 'label',
        label: '不受场景播放状态影响',
        tooltip:
          '动画是否受场景播放状态影响，设置为开启后，即使当前场景停止播放，动画依然会继续运行，用来实现场景停止播放，但一些动画依然继续播放的效果',
        content: {
          index: 'playBySelf',
          spark: 'boolean',
          defaultValue: false,
        },
      },
    ],
  }),
};
