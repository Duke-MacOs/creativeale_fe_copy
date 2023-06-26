import { NodeCell } from '../../groups/customGroups/NodeCell';
import { IScriptDesc } from '../common';
import { nodeId_SPARK } from '../Event';

export const Drag: IScriptDesc = {
  name: '拖动',
  content: ({ blueprint }) => ({
    spark: 'grid',
    content: [
      { ...nodeId_SPARK, hidden: !blueprint },
      {
        spark: 'value',
        index: 'targetId',
        content(value, onChange) {
          return {
            spark: 'element',
            content: () => (
              <NodeCell value={value} onChange={onChange} label="拖动到" tooltip="把当前节点拖动到目标节点上面则成功" />
            ),
          };
        },
      },
    ],
  }),
};
