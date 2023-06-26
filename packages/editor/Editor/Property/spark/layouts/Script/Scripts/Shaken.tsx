import { autoTrigger_SPARK, IScriptDesc, once_SPARK } from '../common';
import { nodeId_SPARK } from '../Event';

export const Shaken: IScriptDesc = {
  name: '摇一摇',
  content: ({ blueprint }) => ({
    spark: 'grid',
    content: [
      { ...nodeId_SPARK, hidden: !blueprint },
      {
        spark: 'flex',
        content: [once_SPARK, autoTrigger_SPARK],
      },
    ],
  }),
};
