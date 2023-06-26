import { Edge } from 'react-flow-renderer';

/**
 * 给定节点ids，获取不同连接性质的连线
 */
export function getConnectedEdgesOfNodes(edges: Edge[], nodeIds: string[]) {
  /**
   * 连接两个选中节点的连线
   */
  const innerEdges: Edge[] = [];
  /**
   * 只有输出端连接节点输入端的连线
   */
  const inputEdges: Edge[] = [];
  /**
   * 只有输入端连接节点输出端的连线
   */
  const outputEdges: Edge[] = [];

  for (const edge of edges) {
    if (nodeIds.includes(edge.source) && nodeIds.includes(edge.target)) {
      innerEdges.push(edge);
    }
    if (nodeIds.includes(edge.source) && !nodeIds.includes(edge.target)) {
      outputEdges.push(edge);
    }
    if (!nodeIds.includes(edge.source) && nodeIds.includes(edge.target)) {
      inputEdges.push(edge);
    }
  }
  return {
    innerEdges,
    inputEdges,
    outputEdges,
  };
}
