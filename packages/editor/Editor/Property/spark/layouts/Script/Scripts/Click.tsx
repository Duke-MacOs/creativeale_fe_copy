import { getNodes, getScene } from '@editor/utils';
import { flattenNodes } from '../../groups/customGroups/NodeCell';
import { IScriptDesc, once_SPARK } from '../common';
import { nodeId_SPARK } from '../Event';

export const Click: IScriptDesc = {
  name: '单击',
  content: ({ blueprint }) => ({
    spark: 'grid',
    content: [{ ...nodeId_SPARK, hidden: !blueprint }, once_SPARK],
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
