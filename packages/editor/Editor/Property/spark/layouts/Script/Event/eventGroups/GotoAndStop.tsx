import { highlight, IEventDesc, time_SPARK } from '../common';
import { formulaSpark } from '../../../../common/formulaSpark';
import { delay } from '../common/highlight';
import { useEnableBlueprint } from '@editor/Editor/Blueprint/hooks';
import { checkSpark } from '@editor/Editor/Property/spark/common/checkSpark';

export const GotoAndStop: IEventDesc = {
  name: '跳转停止',
  category: '播放控制',
  Summary: ({ props: { time, stopTime = 0 } }) => {
    return (
      <>
        {delay(time)} 跳转到 {highlight(`${((stopTime as number) / 1000).toFixed(2)}s`)} 停止
      </>
    );
  },
  content: {
    spark: 'group',
    content: {
      spark: 'grid',
      content: [
        checkSpark(formulaSpark(time_SPARK), {
          hidden: useEnableBlueprint,
        }),
        formulaSpark({
          spark: 'number',
          index: 'stopTime',
          label: '结束时间',
          tooltip: '动画跳转的时间点',
          defaultValue: 0,
          required: true,
          precision: 2,
          ratio: -1000,
          unit: 's',
          step: 10,
          min: 0,
        }),
      ],
    },
  },
};
