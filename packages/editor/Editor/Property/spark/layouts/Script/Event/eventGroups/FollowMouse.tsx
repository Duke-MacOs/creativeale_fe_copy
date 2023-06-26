import { highlight, IEventDesc, targetId_SPARK } from '../common';
import { FOLLOW_MODE_TYPE } from '../../../../constants';
import { useNodeOptions } from '../../../groups/customGroups/NodeCell';

export const FollowMouse: IEventDesc = {
  name: '跟随手指',
  category: '高级',
  checkRef({ targetId }, nodeIds) {
    return nodeIds.includes(targetId!);
  },
  Summary: ({ props: { targetId, followMode } }) => {
    const options = useNodeOptions();
    const node = options.find(opt => opt.value === targetId);
    const label = FOLLOW_MODE_TYPE.find(opt => opt.value === followMode)?.label;
    return (
      <>
        {highlight(node?.label)} {highlight(label)}
      </>
    );
  },
  content: {
    spark: 'group',
    content: {
      spark: 'grid',
      content: [
        targetId_SPARK,
        {
          index: 'followMode',
          spark: 'select',
          label: '跟随模式',
          defaultValue: 'none',
          tooltip: '跟随模式',
          options: FOLLOW_MODE_TYPE,
        },
        {
          spark: 'label',
          label: '始终在鼠标下面',
          tooltip: '是否始终在鼠标下面',
          content: {
            spark: 'boolean',
            index: 'isUnderMouse',
            defaultValue: true,
            required: true,
          },
        },
      ],
    },
  },
  extraProps: ({ enableBlueprint } = {}) => ({
    targetId: enableBlueprint ? undefined : -1,
  }),
};
