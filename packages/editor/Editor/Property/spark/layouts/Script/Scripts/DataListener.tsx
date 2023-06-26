import { storeSelectSpark } from '../../../common/storeSelectSpark';
import { HelpTooltip, IScriptDesc, once_SPARK } from '../common';
import { nodeId_SPARK } from '../Event';

export const DataListener: IScriptDesc = {
  name: '监听变量变化',
  tooltip: <HelpTooltip title="监听全局变量变化" />,
  content: ({ blueprint }) => ({
    spark: 'grid',
    content: [
      { ...nodeId_SPARK, hidden: !blueprint },
      storeSelectSpark({
        index: 'key',
        label: '变量名',
        tooltip: '监听全局变量的变化',
        spark: 'select',
        required: true,
      }),
      once_SPARK,
    ],
  }),
};
