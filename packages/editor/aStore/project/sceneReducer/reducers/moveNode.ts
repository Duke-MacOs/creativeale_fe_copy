import { ActionType, MoveNodeAction } from '@byted/riko';
import { findById } from '../../../../utils';
import { ISceneState } from '../../types';
import { extractNode, putNode } from './utils';

const ACTION = ActionType.MoveNode;

export interface IMoveNode extends MoveNodeAction {
  undo?: IMoveNode;
}

export const moveNode = (dragId: number, dropId: number, dropIndex: number): IMoveNode => ({
  type: ACTION,
  nodeId: dragId,
  parentId: dropId,
  index: dropIndex,
});

export default (scene: ISceneState, action: ReturnType<typeof moveNode>): ISceneState => {
  const { type, nodeId: dragId, parentId: dropId, index: dropIndex } = action;
  if (type === ACTION) {
    const [newNodes, node] = extractNode(scene.nodes, dragId);
    if (!node) {
      return scene;
    }
    const nodes = putNode(scene.id, newNodes, dropId, dropIndex, node);
    if (nodes === newNodes) {
      return scene;
    }
    const [, parent = scene] = findById(scene.nodes, dragId);
    if (parent) {
      const { id: pid, nodes } = parent;
      action.undo = moveNode(
        dragId,
        pid,
        nodes.findIndex(({ id }) => id === dragId)
      );
    }
    return {
      ...scene,
      nodes,
    };
  }
  return scene;
};
