import { IScriptDesc } from '../common';
import { nodeId_SPARK } from '../Event';

export const Auto: IScriptDesc = {
  name: '自动触发',
  content: ({ blueprint }) => ({
    spark: 'grid',
    content: [{ ...nodeId_SPARK, hidden: !blueprint }],
  }),
};
