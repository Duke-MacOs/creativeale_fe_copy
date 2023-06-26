import { continuous_SPARK, IScriptDesc, once_SPARK } from '../common';
import { nodeId_SPARK } from '../Event';

export const MouseDown: IScriptDesc = {
  name: '按下',
  content: ({ blueprint }) => ({
    spark: 'grid',
    content: [
      { ...nodeId_SPARK, hidden: !blueprint },
      {
        spark: 'flex',
        content: [once_SPARK, continuous_SPARK],
      },
      {
        spark: 'check',
        index: 'continuous',
        check: {
          hidden: continuous => !continuous,
        },
        content: {
          spark: 'number',
          index: 'interval',
          defaultValue: 500,
          label: '触发间隔',
          tooltip: '每次定时的间隔时间',
          unit: 's',
          ratio: -1000,
          precision: 2,
          step: 10,
          min: 0,
        },
      },
    ],
  }),
};
