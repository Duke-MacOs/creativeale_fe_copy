import { IScriptDesc } from '../common';
import { nodeId_SPARK } from '../Event';

export const LongPress: IScriptDesc = {
  name: '长按',
  content: ({ blueprint }) => ({
    spark: 'grid',
    content: [{ ...nodeId_SPARK, hidden: !blueprint }],
  }),
};
