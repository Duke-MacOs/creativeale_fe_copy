import { IScriptDesc, once_SPARK } from '../common';
import { nodeId_SPARK } from '../Event';

export const MouseUp: IScriptDesc = {
  name: '抬起',
  content: ({ blueprint }) => ({
    spark: 'grid',
    content: [
      { ...nodeId_SPARK, hidden: !blueprint },
      once_SPARK,
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
        },
      },
    ],
  }),
};
