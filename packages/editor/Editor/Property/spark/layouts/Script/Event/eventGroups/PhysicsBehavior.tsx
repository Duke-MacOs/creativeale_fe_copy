import { useEnableBlueprint } from '@editor/Editor/Blueprint/hooks';
import { checkSpark } from '@editor/Editor/Property/spark/common/checkSpark';
import { formulaSpark } from '../../../../common/formulaSpark';
import { BEHAVIOR_TYPE } from '../../../../constants';
import { useNodeOptions } from '../../../groups/customGroups/NodeCell';
import { IEventDesc, targetId_SPARK, time_SPARK } from '../common';
import { delay, highlight } from '../common/highlight';

export const PhysicsBehavior: IEventDesc = {
  name: '物理行为',
  category: '高级',
  link: 'https://magicplay.oceanengine.com/tutorials/senior/two',
  extraProps: ({ enableBlueprint } = {}) => ({
    targetId: enableBlueprint ? undefined : -1,
  }),
  checkRef({ targetId }, nodeIds) {
    return nodeIds.includes(targetId!);
  },
  Summary: ({ props: { time, targetId, behaviorType } }) => {
    const options = useNodeOptions();
    const node = options.find(opt => opt.value === targetId);
    const label = BEHAVIOR_TYPE.find(opt => opt.value === behaviorType)?.label;
    return (
      <>
        {delay(time)} {highlight(node?.label)} {highlight(label)}
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
        targetId_SPARK,
        {
          index: 'behaviorType',
          spark: 'select',
          label: '物理行为',
          defaultValue: 'force',
          tooltip: '物理行为',
          options: BEHAVIOR_TYPE,
          required: true,
        },
        {
          spark: 'check',
          index: 'behaviorType',
          check: {
            hidden: value => value !== 'force',
          },
          content: {
            spark: 'grid',
            content: [
              formulaSpark({
                index: 'forceX',
                spark: 'number',
                label: '水平力',
                defaultValue: 0,
                tooltip: '水平力',
                required: true,
              }),
              formulaSpark({
                index: 'forceY',
                spark: 'number',
                label: '垂直力',
                defaultValue: 0,
                tooltip: '垂直力',
                required: true,
              }),
            ],
          },
        },
        {
          spark: 'check',
          index: 'behaviorType',
          check: {
            hidden: value => value !== 'velocity',
          },
          content: {
            spark: 'grid',
            content: [
              formulaSpark({
                index: 'velocityX',
                spark: 'number',
                label: '水平速度',
                defaultValue: 0,
                tooltip: '水平速度',
                required: true,
              }),
              formulaSpark({
                index: 'velocityY',
                spark: 'number',
                label: '垂直速度',
                defaultValue: 0,
                tooltip: '垂直速度',
                required: true,
              }),
            ],
          },
        },
        {
          spark: 'check',
          index: 'behaviorType',
          check: {
            hidden: value => value !== 'torque',
          },
          content: formulaSpark({
            index: 'torque',
            spark: 'number',
            label: '扭矩',
            defaultValue: 0,
            tooltip: '扭矩',
            required: true,
          }),
        },
      ],
    },
  },
};
