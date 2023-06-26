import { getScene, getNodes } from '@editor/utils';
import { flattenNodes } from '../../groups/customGroups/NodeCell';
import { HelpTooltip, IScriptDesc, once_SPARK } from '../common';
import { nodeId_SPARK } from '../Event';

export const PhysicsCollide: IScriptDesc = {
  name: '物理碰撞',
  tooltip: <HelpTooltip title="物理碰撞" />,
  content: ({ blueprint }) => ({
    spark: 'grid',
    content: [
      { ...nodeId_SPARK, hidden: !blueprint },
      {
        index: 'when',
        spark: 'select',
        label: '碰撞时机',
        defaultValue: 'enter',
        tooltip: '碰撞时机：开始碰撞，持续碰撞，和结束碰撞',
        options: [
          { label: '碰撞开始', value: 'enter' },
          { label: '碰撞持续', value: 'stay' },
          { label: '碰撞结束', value: 'exit' },
        ],
      },
      {
        index: 'filterCategory',
        spark: 'string',
        label: '刚体类别',
        tooltip:
          '能被碰撞的刚体类别，只有被设定的刚体类别碰撞后，才能触发此碰撞事件，多个类别用逗号隔开，比如“敌人,陷阱”，如果留空，则任意类别均可触发此碰撞事件',
        defaultValue: '',
        placeholder: '留空表示任一类别都可以生效',
      },
      once_SPARK,
    ],
  }),
  checkError(props, { project }) {
    const {
      editor: { enableBlueprint },
    } = project;
    const scene = getScene(project);
    const sceneNodes = getNodes(scene);
    const nodes = Array.from(flattenNodes(sceneNodes))
      .map(({ id }) => id)
      .concat(scene.id);

    if (enableBlueprint && !nodes.includes(props.nodeId as number)) {
      return '缺少目标节点';
    }
    return '';
  },
};
