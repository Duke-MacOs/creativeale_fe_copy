import { Node, Edge, getOutgoers } from 'react-flow-renderer';

/**
 * 获取给定节点的所有子节点ID
 * @param root
 * @param nodes
 * @param edges
 * @param result
 * @returns
 */
export function getChildrenOfNode(
  root: Node<RikoScript>,
  nodes: Node<RikoScript>[],
  edges: Edge[],
  result: string[] = []
): string[] {
  result.push(root.id);
  const outgoers = getOutgoers(root, nodes, edges);
  for (const node of outgoers) {
    if (node.id === result[0]) {
      throw new Error('暂不支持对环状结构执行该操作');
    }
    if (!result.includes(node.id)) {
      getChildrenOfNode(node, nodes, edges, result);
    }
  }
  return result;
}
