import { IScriptDesc, once_SPARK } from '../common';
import { nodeId_SPARK } from '../Event';

export const TimeUpdate: IScriptDesc = {
  name: '动画时间监听',
  content: ({ blueprint }) => ({
    spark: 'grid',
    content: [
      { ...nodeId_SPARK, hidden: !blueprint },
      {
        spark: 'number',
        index: 'triggerTime',
        label: '触发时间',
        defaultValue: 1000,
        precision: 2,
        ratio: -1000,
        step: 10,
        unit: 's',
        min: 0,
      },
      once_SPARK,
    ],
  }),
};
